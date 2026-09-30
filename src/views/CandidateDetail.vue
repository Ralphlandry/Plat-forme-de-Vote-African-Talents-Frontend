<script setup>
import { ref, watchEffect } from 'vue'
import Avatar from '../components/Avatar.vue'
import Countdown from '../components/Countdown.vue'
import { candidateService, rankingService } from '../services'
import { competition, openShare, openVote, statusLabel } from '../composables/useCompetition'
import { categories } from '../data/categories'
const props = defineProps({ id: String })
const c = ref(null), rank = ref(null), err = ref('')
watchEffect(async () => {
  c.value = null; err.value = ''
  try { c.value = await candidateService.getCandidate(props.id); rank.value = (await rankingService.getRanking()).find(x => x.id === props.id)?.rank; document.title = `${c.value.name} · African Talents` }
  catch (e) { err.value = e.message }
})
</script>
<template><div class="page-top"><section class="section" style="padding-top:1rem"><div class="wrap">
  <router-link to="/talents" style="color:var(--gold-l)">← Tous les talents</router-link>
  <div v-if="err" class="state">{{ err }}</div><div v-else-if="!c" class="state"><div class="spin"></div></div>
  <div v-else class="detail" style="margin-top:1.5rem">
    <div class="big"><Avatar :c="c" /></div>
    <div><span class="chip">{{ categories.find(x => x.id === c.category)?.label }} · n°{{ c.number }}</span>
      <h1 class="gold-text" style="margin:.8rem 0;font-size:clamp(2.3rem,5vw,3.6rem)">{{ c.name }}</h1>
      <p style="color:var(--mut)">{{ c.bio }}</p>
      <div class="facts"><div><b class="gold-text">{{ c.votes.toLocaleString('fr-FR') }}</b>votes</div><div><b class="gold-text">#{{ rank }}</b>classement</div></div>
      <div class="detail-actions"><button class="btn gold lg" :disabled="competition.status !== 'open'" @click="openVote(c)">{{ competition.status === 'open' ? 'Voter pour ce talent' : statusLabel[competition.status] }}</button><button class="btn lg" type="button" @click="openShare(c)">Partager</button></div>
      <Countdown v-if="competition.status === 'open'" :target="competition.endsAt" />
      <div class="gal"><img v-for="g in c.gallery" :key="g" :src="g" :alt="`Galerie de ${c.name}`" loading="lazy" /></div></div></div>
</div></section></div></template>
