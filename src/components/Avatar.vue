<script setup>
import { computed } from 'vue'
const p = defineProps({ c: Object })
const ini = computed(() => p.c.name.split(' ').map(w => w[0]).slice(0, 2).join(''))
const bg = computed(() => `linear-gradient(145deg,hsl(${(+p.c.id * 37) % 60 + 205} 60% 30%),hsl(${(+p.c.id * 37) % 60 + 225} 65% 14%))`)
</script>
<template><img v-if="c.photo" :src="c.photo" :alt="c.name" loading="lazy" style="width:100%;height:100%;object-fit:cover" /><div v-else class="av" :style="{ background: bg }" role="img" :aria-label="c.name">{{ ini }}</div></template>
