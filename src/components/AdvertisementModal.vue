<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { contentService } from '../services'

const route = useRoute()
const router = useRouter()
const advertisements = ref([])
const currentAdvertisement = ref(null)
const dismissedAt = new Map()
const enteredAt = ref(0)
let timer

const placement = computed(() => {
  if (route.name === 'home') return 'home'
  if (route.name === 'ticketing') return 'ticketing'
  return null
})

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = undefined
}

function getDismissedAt(advertisement) {
  if (dismissedAt.has(advertisement.id)) return dismissedAt.get(advertisement.id)
  try {
    const value = Number(localStorage.getItem(`aft-ad-dismissed-${advertisement.id}`))
    return Number.isFinite(value) ? value : 0
  } catch (error) {
    console.error('Impossible de lire la période de fermeture de la publicité.', error)
    return 0
  }
}

function dismiss(advertisement) {
  const timestamp = Date.now()
  dismissedAt.set(advertisement.id, timestamp)
  try {
    localStorage.setItem(`aft-ad-dismissed-${advertisement.id}`, String(timestamp))
  } catch (error) {
    console.error('Impossible de mémoriser la fermeture de la publicité.', error)
  }
}

function scheduleNext() {
  clearTimer()
  if (!placement.value || currentAdvertisement.value) return

  const now = Date.now()
  const eligible = advertisements.value
    .filter(ad => ad.placement === 'both' || ad.placement === placement.value)
    .map(ad => {
      const cooldownEndsAt = getDismissedAt(ad) + ad.dismissalCooldownHours * 60 * 60 * 1000
      const firstDisplayAt = enteredAt.value + ad.displayDelaySeconds * 1000
      return { ad, displayAt: Math.max(firstDisplayAt, cooldownEndsAt) }
    })
    .sort((a, b) => a.displayAt - b.displayAt)

  if (!eligible.length) return
  const next = eligible[0]
  timer = setTimeout(() => {
    if (next.displayAt > Date.now()) scheduleNext()
    else currentAdvertisement.value = next.ad
  }, Math.min(Math.max(0, next.displayAt - now), 2_000_000_000))
}

function closeAdvertisement() {
  if (currentAdvertisement.value) {
    dismiss(currentAdvertisement.value)
  }
  currentAdvertisement.value = null
  scheduleNext()
}

async function followAdvertisement() {
  const destination = currentAdvertisement.value?.buttonUrl || '/billetterie'
  closeAdvertisement()
  await router.push(destination)
}

watch(placement, async currentPlacement => {
  clearTimer()
  currentAdvertisement.value = null
  enteredAt.value = Date.now()
  if (!currentPlacement) return
  try {
    advertisements.value = await contentService.getAdvertisements()
    if (placement.value === currentPlacement) scheduleNext()
  } catch (error) {
    console.error('Impossible de charger les publicités.', error)
    advertisements.value = []
  }
}, { immediate: true })

onUnmounted(clearTimer)
</script>

<template>
  <Teleport to="body">
    <Transition name="advertisement-fade">
      <div
        v-if="currentAdvertisement"
        class="advertisement-backdrop"
        role="presentation"
        @click.self="closeAdvertisement"
        @keydown.esc="closeAdvertisement"
      >
        <section class="advertisement-dialog" role="dialog" aria-modal="true" :aria-label="currentAdvertisement.title">
          <button class="advertisement-close" type="button" aria-label="Fermer la publicité" @click="closeAdvertisement">×</button>
          <img class="advertisement-image" :src="currentAdvertisement.image" :alt="currentAdvertisement.title" />
          <button class="advertisement-action" type="button" @click="followAdvertisement">
            {{ currentAdvertisement.buttonLabel }}
          </button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.advertisement-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(0, 0, 0, .86);
  backdrop-filter: blur(3px);
}

.advertisement-dialog {
  position: relative;
  display: flex;
  width: min(100%, 438px);
  max-height: calc(100dvh - 2rem);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(231, 181, 42, .55);
  border-radius: 1.1rem;
  background: #08090c;
  box-shadow: 0 22px 90px rgba(0, 0, 0, .55);
}

.advertisement-image {
  display: block;
  width: 100%;
  max-height: calc(100dvh - 6.5rem);
  min-height: 0;
  flex: 0 1 auto;
  object-fit: contain;
}

.advertisement-close {
  position: absolute;
  z-index: 1;
  top: .55rem;
  right: .65rem;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, .65);
  color: white;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.advertisement-action {
  min-height: 2.9rem;
  margin: .55rem .65rem .65rem;
  border: 0;
  border-radius: .7rem;
  background: #e4ad16;
  color: #17120a;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.advertisement-action:hover {
  background: #f3c53d;
}

.advertisement-fade-enter-active,
.advertisement-fade-leave-active {
  transition: opacity .2s ease;
}

.advertisement-fade-enter-from,
.advertisement-fade-leave-to {
  opacity: 0;
}

@media (max-height: 620px) {
  .advertisement-dialog {
    width: min(100%, 340px);
  }
}
</style>
