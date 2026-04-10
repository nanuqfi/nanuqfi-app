import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://nanuqfi.com', lastModified: new Date() },
    { url: 'https://nanuqfi.com/strategy', lastModified: new Date() },
    { url: 'https://nanuqfi.com/app', lastModified: new Date() },
  ]
}
