/* =========================================================
   Timmy's Yummy Bakes - gallery page
   Category filters plus an accessible lightbox with
   next/previous, keyboard (Esc, arrows, Tab trap), swipe and
   click-outside-to-close. The lightbox only steps through the
   photos visible under the current filter.
   ========================================================= */

(function () {
    "use strict";

    var items, lightbox, lbImage, lbCaption, lbCounter, closeBtn, prevBtn, nextBtn;
    var visible = [];
    var current = 0;
    var lastFocused = null;

    /* ---------- Filtering ---------- */
    function applyFilter(category) {
        document.querySelectorAll(".filter-btn").forEach(function (btn) {
            btn.setAttribute("aria-pressed", String(btn.dataset.category === category));
        });

        items.forEach(function (item) {
            item.hidden = category !== "all" && item.dataset.category !== category;
        });

        visible = items.filter(function (item) { return !item.hidden; });
        var label = category === "all" ? "all categories" : category;
        document.getElementById("gallery-status").textContent =
            "Showing " + visible.length + " photos from " + label + ".";
    }

    /* ---------- Lightbox ---------- */
    function show(index) {
        current = (index + visible.length) % visible.length;
        var trigger = visible[current].querySelector(".gallery-trigger");
        var thumb = trigger.querySelector("img");

        lbImage.style.opacity = "0.3";
        lbImage.onload = function () { lbImage.style.opacity = "1"; };
        lbImage.src = trigger.dataset.full;
        lbImage.alt = thumb.alt;
        lbCaption.textContent = visible[current].querySelector("figcaption").textContent;
        lbCounter.textContent = "Photo " + (current + 1) + " of " + visible.length;

        // Hide arrows when there is nothing to step through
        prevBtn.hidden = nextBtn.hidden = visible.length < 2;

        // Preload neighbours so next/previous feel instant
        [current - 1, current + 1].forEach(function (i) {
            var n = visible[(i + visible.length) % visible.length];
            new Image().src = n.querySelector(".gallery-trigger").dataset.full;
        });
    }

    function open(index) {
        lastFocused = document.activeElement;
        show(index);
        lightbox.classList.add("is-open");
        lightbox.removeAttribute("aria-hidden");
        lightbox.inert = false;
        document.body.classList.add("no-scroll");
        closeBtn.focus();
    }

    function close() {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        lightbox.inert = true;
        document.body.classList.remove("no-scroll");
        if (lastFocused) lastFocused.focus();
    }

    function isOpen() {
        return lightbox.classList.contains("is-open");
    }

    function onKeydown(e) {
        if (!isOpen()) return;
        if (e.key === "Escape") { close(); return; }
        if (e.key === "ArrowRight") { show(current + 1); return; }
        if (e.key === "ArrowLeft") { show(current - 1); return; }

        // Keep keyboard focus inside the dialog
        if (e.key === "Tab") {
            var focusable = Array.prototype.filter.call(
                lightbox.querySelectorAll("button"),
                function (b) { return !b.hidden; }
            );
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        lightbox = document.getElementById("lightbox");
        if (!lightbox) return;

        items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
        lbImage = document.getElementById("lightbox-image");
        lbCaption = document.getElementById("lightbox-caption");
        lbCounter = document.getElementById("lightbox-counter");
        closeBtn = lightbox.querySelector(".lightbox-close");
        prevBtn = lightbox.querySelector(".lightbox-prev");
        nextBtn = lightbox.querySelector(".lightbox-next");
        lightbox.inert = true;

        document.querySelectorAll(".filter-btn").forEach(function (btn) {
            btn.addEventListener("click", function () { applyFilter(btn.dataset.category); });
        });

        items.forEach(function (item) {
            item.querySelector(".gallery-trigger").addEventListener("click", function () {
                open(visible.indexOf(item));
            });
        });

        closeBtn.addEventListener("click", close);
        prevBtn.addEventListener("click", function () { show(current - 1); });
        nextBtn.addEventListener("click", function () { show(current + 1); });

        // Clicking the dark backdrop (not the photo or buttons) closes the viewer
        lightbox.addEventListener("click", function (e) {
            if (e.target === lightbox || e.target.classList.contains("lightbox-figure")) close();
        });

        document.addEventListener("keydown", onKeydown);

        // Swipe left/right on touch screens
        var startX = null;
        lightbox.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
        lightbox.addEventListener("touchend", function (e) {
            if (startX === null) return;
            var dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
            startX = null;
        });

        applyFilter("all");
    });
})();
