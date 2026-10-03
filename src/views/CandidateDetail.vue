<script setup>
import { ref, watchEffect } from 'vue'
import Avatar from '../components/Avatar.vue'
import Countdown from '../components/Countdown.vue'
import { candidateService, rankingService } from '../services'
import { competition, openShare, openVote, statusLabel } from '../composables/useCompetition'
const props = defineProps({ id: String })
const c = ref(null), rank = ref(null), err = ref('')
const glow = ref({ x: 0, y: 0, visible: false })
function updateGlow(event) {
  if (event.pointerType !== 'mouse') return
  const bounds = event.currentTarget.getBoundingClientRect()
  glow.value = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, visible: true }
}
function hideGlow() {
  glow.value.visible = false
}
watchEffect(async () => {
  c.value = null; err.value = ''
  try { c.value = await candidateService.getCandidate(props.id); rank.value = c.value.rank ?? (await rankingService.getRanking()).find(x => x.slug === props.id)?.rank; document.title = `${c.value.name} · African Talents` }
  catch (e) { err.value = e.message }
})
</script>
<template><div class="page-top candidate-detail-page" @pointermove="updateGlow" @pointerleave="hideGlow">
  <span class="candidate-glow" :class="{ visible: glow.visible }"
    :style="{ transform: `translate3d(${glow.x}px, ${glow.y}px, 0) translate(-50%, -50%)` }" aria-hidden="true"></span>
  <section class="section" style="padding-top:1rem"><div class="wrap">
  <router-link to="/talents" style="color:var(--gold-l)">← Tous les talents</router-link>
  <div v-if="err" class="state">{{ err }}</div><div v-else-if="!c" class="state"><div class="spin"></div></div>
  <div v-else class="detail" style="margin-top:1.5rem">
    <div class="big"><Avatar :c="c" /></div>
    <div><span class="chip">{{ c.categoryName || c.category }} · n°{{ c.code || c.number }}</span>
      <h1 class="gold-text" style="margin:.8rem 0;font-size:clamp(2.3rem,5vw,3.6rem)">{{ c.name }}</h1>
      <p style="color:var(--mut)">{{ c.bio }}</p>
      <div class="facts"><div><b class="gold-text">{{ c.votes.toLocaleString('fr-FR') }}</b>votes</div><div><b class="gold-text">#{{ rank }}</b>classement</div></div>
      <div class="detail-actions"><button class="btn gold lg" :disabled="competition.status !== 'open'" @click="openVote(c)">{{ competition.status === 'open' ? 'Voter pour ce talent' : statusLabel[competition.status] }}</button><button class="btn lg" type="button" @click="openShare(c)">Partager</button></div>
      <Countdown v-if="competition.status === 'open'" :target="competition.endsAt" />
      <div class="gal"><img v-for="g in c.gallery" :key="g" :src="g" :alt="`Galerie de ${c.name}`" loading="lazy" /></div></div></div>
</div></section></div></template>

<style scoped>
.candidate-detail-page {
  position: relative;
  isolation: isolate;
}

.candidate-detail-page > .section {
  position: relative;
  z-index: 1;
}

.candidate-glow {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  width: 28rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(212 167 44 / 23%) 0%, rgb(212 167 44 / 12%) 34%, rgb(212 167 44 / 4%) 62%, transparent 72%);
  filter: blur(18px);
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s ease;
  will-change: transform;
}

.candidate-glow.visible {
  opacity: 1;
}

@media (max-width: 640px) {
  .candidate-glow {
    width: 21rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .candidate-glow {
    transition: none;
  }
}
</style>
