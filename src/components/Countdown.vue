<script setup>
import { toRef } from 'vue'
import { useCountdown } from '../composables/useCountdown'
const props = defineProps({ target: Number, label: { type: String, default: 'Fin des votes dans' } })
const c = useCountdown(toRef(props, 'target'))
</script>
<template>
  <div class="count-wrap"><span>{{ label }}</span>
    <div class="count" role="timer"><div v-for="[l, v] in c.parts" :key="l"><b class="gold-text">{{ v }}</b><small>{{ l }}</small></div></div></div>
</template>
