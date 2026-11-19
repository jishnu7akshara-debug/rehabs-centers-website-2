(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav: solid after scrolling, mobile drawer ---------- */
  var nav = document.querySelector("[data-nav]");
  var burger = document.querySelector(".nav__burger");
  var drawer = document.getElementById("drawer");
  function setDrawer(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    drawer.hidden = !open;
    nav.classList.toggle("is-solid", open || window.scrollY > 30);
  }
  burger.addEventListener("click", function () { setDrawer(drawer.hidden); });
  drawer.addEventListener("click", function (e) { if (e.target.closest("a")) setDrawer(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) { setDrawer(false); burger.focus(); } });

  /* ---------- scroll-linked effects, one rAF loop ---------- */
  var stage = document.querySelector("[data-hero-stage]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".stack .card"));
  var timeline = document.querySelector("[data-timeline]");
  var steps = timeline ? Array.prototype.slice.call(timeline.children) : [];
  var ticking = false;

  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    nav.classList.toggle("is-solid", !drawer.hidden || window.scrollY > 30);

    if (!reduce) {
      // hero photo widens and loses its inset as it rises
      if (stage) {
        var r = stage.getBoundingClientRect();
        var p = clamp((vh - r.top) / (vh * 0.9) - 0.35);
        stage.style.setProperty("--p", p.toFixed(3));
      }
      // stacked cards: each one shrinks slightly as the next slides over it
      for (var i = 0; i < cards.length - 1; i++) {
        var next = cards[i + 1].getBoundingClientRect();
        var cur = cards[i].getBoundingClientRect();
        var overlap = clamp((cur.bottom - next.top) / cur.height);
        cards[i].style.setProperty("--scale", (1 - overlap * 0.05).toFixed(4));
      }
    }

    // timeline fill follows the middle of the screen
    if (timeline) {
      var t = timeline.getBoundingClientRect();
      var mid = vh * 0.55;
      var fill = clamp((mid - t.top) / t.height);
      timeline.style.setProperty("--fill", fill.toFixed(3));
      steps.forEach(function (li) { li.classList.toggle("is-on", li.getBoundingClientRect().top < mid); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  /* ---------- photo reveals + lazy video ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.dataset.loaded) {
            v.querySelectorAll("source[data-src]").forEach(function (s) { s.src = s.dataset.src; });
            v.load(); v.dataset.loaded = "1";
          }
          if (!reduce) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        } else if (!v.paused) { v.pause(); }
      });
    }, { rootMargin: "200px 0px", threshold: 0.2 });
    document.querySelectorAll("video[data-lazy-video]").forEach(function (v) { vio.observe(v); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
    document.querySelectorAll("video[data-lazy-video] source[data-src]").forEach(function (s) { s.src = s.dataset.src; s.parentNode.load(); });
  }

  /* ---------- FAQ: one open at a time ---------- */
  var details = document.querySelectorAll(".faq details");
  details.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) details.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- plan buttons pre-select the plan ---------- */
  var planSel = document.getElementById("plan");
  var homeRadio = document.getElementById("w-home");
  var clinicRadio = document.getElementById("w-clinic");
  document.querySelectorAll("[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () {
      planSel.value = b.dataset.plan;
      if (b.dataset.plan === "Home visit") homeRadio.checked = true; else clinicRadio.checked = true;
    });
  });
  homeRadio.addEventListener("change", function () { if (homeRadio.checked) planSel.value = "Home visit"; });
  clinicRadio.addEventListener("change", function () { if (clinicRadio.checked && planSel.value === "Home visit") planSel.value = "Single session"; });

  /* ---------- form ---------- */
  var form = document.getElementById("form");
  var ok = document.getElementById("form-ok");
  var rules = {
    name: function (v) { return v.trim().length >= 2; },
    phone: function (v) { return /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)/, "")); },
    concern: function (v) { return v !== ""; }
  };
  function mark(input, bad) {
    input.closest(".field").classList.toggle("bad", bad);
    if (bad) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", input.id + "-err"); }
    else { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); }
  }
  Object.keys(rules).forEach(function (k) {
    var el = form.elements[k];
    ["input", "change"].forEach(function (ev) { el.addEventListener(ev, function () { if (rules[k](el.value)) mark(el, false); }); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var first = null;
    Object.keys(rules).forEach(function (k) {
      var el = form.elements[k], bad = !rules[k](el.value);
      mark(el, bad); if (bad && !first) first = el;
    });
    if (first) { first.focus(); return; }
    var name = form.elements.name.value.trim().split(" ")[0];
    var where = form.elements.where.value === "home" ? "a home visit" : "a session at the clinic";
    ok.textContent = "Thanks, " + name + ". We'll call you within the hour to book " + where + ".";
    ok.hidden = false;
    form.reset();
    ok.focus();
  });

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
