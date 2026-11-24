/* Work rails (_includes/work-rail.njk): one continuous row of project cards that runs off the right edge.
   - Touch: native swipe. Mouse: click and drag the row; a drag doesn't open the card you started on.
   - The year on the left follows the cards in view: it shows the year of the first card at the left of the row.
   - When the row spans more than one year, extra space after the last card lets it be dragged all the way to the
     left, so the oldest year can come up even when it's at the end of the row. */
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

    // End space: with more than one year in the row, pad the end so the last card can reach the left edge
    var years = {};
    items.forEach(function (it) { years[it.getAttribute("data-year") || ""] = 1; });
    var multiYear = Object.keys(years).length > 1;
    var spacer = null;
    if (multiYear && items.length) {
      spacer = document.createElement("div");
      spacer.className = "work-rail_end";
      spacer.setAttribute("aria-hidden", "true");
      track.appendChild(spacer);
    }
    function updateEndSpace() {
      if (!spacer) return;
      var cs = getComputedStyle(track);
      var gap = parseFloat(cs.columnGap) || 0;
      var pad = parseFloat(cs.paddingRight) || 0;
      var last = items[items.length - 1].getBoundingClientRect().width;
      spacer.style.flexBasis = Math.max(0, track.clientWidth - last - gap - pad) + "px";
    }

    // Overflow state (shows the drag cue only when there is more to see)
    function updateOverflow() { rail.classList.toggle("has-more", track.scrollWidth > track.clientWidth + 4); }
    updateEndSpace();
    updateOverflow();
    window.addEventListener("resize", function () { updateEndSpace(); updateOverflow(); updateYear(); });

    // Previous / next buttons (railArrows): step one card at a time; each is disabled at its end of the row
    var arrows = rail.nextElementSibling && rail.nextElementSibling.matches("[data-work-rail-arrows]") ? rail.nextElementSibling : null;
    var prevBtn = arrows && arrows.querySelector("[data-work-rail-prev]");
    var nextBtn = arrows && arrows.querySelector("[data-work-rail-next]");
    function step(dir) {
      var first = items[0];
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var by = first ? first.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
      track.scrollBy({ left: dir * by, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    function updateArrows() {
      if (!arrows) return;
      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      arrows.hidden = track.scrollWidth <= track.clientWidth + 4;
    }
    if (arrows) {
      prevBtn.addEventListener("click", function () { step(-1); });
      nextBtn.addEventListener("click", function () { step(1); });
      track.addEventListener("scroll", updateArrows, { passive: true });
      window.addEventListener("resize", updateArrows);
      updateArrows();
    }

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
