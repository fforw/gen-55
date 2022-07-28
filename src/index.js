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


const overdraw = 1/PHI

function randomPoints(v)
{
    const { width, height } = config

    const cx = width >> 1
    const cy = height >> 1


    let pts = []
    const count = 20 + 36 * Math.random()

    const w = Math.round(width * overdraw)
    const h = Math.round(height * overdraw)

    for (let i = 0; i < count; i++)
    {
        pts.push([
            cx - w/2 + Math.random() * w,
            cy - h/2 + Math.random() * h
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

function circumcircle(polygon)
{
    const centroid = polygonCentroid(polygon)

    const vertices= []
    for (let i = 0; i < polygon.length; i++)
    {
        const [x, y] = polygon[i]
        const dx = x - centroid[0]
        const dy = y - centroid[1]
        let d = Math.sqrt(dx * dx + dy * dy)

        vertices.push([
            x,y,d
        ])
    }

    vertices.sort((a,b) => b[2] - a[2])

    let [ax,ay] = vertices[0]
    let [bx,by] = vertices[1]
    let [cx,cy] = vertices[2]

    bx -= ax
    by -= ay
    cx -= ax
    cy -= ay

    const d = (2 * (bx * cy - by * cx))

    let cSquared = cx * cx + cy * cy
    let bSquared = bx * bx + by * by
    const ux = 1/d * (cy * bSquared - by * cSquared)
    const uy = 1/d * (bx * cSquared - cx * bSquared)

    const r = Math.sqrt(ux*ux + uy*uy);
    let result = [ux + ax, uy + ay,r]

    console.log("circumcircle", result)
    return result
}


function drawPolygon(polygon, palette)
{
    const last = polygon.length - 1
    const [x1, y1] = polygon[last]

    ctx.beginPath()
    ctx.moveTo(
        x1 | 0,
        y1 | 0
    )

    for (let i = 0; i < polygon.length; i++)
    {
        const [x1, y1] = polygon[i]
        ctx.lineTo(x1 | 0, y1 | 0)
    }
    ctx.fill()
    ctx.stroke()
}

function drawPolygons(polygons, palette)
{
    const { width, height } = config

    ctx.save()
    //ctx.translate(Math.round(-(width * overdraw - width ) * 0.5), Math.round(-(height * overdraw - height ) * 0.5))
    for (let i = 0; i < polygons.length; i++)
    {
        const polygon = polygons[i]
        if (polygon)
        {
            const [colorA, colorB] = randomPair(palette)
            ctx.strokeStyle = colorA
            ctx.fillStyle = Color.from(colorB).toRGBA(0.618)
            ctx.lineWidth = Math.round(Math.min(width, height) / 270)

            if (Math.random() < 0.5)
            {
                drawPolygon(polygon, palette)
            }
            else
            {
                const [x,y,r] = circumcircle(polygon)
                ctx.beginPath()
                ctx.moveTo(x + r, y)
                ctx.arc(x, y, r, 0, TAU, true)
                ctx.fill()
                ctx.stroke()
            }

        }
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

            const hw = Math.round(width * overdraw * 0.5)
            const hh = Math.round(height * overdraw * 0.5)

            const v = voronoi().extent([[cx - hw, cy - hh], [cx + hw, cy + hh]])
            const pts = relax(v, randomPoints(v), Math.pow(Math.random(),4) * 100);

            const diagram = v(pts)
            ctx.strokeStyle = "#044";

            const polygons = diagram.polygons()

            drawPolygons(polygons, palette)
        }

        paint()

        canvas.addEventListener("click", paint, true)
    }
);
