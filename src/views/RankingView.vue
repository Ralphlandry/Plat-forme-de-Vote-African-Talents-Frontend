<script setup>
import { ref, onMounted } from 'vue'
import Ranking from '../components/Ranking.vue'
import Countdown from '../components/Countdown.vue'
import { rankingService } from '../services'
import { competition } from '../composables/useCompetition'
const list = ref([])
onMounted(async () => list.value = await rankingService.getRanking())
</script>
<template><div class="page-top"><section class="section" style="padding-top:1rem"><div class="wrap">
  <div class="title"><h1 class="gold-text" style="font-size:clamp(2.4rem,6vw,4rem)">Classement</h1><Countdown v-if="competition.status === 'open'" :target="competition.endsAt" style="display:flex;flex-direction:column;align-items:center" /></div>
  <div v-if="!list.length" class="state"><div class="spin"></div></div><Ranking v-else :list="list" />
</div></section></div></template>
