import { NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: Request) {
  try {
    const { title } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `Create a premium gift collection banner with MANDATORY TEXT RENDERING:

CRITICAL TEXT REQUIREMENTS (MUST FOLLOW):
- EXACT TEXT TO DISPLAY: "${title}"
- Display EVERY SINGLE WORD from the title above
- Font size: EXTRA LARGE (minimum 120pt equivalent)
- Font: Bold, modern sans-serif (Montserrat Black, Poppings ExtraBold style)
- Text position: DEAD CENTER, horizontally and vertically aligned
- Text color: Pure WHITE (#FFFFFF) with thick gold stroke outline (#F4C430, 4px width)
- Add strong drop shadow (black, 50% opacity, 8px blur) for maximum contrast
- Text must occupy 80% of banner width
- Letter spacing: slightly expanded for elegance
- ALL LETTERS must be crystal clear and perfectly legible

BACKGROUND DESIGN:
- Luxurious celebration theme with wrapped gifts, gold ribbons, silk bows
- Gradient background: soft gold (#DAA520) to warm cream (#FFF8DC)
- Add floating confetti, sparkles, and bokeh light effects
- Semi-transparent dark overlay (20% opacity) behind text area for contrast
- Elegant depth with layered gift elements

STYLE & QUALITY:
- Ultra-modern, high-end aesthetic
- Professional typography with premium feel
- Celebratory yet sophisticated mood
- Landscape 16:9 format
- Sharp focus on text, subtle blur on background elements
- Color palette: gold, cream, white, soft rose accents

ABSOLUTELY CRITICAL: The complete title text "${title}" MUST be fully visible, centered, and perfectly readable as the main focal point of the banner.`

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
        image_size: "landscape_16_9",
        num_inference_steps: 50, // Maximum quality for text rendering
        guidance_scale: 5.0, // Strong adherence to prompt
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
    })

    const imageUrl = (result as any).images[0].url

    return NextResponse.json({ bannerUrl: imageUrl })
  } catch (error) {
    console.error("Error generating banner:", error)
    return NextResponse.json({ error: "Failed to generate banner" }, { status: 500 })
  }
}
