<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { contentService } from '../services'
import { setPageSeo } from '../utils/seo'

const props = defineProps({ id: String })
const router = useRouter()
const article = ref(null)
const loading = ref(true)
const error = ref('')
watch(() => props.id, async id => {
  loading.value = true
  error.value = ''
  try {
    article.value = await contentService.getNewsItem(id)
    setPageSeo({
      title: `${article.value.title} | Actualités African Talents`,
      description: article.value.excerpt || `Découvrez cette actualité d’African Talents : ${article.value.title}.`,
      path: `/actualites/${encodeURIComponent(id)}`,
      image: article.value.img || undefined,
      type: 'article',
    })
  } catch (cause) {
    article.value = null
    error.value = cause.message
    setPageSeo({
      title: `Actualité introuvable | African Talents`,
      description: 'Cette actualité African Talents est introuvable.',
      robots: 'noindex, nofollow',
    })
  } finally {
    loading.value = false
  }
}, { immediate: true })
function goBack() {
  router.push('/#actualites')
}
</script>

<template>
  <div class="page-top news-detail-page">
    <section v-if="loading" class="section"><div class="wrap state"><div class="spin"></div></div></section>
    <section v-if="article" class="section">
      <div class="wrap news-detail">
        <button class="btn news-back" type="button" @click="goBack">← Toutes les actualités</button>
        <p class="news-detail-date">{{ article.date }}</p>
        <h1 class="gold-text">{{ article.title }}</h1>
        <p class="news-detail-excerpt">{{ article.excerpt }}</p>
        <img class="news-detail-cover" :src="article.img" :alt="article.title" />
        <div class="news-detail-content" v-html="article.content"></div>
        <template v-if="article.gallery.length">
          <div class="news-gallery-title"><h2 class="gold-text">Images de l'événement</h2><span>{{ article.gallery.length }} photos</span></div>
          <div class="news-gallery"><img v-for="(image, index) in article.gallery" :key="image" :src="image" :alt="`${article.title}, image ${index + 1}`" loading="lazy" /></div>
        </template>
      </div>
    </section>
    <section v-else-if="!loading" class="section"><div class="wrap state"><h1>{{ error || 'Actualité introuvable' }}</h1><button class="btn gold" type="button" @click="goBack">Retour aux actualités</button></div></section>
  </div>
</template>

<style scoped>
.page-top.news-detail-page {
  padding-top: 5rem;
}
</style>
