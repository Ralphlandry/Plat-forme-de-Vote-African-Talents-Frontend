// Couche d'accès aux données : remplacer le corps de chaque méthode par un appel API (fetch/axios).
import { candidates } from '../data/candidates.js'
import { categories } from '../data/categories.js'
import { news, stats } from '../data/content.js'
const wait = (ms = 250) => new Promise(r => setTimeout(r, ms))
const db = candidates.map(c => ({ ...c }))
// status: 'open' | 'upcoming' | 'closed' | 'ended'
const competition = { status: 'open', endsAt: Date.now() + 1.6 * 864e5, votePrice: 0, currency: 'FCFA' }
export const competitionService = { async getStatus() { await wait(80); return { ...competition } } }
export const categoryService = { async getCategories() { return categories } }
export const contentService = { async getNews() { return news }, async getStats() { return stats } }
export const candidateService = {
  async getCandidates() { await wait(); return db.filter(c => c.active).map(c => ({ ...c })) },
  async getCandidate(id) { await wait(150); const c = db.find(c => c.id === id); if (!c) throw new Error('Candidat introuvable'); return { ...c } }
}
export const voteService = {
  async vote(candidateId) { // POST /votes — la sécurité (limites, anti-bot, captcha) sera gérée côté serveur
    await wait(1100)
    if (competition.status !== 'open') throw new Error('Les votes sont fermés.')
    if (Math.random() < 0.1) throw new Error('Le vote n\'a pas pu être enregistré. Réessayez.')
    const c = db.find(c => c.id === candidateId); c.votes++; return { votes: c.votes }
  }
}
export const rankingService = {
  async getRanking() { await wait(); return [...db].filter(c => c.active).sort((a, b) => b.votes - a.votes).map((c, i) => ({ ...c, rank: i + 1 })) }
}
