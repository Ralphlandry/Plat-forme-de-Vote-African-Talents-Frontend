<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import VoteModal from './components/VoteModal.vue'
import ShareModal from './components/ShareModal.vue'
</script>
<template>
  <div class="background-sweep" aria-hidden="true"></div>
  <Navbar />
  <main><router-view v-slot="{ Component }"><transition name="page" mode="out-in"><component :is="Component" /></transition></router-view></main>
  <Footer /><VoteModal /><ShareModal />
</template>
