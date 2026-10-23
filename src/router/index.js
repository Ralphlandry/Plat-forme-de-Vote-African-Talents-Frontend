import { createRouter, createWebHistory } from 'vue-router'
import { setPageSeo } from '../utils/seo'
const siteTitle = 'African Talents'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/Home.vue'), meta: { seo: { title: `${siteTitle} | Concours et talents africains`, description: 'African Talents révèle et accompagne les talents africains à travers des concours, des programmes et des événements. Découvrez les candidats et soutenez votre favori.' } } },
    { path: '/a-propos', name: 'about', component: () => import('../views/About.vue'), meta: { seo: { title: `À propos | ${siteTitle}`, description: 'Découvrez la mission, la vision et les valeurs d’African Talents, une plateforme dédiée à la révélation et à l’accompagnement des talents africains.' } } },
    { path: '/candidats', name: 'candidates', component: () => import('../views/Candidates.vue'), meta: { seo: { title: `Candidats et talents | ${siteTitle}`, description: 'Découvrez les candidats African Talents, explorez leurs profils et soutenez les talents africains en compétition.' } } },
    { path: '/candidats/:id', name: 'candidate', component: () => import('../views/CandidateDetail.vue'), props: true, meta: { seo: { title: `Profil candidat | ${siteTitle}`, description: 'Découvrez le parcours d’un candidat African Talents et soutenez les talents africains.' } } },
    { path: '/talents', redirect: to => ({ path: '/candidats', query: to.query, hash: to.hash }) },
    { path: '/talents/:id', redirect: to => ({ path: `/candidats/${to.params.id}`, query: to.query, hash: to.hash }) },
    { path: '/classement', name: 'ranking', component: () => import('../views/RankingView.vue'), meta: { seo: { title: `Classement des candidats | ${siteTitle}`, description: 'Consultez le classement des candidats African Talents et suivez les talents qui se distinguent dans la compétition.' } } },
    { path: '/actualites/:id', name: 'news', component: () => import('../views/NewsDetail.vue'), props: true, meta: { seo: { title: `Actualités | ${siteTitle}`, description: 'Suivez les actualités, les événements et les temps forts d’African Talents.' } } },
    { path: '/paiement/retour', name: 'paymentReturn', component: () => import('../views/PaymentReturn.vue'), meta: { seo: { title: `Confirmation de paiement | ${siteTitle}`, description: 'Suivez la confirmation de votre transaction African Talents.', robots: 'noindex, nofollow' } } },
    { path: '/billetterie', name: 'ticketing', component: () => import('../views/Ticketing.vue'), meta: { seo: { title: `Billetterie | ${siteTitle}`, description: 'Retrouvez les informations de billetterie des événements African Talents et préparez votre venue.' } } },
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
router.afterEach((to) => {
  if (to.meta.seo) setPageSeo({ ...to.meta.seo, path: to.path })
})
export default router
