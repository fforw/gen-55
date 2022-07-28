import domready from "domready"
import "./style.css"
import weightedRandom from "./weightedRandom"
import randomPalette, { randomPaletteWithBlack } from "./randomPalette"
import Color from "./Color"
import AABB from "./AABB"
import { voronoi } from "d3-voronoi"
import { polygonCentroid, polygonArea } from "d3-polygon"

const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;

const layers = weightedRandom([
    1, () => 0,
    1, () => 0,
])







const white = Color.from("#fff")
const shadow = Color.from("#041426")
const greenA = Color.from("#081")
const greenB = Color.from("#b9aa00")


const overdraw = 1.15

function randomPoints(v)
{
    const {width, height} = config

    let pts = []
    const count = 1000 + 100 * Math.random()
    for (let i = 0; i < count; i++)
    {
        pts.push([
            Math.random() * width * overdraw,
            Math.random() * height * overdraw,
        ])
    }
    return pts
}

function relax(v,pts, relaxCount = 3)
{
    for (let i=0; i < relaxCount; i++)
    {
        const diagram = v(pts);
        const polygons = diagram.polygons();
        pts = polygons.map(poly => poly && polygonCentroid(poly));
    }
    return pts
}

const limit = 1000


function randomPair(palette)
{
    const indexA = 0 | Math.random() * palette.length
    let indexB
    do
    {
        indexB = 0 | Math.random() * palette.length
    } while(indexA === indexB)

    return [
        palette[indexA],
        palette[indexB]
    ]
}


function shorten(centroid, x0, y0, amount)
{
    const dx = x0 - centroid[0]
    const dy = y0 - centroid[1]
    const l = Math.sqrt(dx*dx+dy*dy);

    if (l <= amount)
    {
        return [x0,y0]
    }
    
    return [
        centroid[0] + dx * (l - amount) / l,
        centroid[1] + dy * (l - amount) / l
    ]
}


function shrink(polygon, centroid, amount = 10)
{
    const last = polygon.length - 1
    const vertexA = Math.floor(Math.random() * polygon.length)
    const vertexB = vertexA === last ? 0 : vertexA + 1

    const [x0,y0] = polygon[vertexA]
    const [x1,y1] = polygon[vertexB]

    polygon[vertexA] = shorten(centroid, x0, y0, amount)
    polygon[vertexB] = shorten(centroid, x1, y1, amount)
}


function drawPolygon(polygon, palette)
{
    const [colorA, colorB] = randomPair(palette)
    let even = false
    let area
    const centroid = polygonCentroid(polygon)

    do
    {
        const last = polygon.length - 1
        const [x1, y1] = polygon[last]

        ctx.fillStyle = palette[0|Math.random() * palette.length] 
        ctx.beginPath()
        ctx.moveTo(
            x1 | 0,
            y1 | 0
        )

        for (let j = 0; j < polygon.length; j++)
        {
            const [x1, y1] = polygon[j]

            ctx.lineTo(x1 | 0, y1 | 0)
        }
        ctx.fill()

        shrink(polygon, centroid, 20)
        even = !even

        area = polygonArea(polygon)
    }while(area > limit)
}


function drawPolygons(diagram, palette)
{
    const { width, height } = config

    ctx.save()
    ctx.translate(Math.round(-(width * overdraw - width ) * 0.5), Math.round(-(height * overdraw - height ) * 0.5))
    const polygons = diagram.polygons()
    for (let i = 0; i < polygons.length; i++)
    {
        const polygon = polygons[i]
        drawPolygon(polygon.slice(), palette)
    }
    ctx.restore()
}

domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;

        const cx = width >> 1
        const cy = height >> 1

        const paint = () => {

            const palette = randomPaletteWithBlack()

            ctx.fillStyle = Math.random() < 0.5 ? "#000" : "#fff"
            ctx.fillRect(0,0,width,height)

            const v = voronoi().extent([[0, 0], [width * overdraw, height * overdraw]])
            const pts = relax(v, randomPoints(v), 10);

            const diagram = v(pts)
            ctx.strokeStyle = "#044";
            drawPolygons(diagram, palette)
        }

        paint()

        canvas.addEventListener("click", paint, true)
    }
);
