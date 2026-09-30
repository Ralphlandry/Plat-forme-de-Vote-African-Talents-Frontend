import { createRouter, createWebHistory } from 'vue-router'
const titles = { home: 'Accueil', about: 'À propos', talents: 'Talents', talent: 'Profil', ranking: 'Classement', news: 'Actualité' }
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/Home.vue') },
    { path: '/a-propos', name: 'about', component: () => import('../views/About.vue') },
    { path: '/talents', name: 'talents', component: () => import('../views/Candidates.vue') },
    { path: '/talents/:id', name: 'talent', component: () => import('../views/CandidateDetail.vue'), props: true },
    { path: '/classement', name: 'ranking', component: () => import('../views/RankingView.vue') },
    { path: '/actualites/:id', name: 'news', component: () => import('../views/NewsDetail.vue'), props: true },
    { path: '/:p(.*)*', redirect: '/' }
  ],
  scrollBehavior: (to) => {
    if (!to.hash) return { top: 0, behavior: 'instant' }

    return new Promise((resolve) => {
      let attempts = 0
      const findAnchor = () => {
        const element = document.querySelector(to.hash)
        if (element) return resolve({ el: element, behavior: 'smooth' })
        if (++attempts >= 30) return resolve({ top: 0 })
        requestAnimationFrame(findAnchor)
      }
      requestAnimationFrame(findAnchor)
    })
  }
})
router.afterEach((to) => { document.title = `${titles[to.name] || ''} · African Talents` })
export default router
