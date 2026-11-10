// KOL Hub: filter the KOL cards by surname initial (A–Z letters, several can be ticked) and sort them.
// Markup: the form in [data-kol-filter] and the cards in [data-kol-list], each card carrying
// data-surname, data-first and data-letter (set in src/kol-hub.njk).
(function () {
  var root = document.querySelector("[data-kol-filter]");
  var list = document.querySelector("[data-kol-list]");
  if (!root || !list) return;

  var cards = [].slice.call(list.children);
  var boxes = [].slice.call(root.querySelectorAll('input[name="surname"]'));
  var sort = root.querySelector('select[name="sort"]');
  var count = root.querySelector(".kol-filter-count");
  var clear = root.querySelector(".kol-filter-clear");
  var collator = new Intl.Collator("en", { sensitivity: "base" });

  function update() {
    var picked = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
    boxes.forEach(function (b) {
      // Webflow's custom checkbox style
      b.previousElementSibling.classList.toggle("w--redirected-checked", b.checked);
    });
    var shown = 0;
    cards.forEach(function (card) {
      var show = !picked.length || picked.indexOf(card.getAttribute("data-letter")) !== -1;
      card.style.display = show ? "" : "none";
      if (show) shown++;
    });
    clear.hidden = !picked.length;
    count.textContent = picked.length ? shown + (shown === 1 ? " KOL" : " KOLs") : "";
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

  boxes.forEach(function (b) { b.addEventListener("change", update); });
  sort.addEventListener("change", order);
  clear.addEventListener("click", function () {
    boxes.forEach(function (b) { b.checked = false; });
    update();
  });
  update();
})();
