# RealEstateMate - AI-Powered Property Listing Platform

## Project Overview

RealEstateMate is a comprehensive Next.js application that automates property listing creation for New Zealand real estate agents. The platform leverages AI to generate compelling property descriptions, create professional PDF flyers, and provides multi-platform export capabilities.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with OAuth providers (Google, GitHub)
- **AI**: OpenAI GPT-4 for content generation and vision analysis
- **PDF Generation**: jsPDF with QRCode generation
- **UI Components**: Custom components built with Radix UI primitives
- **File Storage**: Direct image uploads with metadata
- **Deployment**: Development on port 3001

## Core Features Implemented

### 1. Authentication System
- **Provider**: NextAuth.js with OAuth
- **Supported Providers**: Google, GitHub
- **Session Management**: JWT-based sessions
- **Route Protection**: Middleware-based authentication
- **Files**:
  - `src/lib/auth.ts` - NextAuth configuration
  - `src/app/api/auth/[...nextauth]/route.ts` - Auth endpoints
  - `middleware.ts` - Route protection
  - `src/app/auth/signin/page.tsx` - Sign-in page

### 2. Listing Management System

#### Database Schema (Prisma)
```prisma
model Listing {
  id               String          @id @default(cuid())
  userId           String
  agencyId         String?
  status           String          @default("draft")
  address          String
  suburb           String
  city             String
  postcode         String?
  propertyType     String
  bedrooms         Int
  bathrooms        Int
  parking          Int?
  floorAreaM2      Int?
  landAreaM2       Int?
  yearBuilt        Int?
  cv               Int?            // Capital Value
  rv               Int?            // Rateable Value
  featuresJson     Json?           // Property features array
  notes            String?
  factsLockJson    Json?           // Locked property facts
  draftCopy        String?
  variantsJson     Json?           // AI-generated content variants
  schoolZonesJson  Json?           // School zone information
  images           Image[]
  exports          ExportPackage[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  user             User            @relation(fields: [userId], references: [id])
  agency           Agency?         @relation(fields: [agencyId], references: [id])
}
```

#### Listing Creation Flow
1. **Form Input**: `src/app/listings/new/page.tsx`
   - Property details (address, bedrooms, bathrooms, etc.)
   - Features selection
   - Notes and additional information
   - Validation with Zod schemas

2. **Image Management**: `src/components/listing/image-upload.tsx`
   - Drag & drop image upload
   - Image reordering with drag & drop
   - Primary image selection (order 0)
   - AI vision analysis for automatic feature detection
   - Support for JPEG, PNG, WebP (max 10MB, up to 20 images)

3. **AI Content Generation**: `src/lib/ai/generator.ts`
   - Multiple headline variations
   - Standard property descriptions
   - Social media optimized content (Facebook, Instagram, LinkedIn)
   - Bullet point features
   - Platform-specific formatting

### 3. AI Vision Analysis System

#### Feature Detection
- **API Endpoint**: `/api/listings/[id]/analyze-images`
- **Functionality**: Analyzes uploaded property images to detect features
- **AI Model**: OpenAI GPT-4 Vision
- **Output**: Array of detected features (e.g., "modern kitchen", "hardwood floors")
- **Integration**: Automatic feature suggestions during listing creation

#### Implementation Details
```typescript
// Vision analysis prompt
const prompt = `Analyze these property images and identify key features that would be valuable for a real estate listing. Focus on:
- Architectural features
- Interior design elements  
- Property condition and quality
- Unique selling points
Return a JSON array of feature strings.`
```

### 4. School Zones Integration

#### NZ Government Data Integration
- **Data Source**: data.govt.nz Schools Directory API
- **API Endpoint**: `https://catalogue.data.govt.nz/api/action/datastore_search_sql`
- **Resource ID**: `4b292323-9fcc-41f8-814b-3c7b19cf14b3`

#### Key Database Columns
```sql
"School_Id" - Unique school identifier
"Org_Name" - School name
"Org_Type" - School type (Primary, Secondary, etc.)
"Authority" - State/Private/Integrated
"Add1_Line1" - Street address
"Add1_Suburb" - Suburb
"Add1_City" - City
"EQi_Index" - Educational Quality Index (approximates decile)
"Latitude" / "Longitude" - GPS coordinates
```

#### School Zone Lookup Process
1. Query schools by city/suburb
2. Filter by school type (Primary, Intermediate, Secondary)
3. Limit results (2 primary, 1 intermediate, 2 secondary)
4. Store in `schoolZonesJson` field
5. Display as badges in listing details

#### API Implementation
```typescript
// School zones endpoint
POST /api/listings/[id]/school-zones
GET  /api/listings/[id]/school-zones

// SQL Query Example
SELECT * FROM "4b292323-9fcc-41f8-814b-3c7b19cf14b3" 
WHERE "Add1_City" ILIKE '%Auckland%' 
ORDER BY "Org_Name" ASC LIMIT 50
```

### 5. PDF Flyer Generation

#### Professional PDF Creation
- **Library**: jsPDF with QRCode
- **Features**:
  - Modern design with rounded corners and cards
  - Property image integration via base64 conversion
  - QR code linking to property listing
  - Professional typography and color scheme
  - Responsive layout with proper spacing

#### Design Specifications
```typescript
// Color Palette
const darkBlue = '#0F172A'    // slate-900
const primaryBlue = '#1E40AF'  // blue-700
const lightBlue = '#E0F2FE'    // sky-100
const accentGreen = '#059669'  // emerald-600

// Layout
- Page: A4 (210mm x 297mm)
- Margins: 20mm
- Image: Aspect ratio 16:9, full width
- Footer: Contact info + QR code
```

#### QR Code Implementation
```typescript
// QR Code generation
const listingUrl = `https://realestatemate.com/listing/${address-slug}`
const qrCodeDataUrl = await QRCode.toDataURL(listingUrl, {
  width: 60,
  margin: 1,
  color: { dark: '#000000', light: '#FFFFFF' }
})
```

### 6. Multi-Platform Export System

#### Export Formats
1. **Trade Me**: Optimized for NZ's largest property platform
2. **realestate.co.nz**: Formatted for industry standard platform  
3. **Social Media**: Platform-specific content (Facebook, Instagram, LinkedIn)
4. **Print & Email**: Clean text format for general use
5. **PDF Flyer**: Professional marketing material

#### Export Modal Implementation
- **Component**: `src/components/listing/export-modal.tsx`
- **Features**: Copy-to-clipboard, format preview, download functionality
- **API Endpoints**: Individual export endpoints for each format

### 7. Dashboard and Listing Management

#### Dashboard Features
- **Listing Overview**: Total, draft, ready, published counts
- **Listing Grid**: Property thumbnails, status badges, quick actions
- **Search and Filter**: By status, date, property type
- **Batch Operations**: Export, publish, delete multiple listings

#### Listing Detail Page
- **View Modes**: View/Edit toggle
- **Image Gallery**: Primary image display above property details
- **Property Information**: Structured data display
- **Generated Content**: AI copy with edit capabilities
- **Action Buttons**: Generate, Export, Publish, School Zones

## API Endpoints

### Authentication
```
GET  /api/auth/[...nextauth]     # NextAuth endpoints
POST /api/auth/[...nextauth]     # NextAuth callbacks
```

### Listings
```
GET    /api/listings             # Get user's listings
POST   /api/listings             # Create new listing
GET    /api/listings/[id]        # Get specific listing
PATCH  /api/listings/[id]        # Update listing
DELETE /api/listings/[id]        # Delete listing
```

### Listing Features
```
POST /api/listings/[id]/generate       # Generate AI content
POST /api/listings/[id]/analyze-images # AI image analysis
POST /api/listings/[id]/school-zones   # Fetch school zones
GET  /api/listings/[id]/school-zones   # Get cached school zones
POST /api/listings/[id]/flyer          # Generate PDF flyer
POST /api/listings/[id]/export         # Export listing content
POST /api/listings/[id]/validate       # Compliance validation
```

### Image Management
```
POST   /api/listings/[id]/images              # Upload images
DELETE /api/listings/[id]/images/[imageId]    # Delete image
POST   /api/listings/[id]/images/reorder      # Reorder images
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3001"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Services
OPENAI_API_KEY="your-openai-api-key"

# Optional: Image Storage
CLOUDINARY_URL="your-cloudinary-url"
```

## Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# View database
npx prisma studio

# Reset database
npx prisma db reset
```

## Development Workflow

### Starting Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### Code Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── listings/          # Listing pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── listing/          # Listing-specific components
└── lib/                  # Utility libraries
    ├── ai/               # AI integration
    ├── auth.ts           # Auth configuration
    ├── db.ts             # Database client
    ├── pdf/              # PDF generation
    ├── school-zones.ts   # School zone utilities
    └── schemas.ts        # Validation schemas
```

## Testing and Debugging

### Common Issues and Solutions

1. **Authentication Errors**
   - Check OAuth provider configuration
   - Verify NEXTAUTH_URL matches development URL
   - Ensure session callbacks return proper user data

2. **Database Connection**
   - Verify DATABASE_URL is correct
   - Check Supabase connection limits
   - Run `npx prisma db push` after schema changes

3. **AI API Failures**
   - Verify OPENAI_API_KEY is valid
   - Check API rate limits and billing
   - Monitor token usage for large requests

4. **PDF Generation Issues**
   - Ensure images are properly base64 encoded
   - Check jsPDF version compatibility
   - Verify QRCode library installation

5. **School Zones API**
   - Test NZ government API directly
   - Verify column names match current schema
   - Handle API rate limiting gracefully

### Performance Considerations

1. **Image Optimization**
   - Compress images before base64 conversion
   - Implement lazy loading for image galleries
   - Consider CDN for image storage

2. **Database Queries**
   - Use Prisma query optimization
   - Implement pagination for large datasets
   - Index frequently queried fields

3. **AI API Calls**
   - Cache AI responses where appropriate
   - Implement request batching
   - Use streaming for long responses

## Future Enhancements

### Pending Features
1. **Compliance Validation**: NZ Fair Trading Act compliance checking
2. **Brand Voice Customization**: Agency-specific content styling
3. **Advanced Analytics**: Usage metrics and performance tracking
4. **Mobile App**: React Native companion app
5. **Integration APIs**: CRM and MLS system connections

### Technical Debt
1. **Error Handling**: Implement comprehensive error boundaries
2. **Testing**: Add unit and integration tests
3. **Monitoring**: Add application monitoring and logging
4. **Caching**: Implement Redis for session and data caching
5. **Security**: Add rate limiting and input sanitization

## Deployment Considerations

### Production Environment
1. **Database**: PostgreSQL with connection pooling
2. **File Storage**: CDN for images and PDFs
3. **Monitoring**: Application performance monitoring
4. **Security**: SSL certificates, CSRF protection
5. **Scaling**: Load balancing and auto-scaling

### Environment Setup
```bash
# Production build
npm run build

# Start production server
npm start

# Database migrations
npx prisma migrate deploy
```

## Git Repository Structure

### Main Branch: `main`
- Production-ready code
- Comprehensive feature set
- Full documentation

### GitHub Repository
- **URL**: `https://github.com/leondavies/real-estate-mate.git`
- **Status**: All features committed and synced
- **Branches**: Single main branch with complete feature set

### Commit History
1. Initial platform implementation with core features
2. OAuth authentication integration
3. AI vision analysis and school zones
4. PDF flyer generation with QR codes
5. Image display improvements for dashboard and listings

## Support and Maintenance

### Monitoring
- Check API quotas (OpenAI, NZ Government data)
- Monitor database performance and storage
- Track user adoption and feature usage

### Updates
- Keep dependencies updated (security patches)
- Monitor Next.js and React version compatibility
- Update AI models as new versions become available

### Backup Strategy
- Database backups (daily automated)
- Code repository (GitHub)
- Environment configuration documentation
- API key and secret management

---

*Last Updated: August 22, 2025*  
*Version: 1.0.0*  
*Author: Built with Claude Code*