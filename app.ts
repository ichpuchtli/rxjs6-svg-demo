
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
    tap,
    scan } = rxjs.operators;


var svg = document.getElementsByTagName("svg")[0];
var polyline = document.getElementsByTagName("polyline")[0];
var line = document.getElementsByTagName("line")[0];

var clearBtn = document.getElementById("clear");
var addBtn = document.getElementById("add");

var clearBtnEvents = Rx.fromEvent<MouseEvent>(clearBtn, "click");
var addBtnEvents = Rx.fromEvent<MouseEvent>(addBtn, "click");

const mouseDown = Rx.fromEvent<MouseEvent>(svg, "mousedown");
const mouseUp = Rx.fromEvent<MouseEvent>(svg, "mouseup");
const mouseWheel = Rx.fromEvent<MouseWheelEvent>(document, "wheel");
const mouseMove = Rx.fromEvent<MouseEvent>(svg, "mousemove");


const touchDown = Rx.fromEvent<TouchEvent>(svg, "touchstart").pipe(map(t => t.touches[0]));
const touchUp = Rx.fromEvent<TouchEvent>(svg, "touchend").pipe(map(t => t.touches[0]));
const touchMove = Rx.fromEvent<TouchEvent>(svg, "touchmove").pipe(map(t => t.touches[0]));

const keyUp = Rx.fromEvent<KeyboardEvent>(document, "keyup");

const getState = () => Array.from<SVGPoint>(polyline.points as any).map(p => ({ x: p.x, y: p.y }));

// #region ZOOM
mouseWheel
    .pipe(
        map(wheelEvent =>
        {
            wheelEvent.preventDefault();
            wheelEvent.stopPropagation();

            return wheelEvent.deltaY > 0 ? 1.1 : 1 / 1.1;
        }),
)
    .subscribe(zoom =>
    {
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
    switchMap(e =>
    {
        e.preventDefault();

        return mouseMove.pipe(
            map(eventToSvgSpace),
            takeUntil(mouseUp),
            pairwise(),
            // ---e1----e2------e3---
            // ---------[e1,e2]-[e2,e3]-
            map(([previous, next]) => ({ x: next.x - previous.x, y: next.y - previous.y })),
            // ---e-e-e-e-e-e-e-e-
            // -----------------^-------
            // -----------------[e,e,e,e,e,e,e]--
            bufferWhen(() => mouseUp),
        );
    })
);

panMovements
    .subscribe(diffs =>
    {
        for (var diff of diffs)
        {
            svg.viewBox.baseVal.x -= diff.x;
            svg.viewBox.baseVal.y -= diff.y;
        }
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


var addNodesStream =
    addBtnEvents.pipe(switchMap(_ =>
        Rx.range(1, 100, Rx.animationFrame).pipe(
            map(i => ({ x: Math.random() * 500, y: Math.random() * 500 })),
            map(p => newSVGPoint(p.x, p.y))
        )));

var newPointStream = mouseDown.pipe(
    filter(e => !isCircle(e.target)),
    filter(x => x.button === 0 /* Left Click */),
    map(eventToSvgSpace),
    merge(addNodesStream),
    merge(initialState)
);

newPointStream
    .subscribe(point =>
    {
        polyline.points.appendItem(point);

        svg.getElementById("circles").appendChild(newCircle({
            r: 3,
            cx: point.x,
            cy: point.y,
            "stroke-width": 1,
            "vector-effect": "non-scaling-stroke",
            stroke: "cyan",
            fill: "grey",
            "fill-opacity": "0.2",
            index: polyline.points.numberOfItems - 1
        }));

    });

// #region MOVE
var movePointStream = mouseDown
    .pipe(
        filter(e => isCircle(e.target)),
        switchMap(e =>
        {
            e.preventDefault();

            return mouseMove.pipe(
                map(eventToSvgSpace),
                takeUntil(mouseUp),
                map(p => [p, e.target as SVGCircleElement] as [SVGPoint, SVGCircleElement]),
            );
        })
    );

movePointStream
    .subscribe(([svgPoint, circle]) =>
    {
        circle.cx.baseVal.value = svgPoint.x;
        circle.cy.baseVal.value = svgPoint.y;

        var index = parseInt(circle.getAttribute("index"), 10);

        polyline.points.replaceItem(svgPoint, index);

    });
// #endregion


var newOrMoveStream = newPointStream.pipe(merge(movePointStream.pipe(map(pair => pair[0]))));

// ----a1---------------a2-------a
// ----b1-------b2--------------------b
// ----[a1,b1]---[a1,b2]-[a2,b2]----

Rx.combineLatest(mouseMove.pipe(map(eventToSvgSpace)), newOrMoveStream)
    .subscribe(([mouseInSvgSpace, lastPoint]) =>
    {
        line.x1.baseVal.value = lastPoint.x;
        line.y1.baseVal.value = lastPoint.y;

        line.x2.baseVal.value = mouseInSvgSpace.x;
        line.y2.baseVal.value = mouseInSvgSpace.y;
    });

var clearEvent = keyUp.pipe(
    filter(e => e.keyCode === 27 /* Escape */),
    merge(clearBtnEvents),
    map(e => []),
    tap(clearDom)
);

function clearDom()
{
    polyline.points.clear();
    svg.getElementById('circles').innerHTML = '';
}

function* iterate<T>(arr: ArrayLike<T>)
{
    for (var i = 0; i < arr.length; i++)
    {
        yield arr[i];
    }
}


// #region save state
// newpoinstream ----e---e-e---e--e-
// movePointStream ----m------m--
// result        ----e-m-e-e-eme--e-
Rx.merge(newPointStream, movePointStream)
    .pipe(
        debounceTime(1000),
        map(_ => getState()),
        merge(clearEvent)
    )
    .subscribe(state => localStorage.setItem("polyline-state", JSON.stringify(state)));
// #endregion


function newCircle(attributes: {})
{
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    Object.keys(attributes).forEach(key => circle.setAttribute(key, attributes[key]));

    return circle;
}

function isCircle(target: EventTarget)
{
    var circle = target as Element;

    return circle.tagName.toLowerCase() === "circle";
}
// --e-e-e-e-e-e-e-eo
// --e-----e------e-----e------e
function slowMo<T>(time: number)
{
    return (observable: rxjs.Observable<T>) =>
        new Rx.Observable<T>(observer =>
        {

            let i = 1;

            observable.subscribe(val =>
            {
                setTimeout(_ => observer.next(val), time * i);
                i++;
            });

        });
}



function newSVGPoint(x: number, y: number)
{
    const clientPoint = svg.createSVGPoint();

    clientPoint.x = x;
    clientPoint.y = y;

    return clientPoint;
}

function toSVGSpace(x: number, y: number)
{
    return newSVGPoint(x, y).matrixTransform(svg.getScreenCTM().inverse());
}

function eventToSvgSpace(e: MouseEvent)
{
    return toSVGSpace(e.clientX, e.clientY);
}