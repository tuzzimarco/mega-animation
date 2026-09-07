/*! anim-runtime 1.0.0 — GSAP-Bootstrap der Mega-Automation
 *  Quelle: MOTION-AP3-RUNTIME.md §4 (Stand 2026-08-24), unveraendert in der
 *  Wirkung, nur aus dem <script>-Rumpf in eine eigene Datei geloest, damit sie
 *  versioniert ausgeliefert und ueber einen SRI-Hash gesichert werden kann.
 *
 *  Diese Datei wird NICHT je Kundenlauf neu registriert. Webflows Skriptliste
 *  zaehlt Versionen, nicht Skripte, und Loeschen gibt dauerhaft 400 —
 *  registriert wird nur bei einer echten Aenderung der Runtime.
 *
 *  Erwartet vorher geladen (Site Settings, </head>, mit defer):
 *    gsap.min.js und ScrollTrigger.min.js
 *  Erwartet im Dokument:
 *    <script>document.documentElement.classList.add('js-anim')</script>  synchron im <head>
 *    Rezept-Snippets, die sich in window.__animQueue eintragen
 */
(function () {
  // ── Double-GSAP Guard ────────────────────────────────────────────────
  // Webflow-Projekte mit mehreren Page Scripts laden GSAP sonst zweimal.
  if (window.__gsapBootstrapped) return;
  window.__gsapBootstrapped = true;

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("[ANIM] GSAP/ScrollTrigger fehlt — Animationen deaktiviert.");
    // Endzustaende direkt setzen, damit Inhalte sichtbar sind. Ein Ausfall der
    // Animation darf nie ein Ausfall des Inhalts sein.
    document.querySelectorAll("[data-anim-hidden]").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // anticipatePin verhindert Ruckeln beim Einrasten von Pin-Sections.
  ScrollTrigger.defaults({ anticipatePin: 1 });

  var mm = gsap.matchMedia();

  // ── Reduced Motion: kein Tween, direkt Endzustand ────────────────────
  mm.add("(prefers-reduced-motion: reduce)", function () {
    document.querySelectorAll("[data-anim-hidden]").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll("[data-seq-canvas]").forEach(function (canvas) {
      var mid = Math.floor((parseInt(canvas.dataset.seqFrames, 10) || 1) / 2);
      var src = String(canvas.dataset.seqSrc || "").replace("{n}", String(mid).padStart(4, "0"));
      var img = canvas.parentElement && canvas.parentElement.querySelector("[data-seq-fallback]");
      if (img) { img.src = src; img.style.display = "block"; }
      canvas.style.display = "none";
    });
    ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    return function () {};
  });

  // ── Normal: Vollanimation ────────────────────────────────────────────
  mm.add("(prefers-reduced-motion: no-preference)", function () {
    var tweenDefaults = {
      invalidateOnRefresh: true,   // Positionen nach Resize neu berechnen
      overwrite: "auto"            // Konflikte mehrerer Tweens am selben Element
    };

    // Jedes Rezept-Snippet traegt sich selbst in die Queue ein; dieses
    // Bootstrap ruft sie der Reihe nach auf. So haengt nichts an der
    // Ladereihenfolge der Scripts.
    var queue = window.__animQueue || [];
    queue.forEach(function (fn) {
      try { fn(gsap, ScrollTrigger, tweenDefaults); }
      catch (e) { console.warn("[ANIM] Rezept-Fehler:", e); }
    });

    // CMS-Listen blendet Webflow asynchron ein; danach stimmen die
    // ScrollTrigger-Positionen nicht mehr.
    function refreshAfterCms() {
      if (document.readyState === "complete") {
        ScrollTrigger.refresh();
      } else {
        window.addEventListener("load", function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { ScrollTrigger.refresh(); });
          });
        }, { once: true });
      }
    }
    refreshAfterCms();

    return function () {
      ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    };
  });
})();
