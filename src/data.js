import { Home, Users, Wrench, Lightbulb, Rocket, Book, Trophy, Handshake, Phone, Cpu, Code, Smartphone, Zap, Database, FileText } from 'lucide-react';

// Static data for the app with Lucide React icons
export const menuItems = [
  { id: 'accueil', label: 'Accueil', icon: <Home className="w-5 h-5" />, content: {
    title: "L'Maaza",
    lead: "Bienvenue sur la page d'accueil de L'Maaza. Nous sommes ravis de vous accueillir.",
    subtext: "Nous développons des solutions technologiques pour l'Agriculture, la Santé, l'Éducation et l'Environnement",
    heroBg: "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700",
    ctaPrimary: { text: "Découvrir nos services", link: "/services" },
    ctaSecondary: { text: "Nous contacter", link: "/contact" },
    stats: [
      { value: "20+", label: "Années d'expérience" },
      { value: "5", label: "Domaines d'expertise" },
      { value: "25+", label: "Jeunes formées (P.A.M.F)" },
      { value: "3", label: "Axes stratégiques" }
    ]
  } },
  { id: 'apropos', label: 'À Propos', icon: <Users className="w-5 h-5" />, content: "<p>Découvrez notre <strong>histoire</strong>, notre mission et notre équipe passionnée.</p><p>Nous travaillons sur des projets en <em>éducation</em>, <em>santé</em> et <em>agriculture</em>.</p>" },
  { id: 'services', label: 'Services', icon: <Wrench className="w-5 h-5" />, content: "Explorez la gamme complète de nos services innovants et personnalisés." },
  { id: 'solutions', label: 'Solutions', icon: <Lightbulb className="w-5 h-5" />, content: "Découvrez nos solutions technologiques adaptées à vos besoins spécifiques." },
  { id: 'produits', label: 'Produits', icon: <Rocket className="w-5 h-5" />, content: "Parcourez notre catalogue de produits de pointe conçus pour l'avenir." },
  { id: 'formations', label: 'Formations', icon: <Book className="w-5 h-5" />, content: "Développez vos compétences grâce à nos programmes de formation de haute qualité." },
  { id: 'projets', label: 'Projets', icon: <Trophy className="w-5 h-5" />, content: "Découvrez nos réalisations et les projets qui nous passionnent." },
  { id: 'blog', label: 'Blog', icon: <FileText className="w-5 h-5" />, content: "Restez informé des dernières actualités et innovations technologiques." },
  { id: 'partenaires', label: 'Partenaires', icon: <Handshake className="w-5 h-5" />, content: "Rencontrez nos partenaires et découvrez comment nous collaborons pour innover." },
  { id: 'contact', label: 'Contact', icon: <Phone className="w-5 h-5" />, content: "Contactez-nous pour toute question, demande d'information ou collaboration." }
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
      { name: "Serveur automatique de boissons locales", desc: "Solution innovante pour la vente hygiénique de boissons traditionnelles", icon: <Cpu className="w-6 h-6" /> },
      { name: "Impression 3D", desc: "Prototypage rapide et fabrication additive", icon: <Wrench className="w-6 h-6" /> },
      { name: "Production PCB", desc: "Conception et fabrication de circuits imprimés", icon: <Cpu className="w-6 h-6" /> }
    ]
  },
  {
    category: "Formations",
    items: [
      { name: "Informatique / Bureautique", desc: "Formation complète aux outils informatiques", icon: <Code className="w-6 h-6" /> },
      { name: "Électronique / Arduino", desc: "Initiation aux systèmes électroniques et programmation", icon: <Cpu className="w-6 h-6" /> },
      { name: "Développement Mobile & Web", desc: "Création d'applications modernes", icon: <Smartphone className="w-6 h-6" /> },
      { name: "Énergie Solaire", desc: "Technologies d'énergie renouvelable", icon: <Zap className="w-6 h-6" /> },
      { name: "Analyse de Données", desc: "Collecte et traitement de données", icon: <Database className="w-6 h-6" /> }
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

export const blogPosts = [
  {
    id: 1,
    title: "L'Innovation Technologique au Service de l'Agriculture Togolaise",
    excerpt: "Découvrez comment les technologies modernes transforment l'agriculture traditionnelle au Togo et créent de nouvelles opportunités pour les agriculteurs locaux.",
    author: "BEBINESSO Toi Bebezseky",
    date: "15 Décembre 2024",
    category: "Agriculture",
    readTime: "5 min",
    image: "🌾"
  },
  {
    id: 2,
    title: "Formation Arduino : Démystifier l'Électronique pour les Jeunes",
    excerpt: "Retour sur notre formation Arduino organisée avec Tilitu Lab et son impact sur l'éveil technologique des participants.",
    author: "TETE MAWUSSI KOSSI FELIX",
    date: "10 Décembre 2024",
    category: "Formation",
    readTime: "4 min",
    image: "🔧"
  },
  {
    id: 3,
    title: "Le Serveur Automatique : Innovation et Tradition Réunies",
    excerpt: "Comment notre serveur automatique de boissons locales préserve les traditions tout en apportant l'innovation technologique.",
    author: "L'Maaza Team",
    date: "5 Décembre 2024",
    category: "Innovation",
    readTime: "6 min",
    image: "🤖"
  },
  {
    id: 4,
    title: "L'Importance de l'Éducation Technologique pour les Filles",
    excerpt: "Pourquoi il est crucial d'encourager les jeunes filles à s'orienter vers les filières technologiques et comment y parvenir.",
    author: "DADJA Massamasso Clarisse",
    date: "1 Décembre 2024",
    category: "Éducation",
    readTime: "7 min",
    image: "👩‍💻"
  }
];

const data = {
  menuItems,
  teamMembers,
  services,
  solutions,
  projets,
  blogPosts
};

export default data;
