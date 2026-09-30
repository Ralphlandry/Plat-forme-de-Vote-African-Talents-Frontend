import { ref } from 'vue'
import { competitionService } from '../services'
export const competition = ref({ status: 'open', endsAt: 0, votePrice: 0, currency: 'FCFA' })
export const voteTarget = ref(null) // candidat ciblé par la modale de vote
export const openVote = c => { voteTarget.value = c }
export const shareTarget = ref(null)
export const openShare = c => { shareTarget.value = c }
competitionService.getStatus().then(s => competition.value = s)
export const statusLabel = { open: 'Votes ouverts', upcoming: 'Bientôt ouvert', closed: 'Votes fermés', ended: 'Compétition terminée' }
