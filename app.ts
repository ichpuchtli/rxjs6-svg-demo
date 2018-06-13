
// tODO get comments for operators.
/// <reference path="index.d.ts" />

const Rx = rxjs;

const {
    filter,
    switchMap,
    map,
    mapTo,
    takeUntil,
    merge,
    bufferWhen,
    debounceTime,
    distinctUntilChanged,
    pairwise,
    scan } = rxjs.operators;


var svg = document.getElementsByTagName("svg")[0];
var polyline = document.getElementsByTagName("polyline")[0];
var circle = document.getElementsByTagName("circle")[0];
var line = document.getElementsByTagName("line")[0];

const mouseDown = Rx.fromEvent<MouseEvent>(svg, "mousedown");
const mouseUp = Rx.fromEvent<MouseEvent>(svg, "mouseup");
const mouseWheel = Rx.fromEvent<MouseWheelEvent>(document, "wheel");
const mouseMove = Rx.fromEvent<MouseEvent>(svg, "mousemove");

const keyUp = Rx.fromEvent<KeyboardEvent>(document, "keyup");

const getState = () => Array.from<SVGPoint>(polyline.points as any).map(p => ({ x: p.x, y: p.y }));

// #region ZOOM
mouseWheel
    .pipe(
        map(wheelEvent => {
            wheelEvent.preventDefault();
            wheelEvent.stopPropagation();

            return wheelEvent.deltaY > 0 ? 1.1 : 1 / 1.1;
        }),
)
    .subscribe(zoom => {
        const oldHeight = svg.viewBox.baseVal.height;
        const oldWidth = svg.viewBox.baseVal.width;

        svg.viewBox.baseVal.width *= zoom;
        svg.viewBox.baseVal.height *= zoom;

        svg.viewBox.baseVal.x += (oldWidth - svg.viewBox.baseVal.width) / 2;
        svg.viewBox.baseVal.y += (oldHeight - svg.viewBox.baseVal.height) / 2;
    });
// #endregion ZOOM


// #region PAN
var panMovements = mouseDown.pipe(
    filter(x => x.button === 1 /* Mouse Wheel Button */),
    switchMap(e => {
        e.preventDefault();

        return mouseMove.pipe(
            map(eventToSvgSpace),
            takeUntil(mouseUp),
            pairwise(),
            map(([previous, next]) => ({ x: next.x - previous.x, y: next.y - previous.y })),
            bufferWhen(() => mouseUp),
            switchMap(buffer => Rx.from(buffer))
        );
    })
);

panMovements
    .subscribe(diff => {
        svg.viewBox.baseVal.x -= diff.x;
        svg.viewBox.baseVal.y -= diff.y;
    });

// #endregion

// #region replaying state

var initialState = Rx
    .from<{ x: number, y: number }>(JSON.parse(localStorage.getItem("polyline-state") || "[]"))
    .pipe(
        map(p => newSVGPoint(p.x, p.y)),
        slowMo(100)
    );
// #endregion


var newPointStream = mouseDown.pipe(
    filter(e => !isCircle(e.target)),
    filter(x => x.button === 0 /* Left Click */),
    map(eventToSvgSpace),
    merge(initialState)
);

newPointStream
    .subscribe(point => {
        polyline.points.appendItem(point);

        svg.appendChild(newCircle({
            r: 15,
            cx: point.x,
            cy: point.y,
            "stroke-width": 3,
            stroke: "cyan",
            fill: "white",
            index: polyline.points.numberOfItems - 1
        }));

    });

// #region MOVE
var movePointStream = mouseDown
    .pipe(
        filter(e => isCircle(e.target)),
        switchMap(e => {
            e.preventDefault();

            return mouseMove.pipe(
                map(eventToSvgSpace),
                takeUntil(mouseUp),
                map(p => [p, e.target as SVGCircleElement] as [SVGPoint, SVGCircleElement]),
            );
        })
    );

movePointStream
    .subscribe(([svgPoint, circle]) => {
        circle.cx.baseVal.value = svgPoint.x;
        circle.cy.baseVal.value = svgPoint.y;

        var index = parseInt(circle.getAttribute("index"), 10);

        polyline.points.replaceItem(svgPoint, index);

    });
// #endregion

var escapeKey =
    keyUp.pipe(
        filter(e => e.keyCode === 27 /* Escape */),
        mapTo(false),
        scan((previous, _) => !previous, false)
    );

var newOrMoveStream = newPointStream.pipe(merge(movePointStream.pipe(map(pair => pair[0]))));

Rx.combineLatest(mouseMove.pipe(map(eventToSvgSpace)), newOrMoveStream)
    .subscribe(([mouseInSvgSpace, lastPoint]) => {
        line.x1.baseVal.value = lastPoint.x;
        line.y1.baseVal.value = lastPoint.y;

        line.x2.baseVal.value = mouseInSvgSpace.x;
        line.y2.baseVal.value = mouseInSvgSpace.y;
    });

// #region save state
Rx.merge(newPointStream, movePointStream)
    .subscribe(_ => localStorage.setItem("polyline-state", JSON.stringify(getState())));
// #endregion


function newCircle(attributes: {}) {
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    Object.keys(attributes).forEach(key => circle.setAttribute(key, attributes[key]));

    return circle;
}

function isCircle(target: EventTarget) {
    var circle = target as Element;

    return circle.tagName.toLowerCase() === "circle";
}

function slowMo<T>(time: number) {
    return (observable: rxjs.Observable<T>) =>
        new Rx.Observable<T>(observer => {

            let i = 1;

            observable.subscribe(val => {
                setTimeout(_ => observer.next(val), time * i);
                i++;
            });

        });
}



function newSVGPoint(x: number, y: number) {
    const clientPoint = svg.createSVGPoint();

    clientPoint.x = x;
    clientPoint.y = y;

    return clientPoint;
}

function toSVGSpace(x: number, y: number) {
    return newSVGPoint(x, y).matrixTransform(svg.getScreenCTM().inverse());
}

function eventToSvgSpace(e: MouseEvent) {
    return toSVGSpace(e.clientX, e.clientY);
}