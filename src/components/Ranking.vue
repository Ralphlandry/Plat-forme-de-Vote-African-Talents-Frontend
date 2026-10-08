<script setup>
import { computed } from 'vue'
import Avatar from './Avatar.vue'
const props = defineProps({ list: Array, limit: Number })
const ranked = computed(() => (props.list || []).filter((candidate) => Number(candidate.votes) > 0))
const top = computed(() => [ranked.value[1], ranked.value[0], ranked.value[2]].filter(Boolean))
const rest = computed(() => ranked.value.slice(3, props.limit))
const medal = { 1: '1er', 2: '2e', 3: '3e' }
</script>
<template><div>
  <p v-if="!ranked.length" class="state">Le classement apparaîtra dès les premiers votes.</p>
  <template v-else>
  <div class="podium"><router-link v-for="c in top" :key="c.id" :to="`/talents/${c.slug || c.id}`" class="card" :class="'p' + c.rank" v-reveal>
    <div class="medal gold-text">{{ medal[c.rank] }}</div><Avatar :c="c" style="width:90px;height:90px;border-radius:50%;margin:.5rem auto;overflow:hidden;display:block" v-if="c.photo" /><div v-else class="av" style="background:linear-gradient(145deg,#1a3f94,#0b1f52)">{{ c.name[0] }}</div>
    <h3>{{ c.name }}</h3><span class="chip">{{ c.categoryName || c.category }}</span><p style="margin-top:.5rem"><b class="gold-text" style="font-size:1.4rem">{{ c.votes.toLocaleString('fr-FR') }}</b> votes</p></router-link></div>
  <div class="rows"><router-link v-for="c in rest" :key="c.id" :to="`/talents/${c.slug || c.id}`" class="card r"><span>{{ c.rank }}</span><span>{{ c.name }} <small style="color:var(--mut)">· {{ c.categoryName || c.category }}</small></span><b>{{ c.votes.toLocaleString('fr-FR') }}</b></router-link></div>
  </template>
</div></template>
