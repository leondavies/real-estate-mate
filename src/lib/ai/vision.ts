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
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this property/real estate photo and extract:

1. FEATURES: Specific features visible (e.g., "granite countertops", "hardwood floors", "stainless steel appliances", "built-in wardrobes", "ensuite bathroom", "walk-in closet", "deck", "pool", "garden", "fireplace", "air conditioning", "ceiling fans", "skylights", "bay windows", "french doors", "tile floors", "carpet", "dishwasher", "island bench", "double garage")

2. ROOM TYPE: What room/area this is (kitchen, living room, bedroom, bathroom, exterior, garden, etc.)

3. STYLE: Architectural/design style if apparent (modern, traditional, contemporary, colonial, etc.)

4. CONDITION: Overall condition visible (excellent, good, needs updating, etc.)

5. SUGGESTIONS: Marketing copy suggestions based on what you see

Focus on features that New Zealand property buyers care about. Be specific and accurate - only mention what you can clearly see.

Respond in JSON format:
{
  "features": ["feature1", "feature2"],
  "roomType": "kitchen",
  "style": "modern",
  "condition": "excellent", 
  "suggestions": ["Marketing suggestion 1", "Marketing suggestion 2"]
}`
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

    try {
      return JSON.parse(content)
    } catch (parseError) {
      console.error("Failed to parse vision response:", content)
      // Return default analysis if parsing fails
      return {
        features: [],
        suggestions: ["Professional photography showcasing the property's best features"],
      }
    }
  } catch (error) {
    console.error("Vision analysis error:", error)
    // Return fallback analysis
    return {
      features: [],
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
  return [...new Set(allFeatures)]
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