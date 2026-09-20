export const TOUR_ICON_OPTIONS = [
  { id: "compass", label: "Brújula" },
  { id: "activity", label: "Actividad" },
  { id: "gauge", label: "Dificultad" },
  { id: "clock", label: "Tiempo" },
  { id: "mountain", label: "Montaña" },
  { id: "elevation", label: "Desnivel" },
  { id: "temperature", label: "Temperatura" },
  { id: "trees", label: "Bosque" },
  { id: "route", label: "Ruta" },
  { id: "people", label: "Personas" },
  { id: "price", label: "Precio" },
  { id: "tent", label: "Camping" },
  { id: "camera", label: "Fotografía" },
  { id: "waves", label: "Agua" },
] as const;

export const TOUR_ICON_IDS = TOUR_ICON_OPTIONS.map((option) => option.id) as [
  (typeof TOUR_ICON_OPTIONS)[number]["id"],
  ...(typeof TOUR_ICON_OPTIONS)[number]["id"][],
];

export type TourIconId = (typeof TOUR_ICON_OPTIONS)[number]["id"];

export interface TourFact {
  key: string;
  label: string;
  value: string;
  icon: TourIconId;
  /** When false the card is kept in the admin editor but hidden on the
   *  public salida page. Defaults to true for pre-existing stored data. */
  enabled: boolean;
}

/** Punto de encuentro / Experiencia / Regreso: three fixed steps, each with an editable title and text. */
export const TOUR_ITINERARY_STEP_COUNT = 3;

export interface TourItineraryStep {
  title: string;
  body: string;
}

/** The collapsible "Antes de salir", "Qué haremos"… blocks. Titles are fixed; the text is per tour. */
export const TOUR_INFO_SECTIONS = [
  { key: "before", title: "Antes de salir" },
  { key: "plan", title: "Qué haremos" },
  { key: "includes", title: "Qué incluye" },
  { key: "bring", title: "Qué llevar" },
  { key: "avoid", title: "Qué no llevar" },
] as const;

export type TourInfoSectionKey = (typeof TOUR_INFO_SECTIONS)[number]["key"];

export interface TourDetailCopy {
  lead: string;
  paragraphs: string[];
  facts: TourFact[];
  itinerary: TourItineraryStep[];
  sections: Record<TourInfoSectionKey, string>;
}

/** Generic copy shown for tours saved before these fields existed. */
const DEFAULT_ITINERARY: TourItineraryStep[] = [
  { title: "Punto de encuentro", body: "Lugar y hora por confirmar con las personas inscritas." },
  { title: "Experiencia", body: "Recorrido, pausas y actividades de acuerdo con el destino y las condiciones del día." },
  { title: "Regreso", body: "El horario estimado se compartirá junto con el itinerario definitivo." },
];

const DEFAULT_SECTIONS: Record<TourInfoSectionKey, string> = {
  before: "Te enviaremos el punto de encuentro, horario definitivo y recomendaciones cuando confirmemos tu solicitud.",
  plan: "Compartiremos la ruta con la manada, respetando el ritmo del grupo, el entorno y las indicaciones de seguridad.",
  includes: "Coordinación previa, acompañamiento del grupo y orientación general durante la experiencia. Los servicios específicos se detallan al confirmar.",
  bring: "Ropa cómoda, calzado adecuado, agua, protección solar y los artículos particulares que indiquemos para el destino.",
  avoid: "Evita objetos innecesarios, envases desechables y cualquier elemento que pueda afectar el entorno o dificultar la caminata.",
};

/** A new salida starts with these blank so the admin has to write them (they are required on save). */
export function emptyItineraryAndSections(): Pick<TourDetailCopy, "itinerary" | "sections"> {
  return {
    itinerary: DEFAULT_ITINERARY.map(() => ({ title: "", body: "" })),
    sections: { before: "", plan: "", includes: "", bring: "", avoid: "" },
  };
}

interface DetailVariables {
  duration?: string;
  price?: string;
}

interface DetailPreset {
  lead: string;
  paragraphs: string[];
  activity: string;
  difficulty: string;
  ecosystem: string;
  distance: string;
  altitude: string;
  temperature: string;
}

const DETAILS: Record<string, DetailPreset> = {
  "volcan-santa-ana": {
    lead: "Una ruta para descubrir la fuerza de los paisajes volcánicos de El Salvador.",
    paragraphs: [
      "Viviremos una jornada de senderismo con la manada, avanzando a nuestro ritmo y disfrutando cada cambio del paisaje.",
      "Antes de la salida compartiremos el punto de encuentro, horario, recomendaciones y cualquier requisito especial de la ruta.",
    ],
    activity: "Senderismo",
    difficulty: "Moderada–alta",
    ecosystem: "Volcánico",
    distance: "Por confirmar",
    altitude: "Según la ruta",
    temperature: "Según el clima",
  },
  "reserva-roble-negro": {
    lead: "Una experiencia entre bosque, aire fresco y caminos para reconectar con la naturaleza.",
    paragraphs: [
      "Recorreremos senderos naturales en compañía del club, con espacios para observar el entorno, descansar y compartir.",
      "El itinerario definitivo y las indicaciones de acceso se enviarán a las personas inscritas antes de la aventura.",
    ],
    activity: "Ecoturismo",
    difficulty: "Moderada",
    ecosystem: "Bosque",
    distance: "Por confirmar",
    altitude: "Según la ruta",
    temperature: "Fresca y variable",
  },
  "travesia-berlin-alegria": {
    lead: "Una travesía para conocer nuevos caminos, paisajes de altura y rincones con identidad salvadoreña.",
    paragraphs: [
      "La experiencia combina viaje, caminata y tiempo para disfrutar el recorrido junto a la manada.",
      "Confirmaremos previamente los puntos de encuentro, paradas, alimentación y recomendaciones específicas.",
    ],
    activity: "Viaje y senderismo",
    difficulty: "Moderada",
    ecosystem: "Montaña",
    distance: "Por confirmar",
    altitude: "Según el recorrido",
    temperature: "Fresca y variable",
  },
  "bosque-lya": {
    lead: "Una caminata entre árboles, senderos y momentos para disfrutar en buena compañía.",
    paragraphs: [
      "Avanzaremos con la manada por un entorno natural, haciendo pausas para descansar, tomar fotografías y apreciar el paisaje.",
      "La logística detallada se compartirá con cada participante cuando su solicitud sea confirmada.",
    ],
    activity: "Senderismo",
    difficulty: "Moderada",
    ecosystem: "Bosque",
    distance: "Por confirmar",
    altitude: "Según la ruta",
    temperature: "Fresca y variable",
  },
  "camping-entre-volcanes": {
    lead: "Una noche al aire libre para compartir historias, montaña y cielo con la manada.",
    paragraphs: [
      "Prepararemos una experiencia de camping con orientación previa para que cada participante lleve el equipo adecuado.",
      "El lugar, los horarios, los servicios incluidos y la lista final de equipo se confirmarán antes de la salida.",
    ],
    activity: "Camping",
    difficulty: "Moderada",
    ecosystem: "Montaña",
    distance: "Según el campamento",
    altitude: "Según el destino",
    temperature: "Variable",
  },
  "proxima-aventura-manada": {
    lead: "Estamos preparando una nueva experiencia para seguir descubriendo caminos juntos.",
    paragraphs: [
      "Publicaremos todos los detalles de la ruta en cuanto el itinerario quede confirmado.",
      "Puedes enviar tu solicitud desde esta página y te contactaremos con la información disponible.",
    ],
    activity: "Aventura",
    difficulty: "Por confirmar",
    ecosystem: "Por confirmar",
    distance: "Por confirmar",
    altitude: "Por confirmar",
    temperature: "Por confirmar",
  },
};

const FALLBACK: DetailPreset = {
  lead: "Una nueva experiencia para caminar, viajar y compartir con Club de Lobos.",
  paragraphs: [
    "La información completa de la ruta se confirmará antes de la salida.",
    "Enviaremos a las personas inscritas el horario, punto de encuentro, recomendaciones y requisitos.",
  ],
  activity: "Aventura",
  difficulty: "Por confirmar",
  ecosystem: "Por confirmar",
  distance: "Por confirmar",
  altitude: "Por confirmar",
  temperature: "Por confirmar",
};

export function getDefaultTourDetail(slug: string, variables: DetailVariables = {}): TourDetailCopy {
  const preset = DETAILS[slug] ?? FALLBACK;
  return {
    lead: preset.lead,
    paragraphs: preset.paragraphs,
    facts: [
      { key: "activity", label: "Actividad", value: preset.activity, icon: "compass", enabled: true },
      { key: "difficulty", label: "Dificultad", value: preset.difficulty, icon: "gauge", enabled: true },
      { key: "time", label: "Tiempo", value: variables.duration ?? "Por confirmar", icon: "clock", enabled: true },
      { key: "altitude", label: "Altura", value: preset.altitude, icon: "mountain", enabled: true },
      { key: "elevation", label: "Desnivel", value: "Por confirmar", icon: "elevation", enabled: true },
      { key: "temperature", label: "Temperatura", value: preset.temperature, icon: "temperature", enabled: true },
      { key: "ecosystem", label: "Ecosistema", value: preset.ecosystem, icon: "trees", enabled: true },
      { key: "distance", label: "Distancia", value: preset.distance, icon: "route", enabled: true },
      { key: "people", label: "Aventureros", value: "Cupo limitado", icon: "people", enabled: true },
      { key: "price", label: "Precio", value: variables.price ?? "Consultar", icon: "price", enabled: true },
    ],
    itinerary: DEFAULT_ITINERARY,
    sections: DEFAULT_SECTIONS,
  };
}

function isIconId(value: unknown): value is TourIconId {
  return typeof value === "string" && TOUR_ICON_OPTIONS.some((option) => option.id === value);
}

/** Sanitizes JSONB content before it reaches a public page or a client component. */
export function normalizeTourDetail(value: unknown, fallback: TourDetailCopy): TourDetailCopy {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const candidate = value as Record<string, unknown>;
  const facts = Array.isArray(candidate.facts)
    ? candidate.facts.flatMap((fact, index) => {
        if (!fact || typeof fact !== "object" || Array.isArray(fact)) return [];
        const item = fact as Record<string, unknown>;
        if (typeof item.label !== "string" || typeof item.value !== "string" || !isIconId(item.icon)) return [];
        return [{
          key: typeof item.key === "string" && item.key ? item.key : `fact-${index}`,
          label: item.label,
          value: item.value,
          icon: item.icon,
          // Missing on data written before per-card visibility existed — treat as shown.
          enabled: typeof item.enabled === "boolean" ? item.enabled : true,
        }];
      })
    : [];

  const storedItinerary = Array.isArray(candidate.itinerary) ? candidate.itinerary : [];
  const itinerary = fallback.itinerary.map((fallbackStep, index) => {
    const step = storedItinerary[index];
    if (!step || typeof step !== "object" || Array.isArray(step)) return fallbackStep;
    const item = step as Record<string, unknown>;
    return {
      title: typeof item.title === "string" && item.title ? item.title : fallbackStep.title,
      body: typeof item.body === "string" && item.body ? item.body : fallbackStep.body,
    };
  });

  const storedSections = candidate.sections && typeof candidate.sections === "object" && !Array.isArray(candidate.sections)
    ? candidate.sections as Record<string, unknown>
    : {};
  const sections = Object.fromEntries(
    TOUR_INFO_SECTIONS.map(({ key }) => {
      const body = storedSections[key];
      return [key, typeof body === "string" && body ? body : fallback.sections[key]];
    }),
  ) as Record<TourInfoSectionKey, string>;

  return {
    itinerary,
    sections,
    lead: typeof candidate.lead === "string" && candidate.lead ? candidate.lead : fallback.lead,
    paragraphs: Array.isArray(candidate.paragraphs)
      ? candidate.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === "string" && Boolean(paragraph))
      : fallback.paragraphs,
    facts: facts.length >= 1 && facts.length <= 24 ? facts : fallback.facts,
  };
}
