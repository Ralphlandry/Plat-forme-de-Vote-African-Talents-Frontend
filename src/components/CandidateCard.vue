<script setup>
import Avatar from './Avatar.vue'
import { openVote, openShare, competition } from '../composables/useCompetition'
defineProps({ c: Object })
</script>
<template>
  <article class="card cand" v-reveal>
    <div class="ph">
      <router-link class="candidate-photo-link" :to="`/talents/${c.slug || c.id}`" :aria-label="`Profil de ${c.name}`">
        <Avatar :c="c" />
        <div class="candidate-overlay">
          <span class="chip">{{ c.categoryName || c.category }}</span>
          <h3>{{ c.name }}</h3>
          <span class="candidate-code">{{ c.code || `AT-${String(c.number).padStart(3, '0')}` }}</span>
        </div>
      </router-link>
      <button class="share-icon" type="button" :aria-label="`Partager ${c.name}`" title="Partager" @click="openShare(c)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/></svg></button>
    </div>
    <div class="body candidate-body">
      <div class="row"><span>Votes</span><b>{{ c.votes.toLocaleString('fr-FR') }}</b></div>
      <div class="acts"><router-link :to="`/talents/${c.slug || c.id}`" class="btn">Profil</router-link>
        <button class="btn gold" :disabled="competition.status !== 'open'" @click="openVote(c)">Voter</button></div></div>
  </article>
</template>

<style scoped>
.cand .ph {
  aspect-ratio: 3 / 3.2;
}

.candidate-photo-link {
  position: relative;
  isolation: isolate;
}

.candidate-photo-link::after {
  position: absolute;
  z-index: 0;
  inset: 30% 0 0;
  background: linear-gradient(transparent, rgb(3 9 25 / 92%));
  content: '';
  pointer-events: none;
}

.candidate-overlay {
  position: absolute;
  z-index: 1;
  right: 1rem;
  bottom: 0.9rem;
  left: 1rem;
  color: #fff;
  text-align: left;
}

.candidate-overlay .chip {
  padding: 0.2rem 0.65rem;
  font-size: 0.72rem;
}

.candidate-overlay h3 {
  margin-top: 0.45rem;
  font-size: 1.55rem;
  line-height: 1;
}

.candidate-code {
  display: block;
  margin-top: 0.25rem;
  color: var(--gold-l);
  font-size: 0.76rem;
  font-weight: 700;
}

.candidate-overlay p {
  margin-top: 0.2rem;
  color: rgb(238 242 255 / 82%);
  font-size: 0.82rem;
  line-height: 1.3;
}

.candidate-body {
  padding: 0.65rem 1rem 1rem !important;
}

.cand .row {
  margin: 0 0 0.55rem;
}

.cand .acts {
  gap: 0.55rem;
}

.cand .acts .btn {
  min-width: 0;
  padding: 0.58rem 0.35rem;
  font-size: 0.88rem;
}

.cand:hover .candidate-overlay {
  transform: none;
}

@media (max-width: 380px) {
  .candidate-overlay h3 {
    font-size: 1.35rem;
  }
}
</style>
