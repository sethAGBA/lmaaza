// Static data for the app (kept serializable: icons can be mapped in components)
export const menuItems = [
  { id: 'accueil', label: 'Accueil', icon: '🏠' },
  { id: 'apropos', label: 'À Propos', icon: '👥' },
  { id: 'services', label: 'Services', icon: '⚙️' },
  { id: 'solutions', label: 'Solutions', icon: '💡' },
  { id: 'produits', label: 'Produits', icon: '🚀' },
  { id: 'formations', label: 'Formations', icon: '📚' },
  { id: 'projets', label: 'Projets', icon: '🏆' },
  { id: 'partenaires', label: 'Partenaires', icon: '🤝' },
  { id: 'contact', label: 'Contact', icon: '📞' }
];

export const teamMembers = [
  {
    name: "BEBINESSO Toi Bebezseky",
    role: "Électronicien-Informaticien / Économiste",
    experience: "20 ans d'expérience en électronique et systèmes embarqués",
    specialties: ["Électronique", "Systèmes embarqués", "Planification projets"]
  },
  {
    name: "TETE MAWUSSI KOSSI FELIX",
    role: "Ingénieur Systèmes Industriels Intelligents",
    specialties: ["Diagnostic automobile", "Électronique embarquée", "Systèmes intelligents"]
  },
  {
    name: "DADJA Massamasso Clarisse",
    role: "Spécialiste Langues",
    specialties: ["Communication", "Relations internationales"]
  },
  {
    name: "BISSA Ditoma Ingrid",
    role: "Juriste en Droit Privé",
    specialties: ["Aspects juridiques", "Conformité réglementaire"]
  }
];

export const services = [
  {
    category: "Productions/Services",
    items: [
      { name: "Serveur automatique de boissons locales", desc: "Solution innovante pour la vente hygiénique de boissons traditionnelles", icon: 'cpu' },
      { name: "Impression 3D", desc: "Prototypage rapide et fabrication additive", icon: 'wrench' },
      { name: "Production PCB", desc: "Conception et fabrication de circuits imprimés", icon: 'cpu' }
    ]
  },
  {
    category: "Formations",
    items: [
      { name: "Informatique / Bureautique", desc: "Formation complète aux outils informatiques", icon: 'code' },
      { name: "Électronique / Arduino", desc: "Initiation aux systèmes électroniques et programmation", icon: 'cpu' },
      { name: "Développement Mobile & Web", desc: "Création d'applications modernes", icon: 'smartphone' },
      { name: "Énergie Solaire", desc: "Technologies d'énergie renouvelable", icon: 'zap' },
      { name: "Analyse de Données", desc: "Collecte et traitement de données", icon: 'database' }
    ]
  }
];

export const solutions = [
  { domain: "Éducation", desc: "Solutions numériques pour l'apprentissage", color: "bg-blue-500" },
  { domain: "Agriculture/Élevage", desc: "Technologies pour l'agriculture moderne", color: "bg-green-500" },
  { domain: "Santé", desc: "Innovations pour le secteur médical", color: "bg-red-500" },
  { domain: "Environnement", desc: "Solutions écologiques durables", color: "bg-emerald-500" },
  { domain: "Technologie", desc: "Avancées technologiques générales", color: "bg-purple-500" }
];

export const projets = [
  {
    name: "P.A.M.F",
    fullName: "Projet Appui aux Meilleures Filles",
    description: "Formation de 25 jeunes filles brevetées 2022 pour démystifier les préjugés technologiques",
    year: "2022",
    location: "Kpélé et Danyi",
    impact: "25 jeunes filles formées"
  },
  {
    name: "P.E.T.E",
    fullName: "Projet d'Éveil Technologique chez les Élèves",
    description: "Formation des enseignants et élèves du Collège Adel sur la fabrication numérique",
    year: "2021",
    location: "Collège Adel de Kara",
    impact: "Enseignants et élèves formés"
  }
];

const data = {
  menuItems,
  teamMembers,
  services,
  solutions,
  projets
};

export default data;
