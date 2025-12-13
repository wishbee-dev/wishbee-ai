import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { groupName, description } = await request.json()

    if (!groupName || typeof groupName !== "string") {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    // Create a descriptive prompt for group photo generation
    const prompt = `A warm and welcoming group photo for "${groupName}". ${description}. Professional, friendly atmosphere with diverse people smiling together. High quality, well-lit, suitable for a group profile picture.`

    console.log("[v0] Generating group image with prompt:", prompt)

    // Generate image using fal.ai Flux model
    const result = (await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("[v0] Image generation progress:", update.logs)
        }
      },
    })) as { images: Array<{ url: string }> }

    if (!result?.images?.[0]?.url) {
      throw new Error("No image generated")
    }

    const imageUrl = result.images[0].url

    console.log("[v0] Group image generated successfully")

    return NextResponse.json({
      imageUrl,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error generating group image:", error)
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
