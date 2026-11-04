/*
 * Small animations for the home page figures 2 to 4.
 *
 * Idle (all devices, only while on screen):
 *   Fig. 2  bars grow in to scale the first time they are seen.
 *   Fig. 3  the numeral counts up once; a slow wave runs through the dots.
 *   Fig. 4  a dot travels from Student to Programme along the path.
 * Hover (pointer devices only, styled in style.css):
 *   Fig. 2  the original bar compresses down to the compressed size.
 *   Fig. 3  the dots pop one by one, hub after hub.
 *   Fig. 4  the path draws itself and the steps light up in order.
 *
 * Nothing moves with prefers-reduced-motion: every figure shows its
 * final, static state.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function onView(el, cb) {
    if (!('IntersectionObserver' in window)) {
      cb(true);
      return;
    }
    new IntersectionObserver(function (entries) {
      cb(entries[entries.length - 1].isIntersecting);
    }, { threshold: 0.35 }).observe(el);
  }

  // Fig. 2: bars grow in once, then the hover handles the rest (CSS).
  function bars(fig) {
    if (reduce.matches) return;
    fig.classList.add('anim-ready');
    onView(fig, function (visible) {
      if (visible) fig.classList.add('seen');
    });
  }

  // Fig. 3: count up the numeral once, run the dot wave while visible.
  function hubs(fig) {
    var dots = fig.querySelectorAll('.hub-dots circle');
    dots.forEach(function (dot, i) { dot.style.setProperty('--i', i); });

    var num = fig.querySelector('.big-num-value');
    var counted = false;

    function countUp() {
      if (!num || counted) return;
      counted = true;
      var target = 4000;
      var start = null;
      var DURATION = 1200;
      function step(t) {
        if (start === null) start = t;
        var k = Math.min(1, (t - start) / DURATION);
        var eased = 1 - Math.pow(1 - k, 3);
        num.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    onView(fig, function (visible) {
      fig.classList.toggle('in-view', visible);
      if (visible && !reduce.matches) countUp();
    });
  }

  // Fig. 4: a dot travels along the curve while the figure is visible.
  function cami(fig) {
    var path = fig.querySelector('.cami-route');
    var dot = fig.querySelector('.cami-traveler');
    if (!path || !dot || typeof dot.animate !== 'function') return;

    var length = path.getTotalLength();
    var STEPS = 40;
    var frames = [];
    for (var i = 0; i <= STEPS; i++) {
      var p = path.getPointAtLength(length * i / STEPS);
      frames.push({
        transform: 'translate(' + p.x.toFixed(1) + 'px, ' +
                   p.y.toFixed(1) + 'px)',
        offset: 0.75 * i / STEPS,
        opacity: i === 0 ? 0 : 1
      });
    }
    var end = path.getPointAtLength(length);
    var endT = 'translate(' + end.x.toFixed(1) + 'px, ' + end.y.toFixed(1) + 'px)';
    frames.push({ transform: endT, offset: 0.9, opacity: 0 });
    frames.push({ transform: endT, offset: 1, opacity: 0 });

    var anim = null;
    var visible = false;

    function sync() {
      if (reduce.matches) {
        if (anim) { anim.cancel(); anim = null; }
        dot.style.opacity = 0;
        return;
      }
      if (!anim) {
        anim = dot.animate(frames, {
          duration: 5200, iterations: Infinity, easing: 'linear'
        });
      }
      if (visible) anim.play(); else anim.pause();
    }

    onView(fig, function (v) { visible = v; sync(); });
    if (reduce.addEventListener) reduce.addEventListener('change', sync);
  }

  function init() {
    var b = document.querySelector('.bars');
    if (b) bars(b);
    var h = document.querySelector('.tool-fig-hubs');
    if (h) hubs(h);
    var c = document.querySelector('.tool-fig-cami');
    if (c) cami(c);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
