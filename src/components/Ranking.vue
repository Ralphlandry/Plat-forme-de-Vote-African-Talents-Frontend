<script setup>
import { computed } from 'vue'
import Avatar from './Avatar.vue'
import { categories } from '../data/categories'
const props = defineProps({ list: Array, limit: Number })
const cat = id => categories.find(x => x.id === id)?.label
const top = computed(() => [props.list[1], props.list[0], props.list[2]].filter(Boolean))
const rest = computed(() => props.list.slice(3, props.limit))
const medal = { 1: '1er', 2: '2e', 3: '3e' }
</script>
<template><div>
  <div class="podium"><router-link v-for="c in top" :key="c.id" :to="`/talents/${c.id}`" class="card" :class="'p' + c.rank" v-reveal>
    <div class="medal gold-text">{{ medal[c.rank] }}</div><Avatar :c="c" style="width:90px;height:90px;border-radius:50%;margin:.5rem auto;overflow:hidden;display:block" v-if="c.photo" /><div v-else class="av" style="background:linear-gradient(145deg,#1a3f94,#0b1f52)">{{ c.name[0] }}</div>
    <h3>{{ c.name }}</h3><span class="chip">{{ cat(c.category) }}</span><p style="margin-top:.5rem"><b class="gold-text" style="font-size:1.4rem">{{ c.votes.toLocaleString('fr-FR') }}</b> votes</p></router-link></div>
  <div class="rows"><router-link v-for="c in rest" :key="c.id" :to="`/talents/${c.id}`" class="card r"><span>{{ c.rank }}</span><span>{{ c.name }} <small style="color:var(--mut)">· {{ cat(c.category) }}</small></span><b>{{ c.votes.toLocaleString('fr-FR') }}</b></router-link></div>
</div></template>
