(function () {
  /* scroll reveal: hides only when IntersectionObserver exists; fails safe */
  try {
    var els = document.querySelectorAll(".kicker,.side,.side-join,.tile,.badge-row,.hcard,.card,.steps li,.wall,.reviews-note");
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

    /* ---- tracking values: src + UTMs + page URL ---- */
    var track = { src: src };
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      track[k] = qs.get(k) || "";
    });
    track.lead_source = track.utm_source;
    track.landing_page_url = location.href.split("#")[0];
    track.referrer = (document.referrer || "").split("?")[0].slice(0, 200);

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
