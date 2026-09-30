<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CandidateCard from '../components/CandidateCard.vue'
import { candidateService, categoryService } from '../services'
import { competition, statusLabel } from '../composables/useCompetition'
const route = useRoute()
const list = ref([]), cats = ref([]), loading = ref(true), q = ref(''), cat = ref(route.query.cat || 'all'), sort = ref('votes'), shown = ref(8)
onMounted(async () => { [list.value, cats.value] = await Promise.all([candidateService.getCandidates(), categoryService.getCategories()]); loading.value = false })
const out = computed(() => list.value.filter(c => (cat.value === 'all' || c.category === cat.value) && c.name.toLowerCase().includes(q.value.toLowerCase()))
  .sort((a, b) => sort.value === 'votes' ? b.votes - a.votes : sort.value === 'name' ? a.name.localeCompare(b.name) : a.number - b.number))
</script>
<template><div class="page-top"><section class="section" style="padding-top:1rem"><div class="wrap">
  <div class="title"><h1 class="gold-text" style="font-size:clamp(2.4rem,6vw,4rem)">Les talents</h1><p>Choisissez un candidat, consultez son profil, puis votez.</p></div>
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
