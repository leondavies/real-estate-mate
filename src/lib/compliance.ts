/**
 * NZ Fair Trading Act Compliance Validation
 * Validates property listing content against NZ real estate advertising requirements
 */

export interface ComplianceIssue {
  type: 'error' | 'warning' | 'info'
  category: 'false_misleading' | 'unsubstantiated' | 'pricing' | 'disclosure' | 'general'
  message: string
  suggestion?: string
  field?: string
  severity: 'high' | 'medium' | 'low'
}

export interface ComplianceResult {
  isCompliant: boolean
  issues: ComplianceIssue[]
  score: number // 0-100, 100 being fully compliant
  summary: {
    errors: number
    warnings: number
    infos: number
  }
}

// Prohibited phrases that may indicate unsubstantiated claims
const PROHIBITED_PHRASES = [
  // Superlatives without evidence
  /\b(best|perfect|amazing|stunning|incredible|unbeatable|ultimate|premier|exclusive)\b/gi,
  
  // Investment claims without evidence
  /\b(guaranteed|sure|certain|definite|proven) (return|investment|profit|gain)\b/gi,
  /\binvestment opportunity of a lifetime\b/gi,
  /\bcan't go wrong\b/gi,
  
  // Misleading urgency
  /\bmust sell\b/gi,
  /\bwon't last long\b/gi,
  /\bact fast\b/gi,
  /\bonce in a lifetime\b/gi,
  
  // Unverifiable neighborhood claims
  /\bbest (location|area|neighbourhood|street)\b/gi,
  /\bmost sought.?after\b/gi,
  /\btightly held\b/gi,
  
  // Price predictions without evidence
  /\b(prices? )?(will|going to|set to|bound to) (rise|increase|go up|double|triple)\b/gi,
  /\bcan only go up\b/gi,
  
  // False scarcity
  /\blast (one|property|house|home|unit)\b/gi,
  /\bonly one (left|available|remaining)\b/gi,
]

// Warning phrases that require substantiation
const WARNING_PHRASES = [
  // Rental yield claims
  /\b\d+(\.\d+)?%\s*(rental\s*)?(yield|return)\b/gi,
  
  // Market comparisons
  /\b(above|below|under|over)\s*market\s*(value|price)\b/gi,
  /\bgreat\s*value\b/gi,
  /\bwell\s*priced\b/gi,
  
  // Development potential claims
  /\b(development|subdivision)\s*(potential|opportunity)\b/gi,
  /\bcould be subdivided\b/gi,
  
  // School zone claims (need verification)
  /\b(zoned|in\s*zone)\s*(for|to)\s*[\w\s]*(school|college)\b/gi,
  
  // Transport claims
  /\b\d+\s*min(utes?)?\s*(walk|drive|bus|train)\s*(to|from)\b/gi,
]

// Required disclosures based on property type/features
const DISCLOSURE_REQUIREMENTS = [
  {
    trigger: /\b(leaky|weathertight|weather.?tight|monolithic|plaster)\b/gi,
    message: "Properties with weathertightness concerns must include appropriate disclosure statements"
  },
  {
    trigger: /\b(apartment|unit|body\s*corporate|owners\s*corporation)\b/gi,
    message: "Body corporate/strata properties should disclose fees and any special levies"
  },
  {
    trigger: /\b(heritage|historic|protected|character|villa|bungalow)\b/gi,
    message: "Heritage or character properties should disclose any council protections or restrictions"
  },
  {
    trigger: /\b(cross.?lease|company\s*share|licence\s*to\s*occupy)\b/gi,
    message: "Non-standard tenure types require clear explanation and disclosure"
  }
]

/**
 * Validates listing content against NZ Fair Trading Act requirements
 */
export function validateCompliance(listing: {
  address: string
  draftCopy?: string
  variantsJson?: any
  featuresJson?: string[]
  notes?: string
  cv?: number
  rv?: number
}): ComplianceResult {
  const issues: ComplianceIssue[] = []
  
  // Combine all text content for analysis
  const allText = [
    listing.draftCopy || '',
    listing.variantsJson?.standard || '',
    listing.variantsJson?.long || '',
    ...(listing.variantsJson?.headlines || []),
    ...(listing.variantsJson?.bullets || []),
    ...(listing.featuresJson || []),
    listing.notes || ''
  ].join(' ')

  // Check for prohibited phrases (high severity)
  PROHIBITED_PHRASES.forEach(pattern => {
    const matches = allText.match(pattern)
    if (matches) {
      matches.forEach(match => {
        issues.push({
          type: 'error',
          category: 'unsubstantiated',
          message: `Potentially unsubstantiated claim: "${match}"`,
          suggestion: 'Remove superlative language or provide evidence to support the claim',
          severity: 'high'
        })
      })
    }
  })

  // Check for warning phrases (medium severity)
  WARNING_PHRASES.forEach(pattern => {
    const matches = allText.match(pattern)
    if (matches) {
      matches.forEach(match => {
        issues.push({
          type: 'warning',
          category: 'unsubstantiated',
          message: `Claim requires substantiation: "${match}"`,
          suggestion: 'Ensure you have evidence to support this claim (e.g., comparable sales, official reports)',
          severity: 'medium'
        })
      })
    }
  })

  // Check disclosure requirements
  DISCLOSURE_REQUIREMENTS.forEach(req => {
    if (req.trigger.test(allText)) {
      issues.push({
        type: 'warning',
        category: 'disclosure',
        message: req.message,
        suggestion: 'Consider adding appropriate disclosure statements',
        severity: 'medium'
      })
    }
  })

  // Check for price-related issues
  if (listing.cv && listing.rv) {
    const cvRvRatio = listing.cv / listing.rv
    if (cvRvRatio > 1.5 || cvRvRatio < 0.5) {
      issues.push({
        type: 'warning',
        category: 'pricing',
        message: 'Significant difference between CV and RV values',
        suggestion: 'Ensure pricing expectations are realistic and well-supported',
        severity: 'medium'
      })
    }
  }

  // Check for overly promotional language
  const promotionalWords = allText.match(/\b(amazing|incredible|stunning|perfect|dream|paradise|luxury|executive|prestigious)\b/gi)
  if (promotionalWords && promotionalWords.length > 3) {
    issues.push({
      type: 'warning',
      category: 'general',
      message: 'High use of promotional language detected',
      suggestion: 'Consider using more factual, descriptive language to avoid potential misleading representation claims',
      severity: 'low'
    })
  }

  // Check for missing basic information
  if (!listing.draftCopy && !listing.variantsJson) {
    issues.push({
      type: 'error',
      category: 'general',
      message: 'No property description available',
      suggestion: 'Generate property description before publishing',
      severity: 'high'
    })
  }

  // Calculate compliance score
  const errorWeight = 30
  const warningWeight = 10
  const infoWeight = 2
  
  const errors = issues.filter(i => i.type === 'error').length
  const warnings = issues.filter(i => i.type === 'warning').length
  const infos = issues.filter(i => i.type === 'info').length
  
  const totalDeductions = (errors * errorWeight) + (warnings * warningWeight) + (infos * infoWeight)
  const score = Math.max(0, 100 - totalDeductions)

  return {
    isCompliant: errors === 0 && score >= 80,
    issues,
    score,
    summary: {
      errors,
      warnings,
      infos
    }
  }
}

/**
 * Get compliance suggestions for improving listing content
 */
export function getComplianceSuggestions(): string[] {
  return [
    "Use factual, descriptive language rather than promotional superlatives",
    "Support all claims with evidence (e.g., comparable sales, official reports)",
    "Verify all property information before publication",
    "Include required disclosures for property type and known issues",
    "Ensure pricing expectations are realistic and well-supported",
    "Have supervisor review all marketing materials before publication",
    "Keep records of all information sources and vendor communications",
    "Update or remove marketing materials immediately when listing status changes"
  ]
}

/**
 * Check if specific text contains compliance issues
 */
export function checkTextCompliance(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  
  PROHIBITED_PHRASES.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        issues.push({
          type: 'error',
          category: 'unsubstantiated',
          message: `Potentially unsubstantiated claim: "${match}"`,
          suggestion: 'Remove superlative language or provide evidence',
          severity: 'high'
        })
      })
    }
  })
  
  WARNING_PHRASES.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        issues.push({
          type: 'warning',
          category: 'unsubstantiated',
          message: `Claim requires substantiation: "${match}"`,
          suggestion: 'Ensure you have evidence to support this claim',
          severity: 'medium'
        })
      })
    }
  })
  
  return issues
}

/**
 * Generate compliance-friendly alternative phrases
 */
export function suggestAlternatives(problematicPhrase: string): string[] {
  const alternatives: Record<string, string[]> = {
    'amazing': ['impressive', 'notable', 'well-appointed', 'attractive'],
    'stunning': ['attractive', 'well-presented', 'appealing', 'stylish'],
    'perfect': ['suitable', 'well-suited', 'ideal for', 'appropriate'],
    'incredible': ['remarkable', 'notable', 'significant', 'impressive'],
    'best': ['excellent', 'high-quality', 'superior', 'premium'],
    'guaranteed return': ['historical returns', 'potential returns', 'indicative returns'],
    'must sell': ['vendor motivated', 'genuine sale', 'committed vendor'],
    'won\'t last long': ['expected to attract interest', 'likely to be popular'],
    'investment opportunity': ['rental potential', 'investment consideration'],
    'tightly held': ['rarely available', 'seldom offered'],
    'most sought after': ['popular', 'desirable', 'well-regarded']
  }
  
  const phrase = problematicPhrase.toLowerCase().trim()
  return alternatives[phrase] || ['Consider more factual, descriptive language']
}