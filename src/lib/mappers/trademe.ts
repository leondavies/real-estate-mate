import { ListingVariants } from "@/lib/schemas"

export function mapToTradeMe(listing: any, variants: ListingVariants) {
  return {
    title: variants.headlines[0]?.slice(0, 50) || `${listing.bedrooms} bed ${listing.propertyType} in ${listing.suburb}`,
    description: variants.long || variants.standard,
    suburb: listing.suburb,
    region: listing.city,
    address: listing.address,
    property_type: mapPropertyType(listing.propertyType),
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    parking: listing.parking ?? 0,
    floor_area: listing.floorAreaM2 ?? null,
    land_area: listing.landAreaM2 ?? null,
    year_built: listing.yearBuilt ?? null,
    cv: listing.cv ?? null,
    rv: listing.rv ?? null,
    features: listing.featuresJson ?? [],
    images: listing.images?.map((img: any) => img.url) ?? [],
    bullets: variants.bullets,
    open_home_text: generateOpenHomeText(variants.standard),
    headlines: variants.headlines,
    social: variants.social,
  }
}

function mapPropertyType(type: string): string {
  const typeMap: { [key: string]: string } = {
    "house": "House",
    "apartment": "Apartment",
    "townhouse": "Townhouse",
    "unit": "Unit",
    "section": "Section/Land"
  }
  return typeMap[type] || "House"
}

function generateOpenHomeText(description: string): string {
  const openHomeLines = [
    "Don't miss this opportunity to view this exceptional property.",
    "Contact us today to arrange your private viewing.",
    "Open homes by appointment - call now to secure your inspection time.",
  ]
  
  return `${description}\n\n${openHomeLines[Math.floor(Math.random() * openHomeLines.length)]}`
}