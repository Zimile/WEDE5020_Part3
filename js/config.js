/* =========================================================
   Timmy's Yummy Bakes - site configuration
   ---------------------------------------------------------
   EMAIL SET-UP (Formspree, free plan):
   1. Sign up at https://formspree.io with the email address
      that should receive enquiries and messages.
   2. Create a new form. Formspree shows an endpoint such as
      https://formspree.io/f/abcdwxyz
   3. Paste that full endpoint below, replacing YOUR_FORM_ID.
   4. Submit the contact form once on the live site, then click
      the confirmation link Formspree emails you.
   ========================================================= */

var SITE_CONFIG = {
    formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID",

    // Enquiry estimate rules (used by js/enquiry.js)
    minNoticeDays: 2,        // menu promise: 24-48 hours' notice
    bulkThreshold: 1000,     // order value (R) that earns a bulk discount
    bulkDiscountRate: 0.1    // 10% off orders at or above the threshold
};
