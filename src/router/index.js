import { createRouter, createWebHistory } from 'vue-router'
const titles = { home: 'Accueil', about: 'À propos', candidates: 'Candidats', candidate: 'Profil', ranking: 'Classement', news: 'Actualité', paymentReturn: 'Paiement', ticketing: 'Billetterie' }
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/Home.vue') },
    { path: '/a-propos', name: 'about', component: () => import('../views/About.vue') },
    { path: '/candidats', name: 'candidates', component: () => import('../views/Candidates.vue') },
    { path: '/candidats/:id', name: 'candidate', component: () => import('../views/CandidateDetail.vue'), props: true },
    { path: '/talents', redirect: to => ({ path: '/candidats', query: to.query, hash: to.hash }) },
    { path: '/talents/:id', redirect: to => ({ path: `/candidats/${to.params.id}`, query: to.query, hash: to.hash }) },
    { path: '/classement', name: 'ranking', component: () => import('../views/RankingView.vue') },
    { path: '/actualites/:id', name: 'news', component: () => import('../views/NewsDetail.vue'), props: true },
    { path: '/paiement/retour', name: 'paymentReturn', component: () => import('../views/PaymentReturn.vue') },
    { path: '/billetterie', name: 'ticketing', component: () => import('../views/Ticketing.vue') },
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
