<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({ slides: { type: Array, required: true } })
const current = ref(0)
let timer

function next() {
  current.value = (current.value + 1) % props.slides.length
}
function previous() {
  current.value = (current.value - 1 + props.slides.length) % props.slides.length
}
function startAutoPlay() {
  timer = window.setInterval(next, 5000)
}
function stopAutoPlay() {
  window.clearInterval(timer)
}

onMounted(startAutoPlay)
onUnmounted(stopAutoPlay)
</script>

<template>
  <div class="gallery-slider" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay" @focusin="stopAutoPlay" @focusout="startAutoPlay">
    <div class="gallery-frame" aria-live="polite">
      <transition name="gallery-fade" mode="out-in">
        <figure :key="props.slides[current].id" class="gallery-slide">
          <img :src="props.slides[current].image" :alt="props.slides[current].title" />
          <figcaption>{{ props.slides[current].title }}</figcaption>
        </figure>
      </transition>
      <button class="gallery-arrow gallery-arrow-prev" type="button" aria-label="Image précédente" @click="previous">←</button>
      <button class="gallery-arrow gallery-arrow-next" type="button" aria-label="Image suivante" @click="next">→</button>
    </div>
    <div class="gallery-controls" aria-label="Choisir une image">
      <button v-for="(slide, index) in props.slides" :key="slide.id" class="gallery-dot" :class="{ active: index === current }" type="button" :aria-label="`Afficher ${slide.title}`" :aria-current="index === current" @click="current = index"></button>
    </div>
  </div>
</template>
