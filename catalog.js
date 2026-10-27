// Catálogo de ideas de regalo por categoría.
// `keywords` se comparan (sin tildes, en minúsculas) con los gustos del perfil.
// `price` es un precio orientativo en euros.
const CATALOG = [
  {
    id: "musica", label: "Música", emoji: "🎵",
    keywords: ["musica", "cancion", "concierto", "rock", "pop", "jazz", "rap", "reggaeton", "indie", "vinilo", "spotify", "festival", "cantar"],
    ideas: [
      { name: "Púa personalizada con su nombre", price: 6 },
      { name: "Póster de su grupo favorito", price: 12 },
      { name: "Vinilo de un álbum que le guste", price: 28 },
      { name: "Auriculares inalámbricos", price: 35 },
      { name: "Altavoz bluetooth portátil", price: 45 },
      { name: "Entrada para un concierto", price: 60 },
    ],
  },
  {
    id: "instrumentos", label: "Instrumentos", emoji: "🎸",
    keywords: ["guitarra", "piano", "bateria", "ukelele", "bajo electrico", "violin", "instrumento", "teclado"],
    ideas: [
      { name: "Pack de púas y cuerdas", price: 10 },
      { name: "Afinador de pinza", price: 14 },
      { name: "Libro de partituras", price: 18 },
      { name: "Soporte o funda para su instrumento", price: 30 },
      { name: "Ukelele de iniciación", price: 45 },
    ],
  },
  {
    id: "lectura", label: "Lectura", emoji: "📚",
    keywords: ["leer", "lectura", "libro", "novela", "poesia", "comic", "literatura", "fantasia", "thriller", "kindle"],
    ideas: [
      { name: "Marcapáginas artesanal", price: 5 },
      { name: "Lámpara de lectura con pinza", price: 14 },
      { name: "Novela de su género favorito", price: 20 },
      { name: "Suscripción a audiolibros (3 meses)", price: 30 },
      { name: "Edición ilustrada de un clásico", price: 40 },
    ],
  },
  {
    id: "anime", label: "Anime y manga", emoji: "🍥",
    keywords: ["anime", "manga", "otaku", "japon", "kawaii", "naruto", "one piece", "ghibli"],
    ideas: [
      { name: "Tomo de un manga que siga", price: 9 },
      { name: "Taza de su anime favorito", price: 13 },
      { name: "Figura coleccionable pequeña", price: 25 },
      { name: "Artbook de Studio Ghibli", price: 38 },
    ],
  },
  {
    id: "cine", label: "Cine y series", emoji: "🎬",
    keywords: ["cine", "pelicula", "series", "netflix", "hbo", "marvel", "star wars", "harry potter", "disney", "terror"],
    ideas: [
      { name: "Kit de palomitas gourmet", price: 10 },
      { name: "Póster minimalista de su película favorita", price: 15 },
      { name: "Merchandising de su saga favorita", price: 22 },
      { name: "Proyector de bolsillo (básico)", price: 50 },
    ],
  },
  {
    id: "gaming", label: "Videojuegos", emoji: "🎮",
    keywords: ["videojuego", "gaming", "gamer", "playstation", "xbox", "nintendo", "switch", "pc", "consola", "fortnite", "minecraft", "zelda", "pokemon"],
    ideas: [
      { name: "Alfombrilla XXL para el ratón", price: 15 },
      { name: "Lámpara LED con forma de icono gamer", price: 20 },
      { name: "Tarjeta regalo de su plataforma", price: 25 },
      { name: "Mando o accesorio para su consola", price: 40 },
      { name: "Videojuego que tenga pendiente", price: 50 },
    ],
  },
  {
    id: "juegos-mesa", label: "Juegos de mesa", emoji: "🎲",
    keywords: ["juegos de mesa", "juego de mesa", "cartas", "rol", "ajedrez", "puzzle", "dungeons", "catan"],
    ideas: [
      { name: "Juego de cartas rápido (Dobble, Uno Flip…)", price: 12 },
      { name: "Puzzle de 1000 piezas", price: 18 },
      { name: "Juego de mesa para grupos", price: 30 },
      { name: "Ajedrez de madera de viaje", price: 25 },
    ],
  },
  {
    id: "deporte", label: "Deporte", emoji: "⚽",
    keywords: ["deporte", "futbol", "baloncesto", "tenis", "padel", "gym", "gimnasio", "crossfit", "pesas", "natacion", "ciclismo", "bici", "boxeo", "entrenar"],
    ideas: [
      { name: "Toalla de microfibra deportiva", price: 10 },
      { name: "Botella térmica de acero", price: 16 },
      { name: "Bandas elásticas de entrenamiento", price: 18 },
      { name: "Camiseta técnica o de su equipo", price: 30 },
      { name: "Pulsera de actividad básica", price: 40 },
    ],
  },
  {
    id: "running", label: "Running", emoji: "🏃",
    keywords: ["correr", "running", "maraton", "trail", "atletismo"],
    ideas: [
      { name: "Calcetines técnicos de running", price: 12 },
      { name: "Riñonera o cinturón para el móvil", price: 15 },
      { name: "Frontal LED para correr de noche", price: 22 },
      { name: "Inscripción a una carrera popular", price: 25 },
    ],
  },
  {
    id: "naturaleza", label: "Montaña y naturaleza", emoji: "🏔️",
    keywords: ["montana", "senderismo", "naturaleza", "camping", "acampar", "escalada", "trekking", "aire libre", "excursion", "playa", "surf"],
    ideas: [
      { name: "Navaja multiusos compacta", price: 15 },
      { name: "Taza plegable de silicona", price: 9 },
      { name: "Linterna o frontal recargable", price: 20 },
      { name: "Mochila ligera plegable", price: 25 },
      { name: "Guía de rutas de su zona", price: 18 },
    ],
  },
  {
    id: "yoga", label: "Yoga y bienestar", emoji: "🧘",
    keywords: ["yoga", "meditacion", "pilates", "mindfulness", "relax", "bienestar", "spa", "masaje"],
    ideas: [
      { name: "Vela aromática de soja", price: 10 },
      { name: "Diario de gratitud", price: 12 },
      { name: "Bloque y cinta de yoga", price: 18 },
      { name: "Esterilla de yoga antideslizante", price: 30 },
      { name: "Bono para un masaje", price: 45 },
    ],
  },
  {
    id: "cocina", label: "Cocina", emoji: "🍳",
    keywords: ["cocina", "cocinar", "receta", "chef", "reposteria", "hornear", "pasteles", "comida", "gastronomia", "pizza", "sushi"],
    ideas: [
      { name: "Set de especias del mundo", price: 15 },
      { name: "Delantal divertido personalizado", price: 14 },
      { name: "Libro de recetas temático", price: 20 },
      { name: "Kit para hacer sushi", price: 22 },
      { name: "Clase o taller de cocina", price: 45 },
    ],
  },
  {
    id: "cafe", label: "Café y té", emoji: "☕",
    keywords: ["cafe", "te", "infusion", "matcha", "capuchino", "espresso"],
    ideas: [
      { name: "Taza térmica de viaje", price: 12 },
      { name: "Selección de tés o cafés de especialidad", price: 15 },
      { name: "Cafetera de émbolo (french press)", price: 20 },
      { name: "Kit de matcha con batidor", price: 28 },
    ],
  },
  {
    id: "dulces", label: "Dulces", emoji: "🍫",
    keywords: ["chocolate", "dulce", "golosinas", "chuches", "galletas", "helado", "postre"],
    ideas: [
      { name: "Caja de bombones artesanos", price: 12 },
      { name: "Cesta de golosinas variadas", price: 15 },
      { name: "Kit para hacer chocolate caliente gourmet", price: 18 },
      { name: "Fondue de chocolate", price: 25 },
    ],
  },
  {
    id: "bebidas", label: "Vino y cerveza", emoji: "🍷",
    keywords: ["vino", "cerveza", "gin", "coctel", "cocteleria", "whisky", "vermut", "sidra"],
    ideas: [
      { name: "Pack de cervezas artesanas", price: 15 },
      { name: "Botella de vino de una D.O. especial", price: 18 },
      { name: "Kit de coctelería básico", price: 25 },
      { name: "Cata de vinos para dos", price: 45 },
    ],
  },
  {
    id: "viajes", label: "Viajes", emoji: "✈️",
    keywords: ["viajar", "viaje", "viajes", "turismo", "mochilero", "aventura", "paises", "explorar"],
    ideas: [
      { name: "Organizador de cables para viaje", price: 10 },
      { name: "Funda para pasaporte personalizada", price: 12 },
      { name: "Mapa de rascar del mundo", price: 18 },
      { name: "Cojín de viaje viscoelástico", price: 20 },
      { name: "Báscula digital para maleta", price: 12 },
    ],
  },
  {
    id: "foto", label: "Fotografía", emoji: "📷",
    keywords: ["foto", "fotografia", "camara", "instagram", "polaroid", "revelar"],
    ideas: [
      { name: "Revelado de sus mejores fotos", price: 10 },
      { name: "Trípode flexible para el móvil", price: 15 },
      { name: "Álbum de fotos de tapa dura", price: 22 },
      { name: "Kit de lentes para móvil", price: 25 },
      { name: "Cámara instantánea (tipo Instax Mini)", price: 70 },
    ],
  },
  {
    id: "tecnologia", label: "Tecnología", emoji: "💻",
    keywords: ["tecnologia", "gadget", "informatica", "programar", "programacion", "movil", "ordenador", "robotica", "electronica", "domotica"],
    ideas: [
      { name: "Soporte de aluminio para el móvil", price: 10 },
      { name: "Hub USB‑C", price: 20 },
      { name: "Powerbank compacta", price: 25 },
      { name: "Bombilla inteligente WiFi", price: 15 },
      { name: "Teclado mecánico compacto", price: 50 },
    ],
  },
  {
    id: "plantas", label: "Plantas", emoji: "🪴",
    keywords: ["plantas", "jardin", "jardineria", "huerto", "flores", "cactus", "suculentas", "botanica"],
    ideas: [
      { name: "Kit de semillas de aromáticas", price: 10 },
      { name: "Suculenta en maceta de diseño", price: 14 },
      { name: "Terrario de cristal", price: 25 },
      { name: "Set de herramientas de jardinería", price: 20 },
    ],
  },
  {
    id: "mascotas", label: "Mascotas", emoji: "🐾",
    keywords: ["perro", "perros", "gato", "gatos", "mascota", "mascotas", "animales"],
    ideas: [
      { name: "Juguete interactivo para su mascota", price: 10 },
      { name: "Chapa identificativa grabada", price: 12 },
      { name: "Taza con el retrato de su mascota", price: 18 },
      { name: "Cama o mantita para su mascota", price: 30 },
    ],
  },
  {
    id: "arte", label: "Arte y manualidades", emoji: "🎨",
    keywords: ["arte", "dibujar", "dibujo", "pintar", "pintura", "acuarela", "manualidades", "diy", "ceramica", "ganchillo", "punto", "costura", "lettering"],
    ideas: [
      { name: "Cuaderno de bocetos de calidad", price: 12 },
      { name: "Set de rotuladores de lettering", price: 15 },
      { name: "Caja de acuarelas profesional", price: 25 },
      { name: "Taller de cerámica", price: 45 },
    ],
  },
  {
    id: "moda", label: "Moda", emoji: "👗",
    keywords: ["moda", "ropa", "zapatillas", "sneakers", "estilo", "complementos", "joyas", "bolsos", "gafas"],
    ideas: [
      { name: "Calcetines con diseño divertido", price: 8 },
      { name: "Gorro o bufanda de punto", price: 18 },
      { name: "Bolso tote de diseño", price: 20 },
      { name: "Cartera minimalista", price: 25 },
      { name: "Pendientes o pulsera artesanal", price: 22 },
    ],
  },
  {
    id: "belleza", label: "Cuidado personal", emoji: "💄",
    keywords: ["maquillaje", "belleza", "skincare", "cosmetica", "perfume", "cuidado", "manicura", "barba", "peluqueria"],
    ideas: [
      { name: "Set de mascarillas faciales", price: 10 },
      { name: "Kit de cuidado de barba o manos", price: 18 },
      { name: "Neceser con productos de skincare", price: 28 },
      { name: "Perfume en formato viaje", price: 35 },
    ],
  },
  {
    id: "hogar", label: "Hogar y decoración", emoji: "🏠",
    keywords: ["decoracion", "hogar", "casa", "interiorismo", "velas", "minimalismo", "ordenar"],
    ideas: [
      { name: "Vela aromática en tarro", price: 12 },
      { name: "Manta de sofá suave", price: 25 },
      { name: "Lámina decorativa enmarcada", price: 20 },
      { name: "Difusor de aromas", price: 22 },
    ],
  },
  {
    id: "motor", label: "Motor", emoji: "🏎️",
    keywords: ["coche", "coches", "moto", "motos", "f1", "formula 1", "motor", "motogp", "carreras"],
    ideas: [
      { name: "Ambientador de coche original", price: 6 },
      { name: "Maqueta o coche a escala", price: 20 },
      { name: "Gorra de su escudería favorita", price: 30 },
      { name: "Experiencia de karting", price: 40 },
    ],
  },
];

// Ideas genéricas que se adaptan a cualquier gusto que no esté en el catálogo.
const GENERIC_TEMPLATES = [
  { name: (g) => `Libro o guía sobre ${g}`, price: 18 },
  { name: (g) => `Accesorio temático de ${g}`, price: 12 },
  { name: (g) => `Taza o camiseta con motivo de ${g}`, price: 15 },
  { name: (g) => `Taller o experiencia de ${g}`, price: 40 },
];

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function matchCategories(like) {
  const n = normalize(like);
  if (!n) return [];
  const words = n.split(/[\s,.;/]+/).filter(Boolean);
  return CATALOG.filter((cat) =>
    cat.keywords.some((k) => {
      // Las palabras clave de varias palabras se buscan como frase.
      if (k.includes(" ")) return n.includes(k);
      // Las cortas (p. ej. "te", "pc") deben coincidir con una palabra completa.
      if (k.length <= 3) return words.includes(k);
      return words.some((w) => w.startsWith(k) || k.startsWith(w) && w.length >= 4);
    })
  );
}

/**
 * Devuelve recomendaciones para una lista de gustos y un presupuesto.
 * Resultado: { items: [{name, price, emoji, reason, category}], overBudget: n }
 */
function getRecommendations(likes, budget) {
  const seen = new Set();
  const all = [];

  likes.filter((l) => l && l.trim()).forEach((like) => {
    const cats = matchCategories(like);
    if (cats.length) {
      cats.forEach((cat) =>
        cat.ideas.forEach((idea) => {
          if (seen.has(idea.name)) return;
          seen.add(idea.name);
          all.push({ ...idea, emoji: cat.emoji, category: cat.label, reason: like.trim() });
        })
      );
    } else {
      GENERIC_TEMPLATES.forEach((t) => {
        const name = t.name(like.trim());
        if (seen.has(name)) return;
        seen.add(name);
        all.push({ name, price: t.price, emoji: "✨", category: "Personalizado", reason: like.trim() });
      });
    }
  });

  const within = all.filter((i) => i.price <= budget);
  // Prioriza ideas que aprovechan bien el presupuesto, sin dejar de variar por gusto.
  within.sort((a, b) => Math.abs(budget * 0.8 - a.price) - Math.abs(budget * 0.8 - b.price));

  // Reparto equilibrado: alterna entre gustos para que todos estén representados.
  const byReason = new Map();
  within.forEach((i) => {
    if (!byReason.has(i.reason)) byReason.set(i.reason, []);
    byReason.get(i.reason).push(i);
  });
  const items = [];
  const queues = [...byReason.values()];
  while (queues.some((q) => q.length)) {
    queues.forEach((q) => q.length && items.push(q.shift()));
  }

  return { items, overBudget: all.length - within.length };
}

const LIKE_SUGGESTIONS = CATALOG.map((c) => `${c.emoji} ${c.label}`);
