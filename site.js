/* Asnan Tower concept: hero photo opens to full width on scroll, counters, the tower's lift light, lab parallax. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (u) => 1 - Math.pow(1 - u, 3);

  /* scroll-linked bits share one rAF */
  const media = $("#heroMedia"), lab = $(".lab");
  let queued = false;
  function frame() {
    queued = false;
    if (media && !reduce) {
      const r = media.getBoundingClientRect();
      const e = clamp((innerHeight - r.top) / (innerHeight * .9) - .25, 0, 1);
      media.style.setProperty("--e", ease(e).toFixed(4));
    }
    if (lab && !reduce) {
      const r = lab.getBoundingClientRect();
      lab.style.setProperty("--lp", clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1).toFixed(4));
    }
    if (!hovering) follow();
  }
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener("resize", frame);

  /* counters */
  const counted = new IntersectionObserver((es) => es.forEach((x) => {
    if (!x.isIntersecting) return;
    counted.unobserve(x.target);
    const el = x.target, to = +el.dataset.to, from = +(el.dataset.from || 0);
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (now) => { const u = clamp((now - t0) / dur, 0, 1); el.textContent = Math.round(from + (to - from) * ease(u)); if (u < 1) requestAnimationFrame(step); };
    el.textContent = from; requestAnimationFrame(step);
  }), { threshold: .6 });
  $$(".count").forEach((c) => counted.observe(c));

  /* tower: the department nearest the middle of the screen (or the one under the cursor) lights its floor */
  const bldg = $(".bldg"), floors = $$(".bldg__floors li").reverse(), deps = $$(".deps li");
  let cur = -1, hovering = false;
  function light(i) {
    if (i === cur) return;
    cur = i;
    deps.forEach((d, k) => d.classList.toggle("on", k === i));
    floors.forEach((f, k) => f.classList.toggle("on", k === i));
    if (bldg) bldg.style.setProperty("--f", i);
  }
  function follow() {
    if (!deps.length) return;
    const mid = innerHeight * .5;
    let best = 0, bd = Infinity;
    deps.forEach((d, k) => { const r = d.getBoundingClientRect(); const dist = Math.abs(r.top + r.height / 2 - mid); if (dist < bd) { bd = dist; best = k; } });
    light(best);
  }
  if (fine) deps.forEach((d, k) => {
    d.addEventListener("pointerenter", () => { hovering = true; light(k); });
    d.addEventListener("pointerleave", () => { hovering = false; });
  });
  frame();
})();
