const SITE_URL = 'https://african-talents.socoprocaap.com'
const DEFAULT_IMAGE = `${SITE_URL}/logo.jpg`

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.setAttribute('content', content)
}

export function setPageSeo({
  title,
  description,
  path = window.location.pathname,
  image = DEFAULT_IMAGE,
  type = 'website',
  robots = 'index, follow',
}) {
  const canonicalUrl = new URL(path, SITE_URL).href
  const imageUrl = new URL(image, SITE_URL).href
  const metaDescription = description.replace(/\s+/g, ' ').trim()
  const shortDescription = metaDescription.length > 160
    ? `${metaDescription.slice(0, 157).trimEnd()}…`
    : metaDescription

  document.title = title
  setMeta('name', 'description', shortDescription)
  setMeta('name', 'robots', robots)
  setMeta('property', 'og:type', type)
  setMeta('property', 'og:site_name', 'African Talents')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', shortDescription)
  setMeta('property', 'og:url', canonicalUrl)
  setMeta('property', 'og:image', imageUrl)
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', shortDescription)
  setMeta('name', 'twitter:image', imageUrl)

  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = canonicalUrl
}

export { SITE_URL }
