import { ValidationResult } from "@/lib/schemas"

export async function validateDraft(facts: any, draft: string): Promise<ValidationResult> {
  const systemPrompt = `You are a New Zealand real estate compliance validator.
Analyze the draft copy against the provided facts and identify:
1. Unsupported claims (anything not backed by facts)
2. Risky phrases that could violate Fair Trading Act
3. Suggestions for improvement

Return valid JSON with keys: unsupported[], risky_phrases[], suggestions[], compliance_score (0-100).`

  const userPrompt = `Validate this draft copy against the facts.

FACTS:
${JSON.stringify(facts, null, 2)}

DRAFT:
${draft}

Return JSON only.`

  try {
    const response = await callValidationProvider(systemPrompt, userPrompt)
    return JSON.parse(response)
  } catch (error) {
    console.error("Error validating draft:", error)
    
    // Fallback validation logic
    return performBasicValidation(facts, draft)
  }
}

async function callValidationProvider(system: string, prompt: string): Promise<string> {
  if (process.env.OPENAI_API_KEY) {
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
        temperature: 0.1,
        max_tokens: 800,
      }),
    })
    
    const data = await response.json()
    return data.choices[0]?.message?.content || ""
  }
  
  // Fallback to basic validation
  throw new Error("No AI provider available")
}

function performBasicValidation(facts: any, draft: string): ValidationResult {
  const unsupported: string[] = []
  const risky_phrases: string[] = []
  const suggestions: string[] = []
  
  // Basic fact checking
  const factBedrooms = facts.bedrooms?.toString()
  const factBathrooms = facts.bathrooms?.toString()
  
  // Check for common unsupported claims
  const commonClaims = [
    "stunning", "beautiful", "perfect", "ideal", "amazing", 
    "fantastic", "excellent", "outstanding", "magnificent",
    "double glazing", "heat pump", "alarm", "dishwasher"
  ]
  
  commonClaims.forEach(claim => {
    if (draft.toLowerCase().includes(claim.toLowerCase()) && 
        !(facts.features && facts.features.some((f: string) => f.toLowerCase().includes(claim.toLowerCase())))) {
      if (["stunning", "beautiful", "perfect", "ideal", "amazing"].includes(claim)) {
        risky_phrases.push(`Subjective claim: "${claim}"`)
      } else {
        unsupported.push(`"${claim}" not listed in property features`)
      }
    }
  })
  
  // Check bedroom/bathroom counts
  if (factBedrooms && !draft.includes(factBedrooms)) {
    suggestions.push("Ensure bedroom count matches the facts")
  }
  
  if (factBathrooms && !draft.includes(factBathrooms)) {
    suggestions.push("Ensure bathroom count matches the facts")
  }
  
  // Calculate basic compliance score
  let score = 100
  score -= unsupported.length * 15
  score -= risky_phrases.length * 10
  score = Math.max(score, 0)
  
  return {
    unsupported,
    risky_phrases,
    suggestions,
    compliance_score: score
  }
}