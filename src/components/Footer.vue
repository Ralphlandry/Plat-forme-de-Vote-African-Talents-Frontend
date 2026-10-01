<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { categories } from '../data/categories'
import { contact } from '../data/content'

const route = useRoute()
const auditionForm = ref({ name: '', phone: '', email: '', location: '', category: '', presentation: '', consent: false })

function submitAuditionForm() {
  const { name, phone, email, location, category, presentation } = auditionForm.value
  const message = [
    'Bonjour African Talents, je souhaite m’inscrire aux prochaines auditions.',
    `Nom complet : ${name}`,
    `Téléphone / WhatsApp : ${phone}`,
    `E-mail : ${email}`,
    `Ville et pays : ${location}`,
    `Domaine : ${category}`,
    `Présentation : ${presentation}`
  ].join('\n')

  window.open(`${contact.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
}
</script>
<template>
  <section v-if="!['talents', 'talent', 'news'].includes(route.name)" class="community-section" id="contact"><div class="wrap community-wrap">
    <div class="community-title"><span class="community-eyebrow">Communauté</span><h2>Rejoignez<br />la communauté</h2><p>Suivez African Talents sur les réseaux et ne manquez aucune actualité.</p></div>
    <div class="community-links">
      <a class="community-link" :href="contact.whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir WhatsApp"><span aria-hidden="true">◔</span>WhatsApp</a>
      <a v-for="phone in contact.phones" :key="phone" class="community-link" :href="`tel:${phone.replace(/ /g, '')}`"><span aria-hidden="true">⌕</span>{{ phone }}</a>
      <a class="community-link" :href="contact.tiktok" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">♪</span>TikTok</a>
      <a class="community-link" :href="contact.facebook" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">●</span>Facebook</a>
      <a class="community-link" :href="contact.youtube" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span>YouTube</a>
    </div>
  </div></section>
  <section v-if="!['talents', 'talent', 'news'].includes(route.name)" class="audition-section" aria-labelledby="audition-title">
    <div class="wrap audition-wrap">
      <div class="audition-intro">
        <span class="audition-eyebrow">Prochaine édition</span>
        <h2 id="audition-title">Les auditions vous attendent</h2>
        <p>Vous rêvez de participer à un concours de jeunes talents, de vivre de nouvelles expériences et de prendre part à la prochaine édition d’African Talents ? Inscrivez-vous en renseignant les informations ci-dessous.</p>
      </div>
      <form class="audition-form" @submit.prevent="submitAuditionForm">
        <div class="audition-fields">
          <label>Nom complet<input v-model.trim="auditionForm.name" name="name" autocomplete="name" required /></label>
          <label>Téléphone / WhatsApp<input v-model.trim="auditionForm.phone" name="phone" type="tel" autocomplete="tel" required /></label>
          <label>Adresse e-mail<input v-model.trim="auditionForm.email" name="email" type="email" autocomplete="email" required /></label>
          <label>Ville et pays<input v-model.trim="auditionForm.location" name="location" autocomplete="address-level2" required /></label>
          <label>Domaine de talent<select v-model="auditionForm.category" name="category" required><option disabled value="">Choisir un domaine</option><option v-for="category in categories" :key="category.id" :value="category.label">{{ category.label }}</option></select></label>
          <label class="audition-presentation">Présentez votre talent<textarea v-model.trim="auditionForm.presentation" name="presentation" rows="4" required></textarea></label>
        </div>
        <label class="audition-consent"><input v-model="auditionForm.consent" type="checkbox" required /><span>J’accepte de transmettre ces informations à African Talents via WhatsApp pour ma pré-inscription.</span></label>
        <div class="audition-submit"><button class="btn gold" type="submit">Envoyer ma demande sur WhatsApp</button><span>Un message prérempli s’ouvrira pour confirmer l’envoi.</span></div>
      </form>
    </div>
  </section>
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

<style scoped>
.audition-section {
  padding: clamp(3.5rem, 8vw, 6rem) 0;
  background: #071738;
  color: #eef2ff;
}

.audition-wrap {
  display: grid;
  grid-template-columns: minmax(220px, .8fr) minmax(0, 1.2fr);
  gap: clamp(2rem, 6vw, 5rem);
  align-items: start;
}

.audition-intro {
  position: sticky;
  top: 6rem;
}

.audition-eyebrow {
  color: #f6e08a;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.audition-intro h2 {
  margin-top: .8rem;
  color: #f6e08a;
  font-size: clamp(2rem, 4vw, 3rem);
}

.audition-intro p {
  margin-top: 1rem;
  color: #c3cce2;
  line-height: 1.8;
}

.audition-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.audition-fields label {
  display: grid;
  gap: .45rem;
  color: #eef2ff;
  font-size: .9rem;
  font-weight: 600;
}

.audition-fields input,
.audition-fields select,
.audition-fields textarea {
  width: 100%;
  min-height: 3rem;
  padding: .75rem .85rem;
  border: 1px solid #52658f;
  border-radius: 4px;
  background: #0b1f52;
  color: #fff;
  font: inherit;
}

.audition-fields textarea {
  resize: vertical;
}

.audition-fields input:focus,
.audition-fields select:focus,
.audition-fields textarea:focus {
  border-color: #f6e08a;
}

.audition-fields option {
  color: #071738;
}

.audition-presentation {
  grid-column: 1 / -1;
}

.audition-consent {
  display: flex;
  gap: .65rem;
  align-items: flex-start;
  margin-top: 1.2rem;
  color: #c3cce2;
  font-size: .85rem;
}

.audition-consent input {
  flex: none;
  width: 1rem;
  height: 1rem;
  margin-top: .2rem;
  accent-color: #d4a72c;
}

.audition-submit {
  display: flex;
  flex-wrap: wrap;
  gap: .8rem 1rem;
  align-items: center;
  margin-top: 1.2rem;
}

.audition-submit span {
  color: #a9b6d8;
  font-size: .8rem;
}

@media (max-width: 760px) {
  .audition-wrap {
    grid-template-columns: 1fr;
  }

  .audition-intro {
    position: static;
  }
}

@media (max-width: 520px) {
  .audition-fields {
    grid-template-columns: 1fr;
  }

  .audition-presentation {
    grid-column: auto;
  }

  .audition-submit .btn {
    width: 100%;
  }
}
</style>
