const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATA_PATH || path.join(__dirname, '..', 'data', 'gerondyshop.json');
const dbDir = path.dirname(DB_PATH);

const seedProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    category: "iphone",
    price: 590000,
    originalPrice: 650000,
    badge: "Populaire",
    stock: 8,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.9,
    reviewsCount: 38,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    description: "Le summum de l'innovation Apple avec châssis en titane de qualité aérospatiale, puce A17 Pro surpuissante, bouton Action personnalisable et capteur photo principal 48 MP avec zoom optique x5.",
    shortSpecs: "6.1\" OLED Super Retina XDR 120Hz | A17 Pro | 256GB | Titane Naturel",
    specs: {
      screen: "6.1\" OLED Super Retina XDR 120Hz ProMotion",
      ram: "8GB",
      storage: "256GB",
      camera: "48MP Principal + 12MP Ultra-wide + 12MP Téléobjectif 5x",
      battery: "3274 mAh - Autonomie toute la journée",
      color: "Titane Naturel",
      processor: "Apple A17 Pro (3nm)",
      condition: "Neuf scellé"
    }
  },
  {
    id: 2,
    name: "iPhone 15",
    category: "iphone",
    price: 380000,
    originalPrice: 420000,
    badge: "Nouveau",
    stock: 14,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.8,
    reviewsCount: 29,
    image: "https://images.unsplash.com/photo-1695048133036-3914a29a2444?w=800&auto=format&fit=crop&q=80",
    description: "Équipé de la Dynamic Island révolutionnaire, d'un capteur photo 48 MP ultra-détaillé et du connecteur universel USB-C, le tout sublimé par un dos en verre teinté dans la masse.",
    shortSpecs: "6.1\" OLED Dynamic Island | A16 Bionic | 128GB | Bleu Pastel",
    specs: {
      screen: "6.1\" Super Retina XDR OLED",
      ram: "6GB",
      storage: "128GB",
      camera: "48MP + 12MP Ultra grand-angle",
      battery: "3349 mAh charge rapide",
      color: "Bleu Pastel",
      processor: "Apple A16 Bionic",
      condition: "Neuf scellé"
    }
  },
  {
    id: 3,
    name: "iPhone 14 Pro",
    category: "iphone",
    price: 350000,
    originalPrice: 395000,
    badge: "Promo",
    stock: 6,
    seller: "Apple Store Premium Abidjan",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.9,
    reviewsCount: 45,
    image: "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&auto=format&fit=crop&q=80",
    description: "La puissance Pro avec affichage permanent Always-On, Dynamic Island et triple objectif 48 MP capturant des détails saisissants en basse lumière.",
    shortSpecs: "6.1\" OLED ProMotion | A16 Bionic | 256GB | Violet Intense",
    specs: {
      screen: "6.1\" OLED Always-On 120Hz",
      ram: "6GB",
      storage: "256GB",
      camera: "48MP + 12MP + 12MP",
      battery: "3200 mAh",
      color: "Violet Intense (Deep Purple)",
      processor: "Apple A16 Bionic",
      condition: "Comme neuf (Reconditionné certifié)"
    }
  },
  {
    id: 4,
    name: "iPhone 14",
    category: "iphone",
    price: 280000,
    originalPrice: 310000,
    badge: "Populaire",
    stock: 11,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.7,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80",
    description: "Écran Super Retina brillant, double appareil photo perfectionné et autonomie remarquable pour un usage quotidien fluide et sans compromis.",
    shortSpecs: "6.1\" OLED | A15 Bionic | 128GB | Minuit",
    specs: {
      screen: "6.1\" OLED Super Retina XDR",
      ram: "6GB",
      storage: "128GB",
      camera: "12MP + 12MP Ultra large",
      battery: "3279 mAh",
      color: "Minuit",
      processor: "Apple A15 Bionic (5 cœurs GPU)",
      condition: "Neuf"
    }
  },
  {
    id: 5,
    name: "iPhone 13",
    category: "iphone",
    price: 200000,
    originalPrice: 230000,
    badge: "Promo",
    stock: 15,
    seller: "iStore Cotonou",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.8,
    reviewsCount: 54,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80",
    description: "Le modèle le plus plébiscité : mode cinématique immersif, autonomie boostée et robustesse avec Ceramic Shield.",
    shortSpecs: "6.1\" OLED | A15 Bionic | 128GB | Bleu",
    specs: {
      screen: "6.1\" OLED Super Retina",
      ram: "4GB",
      storage: "128GB",
      camera: "12MP + 12MP Capteur diagonal",
      battery: "3240 mAh",
      color: "Bleu",
      processor: "Apple A15 Bionic",
      condition: "Excellent état"
    }
  },
  {
    id: 6,
    name: "iPhone 12 Pro Max",
    category: "iphone",
    price: 250000,
    originalPrice: 285000,
    badge: "Grand Écran",
    stock: 5,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.7,
    reviewsCount: 19,
    image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&auto=format&fit=crop&q=80",
    description: "L'expérience géante 6.7 pouces avec téléobjectif dédié, stabilisation optique du capteur et cadre en acier inoxydable.",
    shortSpecs: "6.7\" OLED | A14 Bionic | 256GB | Bleu Pacifique",
    specs: {
      screen: "6.7\" OLED Super Retina XDR",
      ram: "6GB",
      storage: "256GB",
      camera: "12MP Triple caméra + LiDAR",
      battery: "3687 mAh",
      color: "Bleu Pacifique",
      processor: "Apple A14 Bionic",
      condition: "Reconditionné Premium"
    }
  },
  {
    id: 7,
    name: "iPhone 12",
    category: "iphone",
    price: 180000,
    originalPrice: 210000,
    badge: "Bon Plan",
    stock: 18,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.6,
    reviewsCount: 31,
    image: "https://images.unsplash.com/photo-1607936854279-55e8a4c64888?w=800&auto=format&fit=crop&q=80",
    description: "Design à bords plats moderne, compatibilité réseau 5G ultrarapide et écran OLED haute définition éclatant.",
    shortSpecs: "6.1\" OLED | A14 Bionic | 128GB | Blanc",
    specs: {
      screen: "6.1\" OLED Super Retina",
      ram: "4GB",
      storage: "128GB",
      camera: "12MP + 12MP",
      battery: "2815 mAh",
      color: "Blanc",
      processor: "Apple A14 Bionic",
      condition: "Très bon état"
    }
  },
  {
    id: 8,
    name: "iPhone 11",
    category: "iphone",
    price: 120000,
    originalPrice: 140000,
    badge: "Accessible",
    stock: 24,
    seller: "Dakar Digital Hub",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.7,
    reviewsCount: 68,
    image: "https://images.unsplash.com/photo-1574710954930-4e314643503f?w=800&auto=format&fit=crop&q=80",
    description: "L'incontournable rapport qualité/prix Apple avec double appareil photo 4K, mode Nuit performant et batterie longue durée.",
    shortSpecs: "6.1\" Liquid Retina | A13 Bionic | 128GB | Noir / Mauve",
    specs: {
      screen: "6.1\" LCD Liquid Retina",
      ram: "4GB",
      storage: "128GB",
      camera: "12MP + 12MP Ultra large",
      battery: "3110 mAh",
      color: "Noir",
      processor: "Apple A13 Bionic",
      condition: "Très bon état certifié"
    }
  },
  {
    id: 9,
    name: "MacBook Air M2 13\"",
    category: "tech",
    price: 680000,
    originalPrice: 750000,
    badge: "Top Vente",
    stock: 4,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.9,
    reviewsCount: 16,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    description: "Design ultra-fin de 1.24 kg, puce Apple M2 à 8 cœurs, autonomie phénoménale jusqu'à 18h et écran Liquid Retina éblouissant de 500 nits.",
    shortSpecs: "13.6\" Liquid Retina | Apple M2 | 8GB RAM | 256GB SSD | Minuit",
    specs: {
      screen: "13.6\" Liquid Retina TrueTone",
      ram: "8GB Mémoire unifiée",
      storage: "256GB SSD ultra-rapide",
      camera: "Caméra FaceTime HD 1080p",
      battery: "Jusqu'à 18h d'autonomie",
      color: "Minuit",
      processor: "Puce Apple M2 (8 cœurs CPU, 8 cœurs GPU)",
      condition: "Neuf sous scellé"
    }
  },
  {
    id: 10,
    name: "Sony WH-1000XM5",
    category: "tech",
    price: 195000,
    originalPrice: 225000,
    badge: "Audio Pro",
    stock: 10,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.9,
    reviewsCount: 41,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    description: "Le casque audio de référence mondiale avec réduction de bruit active d'exception à double processeur, son Hi-Res sans fil et autonomie de 30 heures.",
    shortSpecs: "Réduction de bruit active ANC | Bluetooth 5.2 LDAC | 30h autonomie | Noir",
    specs: {
      screen: "Commandes tactiles intégrées",
      ram: "Processeur V1 + HD QN1",
      storage: "Étui de transport inclus",
      camera: "8 microphones Beamforming",
      battery: "30h avec ANC (Charge 3 min = 3h)",
      color: "Noir Mat",
      processor: "Double puce de traitement audio",
      condition: "Neuf scellé"
    }
  },
  {
    id: 11,
    name: "Apple Watch Series 9",
    category: "smart",
    price: 245000,
    originalPrice: 275000,
    badge: "Nouveau",
    stock: 9,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.8,
    reviewsCount: 27,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    description: "Équipée de la puce S9 SiP, du geste magique Toucher Deux Fois, d'un écran OLED lumineux jusqu'à 2000 nits et du suivi santé complet avec ECG et oxygène sanguin.",
    shortSpecs: "Boîtier Aluminium 45mm | Puce S9 | Écran Retina 2000 nits | Minuit",
    specs: {
      screen: "45mm OLED Always-On 2000 nits",
      ram: "Puce S9 SiP 64 bits",
      storage: "64GB stockage interne",
      camera: "Capteur cardiaque optique & électrique ECG",
      battery: "18h mode normal / 36h économie",
      color: "Aluminium Minuit",
      processor: "Apple S9 SiP",
      condition: "Neuf"
    }
  },
  {
    id: 12,
    name: "AirPods Pro 2 (USB-C)",
    category: "tech",
    price: 145000,
    originalPrice: 165000,
    badge: "Populaire",
    stock: 16,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.9,
    reviewsCount: 52,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
    description: "Réduction active du bruit 2x plus efficace, mode Transparence adaptative, audio spatial personnalisé avec suivi dynamique de la tête et boîtier de charge USB-C MagSafe.",
    shortSpecs: "Puce H2 | Boîtier USB-C MagSafe | Audio Spatial 3D | Blanc",
    specs: {
      screen: "Contrôle tactile sur la tige",
      ram: "Puce Apple H2 + Puce U1",
      storage: "4 tailles d'embouts silicone",
      camera: "Micros orientés vers l'intérieur",
      battery: "Jusqu'à 30h avec le boîtier",
      color: "Blanc brillant",
      processor: "Apple H2",
      condition: "Neuf scellé"
    }
  },
  {
    id: 13,
    name: "Sneakers Urban Gérondy Wave",
    category: "style",
    price: 380000 < 100000 ? 38000 : 38000,
    originalPrice: 48000,
    badge: "Tendance",
    stock: 20,
    seller: "Urban Street Style",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.7,
    reviewsCount: 34,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    description: "Baskets au design contemporain combinant mesh respirant haute densité, semelle amortissante à coussin d'air dynamique et accents contrastés bleu & rouge.",
    shortSpecs: "Semelle Air Dynamic | Mesh respirant | Tailles 39 à 45",
    specs: {
      screen: "Semelle intérieure à mémoire de forme",
      ram: "Fermeture par lacets renforcés",
      storage: "Sac de protection inclus",
      camera: "Finition déperlante",
      battery: "Amorti longue durée 1000km+",
      color: "Rouge Rubis & Noir Intense",
      processor: "Composition cuir & synthétique premium",
      condition: "Neuf en boîte d'origine"
    }
  },
  {
    id: 14,
    name: "Veste Bombers Techwear",
    category: "style",
    price: 28500,
    originalPrice: 35000,
    badge: "Promo",
    stock: 12,
    seller: "Urban Street Style",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.6,
    reviewsCount: 18,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    description: "Blouson bomber urbain résistant à l'eau, doublure thermique respirante, multiples poches cargo sécurisées zippées et coupe moderne ajustée.",
    shortSpecs: "Tissu déperlant | Poches tactiques | Tailles S, M, L, XL, XXL",
    specs: {
      screen: "Col et poignets côtelés",
      ram: "Zips étanches haute qualité",
      storage: "4 poches externes + 2 internes",
      camera: "Bandes réfléchissantes subtiles",
      battery: "Entretien machine à 30°C",
      color: "Noir Mat",
      processor: "Nylon 100% renforcé coupe-vent",
      condition: "Neuf avec étiquettes"
    }
  },
  {
    id: 15,
    name: "Clavier Mécanique RGB Pro Wireless",
    category: "tech",
    price: 32000,
    originalPrice: 42000,
    badge: "Gamer & Bureau",
    stock: 15,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.8,
    reviewsCount: 26,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    description: "Clavier mécanique compact à 75% avec switches rouges linéaires pré-lubrifiés, triple connectivité (Bluetooth 5.0, 2.4Ghz sans fil, câble USB-C tressé) et rétroéclairage RGB 16.8M couleurs.",
    shortSpecs: "Switches Mécaniques Hot-Swap | RGB Personnalisable | Bluetooth & 2.4G",
    specs: {
      screen: "Indicateur de batterie LED",
      ram: "Mémoire interne pour profils",
      storage: "Extracteur de touches & touches bonus",
      camera: "Structure insonorisée 3 couches",
      battery: "4000 mAh - jusqu'à 200h d'autonomie",
      color: "Gris Carbone & Bleu",
      processor: "Compatible Windows, Mac, Android, iOS",
      condition: "Neuf"
    }
  },
  {
    id: 16,
    name: "Enceinte JBL Charge 5 Bluetooth",
    category: "tech",
    price: 75000,
    originalPrice: 89000,
    badge: "Son Puissant",
    stock: 14,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.8,
    reviewsCount: 39,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    description: "Son Original JBL Pro puissant avec haut-parleur de graves optimisé, autonomie impressionnante de 20 heures, certification étanche IP67 et fonction Powerbank pour recharger son téléphone.",
    shortSpecs: "Son Pro JBL | Étanchéité IP67 | 20h d'autonomie | Powerbank 7500mAh",
    specs: {
      screen: "Boutons de contrôle physique",
      ram: "Fonction PartyBoost multi-enceintes",
      storage: "Câble USB-C de charge inclus",
      camera: "2 radiateurs passifs pour basses profondes",
      battery: "7500 mAh Li-ion rechargeable",
      color: "Bleu Océan",
      processor: "Bluetooth 5.1 haute fidélité",
      condition: "Neuf garanti"
    }
  },
  {
    id: 17,
    name: "Montre Chronographe Acier Prestige",
    category: "style",
    price: 55000,
    originalPrice: 70000,
    badge: "Élégance",
    stock: 7,
    seller: "Prestige Timepieces",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.9,
    reviewsCount: 21,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
    description: "Montre de luxe contemporaine avec boîtier et bracelet en acier inoxydable 316L, cadran bleu soleillé avec compteurs chronomètre, mouvement à quartz japonais de haute précision et étanchéité 5 ATM.",
    shortSpecs: "Acier Inox 316L | Verre Minéral Durci | Mouvement Quartz Japonais | 5 ATM",
    specs: {
      screen: "Cadran 42mm avec aiguilles luminescentes",
      ram: "Fermoir papillon sécurisé",
      storage: "Écrin cadeau prestige inclus",
      camera: "Fonction date rapide et chrono",
      battery: "Pile longue durée 3 ans",
      color: "Argent & Cadran Bleu Nuit",
      processor: "Calibre Quartz Chrono Seiko",
      condition: "Neuf avec certificat"
    }
  },
  {
    id: 18,
    name: "Caméra Sécurité Smart Home 2K 360°",
    category: "smart",
    price: 24000,
    originalPrice: 32000,
    badge: "Sécurité",
    stock: 22,
    seller: "Gérondy Tech Officiel",
    sellerEmail: "seller@gerondyshop.com",
    rating: 4.6,
    reviewsCount: 19,
    image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800&auto=format&fit=crop&q=80",
    description: "Surveillez votre domicile ou magasin en direct sur smartphone : résolution Ultra HD 2K, rotation motorisée à 360°, vision nocturne infrarouge, détection humaine par IA et audio bidirectionnel pour parler à distance.",
    shortSpecs: "Résolution 2K UHD | Rotation 360° | Vision Nocturne | Audio Bidirectionnel",
    specs: {
      screen: "Visionnage en direct sur app iOS & Android",
      ram: "Puce IA de détection de mouvements et pleurs",
      storage: "Support MicroSD jusqu'à 256GB & Cloud",
      camera: "Capteur 3MP 2K avec lentille grand-angle",
      battery: "Alimentation continue USB",
      color: "Blanc Céramique",
      processor: "Wi-Fi 2.4GHz sécurisé chiffrement AES-128",
      condition: "Neuf en boîte"
    }
  }
];

const seedUsers = [
  {
    id: 1,
    name: "Gérondy Admin",
    email: "schekinacamille@gmail.com",
    password: "$2a$10$wE9q3bA1cM.tVv47.F3U5e835mHkH/O67Qh5yUcm78yF3pTf2P4g.", // admin123
    phone: "+229 97 00 00 00",
    role: "admin",
    walletBalance: 500000,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    city: "Cotonou",
    district: "Haie Vive",
    createdAt: "2026-01-01T10:00:00.000Z"
  },
  {
    id: 2,
    name: "Gérondy Store Officiel",
    email: "seller@gerondyshop.com",
    password: "$2a$10$wE9q3bA1cM.tVv47.F3U5e835mHkH/O67Qh5yUcm78yF3pTf2P4g.", // seller123
    phone: "+229 97 12 34 56",
    role: "seller",
    storeName: "Gérondy Store Officiel",
    sellerBio: "Boutique officielle certifiée spécialisée en produits Apple, High-Tech et accessoires tendance.",
    walletBalance: 840000,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    city: "Abidjan",
    district: "Plateau",
    createdAt: "2026-01-02T11:00:00.000Z"
  },
  {
    id: 3,
    name: "Aimé K.",
    email: "client@gerondy.com",
    password: "$2a$10$wE9q3bA1cM.tVv47.F3U5e835mHkH/O67Qh5yUcm78yF3pTf2P4g.", // client123
    phone: "+229 96 44 55 66",
    role: "user",
    walletBalance: 125000,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    city: "Cotonou",
    district: "Cadjehoun",
    createdAt: "2026-01-10T14:30:00.000Z"
  }
];

const seedTransactions = [
  {
    id: 1,
    userId: 3,
    type: "deposit",
    amount: 150000,
    description: "Recharge Mobile Money (MTN MoMo)",
    reference: "MOMO-948271",
    status: "completed",
    createdAt: "2026-02-15T09:30:00.000Z"
  },
  {
    id: 2,
    userId: 3,
    type: "payment",
    amount: 25000,
    description: "Achat Caméra Sécurité Smart Home",
    reference: "CMD-2026-8812",
    status: "completed",
    createdAt: "2026-02-18T16:45:00.000Z"
  },
  {
    id: 3,
    userId: 2,
    type: "credit",
    amount: 380000,
    description: "Vente iPhone 15 payée par Wallet",
    reference: "CMD-2026-8901",
    status: "completed",
    createdAt: "2026-02-28T14:10:00.000Z"
  }
];

const seedOrders = [
  {
    id: 1,
    trackingNumber: "GER-2026-8812",
    userId: 3,
    customerName: "Aimé K.",
    customerEmail: "client@gerondy.com",
    customerPhone: "+229 96 44 55 66",
    shippingAddress: {
      country: "Bénin",
      city: "Cotonou",
      district: "Cadjehoun, Rue 340",
      notes: "Appeler en arrivant au portail noir"
    },
    items: [
      {
        productId: 18,
        name: "Caméra Sécurité Smart Home 2K 360°",
        price: 24000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800&auto=format&fit=crop&q=80",
        specsSummary: "Blanc Céramique"
      }
    ],
    subtotal: 24000,
    shippingCost: 1000,
    totalAmount: 25000,
    paymentMethod: "wallet",
    paymentStatus: "paid",
    status: "delivered",
    sellerEmail: "seller@gerondyshop.com",
    createdAt: "2026-02-18T16:45:00.000Z"
  },
  {
    id: 2,
    trackingNumber: "GER-2026-9045",
    userId: 3,
    customerName: "Aimé K.",
    customerEmail: "client@gerondy.com",
    customerPhone: "+229 96 44 55 66",
    shippingAddress: {
      country: "Bénin",
      city: "Cotonou",
      district: "Cadjehoun",
      notes: "Livraison rapide express demandée"
    },
    items: [
      {
        productId: 12,
        name: "AirPods Pro 2 (USB-C)",
        price: 145000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
        specsSummary: "Blanc MagSafe"
      }
    ],
    subtotal: 145000,
    shippingCost: 1500,
    totalAmount: 146500,
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending_cash",
    status: "processing",
    sellerEmail: "seller@gerondyshop.com",
    createdAt: "2026-03-01T11:20:00.000Z"
  }
];

const seedMessages = [
  {
    id: 1,
    conversationId: "conv-user3-seller2",
    senderId: 3,
    senderName: "Aimé K.",
    recipientId: 2,
    recipientName: "Gérondy Tech Officiel",
    text: "Bonjour ! Est-ce que l'iPhone 15 Pro Titane Naturel est disponible immédiatement avec sa garantie d'un an ?",
    productContext: {
      id: 1,
      name: "iPhone 15 Pro",
      price: 590000,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"
    },
    createdAt: "2026-03-01T10:15:00.000Z"
  },
  {
    id: 2,
    conversationId: "conv-user3-seller2",
    senderId: 2,
    senderName: "Gérondy Tech Officiel",
    recipientId: 3,
    recipientName: "Aimé K.",
    text: "Bonjour Aimé ! Oui, tout à fait ! Nous avons 8 unités scellées en stock avec la garantie officielle 12 mois et livraison offerte dans la journée.",
    createdAt: "2026-03-01T10:18:00.000Z"
  },
  {
    id: 3,
    conversationId: "conv-user3-seller2",
    senderId: 3,
    senderName: "Aimé K.",
    recipientId: 2,
    recipientName: "Gérondy Tech Officiel",
    text: "Parfait, je finalise ma commande avec mon Gérondy Wallet !",
    createdAt: "2026-03-01T10:22:00.000Z"
  }
];

const seedConciergeRequests = [
  {
    id: 1,
    referenceCode: "CC-8921",
    user: 3,
    userName: "Aimé K.",
    userEmail: "client@gerondy.com",
    userPhone: "+229 96 44 55 66",
    productName: "Drone DJI Mini 4 Pro Fly More Combo Plus",
    category: "High-Tech Spécialisé",
    budgetMin: 550000,
    budgetMax: 700000,
    quantity: 1,
    description: "Je recherche le pack DJI Mini 4 Pro avec les 3 batteries haute autonomie et la radiocommande DJI RC 2 avec écran intégré.",
    referenceLink: "https://www.dji.com/mini-4-pro",
    status: "searching", // "pending", "searching", "found", "completed"
    statusLabel: "Recherche en cours",
    adminNotes: "Notre agent à Dubaï est en contact avec le fournisseur officiel DJI. Proposition de tarif dans 24h.",
    offer: null,
    createdAt: "2026-02-26T15:00:00.000Z"
  },
  {
    id: 2,
    referenceCode: "CC-8410",
    user: 3,
    userName: "Aimé K.",
    userEmail: "client@gerondy.com",
    userPhone: "+229 96 44 55 66",
    productName: "Sneakers Nike Air Jordan 4 Retro 'Military Blue'",
    category: "Sneakers & Mode Rare",
    budgetMin: 120000,
    budgetMax: 160000,
    quantity: 1,
    description: "Pointure 43 EU, modèle original neuf avec boîte et facture.",
    referenceLink: "",
    status: "found",
    statusLabel: "Produit trouvé",
    adminNotes: "Produit localisé auprès de notre partenaire certifié en France. Authenticité 100% vérifiée.",
    offer: {
      price: 145000,
      deliveryDays: 5,
      sellerNotes: "Expédition par fret aérien express avec suivi."
    },
    createdAt: "2026-02-12T08:40:00.000Z"
  }
];

const initialState = {
  users: seedUsers,
  products: seedProducts,
  orders: seedOrders,
  transactions: seedTransactions,
  messages: seedMessages,
  concierge_requests: seedConciergeRequests,
};

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialState, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(initialState));
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  try {
    const parsed = JSON.parse(data || '{}');
    let needsSave = false;
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = seedProducts;
      needsSave = true;
    }
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = seedUsers;
      needsSave = true;
    }
    if (!parsed.orders) {
      parsed.orders = seedOrders;
      needsSave = true;
    }
    if (!parsed.transactions) {
      parsed.transactions = seedTransactions;
      needsSave = true;
    }
    if (!parsed.messages) {
      parsed.messages = seedMessages;
      needsSave = true;
    }
    if (!parsed.concierge_requests) {
      parsed.concierge_requests = seedConciergeRequests;
      needsSave = true;
    }
    if (needsSave) {
      saveDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Erreur de lecture du fichier de base de données:', err);
    return JSON.parse(JSON.stringify(initialState));
  }
}

function saveDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { loadDb, saveDb, initialState };
