// Données fictives — à remplacer par l'API. `photo: null` => avatar généré (initiales).
const raw = [
  ['Amina Kouassi', 'musique', 'Chanteuse afro-soul'], ['Junior Mbella', 'musique', 'Rappeur et auteur'],
  ['Fatou Diallo', 'mode', 'Styliste de mode éthique'], ['Kevin Nana', 'sport', 'Sprinteur 100 m'],
  ['Estelle Tchoua', 'art', 'Peintre contemporaine'], ['Samuel Owona', 'entrepreneuriat', 'Fondateur agritech'],
  ['Grace Ndzana', 'musique', 'Pianiste et compositrice'], ['Ibrahim Sow', 'art', 'Danseur traditionnel'],
  ['Carine Eyenga', 'entrepreneuriat', 'Créatrice de cosmétiques'], ['Patrick Mvondo', 'sport', 'Boxeur amateur'],
  ['Naomi Bekolo', 'mode', 'Mannequin et designer'], ['Elvis Tagne', 'art', 'Photographe documentaire']]
const votes = [8420, 7310, 6980, 5120, 4870, 4410, 3960, 3120, 2740, 2210, 1890, 1330]
export const candidates = raw.map(([name, category, tagline], i) => ({
  id: String(i + 1), number: i + 1, name, category, tagline, photo: null, active: true, votes: votes[(i * 5) % 12],
  bio: `${name} — ${tagline.toLowerCase()} — incarne l'excellence et l'authenticité que défend African Talents. Un parcours nourri de travail, de discipline et d'une vision claire : inspirer la jeunesse africaine.`,
  gallery: ['event-1', 'event-2', 'event-3'].map(n => `https://african-talents.vercel.app/images/${n}.jpg`)
}))
