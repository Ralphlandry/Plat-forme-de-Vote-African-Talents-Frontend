<script setup>import { contact } from '../data/content'</script>
<template>
  <section class="community-section" id="contact"><div class="wrap community-wrap">
    <div class="community-title"><span class="community-eyebrow">Communauté</span><h2>Rejoignez<br />la communauté</h2><p>Suivez African Talents sur les réseaux et ne manquez aucune actualité.</p></div>
    <div class="community-links">
      <a class="community-link" :href="contact.whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir WhatsApp"><span aria-hidden="true">◔</span>WhatsApp</a>
      <a v-for="phone in contact.phones" :key="phone" class="community-link" :href="`tel:${phone.replace(/ /g, '')}`"><span aria-hidden="true">⌕</span>{{ phone }}</a>
      <a class="community-link" :href="contact.tiktok" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">♪</span>TikTok</a>
      <a class="community-link" :href="contact.facebook" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">●</span>Facebook</a>
      <a class="community-link" :href="contact.youtube" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span>YouTube</a>
    </div>
  </div></section>
  <footer class="foot"><div class="wrap">
    <div class="cols">
      <div><img src="/logo.jpg" alt="African Talents" width="90" height="90" style="border-radius:50%" loading="lazy" />
        <p style="color:var(--mut);margin-top:1rem;max-width:36ch">La plateforme panafricaine qui révèle, valorise et développe les talents du continent.</p></div>
      <ul><li><b class="gold-text">Navigation</b></li><li><router-link to="/a-propos">À propos</router-link></li><li><router-link to="/talents">Talents</router-link></li><li><router-link to="/classement">Classement</router-link></li></ul>
      <ul><li><b class="gold-text">Contact</b></li><li v-for="p in contact.phones" :key="p"><a :href="'tel:' + p.replace(/ /g, '')">{{ p }}</a></li>
        <li><a :href="contact.tiktok" target="_blank" rel="noopener">TikTok</a> · <a :href="contact.facebook" target="_blank" rel="noopener">Facebook</a> · <a :href="contact.youtube" target="_blank" rel="noopener">YouTube</a></li></ul>
    </div>
    <p class="copy">© {{ new Date().getFullYear() }} African Talents. Tous droits réservés.</p>
  </div></footer>
</template>
