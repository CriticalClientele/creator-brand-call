(function () {
  var C = window.BF26_CONFIG || {};
  var qs = new URLSearchParams(location.search);
  var page = document.body.getAttribute("data-page");

  function save(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }

  /* ---- source (?src=austin | max) ---- */
  var src = (qs.get("src") || "").toLowerCase();
  if (src !== "austin" && src !== "max") src = "";
  if (src) save("bf26_src", src);
  else if (page === "thanks") src = load("bf26_src") || "";

  /* ---- [DATE] / [TIME CT] placeholders ---- */
  document.querySelectorAll(".js-event").forEach(function (el) {
    var t = el.textContent;
    if (C.EVENT_DATE) t = t.split("[DATE]").join(C.EVENT_DATE);
    if (C.EVENT_TIME) t = t.split("[TIME CT]").join(C.EVENT_TIME);
    el.textContent = t;
  });

  /* ---- legal links ---- */
  document.querySelectorAll("a[data-link=terms]").forEach(function (a) { a.href = C.TERMS_URL || "#"; });
  document.querySelectorAll("a[data-link=privacy]").forEach(function (a) { a.href = C.PRIVACY_URL || "#"; });

  if (page === "register") {
    /* ---- headline / subhead / Max line swaps ---- */
    var swaps = {
      austin: {
        h: "Free live call for Trybe creators: how to go after more brand work",
        s: "Austin and Max go live to show how brand work works on Trybe and beyond, where creators get stuck, and what to do next. Bring your questions."
      },
      max: {
        h: "Free live call for moms and women 40+: how to make UGC videos for brands",
        s: "Max and Austin go live to show how UGC brand work runs, where beginners get stuck, and how to start. Bring your questions.",
        maxLine: "Pured Media teaches UGC to moms and women 40 and up."
      }
    };
    var sw = swaps[src];
    if (sw) {
      document.getElementById("headline").textContent = sw.h;
      document.getElementById("subhead").textContent = sw.s;
      if (sw.maxLine && C.USE_MAX_LINE_FOR_SRC_MAX) {
        document.getElementById("max-line-text").textContent = sw.maxLine;
      }
    }
    document.title = document.getElementById("headline").textContent;

    /* ---- optional-line toggles ---- */
    var off = function (id, flag) {
      if (flag === false) { var e = document.getElementById(id); if (e) e.classList.add("hidden"); }
    };
    off("hosts", C.SHOW_HOSTS_BLOCK);
    off("sentence-separate", C.SHOW_SEPARATE_COMPANIES);
    off("sentence-fee", C.SHOW_FEE_SENTENCE);

    /* ---- tracking values: src + UTMs + page URL ---- */
    var track = { src: src };
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      track[k] = qs.get(k) || "";
    });
    track.lead_source = track.utm_source;
    track.landing_page_url = location.href.split("#")[0];

    /* hidden inputs in the preview form */
    document.querySelectorAll("input[data-track]").forEach(function (i) {
      i.value = track[i.name] || "";
    });

    /* ---- GHL form embed ---- */
    var slot = document.getElementById("form-slot");
    if (C.GHL_FORM_URL) {
      var u = new URL(C.GHL_FORM_URL);
      Object.keys(track).forEach(function (k) { if (track[k]) u.searchParams.set(k, track[k]); });
      var f = document.createElement("iframe");
      var id = C.GHL_FORM_ID || "bf26";
      f.id = "bf26-form";
      f.src = u.toString();
      f.title = "Registration form";
      f.style.minHeight = (C.GHL_FORM_HEIGHT || 900) + "px";
      f.setAttribute("data-layout", "{'id':'INLINE'}");
      f.setAttribute("data-trigger-type", "alwaysShow");
      f.setAttribute("data-activation-type", "alwaysActivated");
      f.setAttribute("data-deactivation-type", "neverDeactivate");
      f.setAttribute("data-form-name", C.GHL_FORM_NAME || "");
      f.setAttribute("data-height", String(C.GHL_FORM_HEIGHT || 900));
      f.setAttribute("data-layout-iframe-id", "inline-" + id);
      f.setAttribute("data-form-id", id);
      slot.innerHTML = "";
      slot.appendChild(f);
      var s = document.createElement("script");
      s.src = "https://link.msgsndr.com/js/form_embed.js";
      document.body.appendChild(s);
    } else {
      var pv = document.getElementById("preview-form");
      if (pv) pv.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Preview only. Add GHL_FORM_URL in config.js to use the real form.");
      });
    }
  }

  if (page === "thanks") {
    /* ---- add-to-calendar link ---- */
    var cal = document.getElementById("cal-btn");
    if (C.ADDEVENT_LINK) { cal.href = C.ADDEVENT_LINK; cal.target = "_blank"; cal.rel = "noopener"; }
    else cal.classList.add("placeholder-btn");

    /* ---- per-source email-sender line ---- */
    var lines = { austin: "Your email will come from Austin's team.", max: "Your email will come from Max's team." };
    var sl = document.getElementById("sender-line");
    if (lines[src]) sl.textContent = lines[src]; else sl.classList.add("hidden");

    /* ---- step 4: US numbers only. Shows only if ?geo=us, or ?phone= is a +1 number
       whose area code is not Canadian. Hidden otherwise (default). ---- */
    var CA = "204 226 236 249 250 257 263 279 289 306 343 354 365 367 368 382 403 416 418 428 431 437 438 450 468 474 506 514 519 548 579 581 584 587 604 613 639 647 672 683 705 709 742 753 778 780 807 819 825 867 873 879 902 905 942".split(" ");
    var show4 = (qs.get("geo") || "").toLowerCase() === "us";
    var raw = (qs.get("phone") || "").replace(/[^\d+]/g, "");
    if (!show4 && raw.indexOf("+1") === 0) {
      var d = raw.slice(2);
      show4 = d.length === 10 && /^[2-9]/.test(d) && CA.indexOf(d.slice(0, 3)) === -1;
    }
    if (!show4) document.getElementById("step-call").classList.add("hidden");
  }
})();
