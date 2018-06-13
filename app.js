// TODO get comments for operators.
/// <reference path="index.d.ts" />
var Rx = rxjs;
var _a = rxjs.operators, filter = _a.filter, switchMap = _a.switchMap, map = _a.map, mapTo = _a.mapTo, takeUntil = _a.takeUntil, merge = _a.merge, bufferWhen = _a.bufferWhen, debounceTime = _a.debounceTime, distinctUntilChanged = _a.distinctUntilChanged, pairwise = _a.pairwise, scan = _a.scan;
var svg = document.getElementsByTagName("svg")[0];
var polyline = document.getElementsByTagName("polyline")[0];
var circle = document.getElementsByTagName("circle")[0];
var line = document.getElementsByTagName("line")[0];
var mouseDown = Rx.fromEvent(svg, 'mousedown');
var mouseUp = Rx.fromEvent(svg, 'mouseup');
var mouseWheel = Rx.fromEvent(document, 'wheel');
var mouseMove = Rx.fromEvent(svg, 'mousemove');
var keyUp = Rx.fromEvent(document, 'keyup');
var getState = function () { return Array.from(polyline.points).map(function (p) { return ({ x: p.x, y: p.y }); }); };
// #region ZOOM
mouseWheel
    .pipe(map(function (wheelEvent) {
    wheelEvent.preventDefault();
    wheelEvent.stopPropagation();
    return wheelEvent.deltaY > 0 ? 1.1 : 1 / 1.1;
}))
    .subscribe(function (zoom) {
    var oldHeight = svg.viewBox.baseVal.height;
    var oldWidth = svg.viewBox.baseVal.width;
    svg.viewBox.baseVal.width *= zoom;
    svg.viewBox.baseVal.height *= zoom;
    svg.viewBox.baseVal.x += (oldWidth - svg.viewBox.baseVal.width) / 2;
    svg.viewBox.baseVal.y += (oldHeight - svg.viewBox.baseVal.height) / 2;
});
// #endregion ZOOM
// #region PAN
var panMovements = mouseDown.pipe(filter(function (x) { return x.button == 1; } /* Mouse Wheel Button */), switchMap(function (e) {
    e.preventDefault();
    return mouseMove.pipe(map(eventToSvgSpace), takeUntil(mouseUp), pairwise(), map(function (_a) {
        var previous = _a[0], next = _a[1];
        return ({ x: next.x - previous.x, y: next.y - previous.y });
    }), bufferWhen(function () { return mouseUp; }), switchMap(function (buffer) { return Rx.from(buffer); }));
}));
panMovements
    .subscribe(function (diff) {
    svg.viewBox.baseVal.x -= diff.x;
    svg.viewBox.baseVal.y -= diff.y;
});
// #endregion
// #region replaying state 
var initialState = Rx
    .from(JSON.parse(localStorage.getItem('polyline-state') || '[]'))
    .pipe(map(function (p) { return newSVGPoint(p.x, p.y); }), slowMo(100));
// #endregion
var newPointStream = mouseDown.pipe(filter(function (e) { return !isCircle(e.target); }), filter(function (x) { return x.button == 0; } /* Left Click */), map(eventToSvgSpace), merge(initialState));
newPointStream
    .subscribe(function (point) {
    polyline.points.appendItem(point);
    svg.appendChild(newCircle({
        r: 15,
        cx: point.x,
        cy: point.y,
        'stroke-width': 3,
        stroke: 'cyan',
        fill: 'white',
        index: polyline.points.numberOfItems - 1
    }));
});
// #region MOVE
var movePointStream = mouseDown
    .pipe(filter(function (e) { return isCircle(e.target); }), switchMap(function (e) {
    e.preventDefault();
    return mouseMove.pipe(map(eventToSvgSpace), takeUntil(mouseUp), map(function (p) { return [p, e.target]; }));
}));
movePointStream
    .subscribe(function (_a) {
    var svgPoint = _a[0], circle = _a[1];
    circle.cx.baseVal.value = svgPoint.x;
    circle.cy.baseVal.value = svgPoint.y;
    var index = parseInt(circle.getAttribute('index'));
    polyline.points.replaceItem(svgPoint, index);
});
// #endregion 
var escapeKey = keyUp.pipe(filter(function (e) { return e.keyCode == 27; } /* Escape */), mapTo(false), scan(function (previous, _) { return !previous; }, false));
var newOrMoveStream = newPointStream.pipe(merge(movePointStream.pipe(map(function (pair) { return pair[0]; }))));
Rx.combineLatest(mouseMove.pipe(map(eventToSvgSpace)), newOrMoveStream)
    .subscribe(function (_a) {
    var mouseInSvgSpace = _a[0], lastPoint = _a[1];
    line.x1.baseVal.value = lastPoint.x;
    line.y1.baseVal.value = lastPoint.y;
    line.x2.baseVal.value = mouseInSvgSpace.x;
    line.y2.baseVal.value = mouseInSvgSpace.y;
});
// #region save state
Rx.merge(newPointStream, movePointStream)
    .subscribe(function (_) { return localStorage.setItem('polyline-state', JSON.stringify(getState())); });
// #endregion
function newCircle(attributes) {
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    Object.keys(attributes).forEach(function (key) { return circle.setAttribute(key, attributes[key]); });
    return circle;
}
function isCircle(target) {
    var circle = target;
    return circle.tagName.toLowerCase() === "circle";
}
function slowMo(time) {
    return function (observable) {
        return new Rx.Observable(function (observer) {
            var i = 1;
            observable.subscribe(function (val) {
                setTimeout(function (_) { return observer.next(val); }, time * i);
                i++;
            });
        });
    };
}
function newSVGPoint(x, y) {
    var clientPoint = svg.createSVGPoint();
    clientPoint.x = x;
    clientPoint.y = y;
    return clientPoint;
}
function toSVGSpace(x, y) {
    return newSVGPoint(x, y).matrixTransform(svg.getScreenCTM().inverse());
}
function eventToSvgSpace(e) {
    return toSVGSpace(e.clientX, e.clientY);
}
//# sourceMappingURL=app.js.map