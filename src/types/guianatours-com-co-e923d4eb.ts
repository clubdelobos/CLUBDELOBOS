/**
 * Content contracts for the guianatours.com.co clone.
 * site-key: guianatours-com-co-e923d4eb
 */

export interface HeroSlide {
  /** Stable identifier — a DB row id once sourced from Supabase. Used as the React list key. */
  id: string;
  /** Full-bleed background photograph. */
  image: string;
  /** `.elementor-slide-heading` */
  heading: string;
  /** `.elementor-slide-description` */
  description: string;
  /** `.elementor-slide-button` label — rendered as a div, the whole slide is the link. */
  buttonLabel: string;
  /** Destination of the wrapping `.swiper-slide-inner` anchor. */
  href: string;
}

export interface ProductCard {
  /** Stable identifier — a DB row id once sourced from Supabase. Used as the React list key. */
  id: string;
  /** `.woocommerce-loop-product__title` */
  title: string;
  /** Formatted price exactly as WooCommerce renders it, e.g. "169.000". */
  price: string;
  /** Currency symbol rendered in `.woocommerce-Price-currencySymbol`. */
  currencySymbol: string;
  /** Text after the bold "Próxima salida:" label in `.closest-booking-availability`. */
  nextDeparture: string;
  /** Primary thumbnail (woocommerce_thumbnail, 600×360). */
  image: string;
  /** Secondary image revealed on hover (`.secondary-product-image`). */
  hoverImage: string;
  /** Product permalink. */
  href: string;
  /** Add-to-cart label. */
  buttonLabel: string;
}

export interface GalleryItem {
  /** Stable identifier — a DB row id once sourced from Supabase. Used as the React list key. */
  id: string;
  /** Thumbnail used for the justified row layout. */
  thumb: string;
  /** Full-size original, target of the lightbox link. */
  full: string;
  /** `data-elementor-lightbox-title` */
  title: string;
  /** Intrinsic thumbnail width, used to compute justified row ratios. */
  width: number;
  /** Intrinsic thumbnail height. */
  height: number;
}

export interface Review {
  /** Stable identifier — a DB row id once sourced from Supabase. Used as the React list key. */
  id: string;
  author: string;
  /** Relative date as rendered by Trustindex, e.g. "hace 4 años". */
  relativeDate: string;
  /** Machine-readable date of the review. */
  isoDate: string;
  rating: number;
  text: string;
}

export interface NavLink {
  /** Stable identifier — a DB row id once sourced from Supabase. Used as the React list key. */
  id: string;
  label: string;
  href: string;
  /** True for the entry matching the current route (rendered in the palette-7 accent color). */
  active?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  network: "facebook" | "instagram" | "youtube" | "tiktok";
}
