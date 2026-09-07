/*! section-track 1.0.0 — DB-04-Beacon der Mega-Automation
 *  Quelle: section-tracking-snippet.html (gebaut, im Browser getestet).
 *  Unveraendert uebernommen, nur aus dem <script>-Rumpf geloest, damit die
 *  Datei versioniert ausgeliefert und ueber einen SRI-Hash gesichert werden
 *  kann. Wer hier etwas aendert, aendert die Messung von DB-04.
 *  Braucht data-section-instance-id (36 Zeichen) an der Section — das setzt
 *  COMPILE-01. Kuerzere IDs verwirft das Snippet still.
 */
(function(){try{
var EP='https://n8n.srv1485532.hstgr.cloud/webhook/section-track',Q='data-section-instance-id',
G=function(e){var v=e.getAttribute(Q);return v||(e.id&&e.id.slice(0,4)==='sec-'?e.id.slice(4):null)},AE=addEventListener,
E=document.querySelectorAll('['+Q+'],[id^="sec-"]'),T0=performance.now(),
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
if(E.length){var io=new IntersectionObserver(function(x){var n=performance.now(),j,e,d;
for(j=0;j<x.length;j++){e=x[j];d=A[G(e.target)];if(!d)continue;
if(e.isIntersecting){if(d.n++===0)d.t=n}
else{if(d.n>0&&--d.n===0)d.ms+=n-d.t;if(e.boundingClientRect.bottom<=0)d.p=!0}}},{threshold:0});
for(i=0;i<E.length;i++){id=G(E[i]);if(!id||id.length!==36)continue;
if(!A[id])A[id]={ms:0,t:0,n:0,c:0,p:!1};io.observe(E[i])}
AE('click',function(v){act=1;var t=v.target,el=t&&t.closest?t.closest('['+Q+']'):0;
if(el){var d=A[G(el)];if(d)d.c++}},{passive:!0,capture:!0})}
function P(){if(snt||!act)return;snt=1;var n=performance.now(),L=[],k,d;
for(k in A){d=A[k];if(d.n>0){d.ms+=n-d.t;d.n=0}
if(d.ms>=1000||d.c>0){L.push({id:k,visibleMs:Math.round(d.ms),clicks:d.c,passed:d.p});if(L.length>=50)break}}
navigator.sendBeacon(EP,new Blob([JSON.stringify({host:location.hostname,path:location.pathname||'/',
session:S,device:D,timeOnPage:Math.round(n-T0),maxScroll:ms,ref:R,interacted:!0,sections:L})],{type:'text/plain'}))}
document.addEventListener('visibilitychange',function(){document.visibilityState==='hidden'&&P()});
AE('pagehide',P)
}catch(e){}})();
