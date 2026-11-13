/* The MENU button in the nav (_includes/nav.njk): opens and closes the black menu panel.
   The panel has its own Close button in the same place. Escape or a click on a link closes it; while open, the page behind does not scroll and focus stays in the panel. */
(function () {
  var btn = document.querySelector("[data-menu-toggle]");
  var closeBtn = document.querySelector("[data-menu-close]");
  var menu = document.querySelector("[data-site-menu]");
  if (!btn || !menu) return;
  var root = document.documentElement;
  var focusable = function () { return Array.prototype.slice.call(menu.querySelectorAll("a[href], button")); };
  function set(open) {
    root.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    menu.toggleAttribute("inert", !open);
    if (open && closeBtn) setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 50);
  }
  set(false);
  btn.addEventListener("click", function () { set(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { set(false); btn.focus(); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) {
    if (!root.classList.contains("menu-open")) return;
    if (e.key === "Escape") { set(false); btn.focus(); return; }
    if (e.key === "Tab") {
      var els = focusable(), i = els.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); els[els.length - 1].focus(); }
      else if (!e.shiftKey && i === els.length - 1) { e.preventDefault(); els[0].focus(); }
    }
  });
})();
