import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { productUrl } = await request.json();

    if (!productUrl) {
      return Response.json({ error: "Product URL required" }, { status: 400 });
    }

    // Fetch product page
    const pageResponse = await fetch(productUrl);
    const html = await pageResponse.text();

    // Extract with Claude AI
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Extract product information from this HTML and return ONLY valid JSON:

${html.substring(0, 50000)}

Return this exact JSON format:
{
  "productName": "string",
  "productPrice": "number",
  "productDescription": "string",
  "productImage": "string (full URL)",
  "productBrand": "string",
  "productCategory": "string",
  "productUrl": "${productUrl}"
}`
      }],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    const jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const productData = JSON.parse(jsonText);

    return Response.json({
      success: true,
      product: productData
    });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({ 
      error: "Failed to extract product",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
