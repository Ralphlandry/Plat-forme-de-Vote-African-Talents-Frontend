import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
const app = createApp(App)
app.directive('reveal', { mounted(el) {
  el.classList.add('reveal')
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }, { threshold: .12 })
  io.observe(el) } })
app.use(router).mount('#app')
