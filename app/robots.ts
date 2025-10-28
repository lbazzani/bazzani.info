import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bazzani.info'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/profile'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
