/* =========================================================
   Timmy's Yummy Bakes - shared site behaviour
   Runs on every page: navigation, header, back-to-top,
   scroll reveal, FAQ accordion and image slider.
   ========================================================= */

(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Responsive hamburger navigation ---------- */
    function initNav() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.getElementById("site-nav");
        if (!toggle || !nav) return;

        function setOpen(open) {
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            nav.classList.toggle("is-open", open);
        }

        toggle.addEventListener("click", function () {
            setOpen(toggle.getAttribute("aria-expanded") !== "true");
        });

        // Close after choosing a link, on Escape, or when clicking elsewhere
        nav.addEventListener("click", function (e) {
            if (e.target.closest("a")) setOpen(false);
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && nav.classList.contains("is-open")) {
                setOpen(false);
                toggle.focus();
            }
        });

        document.addEventListener("click", function (e) {
            if (nav.classList.contains("is-open") && !e.target.closest(".site-header")) {
                setOpen(false);
            }
        });

        // Reset when resizing up to the desktop layout
        window.matchMedia("(min-width: 901px)").addEventListener("change", function (mq) {
            if (mq.matches) setOpen(false);
        });
    }

    /* ---------- Header shadow + back-to-top button ---------- */
    function initScrollUI() {
        var header = document.querySelector(".site-header");

        var topBtn = document.createElement("button");
        topBtn.type = "button";
        topBtn.className = "back-to-top";
        topBtn.setAttribute("aria-label", "Back to top");
        topBtn.innerHTML = "&#8593;";
        document.body.appendChild(topBtn);

        topBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
            var skip = document.querySelector(".skip-link");
            if (skip) skip.focus({ preventScroll: true });
        });

        var ticking = false;
        function update() {
            var y = window.scrollY;
            if (header) header.classList.toggle("is-scrolled", y > 10);
            topBtn.classList.toggle("is-visible", y > 400);
            ticking = false;
        }

        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
        update();
    }

    /* ---------- Reveal sections as they scroll into view ---------- */
    function initReveal() {
        var items = document.querySelectorAll(".reveal");
        if (!items.length) return;

        if (reduceMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        items.forEach(function (el) { observer.observe(el); });
    }

    /* ---------- FAQ accordion ---------- */
    function initAccordions() {
        document.querySelectorAll("[data-accordion]").forEach(function (accordion) {
            var triggers = accordion.querySelectorAll(".accordion-trigger");

            function setPanel(trigger, open) {
                var panel = document.getElementById(trigger.getAttribute("aria-controls"));
                trigger.setAttribute("aria-expanded", String(open));
                panel.classList.toggle("is-open", open);
                panel.style.maxHeight = open ? panel.scrollHeight + 40 + "px" : "0";
            }

            triggers.forEach(function (trigger, i) {
                trigger.addEventListener("click", function () {
                    var open = trigger.getAttribute("aria-expanded") !== "true";
                    // Only one answer open at a time keeps the list scannable
                    triggers.forEach(function (t) { if (t !== trigger) setPanel(t, false); });
                    setPanel(trigger, open);
                });

                // Arrow keys / Home / End move between questions
                trigger.addEventListener("keydown", function (e) {
                    var next = null;
                    if (e.key === "ArrowDown") next = triggers[(i + 1) % triggers.length];
                    if (e.key === "ArrowUp") next = triggers[(i - 1 + triggers.length) % triggers.length];
                    if (e.key === "Home") next = triggers[0];
                    if (e.key === "End") next = triggers[triggers.length - 1];
                    if (next) {
                        e.preventDefault();
                        next.focus();
                    }
                });
            });
        });
    }

    /* ---------- Image slider ---------- */
    function initSliders() {
        document.querySelectorAll("[data-slider]").forEach(function (slider) {
            var slides = slider.querySelectorAll(".slide");
            var dotsWrap = slider.querySelector(".slider-dots");
            var current = 0;
            var timer = null;
            if (slides.length < 2) return;

            var dots = Array.prototype.map.call(slides, function (_, i) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "Show slide " + (i + 1) + " of " + slides.length);
                dot.addEventListener("click", function () { go(i); restart(); });
                dotsWrap.appendChild(dot);
                return dot;
            });

            function go(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (s, i) {
                    var active = i === current;
                    s.classList.toggle("is-active", active);
                    s.setAttribute("aria-hidden", String(!active));
                });
                dots.forEach(function (d, i) {
                    d.setAttribute("aria-current", String(i === current));
                });
            }

            function start() {
                if (!reduceMotion) timer = window.setInterval(function () { go(current + 1); }, 6000);
            }
            function stop() { window.clearInterval(timer); }
            function restart() { stop(); start(); }

            slider.querySelector(".prev").addEventListener("click", function () { go(current - 1); restart(); });
            slider.querySelector(".next").addEventListener("click", function () { go(current + 1); restart(); });

            // Pause while the visitor is reading or interacting
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            slider.addEventListener("focusin", stop);
            slider.addEventListener("focusout", start);

            // Swipe support on touch screens
            var startX = null;
            slider.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
            slider.addEventListener("touchend", function (e) {
                if (startX === null) return;
                var dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
                startX = null;
            });

            go(0);
            start();
        });
    }

    /* ---------- Footer year ---------- */
    function initYear() {
        document.querySelectorAll("[data-year]").forEach(function (el) {
            el.textContent = new Date().getFullYear();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNav();
        initScrollUI();
        initReveal();
        initAccordions();
        initSliders();
        initYear();
    });
})();
