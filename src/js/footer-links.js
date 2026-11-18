/* Footer link columns (_includes/footer.njk): show the first 6 links in each column, with a centred chevron
   under any longer column that expands it (and collapses it again). Without this script every link shows. */
(function () {
  var LIMIT = 6;
  document.querySelectorAll(".footer-links_col").forEach(function (col) {
    var items = col.querySelectorAll("li");
    var button = col.querySelector(".footer-links_more");
    if (!button || items.length <= LIMIT) return;
    var label = button.querySelector(".visually-hidden");
    var title = (col.querySelector(".footer-links_title") || {}).textContent || "links";
    function set(open) {
      col.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = (open ? "Show fewer " : "Show all ") + title.trim().toLowerCase();
      items.forEach(function (li, i) { li.hidden = !open && i >= LIMIT; });
    }
    button.hidden = false;
    set(false);
    button.addEventListener("click", function () { set(!col.classList.contains("is-open")); });
  });
})();
