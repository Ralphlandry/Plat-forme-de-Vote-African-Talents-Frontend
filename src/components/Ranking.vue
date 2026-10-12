<script setup>
import { computed } from 'vue'
import Avatar from './Avatar.vue'
const props = defineProps({ list: Array, limit: Number })
const ranked = computed(() => (props.list || []).filter((candidate) => Number(candidate.votes) > 0))
const totalVotes = computed(() => ranked.value.reduce((total, candidate) => total + Number(candidate.votes || 0), 0))
const top = computed(() => [ranked.value[1], ranked.value[0], ranked.value[2]].filter(Boolean))
const rest = computed(() => ranked.value.slice(3, props.limit))
const voteShare = candidate => totalVotes.value ? (Number(candidate.votes) / totalVotes.value * 100).toFixed(1) : '0.0'
const medalLabel = { 1: 'Médaille d’or', 2: 'Médaille d’argent', 3: 'Médaille de bronze' }
</script>
<template><div>
  <p v-if="!ranked.length" class="state">Le classement apparaîtra dès les premiers votes.</p>
  <template v-else>
  <div class="podium">
    <router-link v-for="c in top" :key="c.id" :to="`/candidats/${c.slug || c.id}`" class="podium-place" :class="`place-${c.rank}`" v-reveal>
      <div class="podium-photo-wrap">
        <span v-if="c.rank === 1" class="podium-crown" aria-label="Couronne du premier">👑</span>
        <div class="podium-photo"><Avatar :c="c" /></div>
        <span class="podium-medal" :class="`medal-${c.rank}`" :aria-label="medalLabel[c.rank]">{{ c.rank }}</span>
      </div>
      <h3>{{ c.name }}</h3>
      <span class="podium-category">{{ c.categoryName || c.category }}</span>
      <strong class="podium-votes">{{ Number(c.votes).toLocaleString('fr-FR') }}</strong>
      <span class="podium-share">{{ voteShare(c) }}%</span>
      <div class="podium-step" :aria-label="`${c.rank}${c.rank === 1 ? 'er' : 'e'} place`"><span>{{ c.rank }}</span></div>
    </router-link>
  </div>
  <div class="rows"><router-link v-for="c in rest" :key="c.id" :to="`/candidats/${c.slug || c.id}`" class="card r">
    <span>{{ c.rank }}</span><span>{{ c.name }} <small style="color:var(--mut)">· {{ c.categoryName || c.category }}</small></span>
    <b>{{ Number(c.votes).toLocaleString('fr-FR') }} votes</b><span class="ranking-share">{{ voteShare(c) }}%</span>
  </router-link></div>
  </template>
</div></template>
