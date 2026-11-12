// Services page: the chevron next to a service with its own page opens a short summary and a "Read more"
// button (markup in _includes/services/service-row.njk). The summary opens within its own column; the service
// beside it in the same grid row gets .service-row-neighbour so its underline stays under its name.
(function () {
  function markNeighbours() {
    document.querySelectorAll(".service-row-neighbour").forEach(function (el) { el.classList.remove("service-row-neighbour"); });
    document.querySelectorAll(".service-expandable.is-open").forEach(function (item) {
      var top = item.getBoundingClientRect().top;
      Array.prototype.forEach.call(item.parentElement.children, function (sib) {
        if (sib !== item && !sib.classList.contains("is-open") && Math.abs(sib.getBoundingClientRect().top - top) < 2) {
          sib.classList.add("service-row-neighbour");
        }
      });
    });
  }

  document.querySelectorAll(".service-toggle").forEach(function (button) {
    var item = button.closest(".service-expandable");
    var panel = document.getElementById(button.getAttribute("aria-controls"));
    var label = button.querySelector(".visually-hidden");
    if (!item || !panel) return;
    var name = label ? label.textContent.replace(/^Show a summary of /, "") : "";

    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      item.classList.toggle("is-open", open);
      panel.hidden = !open;
      if (label && name) label.textContent = (open ? "Hide the summary of " : "Show a summary of ") + name;
      markNeighbours();
    });
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(markNeighbours, 150);
  });
})();
