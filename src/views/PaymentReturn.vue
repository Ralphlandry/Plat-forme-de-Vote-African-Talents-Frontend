<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { voteService } from '../services'

const route = useRoute()
const orderNumber = String(route.query.order_number || '')
const state = ref('loading')
const message = ref('Nous vérifions la confirmation auprès du prestataire.')
const attempts = ref(0)
let timer

async function checkPayment() {
  if (!orderNumber) {
    state.value = 'error'
    message.value = 'La référence de commande est absente.'
    return
  }
  try {
    const order = await voteService.getOrderStatus(orderNumber)
    if (order.status === 'PAID') {
      state.value = 'success'
      message.value = `Votre paiement est confirmé. ${order.quantity} vote(s) ont été ajoutés pour ${order.candidate_name}.`
      return
    }
    if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
      state.value = 'error'
      message.value = `Le paiement n’a pas été confirmé (${order.status.toLowerCase()}). Aucun vote n’a été ajouté.`
      return
    }
    attempts.value += 1
    if (attempts.value >= 40) {
      state.value = 'pending'
      message.value = 'Le paiement est toujours en attente. Vous pouvez vérifier à nouveau dans quelques instants.'
      return
    }
    timer = window.setTimeout(checkPayment, 3000)
  } catch (error) {
    state.value = 'pending'
    message.value = error.message || 'Le suivi du paiement est momentanément indisponible.'
  }
}

function retry() {
  attempts.value = 0
  state.value = 'loading'
  checkPayment()
}

onMounted(checkPayment)
onUnmounted(() => window.clearTimeout(timer))
</script>

<template>
  <section class="payment-return">
    <div class="payment-return-card">
      <div v-if="state === 'loading'" class="spin payment-wait-spinner"></div>
      <div v-else class="payment-return-icon" :class="state">{{ state === 'success' ? '✓' : state === 'error' ? '×' : '…' }}</div>
      <h1>{{ state === 'success' ? 'Paiement confirmé' : state === 'error' ? 'Paiement non confirmé' : 'Vérification du paiement' }}</h1>
      <p>{{ message }}</p>
      <small v-if="orderNumber">Référence : {{ orderNumber }}</small>
      <button v-if="state === 'pending' || state === 'error'" class="btn gold" type="button" @click="retry">Vérifier à nouveau</button>
      <RouterLink class="btn" to="/">Retour au site</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.payment-return{display:grid;min-height:55vh;place-items:center;padding:2rem 1rem}
.payment-return-card{display:grid;justify-items:center;gap:1rem;width:min(34rem,100%);padding:2rem;border:1px solid rgba(212,167,44,.4);background:linear-gradient(160deg,var(--bg3),var(--bg));color:#fff;text-align:center}
.payment-return-card h1{font:700 1.35rem/1.2 Outfit,system-ui,sans-serif}
.payment-return-card p{color:var(--mut);line-height:1.6}
.payment-return-card small{color:var(--mut)}
.payment-return-icon{display:grid;width:3rem;height:3rem;place-items:center;border-radius:50%;font-size:1.5rem;font-weight:800}
.payment-return-icon.success{background:#123d30;color:#22dca5}
.payment-return-icon.error{background:#421c20;color:#ff8c8c}
.payment-return-icon.pending{background:#3a321b;color:var(--gold-l)}
</style>
