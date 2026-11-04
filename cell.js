/*
 * Animated schematic for the Science Advances paper (schematic, not data).
 *
 * A hexagonal micropattern of channels. An orange disc moves behind the
 * network and is only visible through the channels (SVG mask). The cell
 * walks along ONE closed path, junction (vertex) to junction, resting
 * briefly at each one. It never splits to cover two paths.
 * On hover (pointer devices) the route lights up and the cell speeds up.
 */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var R = 26;                       // hexagon radius (pointy top)
  var DX = Math.sqrt(3) * R;        // column width
  var DY = 1.5 * R;                 // row height
  var STROKE = 4.5;
  var CELL_R = 19;
  var DURATION = 54000;             // ms for one full loop
  var REST = 0.25;                  // share of each leg spent resting

  // Hexagons whose outer boundary is the path, as [row, col].
  var PATH_HEXES = [[2, 2], [2, 3], [3, 3], [3, 4], [1, 3]];

  function centre(row, col) {
    var odd = Math.abs(row % 2) === 1;
    return [col * DX + (odd ? DX / 2 : 0), row * DY];
  }

  function corners(row, col) {
    var c = centre(row, col);
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 180 * (60 * i - 90);
      pts.push([c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]);
    }
    return pts;
  }

  function key(p) {
    return p[0].toFixed(2) + ',' + p[1].toFixed(2);
  }

  // Edges that belong to only one hexagon of the group form the perimeter.
  // Returns the ordered list of perimeter vertices (a closed cycle).
  function perimeter(hexes) {
    var edges = {};
    var points = {};
    hexes.forEach(function (h) {
      var pts = corners(h[0], h[1]);
      for (var i = 0; i < 6; i++) {
        var a = key(pts[i]);
        var b = key(pts[(i + 1) % 6]);
        points[a] = pts[i];
        points[b] = pts[(i + 1) % 6];
        var k = a < b ? a + '|' + b : b + '|' + a;
        edges[k] = (edges[k] || 0) + 1;
      }
    });

    var adj = {};
    Object.keys(edges).forEach(function (k) {
      if (edges[k] !== 1) return;
      var ab = k.split('|');
      (adj[ab[0]] = adj[ab[0]] || []).push(ab[1]);
      (adj[ab[1]] = adj[ab[1]] || []).push(ab[0]);
    });

    // Every perimeter vertex must have degree 2, so the path is one cycle.
    Object.keys(adj).forEach(function (v) {
      if (adj[v].length !== 2) {
        throw new Error('Perimeter vertex ' + v + ' has degree ' + adj[v].length);
      }
    });

    var start = Object.keys(adj).sort()[0];
    var cycle = [start];
    var prev = null;
    var cur = start;
    for (;;) {
      var next = adj[cur][0] === prev ? adj[cur][1] : adj[cur][0];
      if (next === start) break;
      cycle.push(next);
      prev = cur;
      cur = next;
    }
    if (cycle.length !== Object.keys(adj).length) {
      throw new Error('Perimeter is not a single closed cycle');
    }
    return cycle.map(function (k) { return points[k]; });
  }

  function el(name, attrs, parent) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attrs).forEach(function (a) { node.setAttribute(a, attrs[a]); });
    if (parent) parent.appendChild(node);
    return node;
  }

  function translate(p) {
    return 'translate(' + p[0].toFixed(2) + 'px, ' + p[1].toFixed(2) + 'px)';
  }

  function build(host, path) {
    var svg = el('svg', {
      viewBox: '0 0 300 200',
      role: 'img',
      'aria-label': 'Animated schematic of a cell following one path ' +
                    'along the junctions of a hexagonal network'
    });

    var defs = el('defs', {}, svg);
    var mask = el('mask', {
      id: 'channels', maskUnits: 'userSpaceOnUse',
      x: 0, y: 0, width: 300, height: 200
    }, defs);
    var grid = el('g', { 'class': 'cell-grid' }, svg);

    for (var row = -1; row <= 5; row++) {
      for (var col = -1; col <= 6; col++) {
        var pts = corners(row, col).map(function (p) {
          return p[0].toFixed(2) + ',' + p[1].toFixed(2);
        }).join(' ');
        el('polygon', {
          points: pts, fill: 'none', stroke: 'var(--border)',
          'stroke-width': STROKE, 'stroke-linejoin': 'round'
        }, grid);
        el('polygon', {
          points: pts, fill: 'none', stroke: '#fff',
          'stroke-width': STROKE, 'stroke-linejoin': 'round'
        }, mask);
      }
    }

    // The route the cell follows, revealed on hover (see style.css).
    el('polygon', {
      'class': 'cell-route',
      points: path.map(function (p) {
        return p[0].toFixed(2) + ',' + p[1].toFixed(2);
      }).join(' '),
      fill: 'none', stroke: 'var(--signal)', 'stroke-width': 1.5,
      'stroke-dasharray': '2 4', 'stroke-linecap': 'round'
    }, svg);

    var masked = el('g', { mask: 'url(#channels)' }, svg);
    var cell = el('circle', {
      cx: 0, cy: 0, r: CELL_R, fill: 'var(--signal)', 'class': 'cell-disc'
    }, masked);

    host.appendChild(svg);
    return { svg: svg, cell: cell };
  }

  function keyframes(path) {
    var n = path.length;
    var frames = [];
    for (var i = 0; i < n; i++) {
      var t = i / n;
      // arrival at junction i, then rest there
      frames.push({ transform: translate(path[i]), offset: t, easing: 'ease-in-out' });
      frames.push({ transform: translate(path[i]), offset: t + REST / n, easing: 'ease-in-out' });
    }
    frames.push({ transform: translate(path[0]), offset: 1 });
    return frames;
  }

  function init() {
    var host = document.getElementById('cell-figure');
    if (!host) return;

    var path = perimeter(PATH_HEXES);
    var parts = build(host, path);
    var cell = parts.cell;
    var still = translate(path[0]);
    cell.style.transform = still;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var anim = null;
    var visible = false;

    function sync() {
      if (reduce.matches) {
        if (anim) { anim.cancel(); anim = null; }
        cell.style.transform = still;   // rest on a junction, no motion
        return;
      }
      if (!anim && typeof cell.animate === 'function') {
        anim = cell.animate(keyframes(path), {
          duration: DURATION, iterations: Infinity
        });
      }
      if (!anim) return;
      if (visible) anim.play(); else anim.pause();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        sync();
      }).observe(parts.svg);
    } else {
      visible = true;
    }

    // Hover (pointer devices): the cell speeds up along its route.
    var hover = window.matchMedia('(hover: hover)');
    function rate(r) {
      if (!anim || !hover.matches || reduce.matches) return;
      if (anim.updatePlaybackRate) anim.updatePlaybackRate(r);
      else anim.playbackRate = r;
    }
    host.addEventListener('mouseenter', function () { rate(4); });
    host.addEventListener('mouseleave', function () { rate(1); });

    if (reduce.addEventListener) reduce.addEventListener('change', sync);
    else if (reduce.addListener) reduce.addListener(sync);

    sync();
    host.dataset.ready = 'true';
  }

  // Expose geometry for testing without a DOM.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { perimeter: perimeter, PATH_HEXES: PATH_HEXES };
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
