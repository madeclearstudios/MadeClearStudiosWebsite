// Night mode switch. The class is set before paint by _includes/theme.njk; this keeps the switches in step
// and saves the choice ("mc-theme" in localStorage).
(function () {
  var root = document.documentElement;
  function sync() {
    var on = root.classList.contains("night-mode");
    document.querySelectorAll("[data-night-toggle]").forEach(function (b) { b.setAttribute("aria-checked", String(on)); });
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-night-toggle]");
    if (!btn) return;
    var on = !root.classList.contains("night-mode");
    root.classList.toggle("night-mode", on);
    try { localStorage.setItem("mc-theme", on ? "night" : "day"); } catch (err) {}
    sync();
  });
  sync();
})();
