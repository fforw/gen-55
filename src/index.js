import domready from "domready"
import "./style.css"
import weightedRandom from "./weightedRandom"
import randomPalette, { randomPaletteWithBlack } from "./randomPalette"
import Color from "./Color"
import AABB from "./AABB"


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


function drawCrown(x,y,color, ratio = 0.9, ratio2 = 0)
{
    const colorA = Color.from(color).mix(shadow, ratio2).toRGBHex();
    const colorB = Color.from(color).mix(shadow, ratio).toRGBHex();

    ctx.save()
    ctx.beginPath()

    const aabb = new AABB()

    for (let i=0; i < 800; i++)
    {
        const angle = TAU * Math.random()
        const r = 140 * Math.sqrt(Math.random())

        const size = Math.round(2 + Math.pow(Math.random(),4) * 8)
        let x2 = x + Math.cos(angle) * r
        let y2 = y + Math.sin(angle) * r

        aabb.add(x2,y2)
        
        ctx.moveTo(
            x2 + size,
            y2,
        )
        ctx.arc(x2,y2,size,0,TAU, true)
    }
    ctx.clip()

    let gradient = ctx.createLinearGradient(
        aabb.minX, aabb.minY,
        aabb.maxX, aabb.maxY
    )
    gradient.addColorStop(0,colorA)
    gradient.addColorStop(1,colorB)
    ctx.fillStyle = gradient

    ctx.fillRect(
        aabb.minX, aabb.minY,
        aabb.width, aabb.height
    )

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

            ctx.fillStyle = "#fff"
            ctx.fillRect(0,0,width,height)

            for (let i=0; i < 5; i++)
            {
                const angle = TAU * Math.random()
                const r = 150 * Math.sqrt(Math.random())

                let x2 = cx + Math.cos(angle) * r
                let y2 = cy + Math.sin(angle) * r

                drawCrown(
                    x2, y2,
                    greenA.mix(greenB, Math.random()).toRGBHex(),
                    0.9,
                    i < 2 ? 0.9 : 0.6
                )
            }


        }

        paint()

        canvas.addEventListener("click", paint, true)
    }
);
