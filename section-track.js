/*! section-track 1.1.0 — DB-04-Beacon der Mega-Automation
 *
 *  WAS ER MISST: je Abschnittshuelle vier Groessen, und nur diese vier. Die
 *  Namen sind NICHT frei gewaehlt — sie sind der Vertrag des Ingest-Knotens
 *  `Payload saeubern` (Workflow `Section-Tracking Ingest`, vl8Zf9IUOMlSKWK2)
 *  und werden dort auf die Spalten von `section_beobachtungen` gelegt:
 *      id         -> instanz_id        die Instanz-UUID der Section
 *      (dabei)    -> sichtbar          allein im Beacon zu stehen HEISST sichtbar
 *      visibleMs  -> viewport_zeit_ms  wie lange sie im Sichtfeld stand
 *      clicks     -> interaktionen     ob in ihr geklickt wurde
 *      passed     -> durchscrollt      ob der Besucher sie nach unten verliess
 *  Der naechtliche Rollup verdichtet genau diese vier zu
 *  `sichtbarkeitsrate_prozent`, `verweildauer_sek_mittel`,
 *  `interaktionsrate_prozent` und `abbruchquote_prozent` — die Abbruchquote
 *  ist die Gegenzahl zu `durchscrollt`. Wer hier einen Namen aendert, aendert
 *  die Messung von DB-04.
 *
 *  WORAN ER EINEN ABSCHNITT ERKENNT: an `data-section-instance-id` (36
 *  Zeichen, die UUID aus `instanz_registrieren`). Gesucht wird ueber DREI
 *  Huellen-Kennungen, weil zwei Baustrecken nebeneinander bauen:
 *      [data-section-instance-id]  der Compiler COMPILE-01 setzt sie
 *      [data-abschnitt]            das Gewerk BAUER — SEITE setzt sie
 *      [id^="sec-"]                aelteres Markup
 *  `data-abschnitt` traegt nur den NAMEN des Abschnitts, nicht die Instanz.
 *  Ueber den Namen laesst sich nichts schreiben: die Ingest-Abfrage nimmt
 *  ausschliesslich eine UUID an, die in `section_instanzen` steht. Eine Huelle
 *  ohne `data-section-instance-id` wird deshalb STILL uebergangen — sie
 *  erzeugt keinen Fehler und keine halbe Zeile.
 *
 *  KEIN COOKIE, KEINE PERSONENBEZOGENEN DATEN, KEINE EINWILLIGUNGSPFLICHT —
 *  und das ist keine Auslegung, sondern folgt aus dem, was gesendet wird:
 *    · Es wird NICHTS gespeichert. Kein Cookie, kein localStorage, kein
 *      sessionStorage. Die Sitzungskennung `session` ist eine Zufallszahl,
 *      die nur im Speicher dieser einen Seitenansicht lebt und mit ihr
 *      vergeht. Beim naechsten Aufruf ist sie eine andere — dieselbe Person
 *      ist ueber zwei Aufrufe hinweg NICHT wiedererkennbar. Damit fehlt der
 *      Zugriff auf Endgeraete-Information im Sinne von § 25 TTDSG, der eine
 *      Einwilligung ausloesen wuerde.
 *    · Es wird keine IP, keine User-Agent-Zeichenkette, keine Eingabe, kein
 *      Formularinhalt und kein Text der Seite uebertragen. Gesendet werden
 *      Host, Pfad, Geraeteklasse (drei Werte), Verweisquelle (sieben feste
 *      Werte, NICHT die Herkunfts-URL), Verweildauer, Scrolltiefe und je
 *      Abschnitt die vier Zahlen oben.
 *    · Gemessen werden Sichtkontakte auf ABSCHNITTEN, nicht Personen. Die
 *      Frage, die diese Daten beantworten, lautet „welcher Abschnitt traegt",
 *      nicht „wer war da". Ein Personenbezug entstuende erst durch ein
 *      Merkmal, das Wiedererkennung erlaubt — genau das fehlt hier absichtlich.
 *    · Ein Messfehler darf die Kundenseite nie beeintraechtigen: alles steht
 *      in try/catch, auch der Versand. Faellt der Webhook aus, faellt der
 *      Beacon still aus.
 *
 *  EIN AUFRUF JE SITZUNG, gebuendelt: `visibilitychange` (hidden) und
 *  `pagehide`, danach sperrt `snt`. Kein Aufruf je Abschnitt.
 *
 *  Der EINZIGE Scroll-Listener misst die Seiten-Scrolltiefe `maxScroll` —
 *  ein Feld des Ingest-Vertrags. Die Abschnitte selbst werden ausschliesslich
 *  ueber IntersectionObserver gemessen.
 *
 *  Quelle: section-tracking-snippet.html (gebaut, im Browser getestet).
 *  Aus dem <script>-Rumpf geloest, damit die Datei versioniert ausgeliefert
 *  und ueber einen SRI-Hash gesichert werden kann.
 */
(function(){try{
var EP='https://n8n.srv1485532.hstgr.cloud/webhook/section-track',Q='data-section-instance-id',
SEL='['+Q+'],[data-abschnitt],[id^="sec-"]',
G=function(e){var v=e.getAttribute(Q);return v||(e.id&&e.id.slice(0,4)==='sec-'?e.id.slice(4):null)},AE=addEventListener,
E=document.querySelectorAll(SEL),T0=performance.now(),
S=(Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)).slice(0,12),
W=innerWidth,D=W<768?'mobile':W<1024?'tablet':'desktop',R='direct',r=document.referrer,A={},
ms=0,act=0,snt=0,tk=0,i,id;
if(r){try{var h=new URL(r).hostname.replace(/^www\./,'');
R=h===location.hostname?'internal':/google\./.test(h)?'google':
/bing|duckduck|ecosia|yahoo|yandex|brave/.test(h)?'search':
/chatgpt|openai|perplexity|claude|copilot|gemini/.test(h)?'ai':
/facebook|instagram|linkedin|tiktok|pinterest|youtube|reddit|x\.com|t\.co/.test(h)?'social':'other'
}catch(e){R='other'}}
function M(){act=1}
AE('pointerdown',M,{passive:!0,once:!0});AE('keydown',M,{passive:!0,once:!0});
AE('scroll',function(){act=1;if(tk)return;tk=1;requestAnimationFrame(function(){tk=0;
var s=document.documentElement.scrollHeight-innerHeight,p=s>0?Math.round(scrollY/s*100):100;
if(p>ms)ms=p>100?100:p})},{passive:!0});
if(E.length&&window.IntersectionObserver){var io=new IntersectionObserver(function(x){var n=performance.now(),j,e,d;
for(j=0;j<x.length;j++){e=x[j];d=A[G(e.target)];if(!d)continue;
if(e.isIntersecting){if(d.n++===0)d.t=n}
else{if(d.n>0&&--d.n===0)d.ms+=n-d.t;if(e.boundingClientRect.bottom<=0)d.p=!0}}},{threshold:0});
for(i=0;i<E.length;i++){id=G(E[i]);if(!id||id.length!==36)continue;
if(!A[id])A[id]={ms:0,t:0,n:0,c:0,p:!1};io.observe(E[i])}
AE('click',function(v){act=1;var t=v.target,el=t&&t.closest?t.closest(SEL):0;
if(el){var d=A[G(el)];if(d)d.c++}},{passive:!0,capture:!0})}
function P(){try{if(snt||!act||!navigator.sendBeacon)return;snt=1;var n=performance.now(),L=[],k,d;
for(k in A){d=A[k];if(d.n>0){d.ms+=n-d.t;d.n=0}
if(d.ms>=1000||d.c>0){L.push({id:k,visibleMs:Math.round(d.ms),clicks:d.c,passed:d.p});if(L.length>=50)break}}
navigator.sendBeacon(EP,new Blob([JSON.stringify({host:location.hostname,path:location.pathname||'/',
session:S,device:D,timeOnPage:Math.round(n-T0),maxScroll:ms,ref:R,interacted:!0,sections:L})],{type:'text/plain'}))
}catch(e){}}
document.addEventListener('visibilitychange',function(){document.visibilityState==='hidden'&&P()});
AE('pagehide',P)
}catch(e){}})();
