// KOL Hub: filter the KOL cards by surname initial, one letter at a time, and sort them.
// Click a letter to show only those KOLs; click the same letter again, or "Show all", to show everyone.
// Markup: the letter buttons in [data-kol-filter] and the cards in [data-kol-list], each card carrying
// data-surname, data-first and data-letter (set in src/kol-hub.njk).
(function () {
  var root = document.querySelector("[data-kol-filter]");
  var list = document.querySelector("[data-kol-list]");
  if (!root || !list) return;

  var cards = [].slice.call(list.children);
  var buttons = [].slice.call(root.querySelectorAll(".kol-letter:not([disabled])"));
  var sort = root.querySelector('select[name="sort"]');
  var count = root.querySelector(".kol-filter-count");
  var clear = root.querySelector(".kol-filter-clear");
  var collator = new Intl.Collator("en", { sensitivity: "base" });
  var active = null;

  function update() {
    root.classList.toggle("is-filtered", !!active);
    buttons.forEach(function (b) {
      var on = b.getAttribute("data-letter") === active;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var shown = 0;
    cards.forEach(function (card) {
      var show = !active || card.getAttribute("data-letter") === active;
      card.style.display = show ? "" : "none";
      if (show) shown++;
    });
    count.textContent = active ? shown + (shown === 1 ? " KOL" : " KOLs") + " · " + active : "";
    clear.hidden = !active;
  }

  function order() {
    var mode = sort.value;
    var key = mode === "first" ? "data-first" : "data-surname";
    cards.sort(function (a, b) {
      var c = collator.compare(a.getAttribute(key), b.getAttribute(key));
      if (!c) c = collator.compare(a.getAttribute("data-first"), b.getAttribute("data-first"));
      return mode === "surname-desc" ? -c : c;
    });
    cards.forEach(function (card) { list.appendChild(card); });
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var letter = b.getAttribute("data-letter");
      active = active === letter ? null : letter; // the same letter again shows everyone
      update();
    });
  });
  sort.addEventListener("change", order);
  clear.addEventListener("click", function () {
    active = null;
    update();
  });
  update();
})();
