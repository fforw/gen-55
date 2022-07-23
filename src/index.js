import domready from "domready"
import "./style.css"
import Color from "./Color"

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


class Pos
{
    x = 0
    y = 0
    r = 0
    angle = 0

    constructor(x,y,r,angle)
    {
        this.x = x
        this.y = y
        this.r = r
        this.angle = angle
    }
}

function drawFan(pos0, pos1, color = "#f00")
{
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(pos0.x,pos0.y);
    ctx.lineTo(
        pos0.x + Math.cos(pos0.angle) * pos0.r,
        pos0.y + Math.sin(pos0.angle) * pos0.r
    )
    ctx.lineTo(
        pos1.x + Math.cos(pos1.angle) * pos1.r,
        pos1.y + Math.sin(pos1.angle) * pos1.r
    )
    ctx.lineTo(pos1.x,pos1.y);
    ctx.lineTo(pos0.x,pos0.y);
    ctx.fill()
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

        const paint = () => {

            ctx.fillStyle = "#000";
            ctx.fillRect(0,0, width, height);

            ctx.fillStyle = "rgba(255,0,0,0.2)";

            let cx = width >> 1
            const cy = height >> 1

            const slices = 600
            const step = TAU/slices
            let angle = 0

            let pos
            let prev = null

            let first

            const s0 = 1 + Math.random() * 20
            const s1 = 1 + Math.random() * 20

            for (let i=0; i < slices; i++)
            {
                const nextAngle = angle + step

                pos = new Pos(cx + Math.cos(angle * s0) * 400 ,cy + Math.sin(angle * s0) * 400, 300 + + Math.cos(angle * s1) * 230, angle)
                if (prev)
                {
                    drawFan( prev, pos, Color.fromHSL(angle/TAU, 0.7 + Math.random() * 0.3, 0.5).toRGBA(0.5))
                }

                angle = nextAngle

                if (!prev)
                {
                    first = pos
                }
                prev = pos
            }

            drawFan( prev, first, Color.fromHSL(angle/TAU, 0.8, 0.5).toRGBA(0.2))

        }

        paint()

        canvas.addEventListener("click", paint, true)
    }
);
