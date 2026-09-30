<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Countdown from '../components/Countdown.vue'
import CandidateCard from '../components/CandidateCard.vue'
import Ranking from '../components/Ranking.vue'
import GallerySlider from '../components/GallerySlider.vue'
import { competition, statusLabel } from '../composables/useCompetition'
import { candidateService, rankingService, categoryService, contentService } from '../services'
import { coaches, contact, gallerySlides, teamMembers } from '../data/content'
const feat = ref([]), ranking = ref([]), cats = ref([]), news = ref([])
const showWhatsapp = ref(false)
const updateWhatsappVisibility = () => { showWhatsapp.value = window.scrollY > 250 }
onMounted(async () => {
  updateWhatsappVisibility()
  window.addEventListener('scroll', updateWhatsappVisibility, { passive: true });
  [ranking.value, cats.value, news.value] = await Promise.all([rankingService.getRanking(), categoryService.getCategories(), contentService.getNews()])
  feat.value = (await candidateService.getCandidates()).slice(0, 4)
})
onUnmounted(() => window.removeEventListener('scroll', updateWhatsappVisibility))
</script>
<template>
  <div class="home-page"><section class="hero">
    <div class="wrap hero-in"><div>
      <span class="chip">{{ statusLabel[competition.status] }}</span>
      <h1 class="gold-text" style="margin-top:1rem">African Talents</h1>
      <h2 style="font-size:clamp(1.4rem,3vw,2.1rem);font-weight:600">La plate-forme où vous êtes impactés pour impacter</h2>
      <p class="lead">La plateforme panafricaine qui révèle, valorise et développe les talents du continent. Découvrez les candidats et soutenez votre favori.</p>
      <div class="cta"><router-link to="/talents" class="btn gold lg">Voter maintenant</router-link><router-link to="/a-propos" class="btn lg">Découvrir African Talents</router-link></div>
      <Countdown v-if="competition.status === 'open'" :target="competition.endsAt" />
    </div><div class="hero-logo"><img src="/logo.jpg" alt="African Talents, la plate-forme où vous êtes impactés pour impacter" fetchpriority="high" /></div></div>
  </section>
  <section class="section alt"><div class="wrap"><div class="title" v-reveal><h2 class="gold-text">Les talents en lice</h2><p>Cliquez sur un profil pour découvrir le parcours du candidat, puis votez.</p></div>
    <div class="grid"><CandidateCard v-for="c in feat" :key="c.id" :c="c" /></div>
    <p style="text-align:center;margin-top:2.5rem"><router-link to="/talents" class="btn">Voir tous les talents</router-link></p></div></section>
  <section class="section"><div class="wrap"><div class="title" v-reveal><h2 class="gold-text">Qui est en tête ?</h2></div><Ranking v-if="ranking.length" :list="ranking" :limit="3" />
    <p style="text-align:center"><router-link to="/classement" class="btn">Classement complet</router-link></p></div></section>
  <section class="section alt"><div class="wrap"><div class="title" v-reveal><h2 class="gold-text">Domaines d'excellence</h2></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))"><router-link v-for="c in cats" :key="c.id" :to="{ path: '/talents', query: { cat: c.id } }" class="card cat" :style="{ backgroundImage: `url(${c.img})` }" v-reveal><span>{{ c.label }}</span></router-link></div></div></section>
  <section class="section gallery-section"><div class="wrap"><div class="title" v-reveal><h2 class="gold-text">African Talents en images</h2><p>Retrouvez les moments forts des différentes phases de la compétition.</p></div><GallerySlider :slides="gallerySlides" /></div></section>
  <section class="section coaches-section"><div class="wrap"><div class="title coaches-title" v-reveal><span class="eyebrow">Nos experts</span><h2><span>Les</span> coachs</h2><p>Des professionnels passionnés qui accompagnent et révèlent les talents d'African Talents.</p></div><div class="coaches-grid"><article v-for="coach in coaches" :key="coach.id" class="coach-card" v-reveal><img :src="coach.image" :alt="`${coach.name}, ${coach.role}`" loading="lazy" /><div><h3>{{ coach.name }}</h3><span>{{ coach.role }}</span></div></article></div></div></section>
  <section class="section team-section"><div class="wrap"><div class="title team-title" v-reveal><span class="eyebrow">Les visages</span><h2><span>Notre</span> équipe</h2><p>Les femmes et les hommes qui portent la vision African Talents.</p></div><div class="team-grid"><article v-for="member in teamMembers" :key="member.id" class="team-card" v-reveal><img :src="member.image" :alt="`${member.name}, ${member.role}`" loading="lazy" /><div><h3>{{ member.name }}</h3><span>{{ member.role }}</span></div></article></div></div></section>
  <section class="section alt" id="actualites"><div class="wrap"><div class="title" v-reveal><h2 class="gold-text">Actualités</h2></div>
    <div class="grid"><router-link v-for="n in news" :key="n.id" :to="`/actualites/${n.id}`" class="card news" v-reveal><img :src="n.img" :alt="n.title" loading="lazy" /><div><small>{{ n.date }}</small><h3>{{ n.title }}</h3><p>{{ n.excerpt }}</p><span class="news-read">Lire l'actualité →</span></div></router-link></div></div></section>
  <a v-if="showWhatsapp" class="whatsapp-float" :href="contact.whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Contacter African Talents sur WhatsApp">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.3h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.5-8.3ZM12.1 21.6a9.8 9.8 0 0 1-5-.0l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.4 3.3Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.8-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.3-.6-.4Z"/></svg>
  </a>
  </div>
</template>

<style scoped>
.whatsapp-float {
  position: fixed;
  right: max(1.25rem, env(safe-area-inset-right));
  bottom: max(1.25rem, env(safe-area-inset-bottom));
  z-index: 20;
  display: grid;
  width: 3.5rem;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 50%;
  background: #20c66b;
  color: #fff;
  box-shadow: 0 5px 18px rgb(0 0 0 / 25%);
  transition: background-color 160ms ease, transform 160ms ease;
}

.whatsapp-float:hover {
  background: #16a958;
  transform: translateY(-2px);
}

.whatsapp-float:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}

.whatsapp-float svg {
  width: 1.8rem;
  height: 1.8rem;
  fill: currentColor;
}
</style>
