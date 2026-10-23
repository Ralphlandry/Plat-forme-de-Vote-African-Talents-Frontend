<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { competitionService, ticketService } from '../services'

const route = useRoute()
const ticketTypes = ref([])
const ticketSalesOpen = ref(false)
const competitionStartDate = ref('')
const selectedType = ref('')
const purchaseModalOpen = ref(false)
const modalCloseButton = ref(null)
let lastPackageButton = null
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const promoCode = ref(typeof route.query.promo === 'string' ? route.query.promo : '')
const operator = ref('')
const acceptedTerms = ref(false)
const order = ref(null)
const loading = ref(false)
const error = ref('')
const pollingError = ref('')
let pollingTimer = null
let refreshing = false
const terminalStatuses = ['FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED']
const selectedTicket = computed(() => ticketTypes.value.find(ticket => String(ticket.id) === selectedType.value))
const eventDateLabel = computed(() => {
  if (!competitionStartDate.value) return 'Dimanche 22 novembre'
  const [year, month, day] = competitionStartDate.value.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(year, month - 1, day))
})

const ticketBenefits = {
  BASIC: [
    'Accès à la salle',
  ],
  STANDARD: [
    'Accès à la salle',
    'Une boisson incluse',
  ],
  PREMIUM: [
    'Accès à la salle',
    'Une boisson incluse',
    'Accès aux premières places',
    'Photo avec les stars',
  ],
}

const ticketPackageNames = {
  BASIC: 'Pass Basic',
  STANDARD: 'Pass Standard',
  PREMIUM: 'Pass Premium',
}

const paymentMethods = [
  { value: 'MTN', label: 'MTN Mobile Money', short: 'MTN', className: 'mtn' },
  { value: 'ORANGE', label: 'Orange Money', short: 'OM', className: 'orange' },
]

watch(() => route.query.promo, value => {
  if (typeof value === 'string') promoCode.value = value
})

watch(purchaseModalOpen, async isOpen => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) {
    await nextTick()
    modalCloseButton.value?.focus()
    document.addEventListener('keydown', onModalKeydown)
  } else {
    document.removeEventListener('keydown', onModalKeydown)
    await nextTick()
    lastPackageButton?.focus()
  }
})

function onModalKeydown(event) {
  if (event.key === 'Escape') closePurchaseModal()
}

function selectTicket(ticketId, event) {
  selectedType.value = String(ticketId)
  operator.value = ''
  phone.value = ''
  acceptedTerms.value = false
  error.value = ''
  lastPackageButton = event.currentTarget
  purchaseModalOpen.value = true
}

function closePurchaseModal() {
  purchaseModalOpen.value = false
}

async function loadTickets() {
  loading.value = true
  error.value = ''
  try {
    const [types, competition] = await Promise.all([
      ticketService.getTypes(),
      competitionService.getStatus(),
    ])
    const ticketOrder = { BASIC: 0, STANDARD: 1, PREMIUM: 2 }
    ticketTypes.value = [...types].sort(
      (first, second) => ticketOrder[first.ticket_class] - ticketOrder[second.ticket_class],
    )
    ticketSalesOpen.value = competition.ticketSalesOpen
    competitionStartDate.value = competition.startDate || types[0]?.competition_start_date || ''
  } catch (err) {
    error.value = err.message || 'Les billets ne sont pas disponibles pour le moment.'
  } finally {
    loading.value = false
  }
}

function stopPolling() {
  if (pollingTimer) clearInterval(pollingTimer)
  pollingTimer = null
}

async function refreshOrder() {
  if (!order.value?.order_number || refreshing) return
  refreshing = true
  try {
    const status = await ticketService.getOrderStatus(order.value.order_number)
    order.value = status
    pollingError.value = ''
    if (status.status === 'PAID') {
      stopPolling()
      if (!order.value.pdfDownloaded) {
        order.value.pdfDownloaded = true
        await ticketService.downloadPdf(status.order_number)
      }
    } else if (terminalStatuses.includes(status.status)) {
      stopPolling()
    }
  } catch (err) {
    pollingError.value = err.message || 'Impossible de vérifier le paiement.'
  } finally {
    refreshing = false
  }
}

async function submitOrder() {
  error.value = ''
  pollingError.value = ''
  const validPhone = /^\+?[0-9]{9,15}$/.test(phone.value.trim())
  if (
    !selectedTicket.value
    || !firstName.value.trim()
    || !lastName.value.trim()
    || !operator.value
    || !validPhone
    || !acceptedTerms.value
  ) {
    error.value = 'Renseignez votre nom, choisissez un moyen de paiement, saisissez un numéro valide et acceptez les conditions.'
    return
  }
  loading.value = true
  try {
    order.value = await ticketService.createOrder({
      ticketType: selectedType.value,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      phone: phone.value.trim(),
      operator: operator.value,
      promoCode: promoCode.value.trim(),
    })
    purchaseModalOpen.value = false
    if (order.value.status === 'PAID') {
      await refreshOrder()
    } else if (!terminalStatuses.includes(order.value.status)) {
      stopPolling()
      pollingTimer = setInterval(refreshOrder, 4000)
    }
  } catch (err) {
    error.value = err.message || 'La commande n’a pas pu être créée.'
  } finally {
    loading.value = false
  }
}

function startNewOrder() {
  stopPolling()
  order.value = null
  selectedType.value = ''
  purchaseModalOpen.value = false
  operator.value = ''
  phone.value = ''
  acceptedTerms.value = false
  error.value = ''
  pollingError.value = ''
}

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('keydown', onModalKeydown)
  document.body.style.overflow = ''
})
loadTickets()
</script>

<template>
  <main class="page-top ticket-page">
    <section class="section">
      <div class="wrap ticket-wrap">
        <header class="ticket-heading">
          <p class="eyebrow">African Talents · Billetterie officielle</p>
          <h1 class="gold-text">Choisissez votre pass</h1>
          <p class="ticket-intro">
            Vivez la grande finale du concours de chant. Sélectionnez votre formule, renseignez vos
            informations, puis choisissez votre moyen de paiement.
          </p>
          <div class="event-summary">
            <span class="event-summary-icon" aria-hidden="true">♫</span>
            <span><strong>Finale du concours de chant</strong><small>{{ eventDateLabel }} · 15 h · Arena Bonamoussadi, Douala</small></span>
          </div>
        </header>

        <div v-if="error && !purchaseModalOpen" class="ticket-message error" role="alert">{{ error }}</div>
        <div v-if="!order">
          <div v-if="loading && !ticketTypes.length" class="state">Chargement des billets…</div>
          <div v-else-if="!ticketTypes.length" class="ticket-message">
            Aucun pass n’est disponible pour le moment.
          </div>
          <div v-else class="ticket-checkout">
            <p v-if="!ticketSalesOpen" class="ticket-message">
              La vente des billets n’est pas encore ouverte. Revenez bientôt.
            </p>
            <section class="ticket-packages" aria-labelledby="ticket-package-title">
              <div class="section-heading">
                <div>
                  <span class="step-label">ÉTAPE 1</span>
                  <h2 id="ticket-package-title">Choisissez votre expérience</h2>
                </div>
                <span class="package-count">{{ ticketTypes.length }} pass disponibles</span>
              </div>

              <div class="package-grid">
                <article
                  v-for="ticket in ticketTypes"
                  :key="ticket.id"
                  class="package-card"
                  :class="[
                    ticket.ticket_class === 'PREMIUM' ? 'package-vip' : ticket.ticket_class === 'BASIC' ? 'package-basic' : 'package-classic',
                    { 'package-selected': selectedType === String(ticket.id) },
                  ]"
                >
                  <div class="package-card-top">
                    <span class="package-kicker">
                      {{ ticket.ticket_class === 'PREMIUM' ? 'EXPÉRIENCE PRIVILÈGE' : ticket.ticket_class === 'BASIC' ? 'ACCÈS À LA SALLE' : 'ACCÈS À LA FINALE' }}
                    </span>
                    <span v-if="ticket.ticket_class === 'PREMIUM'" class="package-star" aria-hidden="true">✦</span>
                    <h3>{{ ticketPackageNames[ticket.ticket_class] || ticket.label }}</h3>
                    <p class="package-description">
                      {{ ticket.ticket_class === 'PREMIUM' ? 'Vivez la finale au plus près de la scène.' : ticket.ticket_class === 'BASIC' ? 'Un billet pour accéder à la salle.' : 'Prenez part à la grande finale.' }}
                    </p>
                    <p class="package-price">
                      <strong>{{ Number(ticket.price_xaf).toLocaleString('fr-FR') }}</strong>
                      <span>FCFA <small>/ personne</small></span>
                    </p>
                  </div>
                  <ul class="package-benefits">
                    <li v-for="benefit in ticketBenefits[ticket.ticket_class] || ['Une entrée nominative']" :key="benefit">
                      <span aria-hidden="true">✓</span>{{ benefit }}
                    </li>
                  </ul>
                  <button
                    class="package-select"
                    :class="{ 'package-select-active': selectedType === String(ticket.id) }"
                    type="button"
                    :disabled="!ticketSalesOpen"
                    :aria-pressed="ticketSalesOpen && selectedType === String(ticket.id)"
                    @click="selectTicket(ticket.id, $event)"
                  >
                    {{ !ticketSalesOpen ? 'Vente bientôt disponible' : selectedType === String(ticket.id) ? 'Pass sélectionné' : 'Choisir ce pass' }}
                  </button>
                </article>
              </div>
            </section>
          </div>
        </div>

        <Teleport to="body">
          <div v-if="purchaseModalOpen && selectedTicket && !order" class="ticket-modal-overlay" @click.self="closePurchaseModal">
            <section class="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="buyer-title">
              <button ref="modalCloseButton" class="ticket-modal-close" type="button" aria-label="Fermer la fenêtre d’achat" @click="closePurchaseModal">×</button>
              <div class="section-heading">
                <div>
                  <span class="step-label">ÉTAPE 2</span>
                  <h2 id="buyer-title">Vos informations</h2>
                </div>
                <button class="change-package" type="button" @click="selectedType = ''">Changer de pass</button>
              </div>

              <div class="selected-summary">
                <span class="summary-ticket-icon" aria-hidden="true">🎟</span>
                <span><strong>{{ selectedTicket.label }}</strong><small>Une place · {{ Number(selectedTicket.price_xaf).toLocaleString('fr-FR') }} FCFA</small></span>
                <strong class="summary-price">{{ Number(selectedTicket.price_xaf).toLocaleString('fr-FR') }} FCFA</strong>
              </div>

              <div class="ticket-fields">
                <label>Prénom<input v-model="firstName" required maxlength="100" autocomplete="given-name" placeholder="Votre prénom" /></label>
                <label>Nom<input v-model="lastName" required maxlength="100" autocomplete="family-name" placeholder="Votre nom" /></label>
              </div>
              <label class="ticket-field">Code promo du candidat <span class="optional">(facultatif)</span><input v-model="promoCode" maxlength="32" autocomplete="off" placeholder="Ex. AT-001" /></label>
              <p class="ticket-hint">Le code permet d’attribuer cette vente au candidat concerné. Il ne réduit pas le prix.</p>

              <div class="payment-section">
                <div class="section-heading">
                  <div>
                    <span class="step-label">ÉTAPE 3</span>
                    <h2>Choisissez comment payer</h2>
                  </div>
                </div>
                <p class="payment-hint">Sélectionnez d’abord votre opérateur pour saisir le numéro Mobile Money à débiter.</p>
                <div class="payment-grid">
                  <button
                    v-for="method in paymentMethods"
                    :key="method.value"
                    class="payment-choice"
                    :class="[`payment-${method.className}`, { 'payment-choice-selected': operator === method.value }]"
                    type="button"
                    :disabled="loading"
                    @click="operator = method.value"
                    :aria-pressed="operator === method.value"
                  >
                    <span class="payment-brand" aria-hidden="true">{{ method.short }}</span>
                    <span class="payment-copy"><strong>{{ method.label }}</strong><small>Payer {{ Number(selectedTicket.price_xaf).toLocaleString('fr-FR') }} FCFA</small></span>
                    <span class="payment-arrow" aria-hidden="true">›</span>
                  </button>
                </div>
                <label v-if="operator" class="ticket-field payment-phone">
                  Numéro {{ operator === 'MTN' ? 'MTN Mobile Money' : 'Orange Money' }}
                  <input v-model="phone" required type="tel" inputmode="tel" pattern="\+?[0-9]{9,15}" :placeholder="operator === 'MTN' ? '+237 6XX XX XX XX' : '+237 6XX XX XX XX'" autocomplete="tel" />
                </label>
              </div>

              <div v-if="error" class="ticket-message error" role="alert">{{ error }}</div>
              <label v-if="operator" class="terms"><input v-model="acceptedTerms" type="checkbox" required /> J’accepte les conditions d’achat et comprends que le billet sera émis après confirmation du paiement.</label>
              <p class="ticket-security">Votre billet est nominatif. Un QR code unique sera émis après confirmation du paiement.</p>
              <button v-if="operator" class="btn gold lg ticket-submit" type="button" :disabled="loading || !phone.trim() || !acceptedTerms" @click="submitOrder">
                {{ loading ? 'Préparation du paiement…' : `Payer ${Number(selectedTicket.price_xaf).toLocaleString('fr-FR')} FCFA` }}
              </button>
              <p v-if="loading" class="payment-processing" role="status">Préparation de votre paiement…</p>
            </section>
          </div>
        </Teleport>

        <section v-if="order" class="ticket-result" aria-live="polite">
          <span class="ticket-result-icon" :class="order.status?.toLowerCase()" aria-hidden="true">
            {{ order.status === 'PAID' ? '✓' : terminalStatuses.includes(order.status) ? '!' : '…' }}
          </span>
          <span class="ticket-status" :class="order.status?.toLowerCase()">
            {{ order.status === 'PAID' ? 'Paiement confirmé' : terminalStatuses.includes(order.status) ? 'Paiement non abouti' : 'Paiement en attente' }}
          </span>
          <h2>{{ order.ticket_label }} · {{ Number(order.amount_xaf).toLocaleString('fr-FR') }} FCFA</h2>
          <p v-if="order.status !== 'PAID' && !terminalStatuses.includes(order.status)">
            Une demande de paiement a été envoyée au {{ operator === 'MTN' ? 'MTN Mobile Money' : 'Orange Money' }}.
            Validez-la sur votre téléphone avec votre code secret. Cette page vérifie automatiquement le paiement.
          </p>
          <p v-if="order.status === 'PAID'">Votre billet PDF est en cours de téléchargement. Conservez-le précieusement et présentez-le à l’entrée.</p>
          <p v-if="terminalStatuses.includes(order.status)">Le paiement n’a pas été confirmé. Vérifiez votre solde ou votre numéro, puis recommencez une commande.</p>
          <p v-if="order.promo_code">Vente attribuée au candidat {{ order.promo_candidate_name }} ({{ order.promo_code }}).</p>
          <p v-if="pollingError" class="ticket-message error">{{ pollingError }}</p>
          <button v-if="order.status === 'PAID'" class="btn gold lg" type="button" @click="ticketService.downloadPdf(order.order_number)">Télécharger de nouveau le billet</button>
          <button v-else-if="terminalStatuses.includes(order.status)" class="btn gold lg" type="button" @click="startNewOrder">Nouvel achat</button>
          <p class="ticket-reference">Référence : {{ order.order_number }}</p>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.ticket-wrap { max-width: 1080px; }
.ticket-page { padding-top: 6.5rem; }
.ticket-page > .section { padding-top: 2.5rem; }
.ticket-heading { max-width: 760px; margin: 0 auto 2.5rem; text-align: center; }
.ticket-wrap h1 { margin: .5rem 0 .8rem; font-size: clamp(2rem, 5vw, 3.4rem); }
.eyebrow { color: var(--gold-l); text-transform: uppercase; letter-spacing: .15em; font-size: .8rem; }
.ticket-intro { max-width: 670px; margin: 0 auto; color: var(--mut); line-height: 1.7; }
.event-summary { display: inline-flex; align-items: center; gap: .85rem; margin-top: 1.5rem; padding: .85rem 1.15rem; border: 1px solid rgb(212 167 44 / 35%); border-radius: .8rem; background: rgb(255 255 255 / 3%); text-align: left; }
.event-summary-icon { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: 50%; color: #10152d; background: var(--gold-l); font-size: 1.3rem; }
.event-summary span:last-child, .selected-summary > span:nth-child(2) { display: grid; gap: .2rem; }
.event-summary strong { font-size: .95rem; }
.event-summary small, .selected-summary small { color: var(--mut); }
.ticket-checkout { display: grid; gap: 2rem; }
.ticket-packages, .ticket-result { padding: clamp(1rem, 4vw, 2rem); border: 1px solid rgb(212 167 44 / 25%); border-radius: 1.2rem; background: linear-gradient(145deg, rgb(255 255 255 / 4%), rgb(255 255 255 / 1%)); box-shadow: 0 1.2rem 3.5rem rgb(0 0 0 / 16%); }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.2rem; }
.section-heading h2 { margin: .35rem 0 0; font-size: clamp(1.2rem, 3vw, 1.6rem); }
.step-label { color: var(--gold-l); font-size: .7rem; font-weight: 800; letter-spacing: .15em; }
.package-count { color: var(--mut); font-size: .85rem; }
.package-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.2rem; align-items: stretch; }
.package-card { position: relative; display: flex; min-height: 390px; flex-direction: column; overflow: hidden; padding: 1.5rem; border: 1px solid rgb(255 255 255 / 16%); border-radius: 1rem; background: linear-gradient(150deg, #28284f, #171a35 75%); transition: border-color .2s, transform .2s, box-shadow .2s; }
.package-card::after { position: absolute; right: -3.7rem; bottom: -4.1rem; width: 10rem; height: 10rem; border: 1px solid rgb(255 255 255 / 8%); border-radius: 50%; content: ''; pointer-events: none; }
.package-card:hover { transform: translateY(-3px); }
.package-card.package-selected { border-color: var(--gold-l); box-shadow: 0 0 0 2px rgb(212 167 44 / 13%), 0 1rem 2.5rem rgb(0 0 0 / 22%); }
.package-vip { border-color: rgb(232 185 72 / 40%); background: linear-gradient(145deg, #4d3a16, #24203b 78%); }
.package-card-top { position: relative; min-height: 190px; padding: 1.1rem; border-radius: .75rem; color: #17182d; background: #f5f1e8; }
.package-vip .package-card-top { background: linear-gradient(135deg, #fff3bd, #eab94d); }
.package-basic { border-color: rgb(212 167 44 / 38%); }
.package-kicker { display: block; color: #827046; font-size: .65rem; font-weight: 800; letter-spacing: .13em; }
.package-card h3 { margin: 1.05rem 0 .35rem; font-size: 1.8rem; }
.package-description { margin: 0; color: #58576a; font-size: .9rem; }
.package-star { position: absolute; top: .85rem; right: 1rem; color: #a87414; font-size: 1.5rem; }
.package-price { display: flex; align-items: baseline; gap: .45rem; margin: 1.1rem 0 0; }
.package-price strong { color: #a46c0b; font-size: 2rem; }
.package-price > span { font-weight: 800; }
.package-price small { color: #777; font-size: .75rem; font-weight: 500; }
.package-benefits { display: grid; flex: 1; gap: .75rem; margin: 1.25rem 0 1.5rem; padding: 0; list-style: none; }
.package-benefits li { display: flex; align-items: center; gap: .65rem; color: #f3f0ea; font-size: .92rem; }
.package-benefits li span { display: grid; width: 1.25rem; height: 1.25rem; flex: 0 0 1.25rem; place-items: center; border-radius: 50%; color: #11152b; background: var(--gold-l); font-size: .75rem; font-weight: 900; }
.package-select { position: relative; z-index: 1; width: 100%; padding: .85rem 1rem; border: 1px solid rgb(255 255 255 / 32%); border-radius: .65rem; color: #fff; background: rgb(255 255 255 / 6%); font: inherit; font-weight: 800; cursor: pointer; transition: background .2s, color .2s; }
.package-select:hover, .package-select-active { border-color: var(--gold-l); color: #11152b; background: var(--gold-l); }
.ticket-modal-overlay { position: fixed; z-index: 1100; inset: 0; display: grid; overflow-y: auto; place-items: center; padding: 1.25rem; background: rgb(2 7 24 / 82%); backdrop-filter: blur(8px); }
.ticket-modal { position: relative; display: grid; gap: 1rem; width: min(100%, 680px); max-height: min(90vh, 900px); overflow-y: auto; padding: clamp(1.25rem, 4vw, 2rem); border: 1px solid rgb(212 167 44 / 42%); border-radius: 1.2rem; color: #f7f4ea; background: linear-gradient(145deg, #111b3c, #080e24 80%); box-shadow: 0 2rem 6rem rgb(0 0 0 / 55%); }
.ticket-modal-close { position: sticky; z-index: 1; top: 0; justify-self: end; display: grid; width: 2.5rem; height: 2.5rem; margin: -.5rem -.5rem -2.5rem 0; place-items: center; border: 1px solid rgb(255 255 255 / 25%); border-radius: 50%; color: #fff; background: #172344; font-size: 1.6rem; line-height: 1; cursor: pointer; }
.ticket-modal > .section-heading { padding-right: 2rem; }
.ticket-modal .ticket-field { font-weight: 600; }
.payment-phone { margin-top: .4rem; }
.selected-summary { display: flex; align-items: center; gap: .85rem; padding: .9rem 1rem; border: 1px solid rgb(212 167 44 / 24%); border-radius: .75rem; background: rgb(212 167 44 / 7%); }
.summary-ticket-icon { font-size: 1.6rem; }
.selected-summary > span:nth-child(2) { flex: 1; }
.summary-price { color: var(--gold-l); white-space: nowrap; }
.ticket-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.ticket-field, .ticket-fields label { display: grid; gap: .5rem; }
.ticket-field input, .ticket-fields input { width: 100%; padding: .85rem 1rem; border: 1px solid rgb(255 255 255 / 20%); border-radius: .55rem; color: inherit; background: rgb(0 0 0 / 16%); font: inherit; }
.ticket-field input:focus, .ticket-fields input:focus { border-color: var(--gold-l); outline: 2px solid rgb(212 167 44 / 20%); }
.optional, .ticket-hint, .ticket-reference { color: var(--mut); }
.ticket-hint { margin: -.7rem 0 0; font-size: .84rem; }
.payment-section { display: grid; gap: .65rem; margin-top: .5rem; }
.payment-section .section-heading { margin-bottom: 0; }
.payment-hint { margin: -.5rem 0 .35rem; color: var(--mut); font-size: .9rem; }
.payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .85rem; }
.payment-choice { display: flex; align-items: center; gap: .85rem; min-height: 76px; padding: .8rem 1rem; border: 1px solid rgb(255 255 255 / 16%); border-radius: .75rem; color: inherit; background: rgb(255 255 255 / 3%); text-align: left; font: inherit; cursor: pointer; transition: transform .15s, border-color .15s, background .15s; }
.payment-choice:hover:not(:disabled) { transform: translateY(-2px); border-color: var(--gold-l); background: rgb(212 167 44 / 8%); }
.payment-choice:disabled { opacity: .65; cursor: wait; }
.payment-brand { display: grid; width: 2.8rem; height: 2.8rem; flex: 0 0 2.8rem; place-items: center; border-radius: .65rem; color: #fff; background: #f1ad00; font-size: .8rem; font-weight: 900; }
.payment-orange .payment-brand { background: #f06418; }
.payment-copy { display: grid; flex: 1; gap: .2rem; }
.payment-copy small { color: var(--mut); }
.payment-arrow { color: var(--gold-l); font-size: 1.8rem; }
.terms { display: flex; align-items: flex-start; gap: .6rem; color: var(--mut); font-size: .9rem; line-height: 1.5; }
.terms input { margin-top: .25rem; accent-color: var(--gold-l); }
.payment-processing { margin: 0; color: var(--gold-l); }
.ticket-security { margin: 0; color: var(--mut); font-size: .82rem; }
.ticket-message { margin: 1rem 0; padding: 1rem; border-radius: .6rem; background: rgb(255 255 255 / 6%); }
.ticket-message.error { color: #ffb4ab; background: rgb(180 35 24 / 15%); }
.ticket-submit { justify-self: stretch; width: 100%; }
.ticket-submit:disabled { opacity: .55; cursor: not-allowed; }
.ticket-result { display: grid; justify-items: center; gap: .8rem; margin-top: 2rem; text-align: center; }
.ticket-result h2 { margin: 0; }
.ticket-result-icon { display: grid; width: 3.5rem; height: 3.5rem; place-items: center; border: 2px solid var(--gold-l); border-radius: 50%; color: #15172d; background: var(--gold-l); font-size: 1.8rem; font-weight: 900; }
.ticket-result-icon.failed, .ticket-result-icon.cancelled, .ticket-result-icon.expired, .ticket-result-icon.refunded { border-color: #ffb4ab; color: #fff; background: #b42318; }
.ticket-status { color: var(--gold-l); font-weight: 800; }
.ticket-status.failed, .ticket-status.cancelled, .ticket-status.expired, .ticket-status.refunded { color: #ffb4ab; }
.ticket-result p { max-width: 640px; color: var(--mut); line-height: 1.7; }
@media (max-width: 700px) {
  .package-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .package-card { min-height: 0; padding: 1rem; }
  .package-card-top { min-height: 180px; padding: .9rem; }
  .package-price strong { font-size: 1.65rem; }
}
@media (max-width: 560px) {
  .package-grid, .ticket-fields, .payment-grid { grid-template-columns: 1fr; }
  .package-card-top { min-height: 0; }
  .package-card { padding: 1rem; }
  .selected-summary { flex-wrap: wrap; }
  .summary-price { width: 100%; padding-left: 3.2rem; }
  .ticket-modal-overlay { align-items: end; padding: .5rem; }
  .ticket-modal { max-height: 94vh; border-radius: 1rem; }
  .event-summary { align-items: flex-start; }
  .event-summary small { display: block; margin-top: .2rem; }
  .package-count { align-self: flex-end; text-align: right; }
}
</style>
