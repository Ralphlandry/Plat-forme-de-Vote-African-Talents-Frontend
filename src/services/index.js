import { categories as fallbackCategories } from '../data/categories.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8009/api/v1'

function formatApiErrors(errors) {
  if (Array.isArray(errors)) return errors.map(formatApiErrors).filter(Boolean).join(' ')
  if (errors && typeof errors === 'object') return Object.values(errors).map(formatApiErrors).filter(Boolean).join(' ')
  return typeof errors === 'string' ? errors : ''
}

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
    throw new Error(formatApiErrors(body.errors) || body.message || `Erreur API (${response.status})`)
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
  const name = [candidate.last_name, candidate.first_name].filter(Boolean).join(' ') || candidate.display_name || ''
  const categoryName = candidate.category?.name || candidate.category_name || ''
  return {
    id: String(candidate.id),
    slug: candidate.slug,
    number: number || candidate.code,
    code: candidate.code,
    promoCode: candidate.promo_code || candidate.code,
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
    if (!current) return { status: 'upcoming', endsAt: 0, votePrice: 0, currency: 'FCFA', ticketSalesOpen: false }
    let status = 'closed'
    if (current.status === 'ENDED') status = 'ended'
    else if (current.status === 'SCHEDULED' || current.status === 'DRAFT') status = 'upcoming'
    else if (current.votes_open) status = 'open'
    return {
      id: current.id,
      startDate: current.start_date,
      status,
      endsAt: current.end_date ? new Date(current.end_date).getTime() : 0,
      ticketSalesOpen: current.ticket_sales_open === true,
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
  async getPartners() {
    return (await getList('/public/partners/')).map(partner => ({
      id: partner.id,
      name: partner.name,
      logo: partner.logo?.url || '',
    })).filter(partner => partner.logo)
  },
  async getAdvertisements() {
    return (await getList('/public/advertisements/')).map(advertisement => ({
      id: advertisement.id,
      title: advertisement.title,
      image: advertisement.image?.url || '',
      placement: advertisement.placement,
      displayDelaySeconds: advertisement.display_delay_seconds,
      dismissalCooldownSeconds: advertisement.dismissal_cooldown_seconds,
      buttonLabel: advertisement.button_label,
      buttonUrl: advertisement.button_url,
    })).filter(advertisement => advertisement.image)
  },
}

export const voteService = {
  async getPackages() {
    return getList('/public/vote-packages/')
  },
  async getPaymentMethods() {
    const response = await request('/public/payment-methods/')
    if (!Array.isArray(response.methods)) throw new Error('Les moyens de paiement reçus sont invalides.')
    return response.methods
  },
  async createOrder({ candidateSlug, packageId, phone, operator }) {
    return request('/public/vote-orders/', {
      method: 'POST',
      body: JSON.stringify({
        candidate: candidateSlug,
        vote_package: packageId,
        ...(phone ? { phone } : {}),
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

export const ticketService = {
  async getTypes() {
    return getList('/public/ticket-types/')
  },
  async createOrder({ ticketType, firstName, lastName, phone, operator, promoCode }) {
    return request('/public/ticket-orders/', {
      method: 'POST',
      body: JSON.stringify({
        ticket_type: ticketType,
        first_name: firstName,
        last_name: lastName,
        phone,
        operator,
        promo_code: promoCode,
        idempotency_key: crypto.randomUUID(),
        accept_terms: true,
      }),
    })
  },
  async getOrderStatus(orderNumber) {
    return request(`/public/ticket-orders/${encodeURIComponent(orderNumber)}/`)
  },
  async downloadPdf(orderNumber) {
    const response = await fetch(
      `${API_BASE_URL}/public/ticket-orders/${encodeURIComponent(orderNumber)}/pdf/`,
      { credentials: 'include' },
    )
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.message || `Le billet PDF n'a pas pu être téléchargé (${response.status}).`)
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `billet-${orderNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },
}

export const rankingService = {
  async getRanking(categorySlug = '') {
    const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ''
    const [ranking, candidates] = await Promise.all([
      getList(`/public/rankings/${query}`),
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