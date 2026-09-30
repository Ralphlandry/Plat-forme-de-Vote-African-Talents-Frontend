<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const solid = ref(false), open = ref(false)
const on = () => solid.value = scrollY > 40
onMounted(() => { on(); addEventListener('scroll', on, { passive: true }) }); onUnmounted(() => removeEventListener('scroll', on))
</script>
<template>
  <header class="nav" :class="{ solid }">
    <div class="wrap">
      <router-link to="/" aria-label="African Talents — accueil"><img src="/logo.jpg" alt="Logo African Talents" /></router-link>
      <button class="burger" @click="open = !open" :aria-expanded="open">{{ open ? '✕ Fermer' : '☰ Menu' }}</button>
      <nav class="links" :class="{ open }" @click="open = false">
        <router-link to="/">Accueil</router-link><router-link to="/a-propos">À propos</router-link>
        <router-link to="/talents">Talents</router-link><router-link to="/classement">Classement</router-link>
        <router-link to="/#actualites">Actualités</router-link><a href="#contact">Contact</a>
        <router-link to="/talents" class="btn gold">Voter</router-link>
      </nav>
    </div>
  </header>
</template>
