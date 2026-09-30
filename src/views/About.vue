<script setup>
import { missions, values } from "../data/content";
</script>
<template>
  <div class="page-top">
    <section class="section">
      <div class="wrap">
        <div class="title" v-reveal>
          <h1 class="gold-text" style="font-size: clamp(2.4rem, 6vw, 4rem)">
            Une vision africaine
          </h1>
          <p>
            African Talents est dédiée à la découverte, la valorisation et le
            développement des talents africains à travers des compétitions, des
            formations et des événements culturels.
          </p>
        </div>
        <div class="detail" style="margin-bottom: 4rem">
          <img
            class="big"
            src="https://african-talents.vercel.app/images/mission.jpg"
            alt="Mission African Talents"
            loading="lazy"
            style="object-fit: cover; width: 100%"
          />
          <div v-reveal>
            <h2 class="gold-text">Notre vision</h2>
            <p style="margin-top: 1rem; color: var(--mut)">
              Devenir la plateforme africaine de référence pour la découverte,
              la formation et la promotion des talents, avec un écosystème où
              aucun talent ne reste invisible.
            </p>
             <p style="margin-top: 1rem; color: var(--mut)">
              L'Afrique porte en elle une richesse immense : des talents, des voix et des histoires qui attendent d'être révélés.
               African Talents est né de cette vision — révéler ce qui est caché, accompagner ceux qui osent croire en leur potentiel.
            </p>
          </div>
        </div>
        <div class="title mission-title"><h2 class="gold-text">Nos missions</h2></div>
        <div class="mission-grid">
          <div v-for="([t, d], i) in missions" :key="t" class="mission-item" v-reveal>
            <span class="mission-number">{{ String(i + 1).padStart(2, '0') }}</span>
            <svg class="mission-icon" viewBox="0 0 32 32" aria-hidden="true">
              <path v-if="i === 0" d="m16 4 3.7 7.5 8.3 1.2-6 5.8 1.4 8.2-7.4-3.9-7.4 3.9 1.4-8.2-6-5.8 8.3-1.2L16 4Z" />
              <path v-else-if="i === 1" d="M11 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-8 14v-3a7 7 0 0 1 14 0v3m5-14a4 4 0 1 0-1-7.9m4 21.9v-3a6 6 0 0 0-4.5-5.8" />
              <path v-else-if="i === 2" d="m16 4 12 7-12 7-12-7 12-7Zm-12 12 12 7 12-7M4 22l12 7 12-7" />
              <path v-else-if="i === 3" d="M16 29a13 13 0 1 0 0-26 13 13 0 0 0 0 26ZM3 16h26M16 3c4 4.2 4 21.8 0 26M16 3c-4 4.2-4 21.8 0 26" />
              <path v-else-if="i === 4" d="M5 4h17a5 5 0 0 1 5 5v15a4 4 0 0 1-4 4H9a5 5 0 0 1-5-5V4Zm5 9 3 3 6-6" />
              <path v-else d="m16 27-2-2C7 19 3 15 3 10a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 5-4 9-11 15l-2 2Z" />
            </svg>
            <h3>{{ t }}</h3>
            <p>{{ d }}</p>
          </div>
        </div>
        <div class="title" style="margin-top: 4rem">
          <h2 class="gold-text">Nos valeurs C.H.R.I.S.T</h2>
        </div>
        <div class="val">
          <button v-for="[l, n, d] in values" :key="l" type="button" class="card value-card" :aria-label="`${n}: afficher la description`" v-reveal>
            <b class="gold-text">{{ l }}</b>
            <p>{{ n }}</p>
            <span class="value-description">{{ d }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
