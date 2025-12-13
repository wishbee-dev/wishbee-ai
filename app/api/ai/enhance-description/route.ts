import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { description, recipientName, occasion, tone = "heartfelt" } = await req.json()

    if (!description) {
      return Response.json({ error: "Description is required" }, { status: 400 })
    }

    const toneInstructions = {
      heartfelt: "warm, emotional, and sentimental",
      casual: "friendly, relaxed, and conversational",
      professional: "polished, formal, and respectful",
      funny: "humorous, lighthearted, and playful",
    }

    const prompt = `Enhance this gift description to be more ${toneInstructions[tone as keyof typeof toneInstructions]}:

Original: "${description}"

Context:
- Recipient: ${recipientName}
- Occasion: ${occasion}

Make it compelling and encourage people to contribute. Keep it between 100-200 words.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      maxTokens: 300,
      temperature: 0.8,
    })

    return Response.json({ enhancedDescription: text })
  } catch (error) {
    console.error("[v0] Error enhancing description:", error)
    return Response.json({ error: "Failed to enhance description" }, { status: 500 })
  }
}
