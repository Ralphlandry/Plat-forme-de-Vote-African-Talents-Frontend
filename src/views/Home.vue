<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Countdown from '../components/Countdown.vue'
import Ranking from '../components/Ranking.vue'
import GallerySlider from '../components/GallerySlider.vue'
import { competition, statusLabel } from '../composables/useCompetition'
import { rankingService, categoryService, contentService } from '../services'
import { contact, gallerySlides } from '../data/content'
const ranking = ref([]), cats = ref([]), news = ref([]), coaches = ref([]), teamMembers = ref([]), partners = ref([])
const showWhatsapp = ref(false)
const updateWhatsappVisibility = () => { showWhatsapp.value = window.scrollY > 250 }
onMounted(async () => {
  updateWhatsappVisibility()
  window.addEventListener('scroll', updateWhatsappVisibility, { passive: true });
  [ranking.value, cats.value, news.value, coaches.value, teamMembers.value, partners.value] = await Promise.all([
    rankingService.getRanking(), categoryService.getCategories(), contentService.getNews(),
    contentService.getTeam('coach'), contentService.getTeam('team'), contentService.getPartners(),
  ])
})
onUnmounted(() => window.removeEventListener('scroll', updateWhatsappVisibility))
</script>
<template>
  <div class="home-page">
    <section class="hero">
      <div class="wrap hero-in">
        <div>
          <span class="chip">{{ statusLabel[competition.status] }}</span>
          <h1 class="gold-text" style="margin-top:1rem">African Talents</h1>
          <h2 style="font-size:clamp(1.4rem,3vw,2.1rem);font-weight:600">La plate-forme où vous êtes impactés pour
            impacter</h2>
          <p class="lead">La plateforme panafricaine qui révèle, valorise et développe les talents du continent.
            Découvrez les candidats et soutenez votre favori.</p>
          <div class="cta"><router-link to="/talents" class="btn gold lg">Voter maintenant</router-link><router-link
              to="/a-propos" class="btn lg">Découvrir African Talents</router-link></div>
          <Countdown v-if="competition.status === 'open'" :target="competition.endsAt" />
        </div>
        <div class="hero-logo"><img src="/logo.jpg"
            alt="African Talents, la plate-forme où vous êtes impactés pour impacter" fetchpriority="high" /></div>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="title" v-reveal>
          <h2 class="gold-text">Qui est en tête ?</h2>
        </div>
        <Ranking v-if="ranking.length" :list="ranking" :limit="3" />
        <p style="text-align:center"><router-link to="/classement" class="btn">Classement complet</router-link></p>
      </div>
    </section>
    <section class="scene-programs">
      <div class="wrap scene-programs-inner">
        <div class="scene-programs-heading" v-reveal>
          <span class="scene-programs-eyebrow">Nos programmes</span>
          <h2><span>Une scène</span><strong>panafricaine</strong></h2>
        </div>
        <div class="scene-programs-copy" v-reveal>
          <blockquote>« J'ai la conviction profonde que la transformation commence par ce que nous portons en nous. »</blockquote>
          <p>À travers des compétitions, des programmes d'accompagnement, des événements et une communauté engagée, African Talents met en lumière les talents issus de différents domaines. La plateforme offre une véritable vitrine aux jeunes talents en leur permettant de révéler leur potentiel et d'accéder à de nouvelles opportunités.</p>
        </div>
      </div>
    </section>
    <section class="section alt">
      <div class="wrap">
        <div class="title" v-reveal>
          <h2 class="gold-text">Les catégories</h2>
          <p>{{ cats.length }} catégorie{{ cats.length === 1 ? '' : 's' }} · Choisissez et soutenez vos nominés.</p>
        </div>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))"><router-link
            v-for="c in cats" :key="c.id" :to="{ path: '/talents', query: { cat: c.id } }" class="card cat"
            :style="{ backgroundImage: `url(${c.img})` }" v-reveal><span>{{ c.label }}</span></router-link></div>
      </div>
    </section>
    <section class="section gallery-section">
      <div class="wrap">
        <div class="title" v-reveal>
          <h2 class="gold-text">African Talents en images</h2>
          <p>Retrouvez les moments forts des différentes phases de la compétition.</p>
        </div>
        <GallerySlider :slides="gallerySlides" />
      </div>
    </section>
    <section class="section coaches-section">
      <div class="wrap">
        <div class="title coaches-title" v-reveal><span class="eyebrow">Nos experts</span>
          <h2><span>Les</span> coachs</h2>
          <p>Des professionnels passionnés qui accompagnent et révèlent les talents d'African Talents.</p>
        </div>
        <div class="coaches-grid">
          <article v-for="coach in coaches" :key="coach.id" class="coach-card" v-reveal><img :src="coach.image"
              :alt="`${coach.name}, ${coach.role}`" loading="lazy" />
            <div>
              <h3>{{ coach.name }}</h3><span>{{ coach.role }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
    <section class="section team-section">
      <div class="wrap">
        <div class="title team-title" v-reveal><span class="eyebrow">Les visages</span>
          <h2><span>Notre</span> équipe</h2>
          <p>Les femmes et les hommes qui portent la vision African Talents.</p>
        </div>
        <div class="team-grid">
          <article v-for="member in teamMembers" :key="member.id" class="team-card" v-reveal><img :src="member.image"
              :alt="`${member.name}, ${member.role}`" loading="lazy" />
            <div>
              <h3>{{ member.name }}</h3><span>{{ member.role }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
    <section v-if="partners.length" class="partners-section">
      <div class="wrap">
        <div class="partners-heading" v-reveal>
          <h2>Nos Partenaires</h2>
          <p>Ils nous soutiennent</p>
        </div>
        <div class="partners-list">
          <div v-for="partner in partners" :key="partner.id" class="partner-mark" v-reveal>
            <img :src="partner.logo" :alt="partner.name" loading="lazy" />
            <span>{{ partner.name }}</span>
          </div>
        </div>
      </div>
    </section>
    <section class="section alt" id="actualites">
      <div class="wrap">
        <div class="title" v-reveal>
          <h2 class="gold-text">Actualités</h2>
        </div>
        <div class="grid"><router-link v-for="n in news" :key="n.id" :to="`/actualites/${n.id}`" class="card news"
            v-reveal><img :src="n.img" :alt="n.title" loading="lazy" />
            <div><small>{{ n.date }}</small>
              <h3>{{ n.title }}</h3>
              <p>{{ n.excerpt }}</p><span class="news-read">Lire l'actualité →</span>
            </div>
          </router-link></div>
      </div>
    </section>
    <a v-if="showWhatsapp" class="whatsapp-float" :href="contact.whatsapp" target="_blank" rel="noopener noreferrer"
      aria-label="Contacter African Talents sur WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.3h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.5-8.3ZM12.1 21.6a9.8 9.8 0 0 1-5-.0l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.4 3.3Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.8-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.3-.6-.4Z" />
      </svg>
    </a>
  </div>
</template>

<style scoped>
.scene-programs {
  padding: 3.5rem 0;
  background: #10265b;
  color: #fff;
}

.scene-programs-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 3rem;
  align-items: center;
}

.scene-programs-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: .7rem;
  margin-bottom: 1.5rem;
  color: #e7b52a;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.scene-programs-eyebrow::before {
  width: 1.75rem;
  height: 2px;
  background: #e7b52a;
  content: "";
}

.scene-programs-heading h2 {
  display: grid;
  margin: 0;
  font: 500 3.5rem/1.02 'Cormorant Garamond', serif;
  text-transform: uppercase;
}

.scene-programs-heading h2 span {
  color: #fff;
}

.scene-programs-heading h2 strong {
  color: #e7b52a;
  font-weight: 600;
}

.scene-programs-copy blockquote {
  margin: 0;
  padding: .25rem 0 .25rem 1.7rem;
  border-left: 3px solid #e7b52a;
  color: #fff;
  font: italic 1.45rem/1.55 'Cormorant Garamond', serif;
}

.scene-programs-copy p {
  margin: 1.5rem 0 0;
  color: #d9e0f0;
  font-size: .98rem;
  line-height: 1.8;
}

.partners-section {
  padding: 3.5rem 0;
  background: #fff;
  color: #0b1f52;
}

.partners-heading {
  margin-bottom: 2rem;
  text-align: center;
}

.partners-heading h2 {
  color: #0b1f52;
  font-size: 2rem;
}

.partners-heading p {
  margin-top: 0.35rem;
  color: #52658f;
}

.partners-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
}

.partner-mark {
  display: grid;
  width: min(180px, calc(50% - 0.75rem));
  min-height: 130px;
  align-content: center;
  justify-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e7f0;
  border-radius: 6px;
  background: #fff;
  text-align: center;
}

.partner-mark img {
  width: 100%;
  height: 64px;
  object-fit: contain;
}

.partner-mark span {
  color: #0b1f52;
  font-size: 0.88rem;
  font-weight: 600;
}

@media (max-width: 700px) {
  .scene-programs {
    padding: 3rem 0;
  }

  .scene-programs-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .scene-programs-heading h2 {
    font-size: 2.75rem;
  }

  .scene-programs-copy blockquote {
    padding-left: 1.1rem;
    font-size: 1.3rem;
  }
}

@media (max-width: 500px) {
  .partner-mark {
    width: calc(50% - 0.65rem);
    min-height: 112px;
    padding: 0.7rem;
  }
}

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
