<script setup>
import { computed, ref, watch } from 'vue'
import { voteTarget, competition } from '../composables/useCompetition'
import { voteService } from '../services'

const state = ref('form'), msg = ref('')
const votePackages = ref([])
const selectedPackageId = ref('')
const paymentMethod = ref('ORANGE')
const phone = ref('')
const accepted = ref(false)
const currentOrderNumber = ref('')
const packagesLoading = ref(false)
const paymentMethods = [{ id: 'ORANGE', name: 'Orange Money', icon: 'OM' }, { id: 'MTN', name: 'MTN Mobile Money', icon: 'MTN' }]
const selectedPackage = computed(() => votePackages.value.find(item => item.id === selectedPackageId.value))
const total = computed(() => selectedPackage.value?.price_xaf || 0)
const selectedPayment = computed(() => paymentMethods.find(method => method.id === paymentMethod.value))
const phoneValid = computed(() => /^[6-9]\d{8}$/.test(phone.value))
const canSubmit = computed(() => accepted.value && phoneValid.value && !!selectedPackage.value && !packagesLoading.value)
watch(voteTarget, async candidate => {
  state.value = 'form'
  msg.value = ''
  currentOrderNumber.value = ''
  selectedPackageId.value = ''
  paymentMethod.value = 'ORANGE'
  phone.value = ''
  accepted.value = false
  if (!candidate) return
  packagesLoading.value = true
  try {
    votePackages.value = await voteService.getPackages()
    selectedPackageId.value = votePackages.value[0]?.id || ''
    if (!votePackages.value.length) {
      state.value = 'error'
      msg.value = 'Aucun forfait de vote n’est disponible pour le moment.'
    }
  } catch (error) {
    state.value = 'error'
    msg.value = error.message || 'Impossible de charger les forfaits de vote.'
  } finally {
    packagesLoading.value = false
  }
})
const close = () => { if (state.value !== 'loading') voteTarget.value = null }
const formatAmount = value => `${value.toLocaleString('fr-FR')} ${competition.value.currency || 'FCFA'}`
const normalizePhone = value => value.replace(/\D/g, '').slice(0, 9)

async function pollPayment(orderNumber, attempt = 0) {
  try {
    const order = await voteService.getOrderStatus(orderNumber)
    if (order.status === 'PAID') {
      const nextCandidate = await voteService.getCandidate(voteTarget.value.slug)
      voteTarget.value.votes = nextCandidate.votes
      state.value = 'success'
      return
    }
    if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
      state.value = 'error'
      msg.value = `Le paiement est ${order.status === 'FAILED' ? 'échoué' : order.status === 'EXPIRED' ? 'expiré' : 'annulé'} (référence ${orderNumber}).`
      return
    }
    if (attempt >= 40) {
      state.value = 'pending'
      msg.value = `Paiement toujours en attente. Référence : ${orderNumber}. Validez la demande sur votre téléphone.`
      return
    }
    window.setTimeout(() => pollPayment(orderNumber, attempt + 1), 3000)
  } catch (error) {
    state.value = 'pending'
    msg.value = `${error.message || 'Suivi du paiement indisponible.'} Référence : ${orderNumber}.`
  }
}

async function submit() {
  if (!canSubmit.value) {
    msg.value = 'Choisissez un forfait, entrez un numéro camerounais valide et acceptez les conditions.'
    return
  }
  state.value = 'loading'
  msg.value = ''
  try {
    const order = await voteService.createOrder({
      candidateSlug: voteTarget.value.slug,
      packageId: selectedPackage.value.id,
      phone: `+237${phone.value}`,
      operator: paymentMethod.value,
    })
    currentOrderNumber.value = order.order_number
    if (order.status === 'PAID') {
      const nextCandidate = await voteService.getCandidate(voteTarget.value.slug)
      voteTarget.value.votes = nextCandidate.votes
      state.value = 'success'
    } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
      state.value = 'error'
      msg.value = `La commande de paiement a échoué (référence ${order.order_number}).`
    } else {
      pollPayment(order.order_number)
    }
  } catch (error) {
    msg.value = error.message || 'Impossible de créer la commande de paiement.'
    state.value = 'error'
  }
}

function resumePaymentCheck() {
  state.value = 'loading'
  pollPayment(currentOrderNumber.value)
}
</script>
<template>
  <dialog v-if="voteTarget" open class="modal vote-modal" @click.self="close" @keydown.esc="close"
    aria-labelledby="vote-title">
    <div class="vote-box">
      <header class="vote-header">
        <h2 id="vote-title">Finaliser votre vote</h2>
        <button class="modal-close" type="button" aria-label="Fermer" @click="close">×</button>
      </header>
      <template v-if="state === 'form'">
        <section class="vote-section">
          <h3>Choisissez un forfait :</h3>
          <p v-if="packagesLoading" class="vote-note">Chargement des forfaits…</p>
          <div v-else class="vote-packages"><button v-for="item in votePackages" :key="item.id" type="button"
              class="vote-package" :class="{ selected: selectedPackageId === item.id }"
              @click="selectedPackageId = item.id"><strong>{{ item.quantity }}</strong><small>{{ item.quantity === 1 ? 'vote' : 'votes' }}</small><b>{{ formatAmount(item.price_xaf) }}</b></button></div>
        </section>
        <div class="vote-total"><span>Montant total<strong>{{ formatAmount(total) }}</strong></span><b>Paiement sécurisé</b></div>
        <section class="vote-section payment-section">
          <h3>Moyen de paiement :</h3>
          <div class="payment-options"><button v-for="method in paymentMethods" :key="method.id" type="button"
              class="payment-option" :class="{ selected: paymentMethod === method.id }"
              @click="paymentMethod = method.id"><i>{{ method.icon }}</i><strong>{{ method.name }}</strong></button>
          </div>
        </section>
        <div class="payment-instructions"><strong>{{ selectedPayment.name }} (Cameroun)</strong>
          <p>1. Entrez votre numéro {{ selectedPayment.name === 'MTN Mobile Money' ? 'MTN MoMo' : 'Orange Money' }}.</p>
          <p>2. Confirmez la demande de paiement reçue sur votre téléphone.</p>
          <p>3. Les votes seront ajoutés après validation serveur du paiement.</p>
        </div>
        <div class="payment-field"><label :for="`phone-${paymentMethod}`">Votre numéro {{ selectedPayment.name }}</label>
          <div class="phone-input"><span>+237</span><input :id="`phone-${paymentMethod}`" :value="phone"
              inputmode="numeric" placeholder="6XX XX XX XX" maxlength="9"
              @input="phone = normalizePhone($event.target.value)" /></div><small>Numéro mobile camerounais : 9 chiffres, commence par 6.</small>
        </div>
        <label class="consent"><input v-model="accepted" type="checkbox" /><span>J'accepte les <b>conditions d'utilisation</b> et l'utilisation de mon numéro pour le suivi des votes <b>(confidentialité)</b>.</span></label>
        <p v-if="msg" class="vote-error">{{ msg }}</p><button class="btn gold vote-submit" type="button"
          :disabled="!canSubmit" @click="submit">Confirmer et payer {{ formatAmount(total) }}</button>
        <p class="vote-note">Vos votes seront ajoutés après validation du paiement par l’API.</p>
      </template>
      <template v-else-if="state === 'loading'">
        <div class="vote-state">
          <h3>Confirmation du paiement…</h3>
          <div class="spin"></div>
          <p>En attente de la confirmation sécurisée du prestataire.</p>
        </div>
      </template>
      <template v-else-if="state === 'pending'">
        <div class="vote-state">
          <h3>Paiement en attente</h3>
          <p>{{ msg }}</p>
          <button class="btn gold" type="button" @click="resumePaymentCheck">Vérifier à nouveau</button>
          <button class="btn" type="button" @click="close">Fermer</button>
        </div>
      </template>
      <template v-else-if="state === 'success'">
        <div class="vote-state">
          <h3 class="gold-text">Vote enregistré ✓</h3>
          <p>Merci ! {{ voteTarget.name }} compte maintenant {{ voteTarget.votes.toLocaleString('fr-FR') }} votes.</p>
          <button class="btn gold" type="button" @click="close">Fermer</button>
        </div>
      </template>
      <template v-else>
        <div class="vote-state">
          <h3>Vote non enregistré</h3>
          <p>{{ msg }}</p><button class="btn gold" type="button" @click="state = 'form'">Réessayer</button>
        </div>
      </template>
    </div>
  </dialog>
</template>
