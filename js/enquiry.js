/* =========================================================
   Timmy's Yummy Bakes - enquiry page
   Validates every field in real time, then calculates an
   estimated cost and availability, shows a summary, emails
   the enquiry via Formspree and clears the form.
   ========================================================= */

(function () {
    "use strict";

    var R = FormUtils.rules;
    var form, summaryEl, submitBtn, validator;

    var FULFILMENT_LABELS = {
        kitchen: "Collect from home kitchen (by appointment)",
        market: "Collect at weekend market stall"
    };

    /* ---------- Product dropdown built from js/products.js ---------- */
    function buildProductOptions(select) {
        Object.keys(CATEGORY_LABELS).forEach(function (cat) {
            var group = document.createElement("optgroup");
            group.label = CATEGORY_LABELS[cat];
            PRODUCTS.filter(function (p) { return p.category === cat; }).forEach(function (p) {
                var opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = p.name + " (" + formatRand(p.price) + " / " + p.unit + ")";
                group.appendChild(opt);
            });
            select.appendChild(group);
        });

        // Pre-select a product chosen on the menu page (enquiry.html?product=...)
        var requested = new URLSearchParams(window.location.search).get("product");
        if (requested && findProduct(requested)) select.value = requested;
    }

    function updateProductHint() {
        var product = findProduct(form.elements.product.value);
        document.getElementById("product-hint").textContent = product
            ? formatRand(product.price) + " per " + product.unit + ". " + product.description
            : "Prices are per whole cake, box of 6 cupcakes or dozen biscuits.";
        document.getElementById("quantity-unit").textContent = product ? "(" + product.unit + ")" : "";
    }

    /* ---------- Validation rules for each field ---------- */
    var validators = {
        name: function (f) { return R.name(f.elements.name.value); },
        email: function (f) { return R.email(f.elements.email.value); },
        phone: function (f) { return R.phone(f.elements.phone.value, true); },
        enquiryType: function (f) { return R.select(f.elements.enquiryType.value, "the type of enquiry"); },
        product: function (f) { return R.select(f.elements.product.value, "a product"); },
        quantity: function (f) {
            var v = f.elements.quantity.value.trim();
            if (!v) return "Please enter how many you need.";
            if (!/^\d+$/.test(v)) return "Please enter a whole number, e.g. 2.";
            var n = parseInt(v, 10);
            if (n < 1) return "The quantity must be at least 1.";
            if (n > 50) return "For more than 50, please contact us directly so we can plan your order.";
            return "";
        },
        date: function (f) {
            var v = f.elements.date.value;
            if (!v) return "Please choose the date you need your order.";
            var date = FormUtils.parseDate(v);
            if (!date) return "Please enter a valid date.";
            var days = FormUtils.daysFromToday(date);
            if (days < 0) return "That date has already passed. Please choose today or a future date.";
            if (days > 365) return "We take orders up to one year ahead. Please choose an earlier date.";
            var day = date.getDay();
            if (f.elements.fulfilment.value === "market" && day !== 0 && day !== 6) {
                return "Our market stall is only open on weekends. Pick a Saturday or Sunday, or choose home-kitchen collection.";
            }
            return "";
        },
        fulfilment: function (f) { return f.elements.fulfilment.value ? "" : "Please choose how you'd like to collect your order."; },
        message: function (f) { return R.message(f.elements.message.value, 20, 500); },
        consent: function (f) { return f.elements.consent.checked ? "" : "Please tick the box so we can contact you about this enquiry."; }
    };

    /* ---------- Estimate & availability ---------- */
    function calculate(data) {
        var product = findProduct(data.product);
        var subtotal = product.price * data.quantity;
        var discount = subtotal >= SITE_CONFIG.bulkThreshold ? Math.round(subtotal * SITE_CONFIG.bulkDiscountRate) : 0;
        var date = FormUtils.parseDate(data.date);
        var days = FormUtils.daysFromToday(date);

        var availability;
        if (days < SITE_CONFIG.minNoticeDays) {
            availability = {
                ok: false,
                text: "Short notice: " + FormUtils.formatDate(date) + " is within our 24-48 hour baking window. " +
                    "We'll do our best, but we'll need to confirm availability with you first."
            };
        } else {
            availability = {
                ok: true,
                text: "Good news: " + FormUtils.formatDate(date) + " gives us " + days +
                    " days' notice, so your order can be baked fresh in time."
            };
        }

        return {
            product: product,
            subtotal: subtotal,
            discount: discount,
            total: subtotal - discount,
            date: date,
            availability: availability,
            reference: "TYB-" + data.date.replace(/-/g, "").slice(2) + "-" + Math.floor(100 + Math.random() * 900)
        };
    }

    function collect() {
        var e = form.elements;
        return {
            name: e.name.value.trim(),
            email: e.email.value.trim(),
            phone: e.phone.value.trim(),
            enquiryType: e.enquiryType.value,
            enquiryTypeLabel: e.enquiryType.options[e.enquiryType.selectedIndex].text,
            product: e.product.value,
            quantity: parseInt(e.quantity.value, 10),
            date: e.date.value,
            fulfilment: e.fulfilment.value,
            message: e.message.value.trim()
        };
    }

    function renderSummary(data, quote) {
        var esc = FormUtils.escapeHtml;
        var p = quote.product;
        var firstName = data.name.split(" ")[0];

        summaryEl.innerHTML =
            '<h2 tabindex="-1">Thank you, ' + esc(firstName) + '! Here\'s your enquiry summary</h2>' +
            '<p>Reference: <strong>' + quote.reference + '</strong></p>' +
            '<p class="availability">' + esc(quote.availability.text) + '</p>' +
            '<h3>Estimated cost</h3>' +
            '<table class="quote-table">' +
                '<thead><tr><th scope="col">Item</th><th scope="col">Amount</th></tr></thead>' +
                '<tbody>' +
                    '<tr><td>' + data.quantity + ' &times; ' + esc(p.name) + ' (' + esc(p.unit) + ' @ ' + formatRand(p.price) + ')</td>' +
                        '<td>' + formatRand(quote.subtotal) + '</td></tr>' +
                    (quote.discount
                        ? '<tr><td>Bulk discount (' + SITE_CONFIG.bulkDiscountRate * 100 + '% on orders of ' + formatRand(SITE_CONFIG.bulkThreshold) + '+)</td><td>&minus;' + formatRand(quote.discount) + '</td></tr>'
                        : '') +
                '</tbody>' +
                '<tfoot><tr><th scope="row">Estimated total</th><td>' + formatRand(quote.total) + '</td></tr></tfoot>' +
            '</table>' +
            (!quote.discount && quote.subtotal < SITE_CONFIG.bulkThreshold
                ? '<p class="hint">Tip: orders of ' + formatRand(SITE_CONFIG.bulkThreshold) + ' or more get ' + SITE_CONFIG.bulkDiscountRate * 100 + '% off.</p>'
                : '') +
            '<h3>Your details</h3>' +
            '<dl>' +
                '<dt>Name</dt><dd>' + esc(data.name) + '</dd>' +
                '<dt>Email</dt><dd>' + esc(data.email) + '</dd>' +
                '<dt>Phone</dt><dd>' + esc(data.phone) + '</dd>' +
                '<dt>Occasion</dt><dd>' + esc(data.enquiryTypeLabel) + '</dd>' +
                '<dt>Date needed</dt><dd>' + esc(FormUtils.formatDate(quote.date)) + '</dd>' +
                '<dt>Collection</dt><dd>' + esc(FULFILMENT_LABELS[data.fulfilment]) + '</dd>' +
                '<dt>Details</dt><dd>' + esc(data.message) + '</dd>' +
            '</dl>' +
            '<p id="send-status" class="alert" role="status" aria-live="polite">Sending your enquiry to Timmy&hellip;</p>' +
            '<p class="hint">This is an estimate. Final pricing may change for custom decorations or themes.</p>' +
            '<div class="btn-group"><button type="button" class="btn btn-outline" id="new-enquiry">Start a new enquiry</button></div>';

        summaryEl.hidden = false;
        summaryEl.querySelector("h2").focus();
        summaryEl.scrollIntoView({ behavior: "smooth", block: "start" });

        document.getElementById("new-enquiry").addEventListener("click", function () {
            summaryEl.hidden = true;
            form.elements.name.focus();
        });
    }

    function setSendStatus(ok, text) {
        var status = document.getElementById("send-status");
        if (!status) return;
        status.className = "alert " + (ok ? "alert-success" : "alert-error");
        status.textContent = text;
    }

    function onValid() {
        var data = collect();
        var quote = calculate(data);

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending&hellip;';

        renderSummary(data, quote);
        validator.reset();

        FormUtils.send({
            _subject: "New enquiry " + quote.reference + " from " + data.name,
            form: "Order enquiry",
            reference: quote.reference,
            name: data.name,
            email: data.email,
            phone: data.phone,
            occasion: data.enquiryTypeLabel,
            product: quote.product.name + " (" + quote.product.unit + ")",
            quantity: data.quantity,
            date_needed: data.date,
            collection: FULFILMENT_LABELS[data.fulfilment],
            estimated_total: formatRand(quote.total),
            availability: quote.availability.text,
            message: data.message
        }).then(function () {
            setSendStatus(true, "Sent! Timmy will reply to " + data.email + " to confirm your order.");
        }).catch(function (err) {
            setSendStatus(false, FormUtils.sendErrorMessage(err) +
                " You can also call 075 071 8553 and quote reference " + quote.reference + ".");
        }).then(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = "Get my estimate";
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        form = document.getElementById("enquiry-form");
        if (!form) return;
        summaryEl = document.getElementById("enquiry-summary");
        submitBtn = form.querySelector("button[type=submit]");

        buildProductOptions(form.elements.product);
        updateProductHint();
        form.elements.product.addEventListener("change", updateProductHint);
        form.addEventListener("reset", function () { window.setTimeout(updateProductHint, 0); });

        // The date picker cannot go into the past or more than a year ahead
        var today = FormUtils.startOfToday();
        var maxDate = new Date(today);
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        form.elements.date.min = FormUtils.toInputDate(today);
        form.elements.date.max = FormUtils.toInputDate(maxDate);

        FormUtils.counter(form.elements.message, 500);

        validator = FormUtils.attach(form, validators, {
            linked: { fulfilment: ["date"] },
            onValid: onValid
        });
    });
})();
