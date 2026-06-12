import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://biopaternal.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/documentation', '/politique-de-confidentialite', '/login', '/signup'],
        disallow: [
          '/api/',    // API routes — no indexing
          '/app/',    // Authenticated user area
          '/admin/',  // Admin dashboard
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
