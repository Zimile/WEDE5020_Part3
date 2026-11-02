/* =========================================================
   Timmy's Yummy Bakes - shared form helpers
   Validation rules, real-time inline error handling and
   sending submissions to Formspree. Used by enquiry.js and
   contact.js.
   ========================================================= */

var FormUtils = (function () {
    "use strict";

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    // South African numbers: 0 or +27, then 9 digits starting 1-8 (e.g. 075 071 8553)
    var SA_PHONE_RE = /^(?:\+27|0)[1-8]\d{8}$/;
    var NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]*$/;

    /* ---------- Individual rules (return "" when valid) ---------- */
    var rules = {
        name: function (value) {
            var v = value.trim();
            if (!v) return "Please enter your name.";
            if (v.length < 2) return "Your name needs at least 2 letters.";
            if (!NAME_RE.test(v)) return "Names can only contain letters, spaces, hyphens and apostrophes.";
            return "";
        },
        email: function (value) {
            var v = value.trim();
            if (!v) return "Please enter your email address.";
            if (!EMAIL_RE.test(v)) return "That email doesn't look right. Try the format name@example.co.za.";
            return "";
        },
        phone: function (value, required) {
            var v = value.replace(/[\s()-]/g, "");
            if (!v) return required ? "Please enter a phone number so we can confirm your order." : "";
            if (!SA_PHONE_RE.test(v)) return "Enter a 10-digit South African number, e.g. 075 071 8553 or +27 75 071 8553.";
            return "";
        },
        select: function (value, label) {
            return value ? "" : "Please choose " + label + ".";
        },
        message: function (value, min, max) {
            var len = value.trim().length;
            if (!len) return "Please write a message.";
            if (len < min) return "Please add a bit more detail (at least " + min + " characters, " + (min - len) + " to go).";
            if (len > max) return "Please shorten your message to " + max + " characters or fewer.";
            return "";
        }
    };

    /* ---------- Date helpers ---------- */
    function startOfToday() {
        var d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // Parse yyyy-mm-dd as a local date (new Date("yyyy-mm-dd") is treated as UTC)
    function parseDate(value) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!m) return null;
        var d = new Date(+m[1], +m[2] - 1, +m[3]);
        return d.getMonth() === +m[2] - 1 ? d : null;
    }

    function daysFromToday(date) {
        return Math.round((date - startOfToday()) / 86400000);
    }

    function toInputDate(date) {
        var pad = function (n) { return String(n).padStart(2, "0"); };
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    }

    function formatDate(date) {
        return date.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }

    /* ---------- Real-time validation wiring ----------
       validators: { fieldName: function (form) -> error string }
       options.linked: { fieldName: [other fields to re-check when it changes] }
       options.onValid: called with the form when every field passes */
    function attach(form, validators, options) {
        options = options || {};
        var touched = {};
        var summary = form.querySelector(".form-errors");

        function field(name) {
            return form.elements[name];
        }

        function groupFor(name) {
            var el = field(name);
            var node = el.length && !el.tagName ? el[0] : el;
            return node.closest(".form-group");
        }

        function check(name) {
            var error = validators[name](form);
            var group = groupFor(name);
            var errorEl = document.getElementById(name + "-error");
            var el = field(name);
            var inputs = el.length && !el.tagName ? Array.prototype.slice.call(el) : [el];

            group.classList.toggle("has-error", !!error);
            group.classList.toggle("is-valid", !error);
            errorEl.textContent = error;
            inputs.forEach(function (input) { input.setAttribute("aria-invalid", String(!!error)); });
            return error;
        }

        function recheckLinked(name) {
            (options.linked && options.linked[name] || []).forEach(function (other) {
                if (touched[other]) check(other);
            });
        }

        Object.keys(validators).forEach(function (name) {
            var el = field(name);
            var inputs = el.length && !el.tagName ? Array.prototype.slice.call(el) : [el];

            inputs.forEach(function (input) {
                // Validate when the visitor leaves a field...
                input.addEventListener("blur", function () {
                    touched[name] = true;
                    check(name);
                });
                // ...then live as they correct it
                input.addEventListener("input", function () {
                    if (touched[name]) check(name);
                    recheckLinked(name);
                });
                input.addEventListener("change", function () {
                    touched[name] = true;
                    check(name);
                    recheckLinked(name);
                });
            });
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var errors = [];
            Object.keys(validators).forEach(function (name) {
                touched[name] = true;
                var error = check(name);
                if (error) errors.push({ name: name, error: error });
            });

            if (errors.length) {
                showSummary(errors);
                return;
            }
            if (summary) summary.hidden = true;
            if (options.onValid) options.onValid(form);
        });

        function showSummary(errors) {
            if (!summary) {
                focusField(errors[0].name);
                return;
            }
            summary.innerHTML = "<p>Please fix " + errors.length + (errors.length === 1 ? " field" : " fields") +
                " before sending:</p><ul></ul>";
            var list = summary.querySelector("ul");
            errors.forEach(function (item) {
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.href = "#";
                a.textContent = item.error;
                a.addEventListener("click", function (ev) {
                    ev.preventDefault();
                    focusField(item.name);
                });
                li.appendChild(a);
                list.appendChild(li);
            });
            summary.hidden = false;
            summary.focus();
        }

        function focusField(name) {
            var el = field(name);
            (el.length && !el.tagName ? el[0] : el).focus();
        }

        // Clearing the form (button or code) also clears every error state
        form.addEventListener("reset", function () {
            touched = {};
            form.querySelectorAll(".form-group").forEach(function (g) {
                g.classList.remove("has-error", "is-valid");
            });
            form.querySelectorAll("[aria-invalid]").forEach(function (el) {
                el.removeAttribute("aria-invalid");
            });
            if (summary) summary.hidden = true;
        });

        return {
            reset: function () { form.reset(); }
        };
    }

    /* ---------- Character counter for textareas ---------- */
    function counter(textarea, max) {
        var out = document.getElementById(textarea.id + "-count");
        if (!out) return;
        function update() {
            var len = textarea.value.length;
            out.textContent = len + " / " + max;
        }
        textarea.addEventListener("input", update);
        textarea.form.addEventListener("reset", function () { window.setTimeout(update, 0); });
        update();
    }

    /* ---------- Sending to Formspree ---------- */
    function isEmailConfigured() {
        return typeof SITE_CONFIG !== "undefined" &&
            /^https:\/\/formspree\.io\/f\/\w+$/.test(SITE_CONFIG.formspreeEndpoint) &&
            SITE_CONFIG.formspreeEndpoint.indexOf("YOUR_FORM_ID") === -1;
    }

    function send(data) {
        if (!isEmailConfigured()) {
            return Promise.reject(new Error("not-configured"));
        }
        var controller = "AbortController" in window ? new AbortController() : null;
        var timeout = window.setTimeout(function () { if (controller) controller.abort(); }, 15000);

        return fetch(SITE_CONFIG.formspreeEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(data),
            signal: controller ? controller.signal : undefined
        }).then(function (response) {
            window.clearTimeout(timeout);
            if (response.ok) return response.json();
            return response.json().catch(function () { return {}; }).then(function (body) {
                var msg = body.errors && body.errors.length
                    ? body.errors.map(function (e) { return e.message; }).join(" ")
                    : "server-error";
                throw new Error(msg);
            });
        }, function (err) {
            window.clearTimeout(timeout);
            throw err;
        });
    }

    function sendErrorMessage(err) {
        if (err.message === "not-configured") {
            return "The email service hasn't been connected yet (site owner: add your Formspree form ID in js/config.js).";
        }
        if (err.name === "AbortError") {
            return "The request timed out. Please check your internet connection and try again.";
        }
        if (err.message === "server-error" || err.name === "TypeError") {
            return "We couldn't reach our email service. Please check your connection and try again.";
        }
        return "Something went wrong: " + err.message;
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    return {
        rules: rules,
        attach: attach,
        counter: counter,
        send: send,
        sendErrorMessage: sendErrorMessage,
        isEmailConfigured: isEmailConfigured,
        parseDate: parseDate,
        daysFromToday: daysFromToday,
        toInputDate: toInputDate,
        formatDate: formatDate,
        startOfToday: startOfToday,
        escapeHtml: escapeHtml
    };
})();
