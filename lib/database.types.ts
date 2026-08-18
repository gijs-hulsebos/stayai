export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: { created_at: string; hotel_key: string; hotel_snapshot: Json; id: string; user_id: string };
        Insert: { created_at?: string; hotel_key: string; hotel_snapshot?: Json; id?: string; user_id: string };
        Update: { created_at?: string; hotel_key?: string; hotel_snapshot?: Json; id?: string; user_id?: string };
        Relationships: [];
      };
      reservations: {
        Row: {
          adults: number; cancelled_at: string | null; check_in: string; check_out: string;
          child_ages: number[]; created_at: string; currency: string; hotel_key: string;
          hotel_name: string; hotel_snapshot: Json; hotel_url: string | null; id: string;
          image_url: string | null; location_key: string | null; nightly_rate: number;
          pets: number; place_name: string | null; provider_code: string | null;
          provider_name: string | null; rate_collected_at: string; reference: string;
          rooms: number; status: string; total_price: number; user_id: string;
        };
        Insert: {
          adults?: number; cancelled_at?: string | null; check_in: string; check_out: string;
          child_ages?: number[]; created_at?: string; currency: string; hotel_key: string;
          hotel_name: string; hotel_snapshot?: Json; hotel_url?: string | null; id?: string;
          image_url?: string | null; location_key?: string | null; nightly_rate: number;
          pets?: number; place_name?: string | null; provider_code?: string | null;
          provider_name?: string | null; rate_collected_at: string; reference: string;
          rooms?: number; status?: string; total_price: number; user_id: string;
        };
        Update: {
          adults?: number; cancelled_at?: string | null; check_in?: string; check_out?: string;
          child_ages?: number[]; created_at?: string; currency?: string; hotel_key?: string;
          hotel_name?: string; hotel_snapshot?: Json; hotel_url?: string | null; id?: string;
          image_url?: string | null; location_key?: string | null; nightly_rate?: number;
          pets?: number; place_name?: string | null; provider_code?: string | null;
          provider_name?: string | null; rate_collected_at?: string; reference?: string;
          rooms?: number; status?: string; total_price?: number; user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
