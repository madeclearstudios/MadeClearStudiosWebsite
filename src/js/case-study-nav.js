/* Case study pages: previous/next like a slideshow, and the load-in animation as you scroll.
   - The arrows (.case-pager) and the left/right arrow keys go to the previous or next case study. The direction is
     kept in sessionStorage so the next page slides in from the right side (see the view transition in case-study.njk).
   - Photos, videos and blocks of copy fade and rise into place as they come into view. Skipped for people who
     prefer reduced motion; without JavaScript everything simply shows. */
(function () {
  var root = document.documentElement;

  function go(link) {
    try { sessionStorage.setItem("cs-dir", link.getAttribute("data-case-nav")); } catch (e) {}
    root.setAttribute("data-cs-dir", link.getAttribute("data-case-nav"));
  }
  document.querySelectorAll("[data-case-nav]").forEach(function (link) {
    link.addEventListener("click", function () { go(link); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.querySelector(".w-lightbox-backdrop")) return; /* the lightbox uses the arrow keys itself */
    var dir = e.key === "ArrowRight" ? "next" : e.key === "ArrowLeft" ? "prev" : null;
    if (!dir) return;
    if (t && t.closest && t.closest(".splide")) return; /* sliders use them too */
    var link = document.querySelector('[data-case-nav="' + dir + '"]');
    if (!link) return;
    e.preventDefault();
    go(link);
    window.location.href = link.href;
  });

  /* Load-in animation */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { root.classList.remove("cs-anim"); return; }
  var groups = [
    ".case-hero_title", ".case-hero .max-w-498",
    ".case-body_sticky > *",
    ".case-gallery .media-grid-item",
    ".case-body_main > .flex > .flex:not(:has(> .w-dyn-bind-empty + .w-dyn-bind-empty))",
    "#images-slider", ".case-page blockquote", ".video-gallery .grid > div",
    ".case-page [role=listitem]"
  ];
  var items = document.querySelectorAll(groups.join(","));
  var io = new IntersectionObserver(function (entries) {
    var batch = 0;
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.style.transitionDelay = Math.min(batch++ * 90, 360) + "ms";
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  items.forEach(function (el) {
    if (el.closest(".footer, .form-wrapper")) return;
    el.classList.add("cs-reveal");
    io.observe(el);
  });
})();
