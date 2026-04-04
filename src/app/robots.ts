import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/goals/', '/mission/', '/weekly/', '/settings/'],
    },
    sitemap: 'https://life-planner-five-pi.vercel.app/sitemap.xml',
  }
}
