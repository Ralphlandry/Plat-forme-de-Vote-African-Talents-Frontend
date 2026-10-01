<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CandidateCard from '../components/CandidateCard.vue'
import { candidateService, categoryService } from '../services'
import { competition, statusLabel } from '../composables/useCompetition'
const route = useRoute()
const list = ref([]), cats = ref([]), loading = ref(true), q = ref(''), cat = ref(route.query.cat || 'all'), sort = ref('votes'), shown = ref(8)
const glow = ref({ x: 0, y: 0, visible: false })
function updateGlow(event) {
  if (event.pointerType !== 'mouse') return
  const bounds = event.currentTarget.getBoundingClientRect()
  glow.value = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, visible: true }
}
function hideGlow() {
  glow.value.visible = false
}
onMounted(async () => { [list.value, cats.value] = await Promise.all([candidateService.getCandidates(), categoryService.getCategories()]); loading.value = false })
const out = computed(() => list.value.filter(c => (cat.value === 'all' || c.category === cat.value) && c.name.toLowerCase().includes(q.value.toLowerCase()))
  .sort((a, b) => sort.value === 'votes' ? b.votes - a.votes : sort.value === 'name' ? a.name.localeCompare(b.name) : a.number - b.number))
</script>
<template><div class="page-top talents-page" @pointermove="updateGlow" @pointerleave="hideGlow">
  <span class="talent-glow" :class="{ visible: glow.visible }"
    :style="{ transform: `translate3d(${glow.x}px, ${glow.y}px, 0) translate(-50%, -50%)` }" aria-hidden="true"></span>
  <section class="section" style="padding-top:1rem"><div class="wrap">
  <div class="title"><h1 class="gold-text" style="font-size:clamp(2.4rem,6vw,4rem)">Vote pour ton favori</h1><p>Choisissez un candidat, consultez son profil, puis votez.</p></div>
  <div v-if="competition.status !== 'open'" class="notice">{{ statusLabel[competition.status] }} — le vote n'est pas disponible pour le moment.</div>
  <div class="bar"><input v-model="q" type="search" placeholder="Rechercher un talent…" aria-label="Rechercher" />
    <select v-model="sort" aria-label="Trier"><option value="votes">Plus de votes</option><option value="name">Nom (A–Z)</option><option value="number">Numéro</option></select></div>
  <div class="filters"><button class="chip" :class="{ on: cat === 'all' }" @click="cat = 'all'">Tous</button>
    <button v-for="c in cats" :key="c.id" class="chip" :class="{ on: cat === c.id }" @click="cat = c.id">{{ c.label }}</button></div>
  <div v-if="loading" class="state"><div class="spin"></div>Chargement des talents…</div>
  <div v-else-if="!out.length" class="state">Aucun talent ne correspond. <button class="btn" @click="q = ''; cat = 'all'">Réinitialiser les filtres</button></div>
  <div v-else class="grid"><CandidateCard v-for="c in out.slice(0, shown)" :key="c.id" :c="c" /></div>
  <p v-if="out.length > shown" style="text-align:center;margin-top:2rem"><button class="btn" @click="shown += 8">Afficher plus</button></p>
</div></section></div></template>

<style scoped>
.page-top.talents-page {
  position: relative;
  padding-top: 4rem;
  isolation: isolate;
}

.talents-page > .section {
  position: relative;
  z-index: 1;
}

.talent-glow {
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

.talent-glow.visible {
  opacity: 1;
}

@media (max-width: 640px) {
  .talent-glow {
    width: 21rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .talent-glow {
    transition: none;
  }
}
</style>
