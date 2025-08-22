import { z } from "zod"

export const FactsSchema = z.object({
  address: z.string().min(3),
  suburb: z.string().min(2),
  city: z.string().min(2),
  postcode: z.string().optional(),
  propertyType: z.enum(["house", "apartment", "townhouse", "unit", "section"]),
  bedrooms: z.number().int().min(0).max(15),
  bathrooms: z.number().int().min(0).max(10),
  parking: z.number().int().min(0).max(10).optional(),
  floorAreaM2: z.number().int().positive().optional(),
  landAreaM2: z.number().int().positive().optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1850)
    .max(new Date().getFullYear())
    .optional(),
  cv: z.number().int().positive().optional(),
  rv: z.number().int().positive().optional(),
  features: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
})

export const ListingVariantsSchema = z.object({
  long: z.string(),
  standard: z.string(),
  bullets: z.array(z.string()),
  headlines: z.array(z.string()),
  social: z
    .object({
      instagram: z.string(),
      facebook: z.string(),
      linkedin: z.string(),
    })
    .optional(),
})

export const ValidationResultSchema = z.object({
  unsupported: z.array(z.string()),
  risky_phrases: z.array(z.string()),
  suggestions: z.array(z.string()),
  compliance_score: z.number().min(0).max(100),
})

export const BrandVoiceSchema = z.object({
  name: z.string().min(1),
  tone: z.enum([
    "professional",
    "friendly",
    "luxury",
    "casual",
    "energetic",
    "trustworthy",
  ]),
  guidelines: z.string().min(10),
  examples: z.string().optional(),
})

export const ImageMetaSchema = z.object({
  caption: z.string().optional(),
  features: z.array(z.string()).optional(),
  rooms: z.array(z.string()).optional(),
  approved: z.boolean().default(false),
})

export const ExportFormatSchema = z.enum([
  "trademe",
  "realestate",
  "social",
  "flyer",
  "json",
])

export const SubscriptionPlanSchema = z.enum([
  "starter",
  "pro",
  "agency",
])

export const UserRoleSchema = z.enum([
  "user",
  "agent",
  "manager",
  "admin",
])

export type Facts = z.infer<typeof FactsSchema>
export type ListingVariants = z.infer<typeof ListingVariantsSchema>
export type ValidationResult = z.infer<typeof ValidationResultSchema>
export type BrandVoice = z.infer<typeof BrandVoiceSchema>
export type ImageMeta = z.infer<typeof ImageMetaSchema>
export type ExportFormat = z.infer<typeof ExportFormatSchema>
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>
export type UserRole = z.infer<typeof UserRoleSchema>