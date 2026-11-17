/* Work rails (_includes/work-rail.njk): one continuous row of project cards that runs off the right edge.
   - Touch: native swipe. Mouse: click and drag the row; a drag doesn't open the card you started on.
   - The year on the left follows the cards in view: it shows the year of the first card at the left of the row. */
(function () {
  document.querySelectorAll("[data-work-rail]").forEach(function (rail) {
    var track = rail.querySelector("[data-work-rail-track]");
    var yearEl = rail.querySelector("[data-work-rail-year]");
    if (!track) return;
    var items = Array.prototype.slice.call(track.querySelectorAll(".work-rail_item"));

    // Year label
    var current = yearEl ? yearEl.textContent.trim() : "";
    function updateYear() {
      if (!yearEl || !items.length) return;
      var left = track.getBoundingClientRect().left;
      var first = items[0];
      for (var i = 0; i < items.length; i++) {
        var r = items[i].getBoundingClientRect();
        if (r.right > left + r.width * 0.5) { first = items[i]; break; }
      }
      var y = first.getAttribute("data-year") || "";
      if (y && y !== current) {
        current = y;
        yearEl.classList.remove("is-changing");
        void yearEl.offsetWidth;
        yearEl.textContent = y;
        yearEl.classList.add("is-changing");
      }
    }
    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; updateYear(); });
    }, { passive: true });

    // Overflow state (shows the drag cue only when there is more to see)
    function updateOverflow() { rail.classList.toggle("has-more", track.scrollWidth > track.clientWidth + 4); }
    updateOverflow();
    window.addEventListener("resize", function () { updateOverflow(); updateYear(); });

    // Mouse drag to scroll
    var down = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; rail.classList.add("is-dragging"); }
      if (moved) { track.scrollLeft = startScroll - dx; e.preventDefault(); }
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      rail.classList.remove("is-dragging");
    });
    // A drag shouldn't open a card
    track.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });
})();
