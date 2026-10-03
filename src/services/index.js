import { categories as fallbackCategories } from '../data/categories.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8009/api/v1'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `Erreur API (${response.status})`)
  }

  if (response.status === 204) return null
  return response.json()
}

async function getList(path) {
  const data = await request(path)
  return Array.isArray(data) ? data : data?.results || []
}

function categoryImage(slug) {
  return fallbackCategories.find(category => category.id === slug)?.img || ''
}

function mapCategory(category) {
  return {
    id: category.slug,
    label: category.name,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    img: category.image?.url || categoryImage(category.slug),
  }
}

function mapCandidate(candidate) {
  const number = Number(candidate.code?.match(/\d+$/)?.[0] || 0)
  const name = candidate.display_name || [candidate.first_name, candidate.last_name].filter(Boolean).join(' ')
  const categoryName = candidate.category?.name || candidate.category_name || ''
  return {
    id: String(candidate.id),
    slug: candidate.slug,
    number: number || candidate.code,
    code: candidate.code,
    name,
    category: candidate.category?.slug || candidate.category,
    categoryName,
    tagline: [candidate.city, candidate.country].filter(Boolean).join(' · ') || candidate.bio || '',
    photo: candidate.photo?.url || null,
    active: true,
    votes: candidate.votes_total || 0,
    bio: candidate.bio || '',
    city: candidate.city || '',
    country: candidate.country || '',
    gallery: (candidate.gallery || []).map(image => image.url).filter(Boolean),
    facebook_url: candidate.facebook_url || '',
    instagram_url: candidate.instagram_url || '',
    tiktok_url: candidate.tiktok_url || '',
    rank: candidate.rank,
  }
}

function mapNews(article) {
  const publishedAt = article.published_at ? new Date(article.published_at) : null
  return {
    id: article.slug,
    slug: article.slug,
    date: publishedAt ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(publishedAt) : '',
    title: article.title,
    img: article.main_image?.url || '',
    excerpt: article.excerpt || '',
    content: article.content_html || '',
    gallery: [],
  }
}

export const competitionService = {
  async getStatus() {
    const current = await request('/public/competition/')
    if (!current) return { status: 'upcoming', endsAt: 0, votePrice: 0, currency: 'FCFA' }
    let status = 'closed'
    if (current.status === 'ENDED') status = 'ended'
    else if (current.status === 'SCHEDULED' || current.status === 'DRAFT') status = 'upcoming'
    else if (current.votes_open) status = 'open'
    return {
      id: current.id,
      status,
      endsAt: current.end_date ? new Date(current.end_date).getTime() : 0,
      votePrice: 0,
      currency: 'FCFA',
      phases: current.phases || [],
    }
  },
}

export const categoryService = {
  async getCategories() {
    return (await getList('/public/categories/')).map(mapCategory)
  },
}

export const candidateService = {
  async getCandidates() {
    return (await getList('/public/candidates/?page_size=100')).map(mapCandidate)
  },
  async getCandidate(slug) {
    const candidate = await request(`/public/candidates/${encodeURIComponent(slug)}/`)
    return mapCandidate(candidate)
  },
}

export const contentService = {
  async getNews() {
    return (await getList('/public/news/?page_size=6')).map(mapNews)
  },
  async getNewsItem(slug) {
    return mapNews(await request(`/public/news/${encodeURIComponent(slug)}/`))
  },
  async getStats() {
    const settings = await request('/public/site/')
    return (settings.stats || []).map(item => [item.value, item.label])
  },
  async getTeam(type) {
    const members = await getList('/public/team/')
    return members
      .filter(member => !type || member.type === type)
      .map(member => ({
        id: member.id,
        type: member.type,
        name: member.full_name,
        role: member.role_title,
        image: member.photo?.url || '',
        description: member.bio || '',
      }))
  },
}

export const voteService = {
  async getPackages() {
    return getList('/public/vote-packages/')
  },
  async createOrder({ candidateSlug, packageId, phone, operator }) {
    return request('/public/vote-orders/', {
      method: 'POST',
      body: JSON.stringify({
        candidate: candidateSlug,
        vote_package: packageId,
        phone,
        operator,
        idempotency_key: crypto.randomUUID(),
        accept_terms: true,
      }),
    })
  },
  async getOrderStatus(orderNumber) {
    return request(`/public/vote-orders/${encodeURIComponent(orderNumber)}/`)
  },
}

export const rankingService = {
  async getRanking() {
    const [ranking, candidates] = await Promise.all([
      getList('/public/rankings/'),
      candidateService.getCandidates(),
    ])
    const candidatesBySlug = new Map(candidates.map(candidate => [candidate.slug, candidate]))
    return ranking.map(row => ({
      ...candidatesBySlug.get(row.slug),
      id: candidatesBySlug.get(row.slug)?.id || row.slug,
      slug: row.slug,
      code: row.code,
      name: row.name,
      votes: row.votes_total || 0,
      rank: row.rank,
    }))
  },
}