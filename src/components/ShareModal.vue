<script setup>
import { computed, ref, watch } from 'vue'
import Avatar from './Avatar.vue'
import { shareTarget } from '../composables/useCompetition'

const copied = ref(false)
const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share)
const shareUrl = computed(() => shareTarget.value ? `${window.location.origin}/talents/${shareTarget.value.id}` : '')
const shareText = computed(() => shareTarget.value ? `Je soutiens ${shareTarget.value.name} - votez pour mon favori !` : '')
watch(shareTarget, () => { copied.value = false })
const close = () => { shareTarget.value = null }
async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2200)
  } catch {
    copied.value = false
  }
}
function shareNative() {
  if (navigator.share) navigator.share({ title: shareTarget.value.name, text: shareText.value, url: shareUrl.value })
}
const socialLinks = computed(() => {
  const encodedUrl = encodeURIComponent(shareUrl.value)
  const encodedText = encodeURIComponent(shareText.value)
  return [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, icon: '◉' },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: 'f' },
    { label: 'X', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, icon: 'X' },
    { label: 'Telegram', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, icon: '➤' }
  ]
})
</script>

<template>
  <dialog v-if="shareTarget" open class="share-modal modal" @click.self="close" @keydown.esc="close" aria-labelledby="share-title">
    <div class="share-box">
      <button class="modal-close" type="button" aria-label="Fermer" @click="close">×</button>
      <div class="share-head">
        <Avatar :c="shareTarget" class="share-avatar" />
        <div><h2 id="share-title">Partager {{ shareTarget.name }}</h2><p>Invitez vos proches à soutenir ce talent.</p></div>
      </div>
      <div class="share-actions">
        <button class="btn gold" type="button" @click="copyLink">{{ copied ? 'Lien copie !' : 'Copier le lien' }}</button>
        <button v-if="canNativeShare" class="btn" type="button" @click="shareNative">Partager...</button>
      </div>
      <div class="share-line"><span>Partager sur</span></div>
      <div class="social-grid">
        <a v-for="social in socialLinks" :key="social.label" class="social-link" :href="social.href" target="_blank" rel="noopener noreferrer"><b>{{ social.icon }}</b><span>{{ social.label }}</span></a>
      </div>
      <input class="share-url" :value="shareUrl" readonly aria-label="Lien du candidat" @focus="$event.target.select()" />
    </div>
  </dialog>
</template>
