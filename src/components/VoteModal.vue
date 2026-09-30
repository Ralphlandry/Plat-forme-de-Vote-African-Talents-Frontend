<script setup>
import { computed, ref, watch } from 'vue'
import Avatar from './Avatar.vue'
import { voteTarget, competition } from '../composables/useCompetition'
import { voteService } from '../services'

const state = ref('form'), msg = ref('')
const selectedVotes = ref(1), paymentMethod = ref('orange'), phone = ref(''), accepted = ref(false)
const cardNumber = ref(''), cardExpiry = ref(''), cardCvv = ref('')
const votePackages = [1, 5, 10, 20, 50, 100, 150, 500]
const paymentMethods = [{ id: 'orange', name: 'Orange Money', icon: 'OM' }, { id: 'mtn', name: 'MTN Mobile Money', icon: 'MTN' }, { id: 'card', name: 'Carte bancaire', icon: 'CB' }]
const unitPrice = computed(() => competition.value.votePrice || 200)
const total = computed(() => selectedVotes.value * unitPrice.value)
const selectedPayment = computed(() => paymentMethods.find(method => method.id === paymentMethod.value))
const phoneValid = computed(() => /^[6-9]\d{8}$/.test(phone.value))
const cardValid = computed(() => /^\d{12,19}$/.test(cardNumber.value.replace(/\s/g, '')) && /^\d{2}\/\d{2}$/.test(cardExpiry.value) && /^\d{3,4}$/.test(cardCvv.value))
const canSubmit = computed(() => accepted.value && (paymentMethod.value === 'card' ? cardValid.value : phoneValid.value))
watch(voteTarget, () => { state.value = 'form'; msg.value = ''; selectedVotes.value = 1; paymentMethod.value = 'orange'; phone.value = ''; accepted.value = false; cardNumber.value = ''; cardExpiry.value = ''; cardCvv.value = '' })
const close = () => { if (state.value !== 'loading') voteTarget.value = null }
const formatAmount = value => `${value.toLocaleString('fr-FR')} ${competition.value.currency || 'FCFA'}`
const normalizePhone = value => value.replace(/\D/g, '').slice(0, 9)
async function submit() {
  if (!canSubmit.value) { msg.value = paymentMethod.value === 'card' ? 'Vérifiez les informations de votre carte.' : 'Entrez un numéro camerounais valide à 9 chiffres.'; return }
  state.value = 'loading'
  try { const result = await voteService.vote(voteTarget.value.id); voteTarget.value.votes = result.votes; state.value = 'success' }
  catch (error) { msg.value = error.message; state.value = 'error' }
}
</script>
<template>
  <dialog v-if="voteTarget" open class="modal vote-modal" @click.self="close" @keydown.esc="close" aria-labelledby="vote-title">
    <div class="vote-box">
      <header class="vote-header"><Avatar :c="voteTarget" class="vote-avatar" /><div><h2 id="vote-title">Voter pour <strong>{{ voteTarget.name }}</strong></h2><b>CD{{ String(voteTarget.number).padStart(3, '0') }}</b></div><button class="modal-close" type="button" aria-label="Fermer" @click="close">×</button></header>
      <template v-if="state === 'form'">
        <section class="vote-section"><h3>Choisissez le nombre de votes :</h3><div class="vote-packages"><button v-for="votes in votePackages" :key="votes" type="button" class="vote-package" :class="{ selected: selectedVotes === votes }" @click="selectedVotes = votes"><strong>{{ votes }}</strong><small>{{ votes === 1 ? 'vote' : 'votes' }}</small><b>{{ formatAmount(votes * unitPrice) }}</b></button></div></section>
        <div class="vote-total"><span>Montant total<strong>{{ formatAmount(total) }}</strong></span><b>Paiement sécurisé</b></div>
        <section class="vote-section payment-section"><h3>Moyen de paiement :</h3><div class="payment-options"><button v-for="method in paymentMethods" :key="method.id" type="button" class="payment-option" :class="{ selected: paymentMethod === method.id }" @click="paymentMethod = method.id"><i>{{ method.icon }}</i><strong>{{ method.name }}</strong></button></div></section>
        <div v-if="paymentMethod !== 'card'" class="payment-instructions"><strong>{{ selectedPayment.name }} (Cameroun)</strong><p>1. Entrez votre numéro {{ selectedPayment.name === 'MTN Mobile Money' ? 'MTN MoMo' : 'Orange Money' }}.</p><p>2. Après confirmation, un menu USSD s'affichera sur votre téléphone.</p><p>3. Validez avec votre code secret sur votre téléphone.</p></div>
        <div v-if="paymentMethod !== 'card'" class="payment-field"><label :for="`phone-${paymentMethod}`">Votre numéro {{ selectedPayment.name }}</label><div class="phone-input"><span>+237</span><input :id="`phone-${paymentMethod}`" :value="phone" inputmode="numeric" placeholder="6XX XX XX XX" maxlength="9" @input="phone = normalizePhone($event.target.value)" /></div><small>Numéro mobile camerounais : 9 chiffres, commence par 6.</small></div>
        <div v-else class="card-fields"><label>Numéro de carte<input v-model="cardNumber" inputmode="numeric" placeholder="1234 5678 9012 3456" /></label><div><label>Expiration<input v-model="cardExpiry" placeholder="MM/AA" maxlength="5" /></label><label>CVV<input v-model="cardCvv" inputmode="numeric" placeholder="123" maxlength="4" /></label></div></div>
        <label class="consent"><input v-model="accepted" type="checkbox" /><span>J'accepte les <b>conditions d'utilisation</b> et l'utilisation de mon numéro pour le suivi des votes <b>(confidentialité)</b>.</span></label>
        <p v-if="msg" class="vote-error">{{ msg }}</p><button class="btn gold vote-submit" type="button" :disabled="!canSubmit" @click="submit">Confirmer et payer {{ formatAmount(total) }}</button><p class="vote-note">Vos votes seront comptabilisés immédiatement après confirmation du paiement.</p>
      </template>
      <template v-else-if="state === 'loading'"><div class="vote-state"><h3>Confirmation du paiement…</h3><div class="spin"></div><p>Nous enregistrons votre vote.</p></div></template>
      <template v-else-if="state === 'success'"><div class="vote-state"><h3 class="gold-text">Vote enregistré ✓</h3><p>Merci ! {{ voteTarget.name }} compte maintenant {{ voteTarget.votes.toLocaleString('fr-FR') }} votes.</p><button class="btn gold" type="button" @click="close">Fermer</button></div></template>
      <template v-else><div class="vote-state"><h3>Vote non enregistré</h3><p>{{ msg }}</p><button class="btn gold" type="button" @click="state = 'form'">Réessayer</button></div></template>
    </div>
  </dialog>
</template>
