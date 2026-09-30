import { ref, computed, onMounted, onUnmounted } from 'vue'
export function useCountdown(target) { // target: ref(timestamp ms)
  const now = ref(Date.now()); let t
  onMounted(() => { t = setInterval(() => now.value = Date.now(), 1000) }); onUnmounted(() => clearInterval(t))
  return computed(() => {
    const d = Math.max(0, (target.value || 0) - now.value), p = n => String(n).padStart(2, '0')
    return { done: d === 0, parts: [['Jours', p(Math.floor(d / 864e5))], ['Heures', p(Math.floor(d / 36e5) % 24)], ['Minutes', p(Math.floor(d / 6e4) % 60)], ['Secondes', p(Math.floor(d / 1e3) % 60)]] }
  })
}
