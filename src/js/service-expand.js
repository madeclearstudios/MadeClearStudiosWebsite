// Services page: the chevron next to a service with its own page opens a short summary and a "Read more"
// button (markup in _includes/services/service-row.njk). Open items span the full width of the list.
(function () {
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
    });
  });
})();
