import { ref } from 'vue'
import { competitionService } from '../services'
export const competition = ref({ status: 'upcoming', endsAt: 0, votePrice: 0, currency: 'FCFA' })
export const voteTarget = ref(null) // candidat ciblé par la modale de vote
export const openVote = c => { voteTarget.value = c }
export const shareTarget = ref(null)
export const openShare = c => { shareTarget.value = c }
competitionService.getStatus()
	.then(status => { competition.value = status })
	.catch(() => { competition.value = { ...competition.value, status: 'closed' } })
export const statusLabel = { open: 'Votes ouverts', upcoming: 'Bientôt ouvert', closed: 'Votes fermés', ended: 'Compétition terminée' }
