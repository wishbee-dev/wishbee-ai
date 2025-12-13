import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

// Trusted e-commerce domains for price comparison
const TRUSTED_DOMAINS = [
  "amazon.com",
  "walmart.com",
  "target.com",
  "bestbuy.com",
  "homedepot.com",
  "lowes.com",
  "macys.com",
  "nordstrom.com",
  "wayfair.com",
  "ebay.com",
  "costco.com",
  "samsclub.com",
  "etsy.com",
  "shopify.com",
  "nike.com",
  "adidas.com",
  "zappos.com",
  "sephora.com",
  "ulta.com",
  "chewy.com",
  "staples.com",
  "officedepot.com",
  "bhphotovideo.com",
  "newegg.com",
  "kohls.com",
  "jcpenney.com",
  "overstock.com",
  "walgreens.com",
  "cvs.com",
  "riteaid.com",
]

export async function POST(request: NextRequest) {
  try {
    const { productName, currentPrice, currentStore, productLink } = await request.json()

    console.log("[v0] Comparing prices for:", productName, "at $", currentPrice)

    // Use AI to search for better prices from trusted retailers
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a price comparison assistant. Find the best price for this product from TRUSTED retailers only.

Product: ${productName}
Current Price: $${currentPrice}
Current Store: ${currentStore}
Product Link: ${productLink}

TRUSTED RETAILERS: ${TRUSTED_DOMAINS.join(", ")}

Search for this product and return ONLY prices from the trusted retailers list above. Ignore any suspicious, unknown, or scam websites.

Return your findings in this exact JSON format:
{
  "hasBetterPrice": true/false,
  "bestPrice": price as number or null,
  "bestStore": "Store Name" or null,
  "bestStoreLink": "https://..." or null,
  "savings": amount saved as number or null,
  "trustScore": 1-10 rating of the recommended store's trustworthiness,
  "note": "Brief explanation of the price comparison"
}

If no better price is found from trusted retailers, set hasBetterPrice to false and explain why in the note.`,
      maxTokens: 1000,
    })

    console.log("[v0] AI price comparison response:", text)

    // Parse AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid AI response format")
    }

    const priceComparison = JSON.parse(jsonMatch[0])

    // Verify the store is actually in our trusted list
    if (priceComparison.hasBetterPrice && priceComparison.bestStoreLink) {
      const domain = new URL(priceComparison.bestStoreLink).hostname.replace("www.", "")
      const isTrusted = TRUSTED_DOMAINS.some((trusted) => domain.includes(trusted))

      if (!isTrusted) {
        console.warn("[v0] AI suggested untrusted domain:", domain)
        priceComparison.hasBetterPrice = false
        priceComparison.note = "No better prices found from verified trusted retailers."
      }
    }

    return NextResponse.json(priceComparison)
  } catch (error) {
    console.error("[v0] Price comparison error:", error)
    return NextResponse.json(
      {
        hasBetterPrice: false,
        note: "Unable to compare prices at this time. Please check manually.",
      },
      { status: 200 },
    )
  }
}
