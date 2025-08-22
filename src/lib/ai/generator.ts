import { Facts, ListingVariants } from "@/lib/schemas"

export async function generateListingCopy(facts: Facts): Promise<ListingVariants> {
  const systemPrompt = `You are a New Zealand real estate copywriter.
Rules:
- Only use details from provided FACTS. Do NOT invent details.
- Comply with NZ Fair Trading Act - never make unsupported claims.
- Use NZ English spelling and terminology.
- Tone: Professional yet engaging.
- Provide: Long (250-400w), Standard (150-220w), Bullets (8-12), Headlines (4-6 variants).
- Include optional social media variants.

Return valid JSON with keys: long, standard, bullets[], headlines[], social{instagram, facebook, linkedin}.`

  const userPrompt = `Generate copy for the listing using the above rules.

FACTS:
${JSON.stringify(facts, null, 2)}

Return JSON only.`

  try {
    // This is a placeholder - you'll need to implement the actual AI provider
    const response = await callAIProvider(systemPrompt, userPrompt, facts)
    return JSON.parse(response)
  } catch (error) {
    console.error("Error generating listing copy:", error)
    throw new Error("Failed to generate listing copy")
  }
}

async function callAIProvider(system: string, prompt: string, facts: Facts): Promise<string> {
  // Placeholder implementation - replace with actual AI provider
  // This could be OpenAI, Anthropic Claude, or any other provider
  
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("Calling OpenAI API...")
      // OpenAI implementation
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      })
      
      if (!response.ok) {
        console.log("OpenAI API error:", response.status, response.statusText)
        throw new Error(`OpenAI API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("OpenAI response:", data)
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.log("Invalid OpenAI response structure")
        throw new Error("Invalid OpenAI response")
      }
      
      return data.choices[0].message.content || ""
    } catch (error) {
      console.log("OpenAI API failed, falling back to mock:", error)
      // Fall through to mock response
    }
  } else {
    console.log("No OpenAI API key, using mock response")
  }
  
  // Fallback mock response for development
  const suburb = facts.suburb || "this area"
  const city = facts.city || "the city"
  const bedrooms = facts.bedrooms || 3
  const bathrooms = facts.bathrooms || 1
  const propertyType = facts.propertyType || "home"
  
  return JSON.stringify({
    long: `This exceptional ${propertyType} offers comfortable living in the heart of ${suburb}. With ${bedrooms} bedrooms and ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}, this property provides excellent accommodation for families. Located in ${city}, you'll enjoy convenient access to local amenities, schools, and transport links. The property features quality fixtures and fittings throughout, making it an ideal choice for those seeking a comfortable lifestyle in a desirable location.`,
    
    standard: `Quality ${bedrooms} bedroom ${propertyType} in ${suburb}. Features ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}${facts.parking ? ` and ${facts.parking} car space${facts.parking > 1 ? 's' : ''}` : ''}. Perfect for families seeking comfortable living in ${city}.`,
    
    bullets: [
      `${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}`,
      `${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}`,
      ...(facts.parking ? [`${facts.parking} car space${facts.parking > 1 ? 's' : ''}`] : []),
      ...(facts.floorAreaM2 ? [`${facts.floorAreaM2}m² floor area`] : []),
      ...(facts.landAreaM2 ? [`${facts.landAreaM2}m² section`] : []),
      ...(facts.features && facts.features.length > 0 ? facts.features.slice(0, 3) : []),
      `Prime ${suburb} location`,
      `Close to amenities`
    ].filter(Boolean),
    
    headlines: [
      `Family Living in ${suburb}`,
      `${bedrooms} Bed ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} - ${suburb}`,
      `Quality Home, Prime Location`,
      `Your ${suburb} Sanctuary Awaits`,
      `Comfortable ${city} Living`,
      `${suburb} Gem - Must View!`
    ],
    
    social: {
      instagram: `🏡 Just listed! Beautiful ${bedrooms} bed ${propertyType} in ${suburb} #${city.replace(/\s+/g, '')}RealEstate #PropertyNZ #RealEstate`,
      facebook: `🏠 New listing alert! This gorgeous ${bedrooms} bedroom ${propertyType} in ${suburb} won't last long. Perfect for families looking for quality living in ${city}. Contact us for a viewing today!`,
      linkedin: `Professional opportunity: Quality ${bedrooms} bedroom ${propertyType} now available in ${suburb}, ${city}. Excellent investment or family home prospect.`
    }
  })
}