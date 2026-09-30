<script setup>
import Avatar from './Avatar.vue'
import { openVote, openShare, competition } from '../composables/useCompetition'
import { categories } from '../data/categories'
defineProps({ c: Object })
const cat = id => categories.find(x => x.id === id)?.label
</script>
<template>
  <article class="card cand" v-reveal>
    <div class="ph"><router-link :to="`/talents/${c.id}`" :aria-label="`Profil de ${c.name}`"><Avatar :c="c" /><span class="num">{{ c.number }}</span></router-link><button class="share-icon" type="button" :aria-label="`Partager ${c.name}`" title="Partager" @click="openShare(c)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/></svg></button></div>
    <div class="body"><span class="chip">{{ cat(c.category) }}</span><h3 style="margin-top:.6rem">{{ c.name }}</h3>
      <p style="color:var(--mut);font-size:.92rem">{{ c.tagline }}</p>
      <div class="row"><span>Votes</span><b>{{ c.votes.toLocaleString('fr-FR') }}</b></div>
      <div class="acts"><router-link :to="`/talents/${c.id}`" class="btn">Profil</router-link>
        <button class="btn gold" :disabled="competition.status !== 'open'" @click="openVote(c)">Voter</button></div></div>
  </article>
</template>
