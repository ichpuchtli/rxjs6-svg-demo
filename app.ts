
// TODO get comments for operators.
/// <reference path="index.d.ts" />

const Rx = rxjs;
const RxEx = rxjs.operators;

var svg = document.getElementsByTagName("svg")[0];
var polyline = document.getElementsByTagName("polyline")[0];

function newSVGPoint(x: number, y: number)
{
    const clientPoint = svg.createSVGPoint();

    clientPoint.x = x;
    clientPoint.y = y;

    return clientPoint;
}

const toSVGSpace = (x: number, y: number) => newSVGPoint(x, y).matrixTransform(svg.getScreenCTM().inverse());

const EventtoSVGSpace = (e: MouseEvent) => toSVGSpace(e.clientX, e.clientY);

const mousedown = Rx.fromEvent<MouseEvent>(svg, 'mousedown');
const mouseup = Rx.fromEvent<MouseEvent>(svg, 'mouseup');
const mousewheel = Rx.fromEvent<MouseWheelEvent>(svg, 'mousewheel');
const mousemove = Rx.fromEvent<MouseEvent>(svg, 'mousemove');

mousewheel
    .pipe(
        RxEx.filter(e => e.ctrlKey),
        RxEx.map(wheelEvent =>
        {
            wheelEvent.preventDefault();
            wheelEvent.stopPropagation();

            return wheelEvent.deltaY > 0 ? 1.1 : 1 / 1.1;
        })
    )
    .subscribe(zoom =>
    {
        const oldHeight = svg.viewBox.baseVal.height;
        const oldWidth = svg.viewBox.baseVal.width;

        svg.viewBox.baseVal.width *= zoom;
        svg.viewBox.baseVal.height *= zoom;

        svg.viewBox.baseVal.x += (oldWidth - svg.viewBox.baseVal.width) / 2
        svg.viewBox.baseVal.y += (oldHeight - svg.viewBox.baseVal.height) / 2;
    });


mousedown.pipe(
    RxEx.filter(x => x.button == 1 /* Mouse Wheel Button */),
    RxEx.switchMap(e =>
    {
        e.preventDefault();

        return mousemove.pipe(
            RxEx.map(EventtoSVGSpace),
            RxEx.takeUntil(mouseup),
            RxEx.pairwise(),
            RxEx.filter(x => x.length === 2), // ignore end of stream where buffer may be 1
            RxEx.map(([previous, next]) => ({ x: next.x - previous.x, y: next.y - previous.y }))
        )
    }))
    .subscribe(diff =>
    {
        svg.viewBox.baseVal.x -= diff.x;
        svg.viewBox.baseVal.y -= diff.y;
    });

mousedown.pipe(
    RxEx.filter(x => x.button == 0 /* Left Click */),
    RxEx.map(EventtoSVGSpace),
)
    .subscribe(point =>
    {
        var cicle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        cicle.cx.baseVal.value = point.x;
        cicle.cy.baseVal.value = point.y;

        polyline.points.appendItem(point);
    });