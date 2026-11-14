/* Page settings. Fill these in; nothing else needs editing.
   Empty string = placeholder stays visible on the page. */
window.BF26_CONFIG = {
  // Replace the [DATE] and [TIME CT] placeholders everywhere 
  EVENT_DATE: "",            // e.g. "Thursday, December 4"
  EVENT_TIME: "",            // e.g. "7:00 PM CT"  (fills the "[TIME CT]" slot)

  // GHL form: paste the form's hosted URL (the iframe src from GHL > Sites > Forms > Integrate).
  // Example: "https://api.leadconnectorhq.com/widget/form/AbCdEf123"
  GHL_FORM_URL: "",
  GHL_FORM_ID: "",           // the id at the end of that URL (used for the iframe id)
  GHL_FORM_NAME: "[BF26] Registration",
  GHL_FORM_HEIGHT: 900,      // starting height in px; GHL's script resizes it

  // Thank-you page
  ADDEVENT_LINK: "",         // the AddEvent link for the call

  // Legal links (footer, small print, consent label)
  TERMS_URL: "",
  PRIVACY_URL: "",

  // Optional lines. Set to false to hide a line.
  SHOW_HOSTS_BLOCK: true,          // "Your hosts" block
  SHOW_SEPARATE_COMPANIES: true,   // "separate companies" line
  SHOW_FEE_SENTENCE: true,         // fee disclosure line
  USE_MAX_LINE_FOR_SRC_MAX: true   // Max line swap for ?src=max
};
