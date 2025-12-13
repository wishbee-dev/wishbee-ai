import { generateText } from "ai"
import { NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const isUrl = url.startsWith("http://") || url.startsWith("https://")

    if (!isUrl) {
      console.log("[v0] Input is a gift idea, extracting product details")

      const giftIdeaPrompt = `You are a product research assistant. A user wants: "${url}"

Based on this gift idea, research and provide detailed product information. Return ONLY a JSON object:

{
  "productName": "specific best-selling product name that matches (e.g., 'Nike Air Max 270 Running Shoes' for 'nike shoe')",
  "price": competitive market price in USD (numeric value),
  "description": "Detailed product description with key features and specifications (4-6 sentences)",
  "storeName": "popular retailer (Amazon, Nike.com, Target, Best Buy, etc.)",
  "category": "ONE of: Electronics, Clothing, Home & Kitchen, Beauty, Sports, Toys, Books, or General",
  "imageUrl": null,
  "productLink": null,
  "stockStatus": "In Stock",
  "attributes": {}
}

Research the best-selling, highest-rated product in this category at competitive pricing from trusted stores.
Return ONLY valid JSON, no markdown, no explanation.`

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: giftIdeaPrompt,
        maxTokens: 1500,
      })

      console.log("[v0] AI gift idea response:", text)

      let cleanedText = text.trim()
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

      const jsonStart = cleanedText.indexOf("{")
      const jsonEnd = cleanedText.lastIndexOf("}")

      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedText = cleanedText.slice(jsonStart, jsonEnd + 1)
      }

      const productData = JSON.parse(cleanedText)
      productData.notice =
        "Product details generated from your gift idea. You can refine by pasting a specific product URL."
      productData.isFromGiftIdea = true

      return NextResponse.json({
        productName: productData.productName,
        price: productData.price,
        description: productData.description,
        storeName: productData.storeName,
        category: productData.category,
        imageUrl: productData.imageUrl,
        productLink: productData.productLink,
        stockStatus: productData.stockStatus,
        attributes: productData.attributes || {},
        notice: productData.notice,
      })
    }

    console.log("[v0] Extracting product from URL:", url)

    const urlObj = new URL(url)
    const storeName = urlObj.hostname.replace("www.", "").split(".")[0]
    const storeNameCapitalized = storeName.charAt(0).toUpperCase() + storeName.slice(1)

    let pageContent = ""
    const imageUrls: string[] = []
    let fetchSucceeded = false

    const timeoutMs = 8000

    if (url.includes("dsw.com/product/")) {
      const dswImageUrl = constructDSWImageUrl(url)
      if (dswImageUrl) {
        console.log("[v0] ✅ Constructed DSW image URL:", dswImageUrl)
        imageUrls.push(dswImageUrl)
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const fetchPromise = fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Cache-Control": "max-age=0",
          Referer: urlObj.origin,
        },
      }).catch((err) => {
        console.log("[v0] Fetch failed:", err.message)
        return null
      })

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => {
          console.log("[v0] Request timeout")
          resolve(null)
        }, timeoutMs),
      )

      const response = await Promise.race([fetchPromise, timeoutPromise])

      clearTimeout(timeoutId)

      if (!response) {
        console.log("[v0] Site blocks scraping or timeout - using URL-based extraction")
        fetchSucceeded = false
      } else if (response.status === 403) {
        console.log("[v0] Site blocks scraping (403) - using URL-based extraction")
        fetchSucceeded = false
      } else if (!response.ok) {
        console.log(`[v0] Site returned ${response.status} - using URL-based extraction`)
        fetchSucceeded = false
      } else {
        fetchSucceeded = true
        const html = await response.text()

        const ogImageRegex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi
        let match
        while ((match = ogImageRegex.exec(html)) !== null) {
          const imgUrl = match[1]
          if (imgUrl && imgUrl.match(/\.(jpg|jpeg|png|webp)/i)) {
            const fullUrl = imgUrl.startsWith("http") ? imgUrl : new URL(imgUrl, url).href
            if (!imageUrls.includes(fullUrl)) {
              imageUrls.push(fullUrl)
            }
          }
        }

        const twitterImageRegex = /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/gi
        while ((match = twitterImageRegex.exec(html)) !== null) {
          const imgUrl = match[1]
          if (imgUrl && imgUrl.match(/\.(jpg|jpeg|png|webp)/i)) {
            const fullUrl = imgUrl.startsWith("http") ? imgUrl : new URL(imgUrl, url).href
            if (!imageUrls.includes(fullUrl)) {
              imageUrls.push(fullUrl)
            }
          }
        }

        const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi
        while ((match = jsonLdRegex.exec(html)) !== null) {
          try {
            const jsonData = JSON.parse(match[1])
            const extractImageFromJsonLd = (obj: any): string | null => {
              if (obj.image) {
                const imgUrl = Array.isArray(obj.image) ? obj.image[0] : obj.image
                if (typeof imgUrl === "string") return imgUrl
                if (typeof imgUrl === "object" && imgUrl.url) return imgUrl.url
              }
              return null
            }

            let imgUrl = extractImageFromJsonLd(jsonData)
            if (!imgUrl && Array.isArray(jsonData)) {
              for (const item of jsonData) {
                imgUrl = extractImageFromJsonLd(item)
                if (imgUrl) break
              }
            }

            if (imgUrl && imgUrl.match(/\.(jpg|jpeg|png|webp)/i)) {
              const fullUrl = imgUrl.startsWith("http") ? imgUrl : new URL(imgUrl, url).href
              if (!imageUrls.includes(fullUrl)) {
                imageUrls.push(fullUrl)
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }

        console.log("[v0] Found image URLs from meta tags:", imageUrls)

        const jsDataRegex =
          /(?:window\.__INITIAL_STATE__|__PRELOADED_STATE__|productData|product_data)\s*=\s*({[^;]+});/gi
        while ((match = jsDataRegex.exec(html)) !== null) {
          try {
            const jsonStr = match[1]
            const jsonData = JSON.parse(jsonStr)

            const findImages = (obj: any): string[] => {
              const images: string[] = []
              if (typeof obj === "string" && obj.match(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|webp)/i)) {
                images.push(obj)
              } else if (typeof obj === "object" && obj !== null) {
                for (const key of Object.keys(obj)) {
                  if (
                    key.toLowerCase().includes("image") ||
                    key.toLowerCase().includes("photo") ||
                    key.toLowerCase().includes("picture")
                  ) {
                    const val = obj[key]
                    if (typeof val === "string" && val.match(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|webp)/i)) {
                      images.push(val)
                    } else if (Array.isArray(val)) {
                      val.forEach((item) => {
                        if (typeof item === "string" && item.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp)/i)) {
                          images.push(item)
                        } else if (typeof item === "object" && item !== null && item.url) {
                          images.push(item.url)
                        }
                      })
                    }
                  }
                  images.push(...findImages(obj[key]))
                }
              }
              return images
            }

            const foundImages = findImages(jsonData)
            foundImages.forEach((img) => {
              if (!imageUrls.includes(img) && !img.includes("sprite") && !img.includes("placeholder")) {
                imageUrls.push(img)
              }
            })
          } catch (e) {
            // Skip invalid JSON
          }
        }

        const dataAttrRegex = /<[^>]+data-[^>]*(?:image|img|photo|picture)[^>]*=["']([^"']+)["']/gi
        while ((match = dataAttrRegex.exec(html)) !== null) {
          const imgUrl = match[1]
          if (imgUrl.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp)/i)) {
            if (!imageUrls.includes(imgUrl) && !imgUrl.includes("sprite") && !imgUrl.includes("placeholder")) {
              imageUrls.push(imgUrl)
            }
          }
        }

        const imgRegex = /<img[^>]+src="([^">]+)"/gi
        while ((match = imgRegex.exec(html)) !== null) {
          let imgUrl = match[1]

          if (
            imgUrl.includes("sprite") ||
            imgUrl.includes("nav-") ||
            imgUrl.includes("logo") ||
            imgUrl.includes("icon") ||
            imgUrl.includes("arrow") ||
            imgUrl.includes("button") ||
            imgUrl.includes("fashion-store") ||
            imgUrl.includes("banner") ||
            imgUrl.includes("header") ||
            imgUrl.includes("footer") ||
            imgUrl.includes("thumbnail-placeholder") ||
            imgUrl.match(/\.(svg|gif)$/i) ||
            imgUrl.includes("blank.gif") ||
            imgUrl.includes("pixel.gif") ||
            imgUrl.includes("spacer") ||
            imgUrl.includes("lazy") ||
            imgUrl.includes("placeholder") ||
            imgUrl.length < 20
          ) {
            continue
          }

          if (
            imgUrl.includes("media-amazon.com/images/I/") ||
            imgUrl.includes("product") ||
            imgUrl.includes("item") ||
            imgUrl.includes("catalog") ||
            imgUrl.includes("merchandise") ||
            imgUrl.includes("goods") ||
            imgUrl.includes("cloudfront") ||
            imgUrl.includes("cdn") ||
            imgUrl.includes("assets") ||
            imgUrl.match(/\/images\/[^/]+\.(jpg|jpeg|png|webp)/i)
          ) {
            if (imgUrl.includes("media-amazon.com/images/I/")) {
              imgUrl = imgUrl.replace(/\._AC_[A-Z]{2}\d+_\./g, ".")
              imgUrl = imgUrl.replace(/\._[A-Z]{2}\d+_\./g, ".")
            }

            const fullUrl = imgUrl.startsWith("http") ? imgUrl : new URL(imgUrl, url).href
            if (!imageUrls.includes(fullUrl) && fullUrl.match(/\.(jpg|jpeg|png|webp)/i)) {
              imageUrls.push(fullUrl)
            }
          }
        }

        const dataSrcRegex = /<img[^>]+data-src="([^">]+)"/gi
        while ((match = dataSrcRegex.exec(html)) !== null) {
          let imgUrl = match[1]
          if (
            !imgUrl.includes("sprite") &&
            !imgUrl.includes("nav-") &&
            !imgUrl.includes("placeholder") &&
            imgUrl.match(/\.(jpg|jpeg|png|webp)/i)
          ) {
            if (imgUrl.includes("media-amazon.com/images/I/")) {
              imgUrl = imgUrl.replace(/\._AC_[A-Z]{2}\d+_\./g, ".")
              imgUrl = imgUrl.replace(/\._[A-Z]{2}\d+_\./g, ".")
            }
            const fullUrl = imgUrl.startsWith("http") ? imgUrl : new URL(imgUrl, url).href
            if (!imageUrls.includes(fullUrl)) {
              imageUrls.push(fullUrl)
            }
          }
        }

        const srcsetRegex = /<img[^>]+srcset="([^">]+)"/gi
        while ((match = srcsetRegex.exec(html)) !== null) {
          const srcset = match[1]
          const urls = srcset.split(",").map((s) => s.trim().split(" ")[0])
          const largestUrl = urls[urls.length - 1]
          if (
            largestUrl &&
            !largestUrl.includes("sprite") &&
            !largestUrl.includes("placeholder") &&
            largestUrl.match(/\.(jpg|jpeg|png|webp)/i)
          ) {
            const fullUrl = largestUrl.startsWith("http") ? largestUrl : new URL(largestUrl, url).href
            if (!imageUrls.includes(fullUrl)) {
              imageUrls.push(fullUrl)
            }
          }
        }

        console.log("[v0] Found image URLs:", imageUrls.slice(0, 5))

        const textContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000)

        pageContent = textContent
      }
    } catch (fetchError) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : "unknown"
      if (errorMsg !== "timeout") {
        console.log("[v0] Fetch not possible - using URL-based extraction")
      } else {
        console.log("[v0] Request timeout - using URL-based extraction")
      }
      fetchSucceeded = false
    }

    const bestImageUrl = imageUrls.length > 0 ? imageUrls[0] : null

    console.log("[v0] Best image URL selected:", bestImageUrl)

    const prompt =
      fetchSucceeded && pageContent
        ? `Extract complete product information from this webpage. Return ONLY a JSON object with these exact fields:

Webpage URL: ${url}
${bestImageUrl ? `Product Image URL (USE THIS EXACTLY): ${bestImageUrl}` : ""}
Webpage Content: ${pageContent}

Extract ALL available information:
{
  "productName": "exact product title from the page",
  "price": numeric price value only (e.g., 299.99),
  "description": "COMPLETE detailed product description including ALL key features, specifications, materials, dimensions, and benefits from the webpage (minimum 4-6 sentences with full details)",
  "storeName": "store/retailer name (e.g., Amazon, Target, DSW, etc.)",
  "category": "ONE of: Electronics, Clothing, Home & Kitchen, Beauty, Sports, Toys, Books, or General (determine from product type)",
  "imageUrl": "${bestImageUrl || "null"}",
  "productLink": "${url}",
  "stockStatus": "In Stock" or "Low Stock" or "Out of Stock",
  "attributes": {}
}

CRITICAL RULES:
- Extract the COMPLETE product description with ALL details available on the page
- Determine the most appropriate category from the product type
- For imageUrl, copy EXACTLY this URL without ANY modifications: ${bestImageUrl || "null"}
- Do NOT truncate the description - include all important product information
- Return ONLY valid JSON, no markdown, no explanation, no other text`
        : `The website is blocking automated access. Based on this product URL, analyze the URL path and generate realistic product information. Return ONLY a JSON object:

URL: ${url}
Store: ${storeNameCapitalized}

Analyze the URL carefully to infer:
{
  "productName": "product name inferred from URL path and parameters",
  "price": null,
  "description": "Realistic product description based on what the URL suggests. Since we cannot access the page, we've inferred this from the URL. Please verify details on ${storeNameCapitalized}'s website.",
  "storeName": "${storeNameCapitalized}",
  "category": "General",
  "imageUrl": null,
  "productLink": "${url}",
  "stockStatus": "Unknown - Check store website",
  "attributes": {},
  "notice": "This site blocks automated access. Product details are inferred from the URL. Please verify all information including color, size, and specifications by visiting the store directly."
}

Return ONLY valid JSON, no other text.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      maxTokens: 2000,
    })

    console.log("[v0] AI response:", text)

    let cleanedText = text.trim()
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    const jsonStart = cleanedText.indexOf("{")
    const jsonEnd = cleanedText.lastIndexOf("}")

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedText = cleanedText.slice(jsonStart, jsonEnd + 1)
    }

    const productData = JSON.parse(cleanedText)

    if (!productData.imageUrl || productData.imageUrl === "null" || productData.imageUrl === null) {
      console.log("[v0] No product image found - user can upload manually or use URL")
      productData.imageUrl = null
      productData.productUrlForImageExtraction = url
      if (!productData.notice) {
        productData.notice =
          "Product image could not be extracted automatically. You can paste an image URL or upload an image manually."
      }
    }

    if (!productData.attributes) {
      productData.attributes = {}
    }

    if (!productData.category) {
      productData.category = "General"
    }

    console.log("[v0] Extracted product:", productData)

    return NextResponse.json(productData)
  } catch (error) {
    console.error("[v0] Error extracting product:", error)
    return NextResponse.json(
      {
        error: "Failed to extract product information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function constructDSWImageUrl(productUrl: string): string | null {
  try {
    const url = new URL(productUrl)

    const pathParts = url.pathname.split("/")
    const productId = pathParts[pathParts.length - 1]

    const colorCode = url.searchParams.get("activeColor")

    if (productId && colorCode) {
      const imageUrl = `https://images.dsw.com/is/image/DSWShoes/${productId}_${colorCode}_ss_01?impolicy=qlt-medium-high&imwidth=640&imdensity=2`
      return imageUrl
    }

    return null
  } catch (error) {
    console.log("[v0] Failed to construct DSW image URL:", error)
    return null
  }
}
