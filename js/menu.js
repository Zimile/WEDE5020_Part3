/* =========================================================
   Timmy's Yummy Bakes - menu page
   Renders PRODUCTS (js/products.js) into the grid and adds a
   live, case-insensitive search, category filters and sorting.
   Filters are kept in the URL (?category=cakes&q=choc) so
   links from other pages can open a pre-filtered menu.
   ========================================================= */

(function () {
    "use strict";

    var grid, searchInput, sortSelect, statusEl, emptyEl, emptyTerm, filterButtons;
    var state = { q: "", category: "all", sort: "featured" };

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // Wrap each search word in <mark> so visitors see why a result matched
    function highlight(text, words) {
        if (!words.length) return escapeHtml(text);
        var pattern = new RegExp("(" + words.map(escapeRegExp).join("|") + ")", "gi");
        // split() with a capture group puts the matches at odd indexes
        return text.split(pattern).map(function (part, i) {
            return i % 2 ? "<mark>" + escapeHtml(part) + "</mark>" : escapeHtml(part);
        }).join("");
    }

    function searchWords() {
        return state.q.toLowerCase().split(/\s+/).filter(Boolean);
    }

    function matches(product, words) {
        if (state.category !== "all" && product.category !== state.category) return false;
        var haystack = [product.name, product.description, product.category, product.unit]
            .concat(product.tags).join(" ").toLowerCase();
        // Every word must appear somewhere, so "choc cup" finds chocolate cupcakes
        return words.every(function (w) { return haystack.indexOf(w) !== -1; });
    }

    function sortProducts(list) {
        var sorted = list.slice();
        if (state.sort === "price-asc") sorted.sort(function (a, b) { return a.price - b.price; });
        if (state.sort === "price-desc") sorted.sort(function (a, b) { return b.price - a.price; });
        if (state.sort === "name") sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
        return sorted;
    }

    function cardHtml(p, words) {
        return '<article class="product-card">' +
            '<img src="images/' + p.image + '-480.jpg" ' +
                'srcset="images/' + p.image + '-480.jpg 480w, images/' + p.image + '.jpg ' + p.width + 'w" ' +
                'sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 380px" ' +
                'alt="' + escapeHtml(p.alt) + '" width="480" height="360" loading="lazy" decoding="async">' +
            '<div class="product-card-body">' +
                '<span class="badge">' + escapeHtml(CATEGORY_LABELS[p.category]) + '</span>' +
                '<h3>' + highlight(p.name, words) + '</h3>' +
                '<p>' + highlight(p.description, words) + '</p>' +
                '<div class="card-meta">' +
                    '<p class="price">' + formatRand(p.price) + ' <small>/ ' + escapeHtml(p.unit) + '</small></p>' +
                    '<a class="btn btn-outline" href="enquiry.html?product=' + encodeURIComponent(p.id) + '" ' +
                        'aria-label="Enquire about ' + escapeHtml(p.name) + '">Enquire</a>' +
                '</div>' +
            '</div>' +
        '</article>';
    }

    function render() {
        var words = searchWords();
        var results = sortProducts(PRODUCTS.filter(function (p) { return matches(p, words); }));

        grid.innerHTML = results.map(function (p) { return cardHtml(p, words); }).join("");

        var where = state.category === "all" ? "" : " in " + CATEGORY_LABELS[state.category];
        var forText = state.q ? ' for "' + state.q.trim() + '"' : "";
        statusEl.textContent = results.length
            ? "Showing " + results.length + " of " + PRODUCTS.length + " treats" + where + forText + "."
            : "No treats found" + where + forText + ".";

        emptyEl.hidden = results.length > 0;
        emptyTerm.textContent = state.q.trim() || CATEGORY_LABELS[state.category] || "";

        syncUrl();
    }

    function setCategory(category) {
        state.category = CATEGORY_LABELS[category] ? category : "all";
        filterButtons.forEach(function (btn) {
            btn.setAttribute("aria-pressed", String(btn.dataset.category === state.category));
        });
    }

    function syncUrl() {
        if (!window.history.replaceState) return;
        var params = new URLSearchParams();
        if (state.category !== "all") params.set("category", state.category);
        if (state.q.trim()) params.set("q", state.q.trim());
        var query = params.toString();
        window.history.replaceState(null, "", window.location.pathname + (query ? "?" + query : ""));
    }

    function clearFilters() {
        state.q = "";
        searchInput.value = "";
        setCategory("all");
        render();
        searchInput.focus();
    }

    document.addEventListener("DOMContentLoaded", function () {
        grid = document.getElementById("product-grid");
        if (!grid || typeof PRODUCTS === "undefined") return;

        searchInput = document.getElementById("menu-search");
        sortSelect = document.getElementById("menu-sort");
        statusEl = document.getElementById("menu-status");
        emptyEl = document.getElementById("menu-empty");
        emptyTerm = document.getElementById("menu-empty-term");
        filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));

        // Restore filters from the URL
        var params = new URLSearchParams(window.location.search);
        state.q = params.get("q") || "";
        searchInput.value = state.q;
        setCategory(params.get("category") || "all");

        searchInput.addEventListener("input", function () {
            state.q = searchInput.value;
            render();
        });

        // Escape clears the search box
        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && searchInput.value) {
                searchInput.value = "";
                state.q = "";
                render();
            }
        });

        filterButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                setCategory(btn.dataset.category);
                render();
            });
        });

        sortSelect.addEventListener("change", function () {
            state.sort = sortSelect.value;
            render();
        });

        document.getElementById("menu-clear").addEventListener("click", clearFilters);

        render();
    });
})();
