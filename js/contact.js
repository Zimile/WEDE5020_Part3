/* =========================================================
   Timmy's Yummy Bakes - contact page form
   Real-time validation, then sends the message by email
   through Formspree with loading, success and error states.
   ========================================================= */

(function () {
    "use strict";

    var R = FormUtils.rules;

    var validators = {
        name: function (f) { return R.name(f.elements.name.value); },
        email: function (f) { return R.email(f.elements.email.value); },
        phone: function (f) { return R.phone(f.elements.phone.value, false); },
        subject: function (f) { return R.select(f.elements.subject.value, "a subject"); },
        message: function (f) { return R.message(f.elements.message.value, 20, 1000); }
    };

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("contact-form");
        if (!form) return;
        var status = document.getElementById("contact-status");
        var submitBtn = form.querySelector("button[type=submit]");
        var btnLabel = submitBtn.textContent;

        function setLoading(loading) {
            submitBtn.disabled = loading;
            form.setAttribute("aria-busy", String(loading));
            submitBtn.innerHTML = loading
                ? '<span class="spinner" aria-hidden="true"></span> Sending&hellip;'
                : btnLabel;
        }

        function showStatus(ok, html) {
            status.className = "alert " + (ok ? "alert-success" : "alert-error");
            status.innerHTML = html;
            status.hidden = false;
            status.focus();
        }

        FormUtils.counter(form.elements.message, 1000);

        var validator = FormUtils.attach(form, validators, {
            onValid: function () {
                var e = form.elements;
                var esc = FormUtils.escapeHtml;
                var subjectLabel = e.subject.options[e.subject.selectedIndex].text;
                var data = {
                    _subject: "Website message: " + subjectLabel,
                    form: "Contact",
                    name: e.name.value.trim(),
                    email: e.email.value.trim(),
                    phone: e.phone.value.trim() || "Not provided",
                    subject: subjectLabel,
                    message: e.message.value.trim()
                };

                // Spam bots fill the hidden field; quietly pretend it worked
                if (e._gotcha.value) {
                    validator.reset();
                    return;
                }

                status.hidden = true;
                setLoading(true);

                FormUtils.send(data).then(function () {
                    showStatus(true,
                        "<p><strong>Thank you, " + esc(data.name.split(" ")[0]) + "! Your message has been sent.</strong></p>" +
                        "<p>We received your message about &ldquo;" + esc(subjectLabel) + "&rdquo; and will reply to " +
                        esc(data.email) + " as soon as possible.</p>");
                    validator.reset();
                }).catch(function (err) {
                    // Keep what they typed so they can try again
                    showStatus(false,
                        "<p><strong>Sorry, your message wasn't sent.</strong></p>" +
                        "<p>" + esc(FormUtils.sendErrorMessage(err)) + " You can also call us on " +
                        '<a href="tel:+27750718553">075 071 8553</a>.</p>');
                }).then(function () {
                    setLoading(false);
                });
            }
        });
    });
})();
