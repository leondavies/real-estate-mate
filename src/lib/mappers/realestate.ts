import { ListingVariants } from "@/lib/schemas"

export function mapToRealEstate(listing: any, variants: ListingVariants) {
  return {
    headline: variants.headlines[0]?.slice(0, 80) || "",
    description: variants.long.slice(0, 4000),
    address: listing.address,
    suburb: listing.suburb,
    city: listing.city,
    postcode: listing.postcode,
    property_type: mapPropertyTypeRE(listing.propertyType),
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    car_spaces: listing.parking ?? 0,
    floor_area_sqm: listing.floorAreaM2 ?? null,
    land_area_sqm: listing.landAreaM2 ?? null,
    year_built: listing.yearBuilt ?? null,
    capital_value: listing.cv ?? null,
    rateable_value: listing.rv ?? null,
    property_features: listing.featuresJson ?? [],
    images: listing.images?.map((img: any, index: number) => ({
      url: img.url,
      caption: img.metaJson?.caption || `Property image ${index + 1}`,
      order: img.order || index,
    })) ?? [],
    key_features: variants.bullets,
    marketing_statement: variants.standard,
    social_content: variants.social,
  }
}

function mapPropertyTypeRE(type: string): string {
  const typeMap: { [key: string]: string } = {
    "house": "Residential House",
    "apartment": "Apartment",
    "townhouse": "Townhouse",
    "unit": "Unit",
    "section": "Section"
  }
  return typeMap[type] || "Residential House"
}