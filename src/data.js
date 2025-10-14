import { Home, Users, Wrench, Lightbulb, Rocket, Book, Trophy, Handshake, Phone, Cpu, Code, Smartphone, Zap, Database, FileText } from 'lucide-react';

// Static data for the app with Lucide React icons
export const menuItems = [
  { id: 'accueil', label: 'Accueil', icon: <Home className="w-5 h-5" />, content: {
    title: "L'Maaza",
  lead: "",
  bannerSlogan: "L'Maaza — Innover au service des communautés",
  directorWelcome: "Mot de bienvenue de la Directrice :\n\nBienvenue à toutes et à tous sur le site de L'Maaza.\n\nNotre organisation s'engage fermement à développer des solutions technologiques innovantes et durables pour améliorer la vie de nos communautés. Depuis notre création, nous nous efforçons de démocratiser l'accès aux technologies et de former les jeunes, particulièrement les filles, aux métiers de demain.\n\nNous croyons en un avenir où l'innovation technologique et la tradition se rencontrent harmonieusement pour créer un impact positif et durable. Rejoignez-nous dans cette mission passionnante !",
    subtext: "Nous développons des solutions technologiques innovantes dans les domaines suivantes :   l'Agriculture, la Santé, l'Éducation et l'Environnement",
    heroBg: "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700",
    ctaPrimary: { text: "Découvrir nos services", link: "/services" },
    ctaSecondary: { text: "Nous contacter", link: "/contact" },
    stats: [
      { value: "20+", label: "Années d'expérience" },
      { value: "5", label: "Domaines d'expertise" },
      { value: "300+", label: "Jeunes formées " },
      { value: "3", label: "Axes stratégiques" }
    ]
  } },
  { id: 'apropos', label: 'À Propos', icon: <Users className="w-5 h-5" />, content: "<p>Découvrez notre <strong>histoire</strong>, notre mission et notre équipe passionnée.</p><p>Nous travaillons sur des projets d'éducation, de santé, d'agriculture et de l'environnement. " },
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
    category: "Services",
    items: [
      
      { name: "Impression 3D", desc: "Prototypage rapide et fabrication additive", icon: <Wrench className="w-6 h-6" /> },
      { name: "Production PCB", desc: "Conception et fabrication de circuits imprimés", icon: <Cpu className="w-6 h-6" /> }
    ]
  },
  {
    category: "Formations",
    items: [
      { name: "Informatique / Bureautique", desc: "Formation complète aux outils informatiques", icon: <Code className="w-6 h-6" /> },
      { name: "Électronique / Electronique Embarquée", desc: "Initiation aux systèmes électroniques et programmation", icon: <Cpu className="w-6 h-6" /> },
      { name: "Développement Mobile & Web", desc: "Création d'applications modernes", icon: <Smartphone className="w-6 h-6" /> },
      { name: "Énergie Solaire", desc: "Technologies d'énergie renouvelable", icon: <Zap className="w-6 h-6" /> },
      { name: "Analyse de Données", desc: "Collecte et traitement de données", icon: <Database className="w-6 h-6" /> }
    ]
  }
];

export const solutions = [
  { domain: "Éducation", desc: "Solutions numériques pour l'apprentissage", color: "bg-blue-500" },
  // { domain: "Agriculture/Élevage", desc: "Technologies pour l'agriculture moderne", color: "bg-green-500" },
  { domain: "Santé", desc: "Innovations pour le secteur médical", color: "bg-red-500" },
  // { domain: "Environnement", desc: "Solutions écologiques durables", color: "bg-emerald-500" },
  { domain: "Technologie", desc: "Avancées technologiques générales", color: "bg-purple-500" }
];

export const projets = [
  {
    name: "P.A.M.F",
    fullName: "Projet Appui aux Meilleures Filles",
    description: `FORMATION DES 25 MEILLEURES FILLES AU BEPC 2022 DES PREFECTURES DE KPELE ET DE DANYI EN SYSTEMES ELECTRONIQUE.
Ce projet est organisé par l’ONG Grace Population et exécuté par notre Start-Up
Contact : Mr Paul TEKO  90 15 37 90 
I. Contexte et justification
Au Togo et surtout dans les milieux ruraux, il existe très peu d’infrastructures TIC. Très peu de lycées et de collèges sont équipés de salles informatiques pour initier les jeunes à cet outil de conception, de recherche et de communication…Le besoins des jeunes élèves togolais en général et de ceux de la région des plateaux en particulier de posséder des connaissances solides en informatique et en programmation se fait toujours sentir. II. Objectif général
Susciter chez les jeunes filles brevetées 2022 de la commune …, le gout à s’intéresser à la science, à la technologie et de démystifier les préjugés.

II. Objectifs spécifiques 
	Former 25 filles de la préfecture de Kpélé et de Danyi ayant réussi au BEPC, sur les notions de l’électronique embarquée et à la programmation d’objets électroniques pendant les vacances 2022 ;
	Sensibiliser 25 filles de la préfecture de Kpélé et de Danyi ayant réussi au BEPC, sur les avantages et dangers de l’utilisation des médias sociaux en milieu scolaire pendant les vacances 2022 ;
	Former 25 filles de la préfecture de Kpélé et de Danyi ayant réussi au BEPC, au Leadership pour les adolescentes pendant les vacances 2022.

`,
    year: "2022",
    location: "Kpélé et Danyi",
    impact: "25 jeunes filles formées"
  },
  {
    name: "P.E.T.E",
    fullName: "Projet d'Éveil Technologique chez les Élèves",
    description: "Le club scientifique du Collège Adel de Kara à sollicité les compétences de notre Start-Up, pour former et renforcer les capacités de leurs membres (élèves et enseignants) dans le domaine de la technologie en général et particulièrement en programmation  Arduino.",
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
    image: "🌾",
    content: `L'agriculture au Togo est à un tournant. Grâce à l'introduction de capteurs simples, d'applications mobiles et de solutions de monitoring, les petits exploitants peuvent aujourd'hui mieux gérer l'eau, optimiser les semis et améliorer les rendements.

  Dans cet article, nous présentons des cas concrets issus de nos projets pilotes : installation de capteurs d'humidité, formation des agriculteurs à l'utilisation d'applications de prévision météorologique, et déploiement de systèmes d'irrigation intelligents adaptés aux petites exploitations.

  Ces interventions montrent que la technologie, quand elle est pensée pour le contexte local, devient un levier puissant pour la sécurité alimentaire et la résilience des communautés rurales.`
  },
  {
    id: 2,
    title: "Formation Arduino : Démystifier l'Électronique pour les Jeunes",
    excerpt: "Retour sur notre formation Arduino organisée avec Tilitu Lab et son impact sur l'éveil technologique des participants.",
    author: "TETE MAWUSSI KOSSI FELIX",
    date: "10 Décembre 2024",
    category: "Formation",
    readTime: "4 min",
    image: "🔧",
    content: `La formation Arduino que nous avons tenue avec Tilitu Lab visait à initier les jeunes aux bases de l'électronique et de la programmation. En moins d'une semaine, les participants ont réalisé des prototypes simples : capteurs lumineux, systèmes d'alerte et petits robots.

  L'approche pratique et ludique a permis de lever les peurs autour de l'électronique. De nombreux jeunes ont exprimé leur désir de poursuivre l'apprentissage et de participer à des projets de fabrication numérique.

  Nous pensons que l'apprentissage par la pratique est la clé pour susciter des vocations et fournir des compétences utiles pour l'emploi local.`
  },
  {
    id: 3,
    title: "Le Serveur Automatique : Innovation et Tradition Réunies",
    excerpt: "Comment notre serveur automatique de boissons locales préserve les traditions tout en apportant l'innovation technologique.",
    author: "L'Maaza Team",
    date: "5 Décembre 2024",
    category: "Innovation",
    readTime: "6 min",
    image: "🤖",
    content: `Le serveur automatique de boissons locales est un projet qui combine savoir-faire traditionnel et technologie locale. Il garantit l'hygiène, la disponibilité et une expérience utilisateur moderne tout en valorisant des recettes locales.

  Nous avons travaillé avec des artisans et des entrepreneurs pour concevoir une machine simple à utiliser, facile à maintenir et adaptable à différentes boissons locales. Le résultat : une solution qui aide à professionnaliser la vente ambulante et à créer des revenus supplémentaires.

  Le projet illustre notre philosophie : innover en respectant et en mettant en valeur les traditions locales.`
  },
  {
    id: 4,
    title: "L'Importance de l'Éducation Technologique pour les Filles",
    excerpt: "Pourquoi il est crucial d'encourager les jeunes filles à s'orienter vers les filières technologiques et comment y parvenir.",
    author: "DADJA Massamasso Clarisse",
    date: "1 Décembre 2024",
    category: "Éducation",
    readTime: "7 min",
    image: "👩‍💻",
    content: `Encourager les filles vers les études technologiques est un enjeu majeur pour l'égalité des chances et le développement. Les barrières culturelles et le manque d'exemples restent des freins importants.

  Dans cet article, nous partageons des retours d'expérience de mentors, des témoignages de jeunes filles formées et des recommandations pour les écoles et les décideurs : renforcer les programmes pratiques, former des enseignantes et créer des espaces sûrs pour l'expérimentation.

  Investir dans l'éducation technologique des filles, c'est investir dans un avenir plus inclusif et innovant.`
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
