import domready from "domready"
import "./style.css"
import weightedRandom from "./weightedRandom"
import randomPalette, { randomPaletteWithBlack } from "./randomPalette"
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

const layers = weightedRandom([
    1, () => 0,
    1, () => 0,
])


class Rect {
    x
    y
    size
    constructor(x, y, size)
    {
        this.x = x
        this.y = y
        this.size = size
    }

}


function subdivide(rect, probability, probability2, min)
{
    const {x, y, size} = rect

    const newSize = size * 0.5

    if (newSize < min || (newSize < 100 && Math.random() < probability2))
    {
        return false
    }

    const out = []
    if (Math.random() < probability)
    {
        out.push(
            new Rect(
                x, y, newSize
            )
        )
    }

    if (Math.random() < probability)
    {
        out.push(
            new Rect(
                x, y + size - newSize, newSize
            )
        )
    }

    if (Math.random() < probability)
    {
        out.push(
            new Rect(
                x + size - newSize, y, newSize
            )
        )
    }

    if (Math.random() < probability)
    {
        out.push(
            new Rect(
                x + size - newSize, y + size - newSize, newSize
            )
        )
    }
    return out
}


function createRects(probability, probability2, min = 1)
{
    const { width, height } = config
    const size = Math.max(width, height)

    const cx = width >> 1
    const cy = height >> 1

    let rects = subdivide(
        new Rect(
            cx - size / 2, cy - size / 2,
            size
        ),
        probability,
        probability2,
        min
    )

    const done = []

    let newRects
    do
    {
        newRects = []
        for (let i = 0; i < rects.length; i++)
        {
            const rect = rects[i]
            const sub = subdivide(
                rect,
                probability,
                probability2,
                min
            )
            if (!sub)
            {
                done.push(rect)
            }
            else
            {
                newRects = newRects.concat(sub)
            }
        }

        rects = newRects

    } while (rects.length)

    console.log("DONE", done)
    return done
}

const white = Color.from("#fff")

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

            let bg,fg
            if (Math.random() < 0.5)
            {
                bg = palette[0]
                fg = Color.from(palette[palette.length - 1]).mix(white, 0.5).toRGBHex()
            }
            else
            {
                bg = Color.from(palette[palette.length - 1]).mix(white, 0.5).toRGBHex()
                fg = palette[0]
            }

            ctx.fillStyle = bg
            ctx.fillRect(0,0, width, height);

            const done = createRects(0.91, 0.05, 4)

            ctx.strokeStyle = fg
            for (let i = 0; i < done.length; i++)
            {
                const {x,y,size} = done[i]

                ctx.fillStyle = palette[0|Math.random() * palette.length]
                ctx.fillRect(x,y,size,size)
                ctx.strokeRect(x,y,size,size)

            }

        }

        paint()

        canvas.addEventListener("click", paint, true)
    }
);
