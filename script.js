(function () {
  "use strict";

  var ACCESS_KEY = "6fff8919-6286-47e6-a678-66591e686f06";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  // Count-up for the reach numbers, once on load
  if (!reduceMotion) {
    document.querySelectorAll(".count").forEach(function (el) {
      var to = parseFloat(el.dataset.to);
      var dec = parseInt(el.dataset.decimals || "0", 10);
      var suffix = el.dataset.suffix || "";
      var start = performance.now();
      var dur = 1400;
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec) + (p < 1 ? "" : suffix);
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = (0).toFixed(dec);
      requestAnimationFrame(tick);
    });
  }

  // Work filters
  var chips = document.querySelectorAll(".chip");
  var works = document.querySelectorAll(".work");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", String(on));
      });
      works.forEach(function (w) { w.hidden = !(f === "all" || w.dataset.cat === f); });
    });
  });

  // Video: load the player only when asked
  var playBtn = document.getElementById("video-play");
  if (playBtn) {
    playBtn.addEventListener("click", function () {
      var box = document.getElementById("video-box");
      var frame = document.createElement("iframe");
      frame.src = "https://www.flexclip.com/share/16240077a29ydowFJo6K8RUNFC3RO8ls6oeBCMup.html";
      frame.title = "Short-form video sample by Ian Kuria";
      frame.allow = "autoplay; fullscreen";
      frame.allowFullscreen = true;
      box.replaceChildren(frame);
    });
  }

  // CV viewer
  var dialog = document.getElementById("cv-dialog");
  var stage = document.getElementById("cv-stage");
  document.querySelectorAll("[data-cv]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tpl = document.getElementById(btn.dataset.cv);
      stage.replaceChildren(tpl.content.cloneNode(true));
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });

  // Service buttons preselect the contact form
  document.querySelectorAll("[data-service]").forEach(function (a) {
    a.addEventListener("click", function () {
      var sel = document.getElementById("c-service");
      if (sel) sel.value = a.dataset.service;
    });
  });

  // Reviews: show only real reviews from reviews.js
  var list = document.getElementById("reviews-list");
  var empty = document.getElementById("reviews-empty");
  var reviews = Array.isArray(window.REVIEWS) ? window.REVIEWS : [];
  if (reviews.length) {
    empty.hidden = true;
    reviews.forEach(function (r) {
      var fig = document.createElement("figure");
      fig.className = "review";
      var stars = document.createElement("div");
      stars.className = "stars";
      var n = Math.max(1, Math.min(5, Number(r.rating) || 5));
      stars.textContent = "★".repeat(n) + "☆".repeat(5 - n);
      stars.setAttribute("aria-label", n + " out of 5");
      var q = document.createElement("blockquote");
      q.textContent = r.text;
      var cap = document.createElement("figcaption");
      cap.textContent = r.name;
      var meta = document.createElement("span");
      meta.textContent = [r.role, r.service].filter(Boolean).join(", ");
      cap.appendChild(meta);
      fig.append(stars, q, cap);
      list.appendChild(fig);
    });
  }

  // Forms (Web3Forms)
  function wire(form, subject, okMessage) {
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get("botcheck")) return;

      var firstBad = null;
      form.querySelectorAll("[required]").forEach(function (f) {
        var bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        status.className = "form-status err";
        status.textContent = "Please fill in the required fields marked above.";
        firstBad.focus();
        return;
      }

      data.set("access_key", ACCESS_KEY);
      data.set("subject", subject);
      data.set("from_name", "Ian Kuria Portfolio");
      data.set("replyto", String(data.get("email") || ""));
      button.disabled = true;
      status.className = "form-status";
      status.textContent = "Sending...";

      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: data })
        .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, json: j }; }); })
        .then(function (r) {
          if (!r.ok || !r.json.success) throw new Error(r.json.message || "The request was not accepted.");
          form.reset();
          status.className = "form-status ok";
          status.textContent = okMessage;
          status.focus();
        })
        .catch(function (err) {
          status.className = "form-status err";
          status.textContent = err.message + " Try again, or message me on WhatsApp.";
        })
        .finally(function () { button.disabled = false; });
    });
  }
  wire(document.getElementById("contact-form"), "New project request from Ian Kuria Portfolio", "Request sent. I will reply with a quote and the next steps.");
  wire(document.getElementById("review-form"), "New review submitted on Ian Kuria Portfolio", "Thank you. Your review was sent and will be published once I confirm it with you.");
})();
