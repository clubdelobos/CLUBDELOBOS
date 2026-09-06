/**
 * Hand-written to match `supabase/migrations/0001_init.sql` exactly.
 *
 * Once a live Supabase project exists, regenerate this file for real instead
 * of maintaining it by hand:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 *
 * `Relationships: []` (or a real FK entry, for `bookings.tour_id`) is
 * required on every table — `@supabase/postgrest-js`'s generic constraint
 * checks for it, and omitting it silently degrades every `.from(...)` call
 * to `never` instead of erroring, which is easy to miss.
 */

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type ProfileRole = "admin" | "worker";
export type ContentBlockKey = "guias" | "camping" | "fotografias";
export type AnalyticsEventType = "page_view" | "tour_click" | "cta_click" | "social_click";
export interface TourImage { url: string; width: number; height: number }

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: ProfileRole; full_name: string | null; created_at: string };
        Insert: { id: string; role?: ProfileRole; full_name?: string | null };
        Update: { role?: ProfileRole; full_name?: string | null };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: 1;
          logo_header_url: string | null;
          logo_footer_url: string | null;
          favicon_url: string | null;
          phone_label: string;
          phone_href: string;
          email: string;
          address: string | null;
          social_facebook_url: string | null;
          social_instagram_url: string | null;
          social_youtube_url: string | null;
          // Added in 0007_site_settings_tiktok.sql.
          social_tiktok_url: string | null;
          palette_1: string;
          palette_2: string;
          palette_3: string;
          palette_5: string;
          palette_7: string;
          palette_8: string;
          footer_registro: string | null;
          footer_copyright: string;
          footer_credit_label: string;
          footer_credit_href: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Update: Partial<Omit<Database["public"]["Tables"]["site_settings"]["Row"], "id">>;
        Relationships: [];
      };
      nav_links: {
        Row: { id: string; label: string; href: string; is_active: boolean; sort_order: number; created_at: string };
        Insert: { id?: string; label: string; href: string; is_active?: boolean; sort_order?: number };
        Update: Partial<{ label: string; href: string; is_active: boolean; sort_order: number }>;
        Relationships: [];
      };
      hero_slides: {
        Row: {
          id: string;
          image_url: string;
          image_w: number;
          image_h: number;
          heading: string;
          description: string;
          button_label: string;
          href: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hero_slides"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Database["public"]["Tables"]["hero_slides"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
      tours: {
        Row: {
          id: string;
          slug: string;
          title: string;
          price: string;
          currency_symbol: string;
          departure_dates: string[];
          images: TourImage[];
          button_label: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tours"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Database["public"]["Tables"]["tours"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
      content_blocks: {
        Row: { key: ContentBlockKey; data: Record<string, unknown>; updated_at: string };
        Insert: { key: ContentBlockKey; data: Record<string, unknown> };
        Update: { data: Record<string, unknown> };
        Relationships: [];
      };
      gallery_items: {
        Row: {
          id: string;
          image_url: string;
          image_w: number;
          image_h: number;
          title: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gallery_items"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Database["public"]["Tables"]["gallery_items"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          author: string;
          review_date: string;
          rating: number;
          body_text: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          customer_name: string;
          email: string;
          phone: string;
          tour_id: string;
          requested_date: string;
          num_people: number;
          status: BookingStatus;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at" | "status"> & {
          id?: string;
          status?: BookingStatus;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "bookings_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: AnalyticsEventType;
          path: string;
          label: string | null;
          created_at: string;
          // Added in 0006_analytics_meta.sql — null on rows written before it,
          // and on installs that haven't applied the migration yet.
          country: string | null;
          device: string | null;
        };
        Insert: {
          id?: string;
          event_type: AnalyticsEventType;
          path: string;
          label?: string | null;
          country?: string | null;
          device?: string | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
