/* Page settings. Fill these in; nothing else needs editing.
   Empty string = placeholder stays visible on the page. */
window.BF26_CONFIG = {
  // Replace the [DATE] and [TIME CT] placeholders everywhere 
  EVENT_DATE: "Tuesday, December 1",
  EVENT_TIME: "7:00 PM CT",          // e.g. "7:00 PM CT"  (fills the "[TIME CT]" slot)

  // Zapier Catch Hook URL for the registration form (the Zap fans out to GHL + Kit). Empty = the form shows an error and does not submit.
  ZAPIER_WEBHOOK_URL: "https://hooks.zapier.com/hooks/catch/26178687/45paqe6/",

  // Thank-you page
  ADDEVENT_LINK: "",         // the AddEvent link for the call (base link; the page adds +apple / +google / +outlook). Empty = the three calendar buttons show as disabled
  HELP_EMAIL: "",            // unused for now (the "Still stuck?" line uses HELP_PHONE)
  HELP_PHONE: "+1 630-326-6335",  // shown on the thank-you "Still stuck?" line as a tel: link. Empty = that line is hidden

  // Legal links (footer, small print, consent label)
  TERMS_URL: "/terms",
  PRIVACY_URL: "/privacy",

  // Community review cards that have a written OK from the member (ids: dawn, jose, missy, jayson, christina, bridget).
  // Add an id only after the member's reply is saved. Empty = reviews section hidden.
  REVIEWS_APPROVED: ["dawn", "jose", "missy", "jayson", "christina", "bridget"],

  // Optional lines. Set to false to hide a line.
  SHOW_HOSTS_BLOCK: true,          // "Your hosts" block
  SHOW_SEPARATE_COMPANIES: true,   // "separate companies" line
  SHOW_FEE_SENTENCE: false,        // fee disclosure line
  USE_MAX_LINE_FOR_SRC_MAX: true   // Max line swap for ?src=max
};
