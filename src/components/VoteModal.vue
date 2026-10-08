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
      <template v-if="['form', 'loading', 'pending'].includes(state)">
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
        <p v-if="msg && state === 'form'" class="vote-error">{{ msg }}</p><button class="btn gold vote-submit" type="button"
          :disabled="!canSubmit || state !== 'form'" @click="submit">{{ state === 'loading' ? 'Traitement…' : `Confirmer et payer ${formatAmount(total)}` }}</button>
        <p class="vote-note">Vos votes seront ajoutés après validation du paiement par l’API.</p>
        <div v-if="state === 'loading' || state === 'pending'" class="payment-wait-overlay">
          <section class="payment-wait-card" role="status" aria-live="polite">
            <div class="spin payment-wait-spinner"></div>
            <h3>Validez sur votre téléphone {{ paymentMethod === 'ORANGE' ? 'Orange' : 'MTN' }}</h3>
            <p v-if="paymentMethod === 'ORANGE'" class="payment-wait-intro">Composez #150*50# sur votre téléphone Orange, puis validez avec votre code secret Orange Money.</p>
            <p v-else class="payment-wait-intro">Demande MTN envoyée. Validez le menu USSD Push sur votre téléphone avec votre code secret MTN.</p>
            <ol v-if="paymentMethod === 'ORANGE'" class="payment-wait-steps">
              <li>Composez #150*50# sur votre téléphone Orange</li>
              <li>Saisissez votre code secret Orange Money pour confirmer</li>
              <li>Gardez cette page ouverte jusqu’à la confirmation</li>
            </ol>
            <ol v-else class="payment-wait-steps">
              <li>Déverrouillez votre téléphone</li>
              <li>Acceptez le menu USSD Push qui s’affiche</li>
              <li>Confirmez avec votre code secret MTN</li>
            </ol>
            <p v-if="state === 'pending' && msg" class="payment-wait-status">{{ msg }}</p>
            <p class="payment-wait-note">Gardez cette page ouverte le temps de valider sur votre téléphone.</p>
            <div v-if="state === 'pending'" class="payment-wait-actions">
              <button class="btn gold" type="button" @click="resumePaymentCheck">Vérifier à nouveau</button>
              <button class="btn" type="button" @click="close">Fermer</button>
            </div>
          </section>
        </div>
      </template>
      <template v-else-if="state === 'success'">
        <div class="result-overlay success-sheet">
          <div class="result-box success-box">
            <div class="status-icon success-icon"><span>✓</span></div>
            <h3 class="status-title success">Paiement validé</h3>
            <p class="status-message success">Merci ! {{ voteTarget.name }} compte maintenant {{ voteTarget.votes.toLocaleString('fr-FR') }} votes.</p>
            <button class="btn gold modal-success-btn" type="button" @click="close">Fermer</button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="result-overlay error-sheet">
          <div class="result-box error-box">
            <div class="status-icon error-icon"><span>×</span></div>
            <h3 class="status-title error">Paiement échoué</h3>
            <p class="status-message error">{{ msg || 'Numéro incorrect ou non reconnu par l’opérateur. Vérifie ton numéro.' }}</p>
            <div class="status-badge error-badge">Aucun vote n’a été comptabilisé</div>
            <button class="btn gold modal-error-btn" type="button" @click="close">Fermer</button>
          </div>
        </div>
      </template>
    </div>
  </dialog>
</template>
