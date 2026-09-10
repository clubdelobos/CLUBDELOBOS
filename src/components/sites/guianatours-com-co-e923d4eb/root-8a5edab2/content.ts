/**
 * Verbatim content extracted from https://guianatours.com.co/ (homepage).
 * Text taken with `element.textContent`; asset paths point at the downloaded originals.
 */
import type {
  GalleryItem,
  HeroSlide,
  NavLink,
  ProductCard,
  Review,
  SocialLink,
} from "@/types/guianatours-com-co-e923d4eb";

export const ASSETS = "/sites/guianatours-com-co-e923d4eb/root-8a5edab2";

const SALIDAS = "/proximas-salidas";

export const PHONE_LABEL = "+503 7952-8033 / +503 7554-6785";
export const PHONE_HREF = "tel:+50379528033";
export const EMAIL = "";

export const NAV_LINKS: NavLink[] = [
  { id: "nav-inicio", label: "Inicio", href: "/", active: true },
  { id: "nav-club-lobos", label: "Club de Lobos", href: "/club-de-lobos" },
  { id: "nav-calendario", label: "Calendario", href: "/calendario" },
  { id: "nav-proximas-salidas", label: "Próximas salidas", href: SALIDAS },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/lobos_sv/", network: "instagram" },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-venados-chingaza",
    image: `${ASSETS}/hero/venados-chingaza.jpg`,
    heading: "La aventura se vive en manada",
    description:
      "Somos un club de amigos que disfruta el senderismo, los viajes, el camping y cada experiencia al máximo.",
    buttonLabel: "Ver próximas salidas",
    href: SALIDAS,
  },
  {
    id: "hero-cascada-sueva",
    image: `${ASSETS}/hero/cascada-sueve.jpg`,
    heading: "Caminos que nos conectan",
    description:
      "Volcanes, bosques y nuevas historias por vivir desde El Salvador con la manada.",
    buttonLabel: "Conoce el club",
    href: "/#nosotros",
  },
  {
    id: "hero-chingaza-nocturna",
    image: `${ASSETS}/hero/chingaza-nocturna.jpg`,
    heading: "El Salvador se vive al aire libre",
    description:
      "Cada ruta es una oportunidad para descubrir paisajes, compartir y volver con una gran historia.",
    buttonLabel: "Explora las aventuras",
    href: SALIDAS,
  },
  {
    id: "hero-laguna-siecha",
    image: `${ASSETS}/hero/laguna-de-siecha.jpg`,
    heading: "Siempre hay una nueva ruta",
    description:
      "Preparamos experiencias para quienes disfrutan caminar, acampar y viajar en buena compañía.",
    buttonLabel: "Síguenos en Instagram",
    href: "https://www.instagram.com/lobos_sv/",
  },
];

export const PRODUCTS: ProductCard[] = [
  {
    id: "tour-farallones-sutatausa",
    category: "nacional",
    subcategory: "volcanes",
    title: "Volcán de Santa Ana",
    price: "Consultar",
    currencySymbol: "",
    nextDeparture: "12 Sep 2026",
    image: `${ASSETS}/products/farallones-sutatausa.jpg`,
    hoverImage: `${ASSETS}/products/farallones-sutatausa-hover.jpg`,
    href: SALIDAS,
    buttonLabel: "Solicitar información",
  },
  {
    id: "tour-lagunas-siecha",
    category: "nacional",
    subcategory: "rios",
    title: "Reserva del Roble Negro",
    price: "Consultar",
    currencySymbol: "",
    nextDeparture: "12 Sep 2026",
    image: `${ASSETS}/products/lagunas-de-siecha.jpg`,
    hoverImage: `${ASSETS}/products/lagunas-de-siecha-hover.jpg`,
    href: SALIDAS,
    buttonLabel: "Solicitar información",
  },
  {
    id: "tour-tatacoa",
    category: "nacional",
    subcategory: "pueblos",
    title: "Travesía Berlín–Alegría",
    price: "Consultar",
    currencySymbol: "",
    nextDeparture: "19 Sep 2026 a 20 Sep 2026",
    image: `${ASSETS}/products/tatacoa.png`,
    hoverImage: `${ASSETS}/products/tatacoa-hover.png`,
    href: SALIDAS,
    buttonLabel: "Solicitar información",
  },
  {
    id: "tour-chingaza-kids",
    category: "nacional",
    subcategory: "rios",
    title: "Bosque Lya",
    price: "Consultar",
    currencySymbol: "",
    nextDeparture: "19 Sep 2026",
    image: `${ASSETS}/products/chingaza-kids.jpg`,
    hoverImage: `${ASSETS}/products/chingaza-kids-hover.jpg`,
    href: SALIDAS,
    buttonLabel: "Solicitar información",
  },
  {
    id: "tour-camping-chingaza",
    category: "nacional",
    subcategory: "volcanes",
    title: "Camping entre volcanes",
    price: "Consultar",
    currencySymbol: "",
    nextDeparture: "19 Sep 2026 a 20 Sep 2026",
    image: `${ASSETS}/products/camping-chingaza.jpg`,
    hoverImage: `${ASSETS}/products/camping-chingaza-hover.jpg`,
    href: SALIDAS,
    buttonLabel: "Solicitar información",
  },
  {
    id: "tour-penas-blancas",
    category: "nacional",
    subcategory: "pueblos",
    title: "Próxima aventura de la manada",
    price: "Consultar",
    currencySymbol: "",
    nextDeparture: "20 Sep 2026",
    image: `${ASSETS}/products/penas-blancas.png`,
    hoverImage: `${ASSETS}/products/penas-blancas-hover.png`,
    href: SALIDAS,
    buttonLabel: "Solicitar información",
  },
];

export const GUIAS = {
  heading: "Aventuras que nos conectan",
  buttonLabel: "Mira la próxima salida",
  buttonHref: SALIDAS,
  images: [
    { src: `${ASSETS}/guias/guia-natours.jpg`, width: 439, height: 373 },
    { src: `${ASSETS}/guias/caminata-natural.jpg`, width: 446, height: 373 },
  ],
};

export const CAMPING = {
  heading: "Somos Club de Lobos",
  body: "Somos un club de amigos que nos encanta la aventura: senderismo, viajes, camping y vivir cada experiencia al máximo.",
  buttonLabel: "Síguenos en Instagram",
  buttonHref: "https://www.instagram.com/lobos_sv/",
  image: { src: `${ASSETS}/camping/1024.jpg`, width: 1024, height: 1024 },
};

export const FOTOGRAFIAS = {
  heading: "Historias de la manada",
  body: "Momentos, rutas y paisajes compartidos por Club de Lobos.",
};

const UPLOADS = "https://guianatours.com.co/wp-content/uploads";

export const GALLERY: GalleryItem[] = [
  { id: "gallery-dsc-4263", thumb: `${ASSETS}/gallery/dsc-4263.png`, full: `${UPLOADS}/2022/09/DSC_4263.png`, title: "Bolas de Fuego · Nejapa", width: 300, height: 200 },
  { id: "gallery-1", thumb: `${ASSETS}/gallery/1.jpg`, full: `${UPLOADS}/2022/03/1.jpg`, title: "Volcán de Santa Ana", width: 300, height: 202 },
  { id: "gallery-dsc-0452", thumb: `${ASSETS}/gallery/dsc-0452.jpg`, full: `${UPLOADS}/2021/11/DSC_0452.jpg`, title: "Reserva del Roble Negro", width: 300, height: 200 },
  { id: "gallery-camping", thumb: `${ASSETS}/gallery/camping.jpg`, full: `${UPLOADS}/2021/11/1024.jpg`, title: "Bosque Lya", width: 300, height: 300 },
  { id: "gallery-chingaza-nocturna", thumb: `${ASSETS}/gallery/chingaza-nocturna.jpeg`, full: `${UPLOADS}/2022/09/chingaza-nocturna.jpeg`, title: "Senderismo con la manada", width: 200, height: 300 },
  { id: "gallery-chingaza-kids", thumb: `${ASSETS}/gallery/chingaza-kids.jpeg`, full: `${UPLOADS}/2022/09/chingaza.kids_.jpeg`, title: "Rutas de El Salvador", width: 200, height: 300 },
  { id: "gallery-farallones", thumb: `${ASSETS}/gallery/farallones.jpeg`, full: `${UPLOADS}/2022/09/farallones.jpeg`, title: "Travesía Berlín–Alegría", width: 300, height: 200 },
  { id: "gallery-kids", thumb: `${ASSETS}/gallery/kids.jpeg`, full: `${UPLOADS}/2022/09/kids.jpeg`, title: "Camping y montaña", width: 203, height: 300 },
  { id: "gallery-siecha", thumb: `${ASSETS}/gallery/siecha.jpeg`, full: `${UPLOADS}/2022/09/siecha.jpeg`, title: "Cada paso cuenta", width: 300, height: 200 },
  { id: "gallery-sueva", thumb: `${ASSETS}/gallery/sueva.jpeg`, full: `${UPLOADS}/2022/09/sueva.jpeg`, title: "Nuevos caminos", width: 300, height: 215 },
  { id: "gallery-venados", thumb: `${ASSETS}/gallery/venados.jpeg`, full: `${UPLOADS}/2022/09/venados.jpeg`, title: "Aventura en buena compañía", width: 300, height: 200 },
];

export const REVIEWS_SUMMARY = {
  rating: "LA MANADA",
  countLabel: "Aventuras que dejan huella",
  stars: 5,
};

export const REVIEWS: Review[] = [
  {
    id: "review-manuel-nacho",
    author: "La manada",
    relativeDate: "hace 4 años",
    isoDate: "2022-02-03",
    rating: 5,
    text: "La aventura se disfruta más cuando la compartimos.",
  },
  {
    id: "review-wilber-cifuentes",
    author: "Senderismo",
    relativeDate: "hace 4 años",
    isoDate: "2022-01-31",
    rating: 5,
    text: "Cada paso cuenta y cada ruta deja una nueva historia.",
  },
  {
    id: "review-sergio-velasquez",
    author: "Camping",
    relativeDate: "hace 4 años",
    isoDate: "2022-01-30",
    rating: 5,
    text: "Noches bajo las estrellas, montaña y buena compañía.",
  },
  {
    id: "review-luis-sabogal",
    author: "Viajes",
    relativeDate: "hace 4 años",
    isoDate: "2022-01-24",
    rating: 5,
    text: "Conocemos nuevos destinos sin dejar de sentirnos en casa.",
  },
  {
    id: "review-lamolina-chiquita",
    author: "El Salvador",
    relativeDate: "hace 4 años",
    isoDate: "2022-01-22",
    rating: 5,
    text: "Volcanes, bosques y caminos que vale la pena recorrer.",
  },
  {
    id: "review-luz-elena-martinez",
    author: "Próxima aventura",
    relativeDate: "hace 4 años",
    isoDate: "2022-01-21",
    rating: 5,
    text: "Siempre hay un nuevo lugar esperando a la manada.",
  },
];

export const FOOTER = {
  registro: "El Salvador · Senderismo, camping y viajes en manada",
  sitemapHeading: "Mapa del sitio",
  legalHeading: "Legal",
  subscribeHeading: "Únete a la manada",
  subscribeBody: "Síguenos y escríbenos directamente para enterarte de cada salida.",
  legalLinks: [
    { label: "Términos y condiciones", href: "/legal/terminos" },
    { label: "Política de privacidad", href: "/legal/privacidad" },
    { label: "Política de cancelación", href: "/legal/cancelacion" },
    { label: "Protocolos de bioseguridad", href: "/legal/bioseguridad" },
    { label: "Política de cookies", href: "/legal/cookies" },
  ],
  copyright: "© 2026 Club de Lobos.",
  designer: { label: "", href: null as string | null },
};
