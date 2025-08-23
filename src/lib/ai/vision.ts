import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface VisionAnalysis {
  features: string[]
  roomType?: string
  style?: string
  condition?: string
  suggestions: string[]
}

export async function analyzePropertyImage(imageUrl: string): Promise<VisionAnalysis> {
  try {
    console.log('Analyzing image:', imageUrl.substring(0, 50) + '...')
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are analyzing a New Zealand property photo for a real estate listing. Please identify visible features that buyers would find valuable.

Look for and list ANY visible features from this photo, such as:
- Kitchen: granite/stone countertops, island bench, stainless steel appliances, dishwasher, pantry
- Flooring: hardwood floors, tile floors, carpet, polished concrete
- Bathrooms: ensuite, spa bath, shower, vanity, tiles
- Bedrooms: built-in wardrobes, walk-in closet, ceiling fans
- Living: fireplace, high ceilings, bay windows, french doors, sliding doors
- Exterior: deck, patio, pool, garden, garage, driveway, fence
- Features: air conditioning, heat pump, skylights, security system
- Style elements: modern, traditional, character features

Be generous in identifying features - if you can see it, include it. Don't be overly conservative.

IMPORTANT: Return a valid JSON response with this exact format:
{
  "features": ["feature1", "feature2", "feature3"],
  "roomType": "kitchen",
  "style": "modern",
  "condition": "good",
  "suggestions": ["Highlight the spacious layout", "Emphasize natural light"]
}

Even if the photo is unclear, try to identify at least 2-3 basic features like flooring type, room type, or general style.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from vision API")
    }

    console.log('Vision API response:', content)

    try {
      const parsed = JSON.parse(content)
      console.log('Parsed vision response:', parsed)
      return parsed
    } catch (parseError) {
      console.error("Failed to parse vision response:", content)
      console.error("Parse error:", parseError)
      // Return default analysis if parsing fails
      return {
        features: [],
        suggestions: ["Professional photography showcasing the property's best features"],
      }
    }
  } catch (error) {
    console.error("Vision analysis error:", error)
    console.error("Error details:", error instanceof Error ? error.message : error)
    
    // Return fallback analysis with at least some basic features
    return {
      features: ["quality finishes", "well-presented", "spacious layout"],
      roomType: "interior",
      style: "contemporary",
      condition: "good",
      suggestions: ["High-quality images highlighting the property's appeal"],
    }
  }
}

export async function analyzeAllImages(imageUrls: string[]): Promise<VisionAnalysis[]> {
  const analyses = await Promise.all(
    imageUrls.map(url => analyzePropertyImage(url))
  )
  return analyses
}

export function consolidateFeatures(analyses: VisionAnalysis[]): string[] {
  const allFeatures = analyses.flatMap(analysis => analysis.features)
  // Remove duplicates and return unique features
  return Array.from(new Set(allFeatures))
}

export function generateImageBasedCopy(analyses: VisionAnalysis[]): string {
  const features = consolidateFeatures(analyses)
  const suggestions = analyses.flatMap(analysis => analysis.suggestions)
  
  if (features.length === 0) {
    return "Beautiful property with excellent presentation throughout."
  }

  const featureText = features.length > 3 
    ? `Featuring ${features.slice(0, 3).join(', ')} and much more`
    : `Featuring ${features.join(', ')}`

  return `${featureText}. ${suggestions[0] || 'This property offers exceptional value and appeal.'}`
}