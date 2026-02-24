/**
 * Desenha gráfico de linha (histórico de preço) com labels bonitas e zoom.
 */
var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatDataLabel(s) {
  if (!s || s.length < 10) return s;
  var d = s.slice(8, 10);
  var m = parseInt(s.slice(5, 7), 10) - 1;
  var a = s.slice(0, 4);
  return d + ' ' + (MESES[m] || s.slice(5, 7));
}

function formatDataTooltip(s) {
  if (!s || s.length < 10) return s;
  var d = s.slice(8, 10);
  var m = parseInt(s.slice(5, 7), 10) - 1;
  var a = s.slice(0, 4);
  return d + ' de ' + (MESES[m] || '') + ' de ' + a;
}

function formatPreco(v) {
  return 'R$ ' + Number(v).toFixed(2).replace('.', ',');
}

function renderPriceChart(container, data, options) {
  var width = options?.width ?? (container.offsetWidth || 360);
  var height = options?.height ?? 120;
  var padding = { top: 14, right: 10, bottom: 28, left: 40 };
  var innerWidth = width - padding.left - padding.right;
  var innerHeight = height - padding.top - padding.bottom;

  container.innerHTML = '';
  if (!data || data.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'noobprice-chart-empty';
    empty.style.cssText = 'padding:20px; text-align:center; color:#9ca3af; font-size:13px; border:1px dashed #4b5563; border-radius:8px;';
    empty.textContent = 'Histórico de preço aparecerá aqui conforme você for consultando.';
    container.appendChild(empty);
    return;
  }

  var sorted = data.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
  var totalPoints = sorted.length;

  var wrap = document.createElement('div');
  wrap.className = 'noobprice-chart-wrap';
  wrap.style.cssText = 'position:relative; width:100%;';

  var tooltip = document.createElement('div');
  tooltip.className = 'noobprice-chart-tooltip';
  tooltip.style.cssText = 'display:none; position:absolute; background:linear-gradient(135deg,#1e1e2f,#2c2c3f); border:1px solid #4b5563; border-radius:8px; padding:8px 12px; font-size:12px; color:#e5e7eb; box-shadow:0 4px 12px rgba(0,0,0,0.4); z-index:10; pointer-events:none; white-space:nowrap;';
  wrap.appendChild(tooltip);

  var svgContainer = document.createElement('div');
  svgContainer.style.cssText = 'position:relative;';
  wrap.appendChild(svgContainer);

  var zoomBar = document.createElement('div');
  zoomBar.className = 'noobprice-chart-zoom';
  zoomBar.style.cssText = 'display:flex; align-items:center; justify-content:center; margin-top:8px; padding-bottom:12px;';
  var btnReset = document.createElement('button');
  btnReset.type = 'button';
  btnReset.textContent = 'Resetar zoom';
  btnReset.title = 'Ver todo o período';
  btnReset.style.cssText = 'padding:6px 12px; border:none; border-radius:6px; background:#3f3f5a; color:#93c5fd; font-size:11px; cursor:pointer; transition:background 0.2s;';
  zoomBar.appendChild(btnReset);
  wrap.appendChild(zoomBar);

  btnReset.onmouseover = function () { btnReset.style.background = '#4b5563'; };
  btnReset.onmouseout = function () { btnReset.style.background = '#3f3f5a'; };

  var viewStart = 0;
  var viewEnd = totalPoints - 1;

  function getViewSlice() {
    var start = Math.max(0, Math.min(viewStart, viewEnd));
    var end = Math.min(totalPoints - 1, Math.max(viewStart, viewEnd));
    return { start: start, end: end, data: sorted.slice(start, end + 1) };
  }

  function redraw() {
    var slice = getViewSlice();
    var viewData = slice.data;
    if (viewData.length === 0) return;

    svgContainer.innerHTML = '';
    var prices = viewData.map(function (d) { return d.price; });
    var minP = Math.min.apply(null, prices);
    var maxP = Math.max.apply(null, prices);
    var range = maxP - minP || 1;
    var minY = minP - range * 0.05;
    var maxY = maxP + range * 0.05;
    var scaleY = function (v) {
      return padding.top + innerHeight - ((v - minY) / (maxY - minY)) * innerHeight;
    };
    var scaleX = function (i) {
      return padding.left + (i / Math.max(viewData.length - 1, 1)) * innerWidth;
    };

    var pathD = viewData
      .map(function (d, i) { return (i === 0 ? 'M' : 'L') + ' ' + scaleX(i) + ' ' + scaleY(d.price); })
      .join(' ');
    var areaD = pathD + ' L ' + scaleX(viewData.length - 1) + ' ' + (padding.top + innerHeight) + ' L ' + scaleX(0) + ' ' + (padding.top + innerHeight) + ' Z';

    var gradId = 'noobprice-chart-grad-' + Math.random().toString(36).slice(2, 9);
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(height));
    svg.style.display = 'block';
    svg.style.maxWidth = '100%';

    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', gradId);
    grad.setAttribute('x1', '0');
    grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '0');
    grad.setAttribute('y2', '1');
    var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#22c55e');
    stop1.setAttribute('stop-opacity', '0.35');
    var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#22c55e');
    stop2.setAttribute('stop-opacity', '0');
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    var area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaD);
    area.setAttribute('fill', 'url(#' + gradId + ')');
    svg.appendChild(area);

    var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', pathD);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#22c55e');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(line);

    var nX = Math.min(7, viewData.length);
    var stepX = Math.max(1, Math.floor((viewData.length - 1) / nX));
    var labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labelGroup.setAttribute('class', 'noobprice-chart-labels');
    for (var i = 0; i < viewData.length; i += stepX) {
      var x = scaleX(i);
      var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', x);
      txt.setAttribute('y', height - 8);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', '#9ca3af');
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-family', 'Segoe UI, Tahoma, sans-serif');
      txt.setAttribute('letter-spacing', '0.02em');
      txt.textContent = formatDataLabel(viewData[i].date);
      labelGroup.appendChild(txt);
    }
    svg.appendChild(labelGroup);

    var minPriceTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    minPriceTxt.setAttribute('x', padding.left - 4);
    minPriceTxt.setAttribute('y', padding.top + innerHeight + 4);
    minPriceTxt.setAttribute('text-anchor', 'end');
    minPriceTxt.setAttribute('fill', '#9ca3af');
    minPriceTxt.setAttribute('font-size', '10');
    minPriceTxt.setAttribute('font-family', 'Segoe UI, Tahoma, sans-serif');
    minPriceTxt.textContent = 'R$ ' + minY.toFixed(0);
    svg.appendChild(minPriceTxt);

    var maxPriceTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    maxPriceTxt.setAttribute('x', padding.left - 4);
    maxPriceTxt.setAttribute('y', padding.top + 4);
    maxPriceTxt.setAttribute('text-anchor', 'end');
    maxPriceTxt.setAttribute('fill', '#9ca3af');
    maxPriceTxt.setAttribute('font-size', '10');
    maxPriceTxt.setAttribute('font-family', 'Segoe UI, Tahoma, sans-serif');
    maxPriceTxt.textContent = 'R$ ' + maxY.toFixed(0);
    svg.appendChild(maxPriceTxt);

    var hitRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    hitRect.setAttribute('x', String(padding.left));
    hitRect.setAttribute('y', String(padding.top));
    hitRect.setAttribute('width', String(innerWidth));
    hitRect.setAttribute('height', String(innerHeight));
    hitRect.setAttribute('fill', 'transparent');
    hitRect.setAttribute('cursor', 'crosshair');
    svg.appendChild(hitRect);

    function onMouseMove(e) {
      var rect = svg.getBoundingClientRect();
      var scale = width / rect.width;
      var x = (e.clientX - rect.left) * scale;
      if (x < padding.left || x > padding.left + innerWidth) {
        tooltip.style.display = 'none';
        return;
      }
      var t = (x - padding.left) / innerWidth;
      var i = Math.round(t * (viewData.length - 1));
      var idx = Math.max(0, Math.min(i, viewData.length - 1));
      var point = viewData[idx];
      tooltip.innerHTML = '<strong style="color:#93c5fd">' + formatDataTooltip(point.date) + '</strong><br><span style="color:#22c55e; font-weight:bold">' + formatPreco(point.price) + '</span>';
      tooltip.style.display = 'block';
      var wrapRect = wrap.getBoundingClientRect();
      var ttRect = tooltip.getBoundingClientRect();
      var left = e.clientX - wrapRect.left - ttRect.width / 2;
      left = Math.max(8, Math.min(wrapRect.width - ttRect.width - 8, left));
      var top = e.clientY - wrapRect.top - ttRect.height - 8;
      if (top < 8) top = e.clientY - wrapRect.top + 12;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    }

    function onMouseLeave() {
      tooltip.style.display = 'none';
    }

    hitRect.addEventListener('mousemove', onMouseMove);
    hitRect.addEventListener('mouseleave', onMouseLeave);

    svgContainer.appendChild(svg);
  }

  function zoomIn() {
    var span = viewEnd - viewStart + 1;
    if (span <= 1) return;
    var newSpan = Math.max(2, Math.floor(span * 0.6));
    var center = viewStart + Math.floor(span / 2);
    viewStart = Math.max(0, center - Math.floor(newSpan / 2));
    viewEnd = Math.min(totalPoints - 1, viewStart + newSpan - 1);
    if (viewEnd - viewStart + 1 < newSpan) viewStart = Math.max(0, viewEnd - newSpan + 1);
    redraw();
  }

  function zoomOut() {
    var span = viewEnd - viewStart + 1;
    var newSpan = Math.min(totalPoints, Math.ceil(span * 1.4));
    var center = viewStart + Math.floor(span / 2);
    viewStart = Math.max(0, center - Math.floor(newSpan / 2));
    viewEnd = Math.min(totalPoints - 1, viewStart + newSpan - 1);
    redraw();
  }

  function resetZoom() {
    viewStart = 0;
    viewEnd = totalPoints - 1;
    redraw();
  }

  wrap.addEventListener('wheel', function (e) {
    if (!svgContainer.contains(e.target)) return;
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else if (e.deltaY > 0) zoomOut();
  }, { passive: false });

  btnReset.addEventListener('click', resetZoom);

  redraw();
  container.appendChild(wrap);
}
