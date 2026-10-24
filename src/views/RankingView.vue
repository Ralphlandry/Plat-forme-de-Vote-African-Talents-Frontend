<script setup>
import { onMounted, ref, watch } from 'vue'
import Ranking from '../components/Ranking.vue'
import Countdown from '../components/Countdown.vue'
import { categoryService, rankingService } from '../services'
import { competition } from '../composables/useCompetition'
const list = ref([])
const categories = ref([])
const selectedCategory = ref('')
const loading = ref(true)
const error = ref('')

async function loadRanking() {
  loading.value = true
  error.value = ''
  try {
    list.value = await rankingService.getRanking(selectedCategory.value)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Impossible de charger le classement.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    categories.value = await categoryService.getCategories()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Impossible de charger les catégories.'
  }
  await loadRanking()
})

watch(selectedCategory, loadRanking)
</script>
<template><div class="page-top"><section class="section" style="padding-top:1rem"><div class="wrap">
  <div class="title"><h1 class="gold-text" style="font-size:clamp(2.4rem,6vw,4rem)">Classement</h1><Countdown v-if="competition.status === 'open'" :target="competition.endsAt" style="display:flex;flex-direction:column;align-items:center" /></div>
  <div class="ranking-filter">
    <label for="ranking-category">Filtrer par catégorie</label>
    <select id="ranking-category" v-model="selectedCategory">
      <option value="">Toutes les catégories</option>
      <option v-for="category in categories" :key="category.id" :value="category.slug">{{ category.name }}</option>
    </select>
  </div>
  <div v-if="loading" class="state"><div class="spin"></div></div>
  <div v-else-if="error" class="state" role="alert">{{ error }}</div>
  <Ranking v-else :list="list" />
</div></section></div></template>

<style scoped>
.ranking-filter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: .75rem;
  margin: 1rem 0 1.5rem;
  color: var(--mut);
  font-size: .9rem;
}

.ranking-filter select {
  min-width: 13rem;
  padding: .65rem .8rem;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: .6rem;
  background: var(--navy, #101b35);
  color: inherit;
}

@media (max-width: 520px) {
  .ranking-filter {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
