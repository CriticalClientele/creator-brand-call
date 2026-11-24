(function () {
  /* scroll reveal: hides only when IntersectionObserver exists; fails safe */
  try {
    var els = document.querySelectorAll(".kicker,.side,.side-join,.tile,.badge-row,.hcard,.card,.steps li,.wall,.reviews-note,.ty-event,.ty-mock,.ty-card,.ty-help");
    if (!("IntersectionObserver" in window) || !els.length) return;
    els.forEach(function (el) {
      el.classList.add("reveal");
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--d", (i * 0.12) + "s");
    });
    document.documentElement.classList.add("js-reveal");
    var show = function (el) { el.classList.add("in"); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(show); }, 6000);
  } catch (err) { document.documentElement.classList.remove("js-reveal"); }
})();
(function () {
  /* gold x in the lockup line (cosmetic; harmless if absent) */
  try {
    var ll = document.querySelector(".lockup-line");
    if (ll && ll.textContent.indexOf("×") > -1) {
      var parts = ll.textContent.split("×");
      ll.textContent = "";
      parts.forEach(function (t, i) {
        if (i) { var g = document.createElement("span"); g.className = "gx"; g.textContent = "×"; ll.appendChild(g); }
        ll.appendChild(document.createTextNode(t));
      });
    }
  } catch (e) {}
})();
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
  else src = load("bf26_src") || ""; /* keep the source if they visit /terms or reload */

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
        h: "Austin and Max team up. See the classic UGC side too.",
        s: "Austin covers Trybe. Max covers classic UGC. Free and live."
      },
      max: {
        h: "Max and Austin team up. See two ways to work with brands.",
        s: "Max covers classic UGC. Austin covers Trybe brand campaigns. Free, live.",
        maxLine: "founder of Pured Media, which teaches UGC to moms 40+."
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
    /* ---- reviews: show only cards whose id is in REVIEWS_APPROVED (config.js) ---- */
    var rev = document.getElementById("reviews");
    if (rev) {
      var okIds = C.REVIEWS_APPROVED || [];
      rev.querySelectorAll(".shot[data-id]").forEach(function (q) { if (okIds.indexOf(q.getAttribute("data-id")) === -1) q.remove(); });
      if (rev.querySelector(".shot")) rev.hidden = false;
    }
    document.title = document.getElementById("headline").textContent;

    /* ---- optional-line toggles ---- */
    var off = function (id, flag) {
      if (flag === false) { var e = document.getElementById(id); if (e) e.classList.add("hidden"); }
    };
    off("hosts", C.SHOW_HOSTS_BLOCK);
    off("sentence-separate", C.SHOW_SEPARATE_COMPANIES);
    off("sentence-fee", C.SHOW_FEE_SENTENCE);

    /* ---- registration form: posts to the Zapier Catch Hook (Zap fans out to GHL + Kit), then goes to /thank-you ---- */
    (function () {
      var form = document.getElementById("reg-form");
      if (!form) return;
      var errorBox = document.getElementById("reg-error");
      var WEBHOOK_URL = (C.ZAPIER_WEBHOOK_URL || "").trim();
      var THANK_YOU_URL = "/thank-you";
      var label = function (id) { var l = document.querySelector('label[for="' + id + '"] span'); return l ? l.textContent.trim() : ""; };
      var SMS_TEXT = label("sms_consent");
      var EMAIL_TEXT = label("email_consent");

      function showError(msg) { errorBox.textContent = msg; errorBox.classList.remove("hidden"); }

      /* source: explicit ?src= / utm_source wins, else the referrer's host, else "direct". Kept in localStorage so a reload does not re-attribute. */
      function detectSource(href, referrer, store) {
        var clean = function (s) { return String(s || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30); };
        var is = function (h, d) { return h === d || h.slice(-(d.length + 1)) === "." + d; };
        var params; try { params = new URL(href).searchParams; } catch (e) { params = new URLSearchParams(); }
        var rawTag = params.get("src") || params.get("utm_source") || "";
        var tag = clean(params.get("src")) || clean(params.get("utm_source"));
        var host = "", curHost = "";
        try { var u = new URL(referrer); if (/^https?:$/.test(u.protocol)) host = u.hostname.toLowerCase().replace(/^www\./, ""); } catch (e) {}
        try { curHost = new URL(href).hostname.toLowerCase(); } catch (e) {}
        var isSelf = host && (host === curHost || /^creator-brand-call(-[a-z0-9-]+)?\.vercel\.app$/.test(host));
        var source = "", detail = "", explicit = false;
        if (tag) { source = tag; detail = rawTag.slice(0, 100); explicit = true; }
        else if (host && !isSelf) {
          detail = host;
          if (["mail.google.com", "outlook.live.com", "outlook.office.com", "mail.yahoo.com", "kit.com", "ck.page"].some(function (d) { return is(host, d); }) || /(^|\.)convertkit[a-z0-9-]*\./.test(host)) source = "email";
          else if (is(host, "instagram.com")) source = "instagram";
          else if (is(host, "facebook.com") || is(host, "fb.me")) source = "facebook";
          else if (is(host, "t.co") || is(host, "x.com") || is(host, "twitter.com")) source = "x";
          else if (is(host, "tiktok.com")) source = "tiktok";
          else if (is(host, "youtube.com") || is(host, "youtu.be")) source = "youtube";
          else if (/(^|\.)google\.[a-z.]+$/.test(host)) source = "google";
          else if (is(host, "bing.com")) source = "bing";
          else if (is(host, "discord.com") || is(host, "discordapp.com")) source = "discord";
          else if (is(host, "skool.com")) source = "skool";
          else if (is(host, "threads.net")) source = "threads";
          else if (/(^|\.)linkedin\./.test(host) || is(host, "lnkd.in")) source = "linkedin";
          else source = host;
        }
        var saved = null;
        try { saved = JSON.parse(store.getItem("bf26_source")); } catch (e) { saved = null; }
        if (saved && typeof saved.source !== "string") saved = null;
        var found = { source: source, detail: detail, landing: href };
        if (source && (explicit || !saved)) { try { store.setItem("bf26_source", JSON.stringify(found)); } catch (e) {} return found; }
        if (saved && saved.source) return { source: saved.source, detail: saved.detail || "", landing: saved.landing || href };
        return { source: "direct", detail: "", landing: href };
      }
      var SOURCE = detectSource(location.href, document.referrer, (function () { try { return window.localStorage; } catch (e) { return { getItem: function () { return null; }, setItem: function () {} }; } })());

      /* phone: country picker + real number-format check (intl-tel-input, same version as the Oct 23 page). Defaults to US. */
      var iti = null;
      if (window.intlTelInput) {
        iti = window.intlTelInput(document.getElementById("phone"), {
          initialCountry: "us",
          countryOrder: ["us", "ca", "gb", "au"],
          separateDialCode: true,
          strictMode: true,
          dropdownContainer: document.body,
          utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.8.2/build/js/utils.js"
        });
      }

      var DISPOSABLE = ["mailinator.com", "guerrillamail.com", "sharklasers.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "yopmail.com", "trashmail.com", "getnada.com", "dispostable.com", "maildrop.cc", "throwawaymail.com", "fakeinbox.com", "mailnesia.com", "emailondeck.com", "moakt.com", "tempail.com", "mohmal.com"];
      var TYPOS = {
        "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmai.com": "gmail.com", "gnail.com": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.cm": "gmail.com", "gamil.com": "gmail.com",
        "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yahoo.con": "yahoo.com", "yahoo.co": "yahoo.com",
        "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmail.con": "hotmail.com", "hotmail.co": "hotmail.com",
        "outlok.com": "outlook.com", "outlook.con": "outlook.com", "icloud.con": "icloud.com", "icoud.com": "icloud.com", "aol.con": "aol.com"
      };
      var emailWarnedFor = "";

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        /* honeypot: bots fill it. Fake success, send nothing. */
        if (form.nickname_hp.value.trim() !== "") { location.href = THANK_YOU_URL; return; }
        errorBox.classList.add("hidden");

        var fullName = form.full_name.value.trim().replace(/\s+/g, " ").split(" ")
          .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ");
        var nameParts = fullName.split(" ");
        if (nameParts.length < 2) { showError("Please enter your first and last name."); form.full_name.focus(); return; }

        var email = form.email.value.trim().toLowerCase();
        var domain = email.split("@")[1] || "";
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(email)) { showError("Please enter a valid email address."); form.email.focus(); return; }
        if (DISPOSABLE.indexOf(domain) > -1) { showError("Please use your real email so you get the call link."); form.email.focus(); return; }
        if (TYPOS[domain] && emailWarnedFor !== email) {
          emailWarnedFor = email;
          form.email.value = email.split("@")[0] + "@" + TYPOS[domain];
          showError("We fixed a typo in your email to " + form.email.value + ". Check it and press Save your seat again.");
          form.email.focus();
          return;
        }

        /* precise check rejects fake numbers; types 1 mobile, 2 mobile-or-landline (US/CA), 7 VoIP. Falls back to a length check until the rules load. */
        var phoneDigits = form.phone.value.replace(/\D/g, "");
        var phone, phoneCountry;
        if (iti) {
          var valid = iti.isValidNumberPrecise(), type = iti.getNumberType();
          if (valid === false || (valid && [1, 2, 7].indexOf(type) === -1) || (valid === null && (phoneDigits.length < 7 || phoneDigits.length > 15))) {
            showError("Please enter a valid mobile number and check the country."); form.phone.focus(); return;
          }
          phone = iti.getNumber() || ("+" + iti.getSelectedCountryData().dialCode + phoneDigits);
          phoneCountry = (iti.getSelectedCountryData().iso2 || "").toUpperCase();
        } else {
          if (phoneDigits.length < 7 || phoneDigits.length > 15) { showError("Please enter a valid mobile number and check the country."); form.phone.focus(); return; }
          phone = "+" + phoneDigits; phoneCountry = "";
        }

        if (!WEBHOOK_URL) {
          console.warn("ZAPIER_WEBHOOK_URL is empty in config.js. Nothing was sent.");
          showError("Something went wrong. Please try again.");
          return;
        }

        btn.disabled = true; btn.style.opacity = ".6";
        var smsBox = form.sms_consent.checked, emailBox = form.email_consent.checked;
        var usca = ["US", "CA"].indexOf(phoneCountry) > -1;
        var smsTag = smsBox && usca ? "sms-ok" : "";
        var srcVal = src;
        var data = new URLSearchParams({
          full_name: fullName,
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(" "),
          email: email,
          phone: phone,
          phone_country: phoneCountry,
          sms_tag: smsTag,
          country_tag: usca ? "us-ca" : "international",
          sms_consent: smsBox ? "yes" : "no",
          sms_consent_text: smsBox ? SMS_TEXT : "",
          consent_version: "consent-bf26-v1",
          consent_timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          page_url: location.href,
          source: SOURCE.source,
          source_detail: SOURCE.detail,
          landing_url: SOURCE.landing,
          webinar: "2026-12-01 Zoom 7PM CT",
          tag: "dec1-webinar",
          src: srcVal,
          src_tag: srcVal === "max" ? "src-max" : srcVal === "austin" ? "src-austin" : "src-unknown",
          // Kit tag IDs (Zapier's Kit "Add Tag" step needs the ID, not the name). Kit tags created 2026-11-24.
          kit_src_tag_id: srcVal === "max" ? "26388771" : srcVal === "austin" ? "26388772" : "26388773",
          consent_tag: smsTag ? "consent-bf26-v1" : "",
          email_consent: emailBox ? "yes" : "no",
          email_consent_text: emailBox ? EMAIL_TEXT : "",
          email_tag: emailBox ? "email-ok" : "email-event",
          utm_source: qs.get("utm_source") || "",
          utm_medium: qs.get("utm_medium") || "",
          utm_campaign: qs.get("utm_campaign") || "",
          utm_content: qs.get("utm_content") || "",
          utm_term: qs.get("utm_term") || "",
          referrer: (document.referrer || "").split("?")[0].slice(0, 200),
          hp: form.nickname_hp.value.trim()
        });

        /* form-encoded + no-cors = no preflight, so the browser does not block the cross-site post */
        fetch(WEBHOOK_URL, { method: "POST", mode: "no-cors", body: data }).then(function () {
          location.href = THANK_YOU_URL + "?n=" + encodeURIComponent(nameParts[0]) + "&src=" + encodeURIComponent(srcVal) + "&phone=" + encodeURIComponent(phone);
        }, function (err) {
          console.error("Registration failed to send", err);
          btn.disabled = false; btn.style.opacity = "";
          showError("Something went wrong. Please try again.");
        });
      });
    })();
  }

  if (page === "thanks") {
    var byId = function (id) { return document.getElementById(id); };
    var hideIf = function (id, flag) { if (flag === false) { var e = byId(id); if (e) e.classList.add("hidden"); } };

    /* ---- name from ?n= (first 40 characters, plain text only). No name = "You are in!" and "Hi there," ---- */
    var nm = (qs.get("n") || "").trim().slice(0, 40);
    if (nm) {
      byId("ty-headline").textContent = "You are in, " + nm + "!";
      document.querySelectorAll(".js-name").forEach(function (el) { el.textContent = nm; });
    }

    /* ---- sender name order follows the source: Austin and Max for src=austin, else Max and Austin ---- */
    var fromName = src === "austin" ? "Austin and Max" : "Max and Austin";
    document.querySelectorAll(".js-sender, .js-from").forEach(function (el) { el.textContent = fromName; });

    /* ---- add-to-calendar buttons: AddEvent base link + "+apple" / "+google" / "+outlook".
       No link = buttons stay disabled and the "coming soon" line shows ---- */
    var calLinks = { "cal-apple": "+apple", "cal-google": "+google", "cal-outlook": "+outlook" };
    var base = (C.ADDEVENT_LINK || "").replace(/\/+$/, "");
    var soon = byId("cal-soon");
    if (base) {
      Object.keys(calLinks).forEach(function (id) {
        var a = byId(id);
        a.href = base + calLinks[id];
        a.target = "_blank"; a.rel = "noopener";
        a.removeAttribute("aria-disabled"); a.removeAttribute("role");
      });
      if (soon) soon.hidden = true;
    }

    /* ---- help line: shows only when HELP_PHONE is set ---- */
    var hp = (C.HELP_PHONE || "").trim();
    if (hp && hp.indexOf("[") === -1) {
      document.querySelectorAll(".js-help-phone").forEach(function (a) { a.textContent = hp; a.href = "tel:" + hp.replace(/[^\d+]/g, ""); });
      byId("help-stuck").hidden = false;
    }

    /* ---- date and time chips, time zone row, step 3 label and the text sample all follow EVENT_DATE / EVENT_TIME.
       If either value does not parse, the built-in defaults in the HTML stay. ---- */
    (function () {
      var fill = function (cls, txt) { document.querySelectorAll(cls).forEach(function (el) { el.textContent = txt; }); };
      var dm = /^\s*([A-Za-z]+),?\s+([A-Za-z]+)\s+(\d{1,2})/.exec(C.EVENT_DATE || "");
      var tm = /(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])\s*CT/.exec(C.EVENT_TIME || "");
      var fmt = function (h24, mm, zone) {
        var h = ((h24 % 24) + 24) % 24, ap = h >= 12 ? "PM" : "AM", h12 = h % 12 || 12;
        return h12 + (mm && mm !== "00" ? ":" + mm : "") + " " + ap + " " + zone;
      };
      var wk, mon, day, ct;
      if (dm) { wk = dm[1].slice(0, 3); mon = dm[2].slice(0, 3); day = dm[3]; fill(".js-dchip", wk + ", " + mon + " " + day); }
      if (C.EVENT_TIME) fill(".js-tchip", C.EVENT_TIME);
      if (tm) {
        var h24 = (parseInt(tm[1], 10) % 12) + (/p/i.test(tm[3]) ? 12 : 0), mm = tm[2] || "00";
        ct = fmt(h24, mm, "CT");
        fill(".js-tz", fmt(h24 + 1, mm, "ET") + " · " + fmt(h24 - 1, mm, "MT") + " · " + fmt(h24 - 2, mm, "PT"));
      }
      if (dm && ct) {
        fill(".js-live", mon + " " + day + ", " + ct);
        fill(".js-sms", wk + " " + mon + " " + day + " at " + ct);
      }
    })();

    /* ---- footer toggles, same flags as the registration page ---- */
    hideIf("sentence-separate", C.SHOW_SEPARATE_COMPANIES);
    hideIf("sentence-fee", C.SHOW_FEE_SENTENCE);

    /* ---- US numbers only. Shows only if ?geo=us, or ?phone= is a +1 number
       whose area code is not Canadian. Hidden otherwise (default). ---- */
    var CA = "204 226 236 249 250 257 263 279 289 306 343 354 365 367 368 382 403 416 418 428 431 437 438 450 468 474 506 514 519 548 579 581 584 587 604 613 639 647 672 683 705 709 742 753 778 780 807 819 825 867 873 879 902 905 942".split(" ");
    var show4 = (qs.get("geo") || "").toLowerCase() === "us";
    var raw = (qs.get("phone") || "").replace(/[^\d+]/g, "");
    if (!show4 && raw.indexOf("+1") === 0) {
      var d = raw.slice(2);
      show4 = d.length === 10 && /^[2-9]/.test(d) && CA.indexOf(d.slice(0, 3)) === -1;
    }
    if (!show4) byId("step-call").classList.add("hidden");
  }
})();
(function () {
  /* scroll-driven mood: the band under the middle of the screen sets <html data-mood>.
     CSS cross-fades the fixed .washes layers. No JS or no IntersectionObserver = static band gradients only. */
  try {
    var bands = document.querySelectorAll(".band[data-mood]");
    if (!("IntersectionObserver" in window) || !bands.length || !document.querySelector(".washes")) return;
    var root = document.documentElement;
    var set = function (m) { if (root.getAttribute("data-mood") !== m) root.setAttribute("data-mood", m); };
    set("hero");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) set(e.target.getAttribute("data-mood")); });
    }, { rootMargin: "-49% 0px -49% 0px", threshold: 0 });
    bands.forEach(function (b) { io.observe(b); });
    /* short last band: when scrolled to the very bottom, call it the footer */
    var tick = false;
    window.addEventListener("scroll", function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false;
        if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4) set("foot");
      });
    }, { passive: true });
  } catch (err) {}
})();
(function () {
  /* review cards: visual clamp + "Read more" modal. Text is never edited; the full quote stays in the DOM. */
  try {
    var rev = document.getElementById("reviews");
    var dlg = document.getElementById("review-modal");
    var wall = rev && rev.querySelector(".wall");
    if (!rev || !dlg || !wall) return;
    var cards = Array.prototype.slice.call(wall.querySelectorAll(".shot"));
    if (!cards.length) return;
    var note = rev.querySelector(".reviews-note");
    var last = null;

    cards.forEach(function (c) {
      var name = c.querySelector("figcaption b").textContent;
      var b = document.createElement("button");
      b.type = "button"; b.className = "more"; b.textContent = "Read more";
      b.setAttribute("aria-label", "Read more: full review from " + name);
      b.setAttribute("aria-haspopup", "dialog");
      c.appendChild(b);
    });

    function measure() {
      if (rev.hidden) return;
      cards.forEach(function (c) {
        var q = c.querySelector("blockquote");
        c.classList.remove("clamped"); c.classList.add("measuring");
        c.classList.add("clamped");
        var over = q.scrollHeight > q.clientHeight + 1;
        c.classList.toggle("clamped", over);
        c.classList.remove("measuring");
      });
    }
    measure();
    window.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    function lock(on) {
      document.documentElement.classList.toggle("modal-open", on);
    }
    function open(card, trigger) {
      last = trigger || card.querySelector(".more");
      dlg.querySelector(".rm-quote").textContent = card.querySelector("blockquote").textContent;
      dlg.querySelector("#rm-name").textContent = card.querySelector("figcaption b").textContent;
      dlg.querySelector(".rm-com").textContent = card.querySelector("figcaption span").textContent;
      dlg.querySelector(".rm-note").textContent = note ? note.textContent : "";
      dlg.querySelector(".rm-body").scrollTop = 0; dlg.scrollTop = 0;
      lock(true);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
      dlg.classList.remove("closing");
      dlg.querySelector(".rm-close").focus();
    }
    function close() {
      if (!dlg.open && !dlg.hasAttribute("open")) return;
      dlg.classList.add("closing");
      setTimeout(function () {
        dlg.classList.remove("closing");
        if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
      }, 180);
    }
    dlg.addEventListener("close", function () {
      lock(false);
      if (last && last.focus) last.focus();
    });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    dlg.querySelector(".rm-close").addEventListener("click", close);

    wall.addEventListener("click", function (e) {
      var c = e.target.closest(".shot");
      if (!c || !c.classList.contains("clamped")) return;
      open(c, e.target.closest(".more") || c.querySelector(".more"));
    });

    /* phone: dot indicator for the swipe row */
    var dots = document.createElement("div");
    dots.className = "dots";
    cards.forEach(function (c, i) {
      var d = document.createElement("button");
      d.type = "button"; d.setAttribute("aria-label", "Go to review " + (i + 1) + " of " + cards.length);
      d.addEventListener("click", function () { wall.scrollTo({ left: c.offsetLeft - wall.offsetLeft - 20, behavior: "smooth" }); });
      dots.appendChild(d);
    });
    wall.parentNode.insertBefore(dots, wall.nextSibling);
    function sync() {
      var x = wall.scrollLeft, best = 0, bd = 1e9;
      cards.forEach(function (c, i) {
        var dd = Math.abs((c.offsetLeft - wall.offsetLeft - 20) - x);
        if (dd < bd) { bd = dd; best = i; }
      });
      if (wall.scrollLeft + wall.clientWidth >= wall.scrollWidth - 4) best = cards.length - 1;
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i === best); });
    }
    wall.addEventListener("scroll", function () { requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  } catch (err) {}
})();
