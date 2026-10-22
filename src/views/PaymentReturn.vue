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
      state.value = 'failed'
      message.value = order.status === 'CANCELLED'
        ? 'Vous avez annulé le paiement. Aucun vote n’a été ajouté.'
        : order.status === 'EXPIRED'
          ? 'Le délai de paiement est dépassé. Aucun vote n’a été ajouté.'
          : 'Le prestataire a refusé ou interrompu la transaction. Aucun vote n’a été ajouté.'
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
    state.value = 'error'
    message.value = error.message || 'Le suivi du paiement est momentanément indisponible.'
  }
}

function retry() {
  window.clearTimeout(timer)
  attempts.value = 0
  state.value = 'loading'
  message.value = 'Nous vérifions la confirmation auprès du prestataire.'
  checkPayment()
}

onMounted(checkPayment)
onUnmounted(() => window.clearTimeout(timer))
</script>

<template>
  <section class="payment-return" :class="`is-${state}`" aria-labelledby="payment-return-title">
    <div class="payment-return-card" aria-live="polite">
      <div v-if="state === 'loading'" class="spin payment-wait-spinner" aria-label="Vérification en cours"></div>
      <div v-else class="payment-return-icon" :class="state" aria-hidden="true">
        {{ state === 'success' ? '✓' : state === 'failed' || state === 'error' ? '×' : '…' }}
      </div>
      <span class="payment-return-eyebrow">African Talents · Paiement sécurisé</span>
      <h1 id="payment-return-title">
        {{ state === 'success' ? 'Paiement confirmé' : state === 'failed' ? 'Paiement non abouti' : state === 'error' ? 'Vérification impossible' : state === 'pending' ? 'Paiement en attente' : 'Vérification du paiement' }}
      </h1>
      <p class="payment-return-message">{{ message }}</p>
      <div v-if="orderNumber" class="payment-return-reference">
        <span>Référence de commande</span>
        <strong>{{ orderNumber }}</strong>
      </div>
      <p v-if="state === 'failed'" class="payment-return-note">
        Si ton compte a été débité malgré ce message, ne relance pas le paiement tout de suite. Contacte notre équipe avec la référence ci-dessus.
      </p>
      <div class="payment-return-actions">
        <button v-if="state === 'pending' || state === 'error'" class="btn gold" type="button" @click="retry">
          Vérifier à nouveau
        </button>
        <RouterLink v-if="state === 'failed'" class="btn gold" to="/candidats">Retour aux candidats</RouterLink>
        <RouterLink class="btn payment-return-home" to="/">Retour à l’accueil</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.payment-return{display:grid;min-height:min(68vh,48rem);place-items:center;padding:clamp(2rem,7vh,5rem) 1rem;background:radial-gradient(ellipse at 50% 0,rgba(35,63,119,.44),transparent 62%),var(--bg)}
.payment-return-card{display:grid;justify-items:center;gap:1.1rem;width:min(38rem,100%);padding:clamp(1.5rem,5vw,3rem);border:1px solid rgba(212,167,44,.38);background:linear-gradient(155deg,rgba(20,43,89,.96),rgba(7,19,46,.98));box-shadow:0 1.5rem 4rem rgba(0,0,0,.22);color:#fff;text-align:center}
.payment-return-eyebrow{color:var(--gold-l);font-size:.7rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
.payment-return-card h1{margin:0;font:700 clamp(1.45rem,4vw,2rem)/1.2 Outfit,system-ui,sans-serif}
.payment-return-message{max-width:42ch;margin:0;color:#d5dcef;line-height:1.7}
.payment-return-reference{display:grid;gap:.35rem;width:min(22rem,100%);padding:.85rem 1rem;border:1px solid rgba(255,255,255,.1);background:rgba(3,12,31,.35)}
.payment-return-reference span{color:#aebbd8;font-size:.75rem}
.payment-return-reference strong{color:var(--gold-l);font-size:.95rem;letter-spacing:.04em;overflow-wrap:anywhere}
.payment-return-note{max-width:48ch;margin:0;padding:.8rem 1rem;border-left:3px solid #e1b945;background:rgba(225,185,69,.09);color:#f0e5c3;font-size:.85rem;line-height:1.6;text-align:left}
.payment-return-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:.75rem;margin-top:.35rem}
.payment-return-home{border:1px solid rgba(255,255,255,.35);color:#fff}
.payment-return-icon{display:grid;width:3.5rem;height:3.5rem;place-items:center;border-radius:50%;font-size:1.7rem;font-weight:800}
.payment-return-icon.success{background:#123d30;color:#22dca5}
.payment-return-icon.failed,.payment-return-icon.error{background:#421c20;color:#ff8c8c}
.payment-return-icon.pending{background:#3a321b;color:var(--gold-l)}
@media(max-width:480px){.payment-return{min-height:60vh}.payment-return-card{gap:.9rem}.payment-return-actions{width:100%;flex-direction:column}.payment-return-actions .btn{width:100%}}
</style>
