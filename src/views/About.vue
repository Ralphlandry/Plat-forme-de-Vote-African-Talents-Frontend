<script setup>
import { ref } from "vue";
import { missions, values } from "../data/content";

const activeValue = ref(null);

function toggleValue(label) {
  activeValue.value = activeValue.value === label ? null : label;
}

function closeValue() {
  activeValue.value = null;
}
</script>
<template>
  <div class="page-top">
    <section class="section">
      <div class="wrap">
        <div class="title" v-reveal>
          <h1 class="gold-text" style="font-size: clamp(2.4rem, 6vw, 4rem)">
            Qui sommes nous
          </h1>
          <p>
            African Talents est une plateforme dédiée à la découverte,
            la valorisation , la formation et le développement des talents
            africains à travers des compétitions et des événements culturels.
          </p>
        </div>
        <div class="detail" style="margin-bottom: 4rem">
          <img class="big" src="/accueil-banner.png" alt="Mission African Talents"
            loading="lazy" style="object-fit: cover; width: 100%" />
          <div v-reveal>
            <h2 class="gold-text">Notre vision</h2>
            <p style="margin-top: 1rem; color: var(--mut)">
              << L'Afrique porte en elle une richesse immense : des talents, des voix et des histoires qui attendent
                d'être révélés.>>   M. Eba'a Roger
            </p>
            <p style="margin-top: 1rem; color: var(--mut)">
              African Talents est né de cette vision — révéler ce qui est caché, accompagner ceux qui osent croire en
                leur potentiel.
            </p>
          </div>
        </div>
        <div class="title mission-title">
          <h2 class="gold-text">Notre mission</h2>
        </div>
        <figure class="mission-banner" v-reveal>
          <img src="/event-5.jpg" alt="Les participants d’une édition précédente d’African Talents" loading="lazy" />
        </figure>
        <div class="mission-grid mission-showcase">
          <div v-for="([t, d], i) in missions" :key="t" class="mission-item" v-reveal>
            <span class="mission-number">{{ String(i + 1).padStart(2, '0') }}</span>
            <svg class="mission-icon" viewBox="0 0 32 32" aria-hidden="true">
              <path v-if="i === 0"
                d="m16 4 3.7 7.5 8.3 1.2-6 5.8 1.4 8.2-7.4-3.9-7.4 3.9 1.4-8.2-6-5.8 8.3-1.2L16 4Z" />
              <path v-else-if="i === 1"
                d="M11 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-8 14v-3a7 7 0 0 1 14 0v3m5-14a4 4 0 1 0-1-7.9m4 21.9v-3a6 6 0 0 0-4.5-5.8" />
              <path v-else-if="i === 2" d="m16 4 12 7-12 7-12-7 12-7Zm-12 12 12 7 12-7M4 22l12 7 12-7" />
              <path v-else-if="i === 3"
                d="M16 29a13 13 0 1 0 0-26 13 13 0 0 0 0 26ZM3 16h26M16 3c4 4.2 4 21.8 0 26M16 3c-4 4.2-4 21.8 0 26" />
              <path v-else-if="i === 4" d="M5 4h17a5 5 0 0 1 5 5v15a4 4 0 0 1-4 4H9a5 5 0 0 1-5-5V4Zm5 9 3 3 6-6" />
              <path v-else d="m16 27-2-2C7 19 3 15 3 10a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 5-4 9-11 15l-2 2Z" />
            </svg>
            <h3>{{ t }}</h3>
            <p>{{ d }}</p>
          </div>
        </div>
        <div class="title" style="margin-top: 4rem">
          <h2 class="gold-text">Nos valeurs</h2>
          <h2 class="gold-text">C.H.R.I.S.T</h2>
          <p>
           Nous sommes convaincus que le développement des talents 
           ne repose pas uniquement sur les compétences, mais aussi sur 
           les valeurs qui construisent des hommes et femmes capables d'avoir un impact durable.
          </p>
        </div>
        <div class="val">
          <div v-for="[l, n, d] in values" :key="l" class="value-item">
            <button type="button" class="card value-card"
              :aria-label="`${n}: ${activeValue === l ? 'masquer' : 'afficher'} la description`"
              :aria-expanded="activeValue === l"
              :aria-controls="`value-description-${l}`"
              @click="toggleValue(l)"
              @keydown.esc="closeValue"
              v-reveal>
              <b class="gold-text">{{ l }}</b>
              <p>{{ n }}</p>
            </button>
            <div :id="`value-description-${l}`" class="value-description"
              :class="{ 'is-open': activeValue === l }"
              :aria-hidden="activeValue !== l">
              <div class="value-description-content">{{ d }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-top {
  padding-top: 4rem;
}

.page-top > .section {
  padding-top: 2.5rem;
}

.mission-banner {
  width: min(1022px, 100%);
  aspect-ratio: 1022 / 300;
  margin: 0 auto 2.5rem;
  overflow: hidden;
  border: 1px solid rgba(231, 181, 42, .55);
  background: #10265b;
  box-shadow: 0 14px 34px rgb(2 8 26 / 20%);
}

.mission-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 32%;
}

.mission-showcase {
  gap: 1rem;
  border: 0;
  background: transparent;
}

.mission-showcase .mission-item {
  min-height: 260px;
  padding: 1.5rem;
  border: 1px solid #d6d9e5;
  border-top: 3px solid #e7b52a;
  background: #f7f8fc;
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}

.mission-showcase .mission-item:hover {
  transform: translateY(-4px);
  border-color: #e7b52a;
  box-shadow: 0 12px 26px rgb(16 38 91 / 10%);
}

.mission-showcase .mission-number {
  top: 1rem;
  right: 1.2rem;
  left: auto;
  color: #d6d9e5;
}

.mission-showcase .mission-icon {
  margin-bottom: 1.25rem;
  color: #b58a1b;
}

.mission-showcase .mission-item h3 {
  color: #10265b;
}

.mission-showcase .mission-item p {
  max-width: 34ch;
  color: #52658f;
  line-height: 1.7;
}

.val {
  align-items: start;
}

.val .value-item {
  min-width: 0;
  align-self: start;
  padding: 0;
  text-align: center;
}

.val .value-card {
  display: block;
  align-self: start;
}

.val .value-description {
  position: static;
  display: grid;
  grid-template-rows: 0fr;
  width: 100%;
  max-height: none;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  visibility: hidden;
  opacity: 0;
  transform: none;
  pointer-events: none;
  transition: grid-template-rows .35s ease, margin .35s ease, padding .35s ease, opacity .2s ease,
    visibility 0s linear .35s;
}

.val .value-description-content {
  display: block;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  white-space: pre-line;
  color: #fff;
  text-align: left;
}

.val .value-description.is-open {
  grid-template-rows: 1fr;
  margin-top: .75rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--gold);
  border-radius: 8px;
  background: #07153a;
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  transition: grid-template-rows .35s ease, margin .35s ease, padding .35s ease, opacity .2s ease,
    visibility 0s;
}

@media (max-width: 520px) {
  .mission-banner {
    aspect-ratio: 4 / 2;
    margin-bottom: 1.5rem;
  }

  .mission-showcase .mission-item {
    min-height: 220px;
  }
}
</style>
