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
      var start = performance.now() + 1000;
      var dur = 1400;
      function tick(now) {
        var p = Math.min(Math.max((now - start) / dur, 0), 1);
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
      var shown = 0;
      works.forEach(function (w) {
        var vis = f === "all" || w.dataset.cat === f;
        w.hidden = !vis;
        if (vis && w.hasAttribute("data-reveal")) {
          w.classList.remove("is-in");
          void w.offsetWidth;
          w.style.setProperty("--d", shown * 70 + "ms");
          w.classList.add("is-in");
          shown++;
        }
      });
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

  // Header state and scroll progress bar
  var header = document.querySelector(".site-header");
  var bar = document.querySelector(".progress");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.setProperty("--p", max > 0 ? Math.min(y / max, 1).toFixed(4) : "0");
      header.classList.toggle("is-scrolled", y > 24);
      if (y < 200) document.querySelectorAll(".nav a.is-active").forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  var hasIO = "IntersectionObserver" in window;

  // Highlight the menu link for the section being read
  if (hasIO) {
    var links = {};
    document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (id) {
          var on = id === en.target.id;
          links[id].classList.toggle("is-active", on);
          if (on) links[id].setAttribute("aria-current", "true"); else links[id].removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var sec = document.getElementById(id); if (sec) spy.observe(sec); });
  }

  // Reveal on scroll, staggered within a row
  if (hasIO && !reduceMotion) {
    var groups = [[".section-head", false], [".service", true], [".work", true], [".ebook-art", false], [".ebook-copy", false], [".steps li", true], [".contact-intro", false], [".contact .form", false]];
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        reveal.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    groups.forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (el) {
        var idx = 0;
        if (g[1]) idx = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(g[0]); }).indexOf(el);
        el.setAttribute("data-reveal", "");
        el.style.setProperty("--d", (idx % 3) * 90 + "ms");
        reveal.observe(el);
      });
    });
  }

  // Portrait follows the pointer on mouse devices
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var hero = document.querySelector(".hero");
    var vf = document.querySelector(".viewfinder");
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      vf.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      vf.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
    hero.addEventListener("pointerleave", function () { vf.style.setProperty("--px", "0"); vf.style.setProperty("--py", "0"); });
  }

  // Marquee: fill the row, clone it once and loop at a steady speed
  var track = document.querySelector(".marquee-track");
  if (track && !reduceMotion) {
    var base = Array.prototype.map.call(track.firstElementChild.children, function (n) { return n.cloneNode(true); });
    var buildMarquee = function () {
      track.classList.remove("is-running");
      track.style.animationDuration = "";
      track.replaceChildren();
      var g = document.createElement("div");
      g.className = "marquee-group";
      base.forEach(function (n) { g.appendChild(n.cloneNode(true)); });
      track.appendChild(g);
      track.classList.add("is-running");
      var guard = 0;
      while (g.offsetWidth < window.innerWidth * 1.2 && guard++ < 10) base.forEach(function (n) { g.appendChild(n.cloneNode(true)); });
      var copy = g.cloneNode(true);
      copy.setAttribute("data-clone", "");
      track.appendChild(copy);
      track.style.animationDuration = Math.max(g.offsetWidth / 55, 12) + "s";
    };
    var rebuildTimer;
    var startMarquee = function () { buildMarquee(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(startMarquee); else startMarquee();
    window.addEventListener("resize", function () { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(buildMarquee, 250); });
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
})();
