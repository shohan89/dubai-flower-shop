/**
 * Supabase database types.
 *
 * Hand-authored from `supabase/migrations/*.sql` because `supabase gen
 * types` requires a local Docker/Podman runtime that isn't available in
 * this environment. Once Docker is available, regenerate authoritatively
 * with:
 *   npx supabase gen types typescript --db-url "$SUPABASE_DB_URL" > src/types/database.types.ts
 * (use the connection pooler host if the direct db.<ref>.supabase.co host
 * doesn't resolve over IPv4 — see docs/DATABASE.md).
 *
 * `Relationships` arrays (FK metadata used for nested `select()` typing)
 * are intentionally omitted (`[]`) — regenerate to get accurate ones.
 * Postgres `numeric` columns are typed `string`, matching real
 * PostgREST/Supabase behavior (avoids float precision loss on money).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          default_locale: string;
          marketing_opt_in: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          default_locale?: string;
          marketing_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          default_locale?: string;
          marketing_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          recipient_name: string;
          phone: string;
          emirate: string;
          area: string;
          building: string | null;
          apartment: string | null;
          street: string | null;
          landmark: string | null;
          city: string;
          country: string;
          is_default: boolean;
          latitude: string | null;
          longitude: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          recipient_name: string;
          phone: string;
          emirate?: string;
          area: string;
          building?: string | null;
          apartment?: string | null;
          street?: string | null;
          landmark?: string | null;
          city?: string;
          country?: string;
          is_default?: boolean;
          latitude?: string | null;
          longitude?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          recipient_name?: string;
          phone?: string;
          emirate?: string;
          area?: string;
          building?: string | null;
          apartment?: string | null;
          street?: string | null;
          landmark?: string | null;
          city?: string;
          country?: string;
          is_default?: boolean;
          latitude?: string | null;
          longitude?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          parent_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      addons: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: string;
          currency: string;
          image_url: string | null;
          stock_quantity: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: string;
          currency?: string;
          image_url?: string | null;
          stock_quantity?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: string;
          currency?: string;
          image_url?: string | null;
          stock_quantity?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          sku: string;
          product_type: string;
          base_price: string;
          compare_at_price: string | null;
          cost_price: string | null;
          currency: string;
          stock_quantity: number;
          low_stock_threshold: number;
          status: string;
          featured: boolean;
          bestseller: boolean;
          new_arrival: boolean;
          on_sale: boolean;
          delivery_available: boolean;
          flower_type: string | null;
          flower_color: string | null;
          stem_count: number | null;
          bouquet_size: string | null;
          occasion: string | null;
          fragrance: string | null;
          freshness_information: string | null;
          plant_type: string | null;
          indoor_outdoor: string | null;
          height_cm: string | null;
          pot_size: string | null;
          sunlight: string | null;
          watering_frequency: string | null;
          care_level: string | null;
          pot_included: boolean | null;
          care_instructions: string | null;
          search_vector: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          sku: string;
          product_type: string;
          base_price: string;
          compare_at_price?: string | null;
          cost_price?: string | null;
          currency?: string;
          stock_quantity?: number;
          low_stock_threshold?: number;
          status?: string;
          featured?: boolean;
          bestseller?: boolean;
          new_arrival?: boolean;
          on_sale?: boolean;
          delivery_available?: boolean;
          flower_type?: string | null;
          flower_color?: string | null;
          stem_count?: number | null;
          bouquet_size?: string | null;
          occasion?: string | null;
          fragrance?: string | null;
          freshness_information?: string | null;
          plant_type?: string | null;
          indoor_outdoor?: string | null;
          height_cm?: string | null;
          pot_size?: string | null;
          sunlight?: string | null;
          watering_frequency?: string | null;
          care_level?: string | null;
          pot_included?: boolean | null;
          care_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          sku?: string;
          product_type?: string;
          base_price?: string;
          compare_at_price?: string | null;
          cost_price?: string | null;
          currency?: string;
          stock_quantity?: number;
          low_stock_threshold?: number;
          status?: string;
          featured?: boolean;
          bestseller?: boolean;
          new_arrival?: boolean;
          on_sale?: boolean;
          delivery_available?: boolean;
          flower_type?: string | null;
          flower_color?: string | null;
          stem_count?: number | null;
          bouquet_size?: string | null;
          occasion?: string | null;
          fragrance?: string | null;
          freshness_information?: string | null;
          plant_type?: string | null;
          indoor_outdoor?: string | null;
          height_cm?: string | null;
          pot_size?: string | null;
          sunlight?: string | null;
          watering_frequency?: string | null;
          care_level?: string | null;
          pot_included?: boolean | null;
          care_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          name: string;
          price_override: string | null;
          compare_at_price_override: string | null;
          attributes: Json;
          stock_quantity: number;
          is_default: boolean;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          name: string;
          price_override?: string | null;
          compare_at_price_override?: string | null;
          attributes?: Json;
          stock_quantity?: number;
          is_default?: boolean;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string;
          name?: string;
          price_override?: string | null;
          compare_at_price_override?: string | null;
          attributes?: Json;
          stock_quantity?: number;
          is_default?: boolean;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          url: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          url: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          url?: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          product_id: string;
          category_id: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          product_id: string;
          category_id: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          category_id?: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      collection_products: {
        Row: {
          collection_id: string;
          product_id: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          collection_id: string;
          product_id: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          collection_id?: string;
          product_id?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      product_tags: {
        Row: {
          product_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          product_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      product_addons: {
        Row: {
          product_id: string;
          addon_id: string;
          is_default: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          product_id: string;
          addon_id: string;
          is_default?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          addon_id?: string;
          is_default?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      delivery_zones: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_delivery_fee: string;
          minimum_order_amount: string;
          currency: string;
          same_day_available: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          base_delivery_fee?: string;
          minimum_order_amount?: string;
          currency?: string;
          same_day_available?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          base_delivery_fee?: string;
          minimum_order_amount?: string;
          currency?: string;
          same_day_available?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      delivery_zone_areas: {
        Row: {
          id: string;
          delivery_zone_id: string;
          area_name: string;
          postcode: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          delivery_zone_id: string;
          area_name: string;
          postcode?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          delivery_zone_id?: string;
          area_name?: string;
          postcode?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_slots: {
        Row: {
          id: string;
          label: string;
          start_time: string;
          end_time: string;
          is_same_day: boolean;
          extra_fee: string;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          start_time: string;
          end_time: string;
          is_same_day?: boolean;
          extra_fee?: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          start_time?: string;
          end_time?: string;
          is_same_day?: boolean;
          extra_fee?: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: string;
          discount_value: string;
          currency: string;
          minimum_order_amount: string;
          usage_limit: number | null;
          usage_limit_per_customer: number | null;
          times_used: number;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: string;
          discount_value: string;
          currency?: string;
          minimum_order_amount?: string;
          usage_limit?: number | null;
          usage_limit_per_customer?: number | null;
          times_used?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string | null;
          discount_type?: string;
          discount_value?: string;
          currency?: string;
          minimum_order_amount?: string;
          usage_limit?: number | null;
          usage_limit_per_customer?: number | null;
          times_used?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      coupon_products: {
        Row: { coupon_id: string; product_id: string; created_at: string };
        Insert: { coupon_id: string; product_id: string; created_at?: string };
        Update: { coupon_id?: string; product_id?: string; created_at?: string };
        Relationships: [];
      };
      coupon_categories: {
        Row: { coupon_id: string; category_id: string; created_at: string };
        Insert: { coupon_id: string; category_id: string; created_at?: string };
        Update: { coupon_id?: string; category_id?: string; created_at?: string };
        Relationships: [];
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          status: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          status?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          status?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price_snapshot: string;
          selected_addons: Json;
          gift_message: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity: number;
          unit_price_snapshot: string;
          selected_addons?: Json;
          gift_message?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          unit_price_snapshot?: string;
          selected_addons?: Json;
          gift_message?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          status: string;
          payment_status: string;
          currency: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          subtotal: string;
          discount_total: string;
          delivery_fee: string;
          tax_total: string;
          total: string;
          coupon_id: string | null;
          coupon_code: string | null;
          gift_message: string | null;
          order_notes: string | null;
          placed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: string;
          payment_status?: string;
          currency?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          subtotal: string;
          discount_total?: string;
          delivery_fee?: string;
          tax_total?: string;
          total: string;
          coupon_id?: string | null;
          coupon_code?: string | null;
          gift_message?: string | null;
          order_notes?: string | null;
          placed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: string;
          payment_status?: string;
          currency?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          subtotal?: string;
          discount_total?: string;
          delivery_fee?: string;
          tax_total?: string;
          total?: string;
          coupon_id?: string | null;
          coupon_code?: string | null;
          gift_message?: string | null;
          order_notes?: string | null;
          placed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name_snapshot: string;
          product_sku_snapshot: string;
          variant_name_snapshot: string | null;
          product_image_url_snapshot: string | null;
          unit_price: string;
          quantity: number;
          line_subtotal: string;
          selected_addons: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name_snapshot: string;
          product_sku_snapshot: string;
          variant_name_snapshot?: string | null;
          product_image_url_snapshot?: string | null;
          unit_price: string;
          quantity: number;
          line_subtotal: string;
          selected_addons?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name_snapshot?: string;
          product_sku_snapshot?: string;
          variant_name_snapshot?: string | null;
          product_image_url_snapshot?: string | null;
          unit_price?: string;
          quantity?: number;
          line_subtotal?: string;
          selected_addons?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          previous_status: string | null;
          new_status: string;
          note: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          previous_status?: string | null;
          new_status: string;
          note?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          previous_status?: string | null;
          new_status?: string;
          note?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          status: string;
          amount: string;
          currency: string;
          provider_reference: string | null;
          provider_metadata: Json;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider: string;
          status?: string;
          amount: string;
          currency?: string;
          provider_reference?: string | null;
          provider_metadata?: Json;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          status?: string;
          amount?: string;
          currency?: string;
          provider_reference?: string | null;
          provider_metadata?: Json;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      refunds: {
        Row: {
          id: string;
          order_id: string;
          payment_id: string | null;
          amount: string;
          currency: string;
          reason: string | null;
          status: string;
          provider_reference: string | null;
          processed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          payment_id?: string | null;
          amount: string;
          currency?: string;
          reason?: string | null;
          status?: string;
          provider_reference?: string | null;
          processed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          payment_id?: string | null;
          amount?: string;
          currency?: string;
          reason?: string | null;
          status?: string;
          provider_reference?: string | null;
          processed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_deliveries: {
        Row: {
          id: string;
          order_id: string;
          delivery_zone_id: string | null;
          delivery_slot_id: string | null;
          address_id: string | null;
          recipient_name: string;
          recipient_phone: string;
          emirate: string;
          area: string;
          building: string | null;
          apartment: string | null;
          street: string | null;
          landmark: string | null;
          delivery_date: string;
          delivery_fee: string;
          status: string;
          tracking_notes: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          delivery_zone_id?: string | null;
          delivery_slot_id?: string | null;
          address_id?: string | null;
          recipient_name: string;
          recipient_phone: string;
          emirate?: string;
          area: string;
          building?: string | null;
          apartment?: string | null;
          street?: string | null;
          landmark?: string | null;
          delivery_date: string;
          delivery_fee?: string;
          status?: string;
          tracking_notes?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          delivery_zone_id?: string | null;
          delivery_slot_id?: string | null;
          address_id?: string | null;
          recipient_name?: string;
          recipient_phone?: string;
          emirate?: string;
          area?: string;
          building?: string | null;
          apartment?: string | null;
          street?: string | null;
          landmark?: string | null;
          delivery_date?: string;
          delivery_fee?: string;
          status?: string;
          tracking_notes?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          quantity_on_hand: number;
          quantity_reserved: number;
          quantity_available: number;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_transactions: {
        Row: {
          id: string;
          inventory_id: string;
          quantity_delta: number;
          reason: string;
          reference_type: string | null;
          reference_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          inventory_id: string;
          quantity_delta: number;
          reason: string;
          reference_type?: string | null;
          reference_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          inventory_id?: string;
          quantity_delta?: number;
          reason?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          id: string;
          wishlist_id: string;
          product_id: string;
          variant_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wishlist_id: string;
          product_id: string;
          variant_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wishlist_id?: string;
          product_id?: string;
          variant_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          author_name: string;
          rating: number;
          title: string | null;
          body: string | null;
          order_item_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          author_name: string;
          rating: number;
          title?: string | null;
          body?: string | null;
          order_item_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string | null;
          author_name?: string;
          rating?: number;
          title?: string | null;
          body?: string | null;
          order_item_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      homepage_sections: {
        Row: {
          id: string;
          section_type: string;
          heading: string | null;
          subheading: string | null;
          description: string | null;
          cta_text: string | null;
          cta_url: string | null;
          layout: string | null;
          background_style: string | null;
          content: Json;
          display_order: number;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          section_type: string;
          heading?: string | null;
          subheading?: string | null;
          description?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          layout?: string | null;
          background_style?: string | null;
          content?: Json;
          display_order?: number;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          section_type?: string;
          heading?: string | null;
          subheading?: string | null;
          description?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          layout?: string | null;
          background_style?: string | null;
          content?: Json;
          display_order?: number;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          image_url: string;
          mobile_image_url: string | null;
          cta_text: string | null;
          cta_url: string | null;
          placement: string;
          display_order: number;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          image_url: string;
          mobile_image_url?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          placement: string;
          display_order?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          image_url?: string;
          mobile_image_url?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          placement?: string;
          display_order?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          body: string | null;
          status: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          body?: string | null;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          body?: string | null;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      navigation_menus: {
        Row: {
          id: string;
          name: string;
          location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      navigation_items: {
        Row: {
          id: string;
          menu_id: string;
          parent_id: string | null;
          label: string;
          url: string | null;
          link_type: string;
          category_id: string | null;
          collection_id: string | null;
          page_id: string | null;
          product_id: string | null;
          display_order: number;
          is_active: boolean;
          open_in_new_tab: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          menu_id: string;
          parent_id?: string | null;
          label: string;
          url?: string | null;
          link_type?: string;
          category_id?: string | null;
          collection_id?: string | null;
          page_id?: string | null;
          product_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          open_in_new_tab?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_id?: string;
          parent_id?: string | null;
          label?: string;
          url?: string | null;
          link_type?: string;
          category_id?: string | null;
          collection_id?: string | null;
          page_id?: string | null;
          product_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          open_in_new_tab?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          body: string;
          cover_image_url: string | null;
          author_id: string | null;
          blog_category_id: string | null;
          status: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          body: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          blog_category_id?: string | null;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          body?: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          blog_category_id?: string | null;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      faq_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          faq_category_id: string | null;
          question: string;
          answer: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          faq_category_id?: string | null;
          question: string;
          answer: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          faq_category_id?: string | null;
          question?: string;
          answer?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      seo_metadata: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string | null;
          seo_title: string | null;
          meta_description: string | null;
          canonical_url: string | null;
          og_title: string | null;
          og_description: string | null;
          og_image_url: string | null;
          robots_directives: string;
          structured_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id?: string | null;
          seo_title?: string | null;
          meta_description?: string | null;
          canonical_url?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          og_image_url?: string | null;
          robots_directives?: string;
          structured_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string | null;
          seo_title?: string | null;
          meta_description?: string | null;
          canonical_url?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          og_image_url?: string | null;
          robots_directives?: string;
          structured_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      redirects: {
        Row: {
          id: string;
          source_path: string;
          destination_path: string;
          status_code: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_path: string;
          destination_path: string;
          status_code?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_path?: string;
          destination_path?: string;
          status_code?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          site_name: string;
          site_description: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          default_seo_title: string | null;
          default_seo_description: string | null;
          default_og_image_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          maintenance_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          site_description?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          default_seo_title?: string | null;
          default_seo_description?: string | null;
          default_og_image_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          maintenance_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          site_description?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          default_seo_title?: string | null;
          default_seo_description?: string | null;
          default_og_image_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          maintenance_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      store_settings: {
        Row: {
          id: string;
          default_currency: string;
          order_number_prefix: string;
          business_hours: Json;
          whatsapp_number: string | null;
          support_email: string | null;
          support_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          default_currency?: string;
          order_number_prefix?: string;
          business_hours?: Json;
          whatsapp_number?: string | null;
          support_email?: string | null;
          support_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          default_currency?: string;
          order_number_prefix?: string;
          business_hours?: Json;
          whatsapp_number?: string | null;
          support_email?: string | null;
          support_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_settings: {
        Row: {
          id: string;
          default_currency: string;
          free_delivery_threshold: string | null;
          same_day_cutoff_time: string | null;
          default_delivery_fee: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          default_currency?: string;
          free_delivery_threshold?: string | null;
          same_day_cutoff_time?: string | null;
          default_delivery_fee?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          default_currency?: string;
          free_delivery_threshold?: string | null;
          same_day_cutoff_time?: string | null;
          default_delivery_fee?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_settings: {
        Row: {
          id: string;
          cod_enabled: boolean;
          card_enabled: boolean;
          enabled_providers: string[];
          test_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cod_enabled?: boolean;
          card_enabled?: boolean;
          enabled_providers?: string[];
          test_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cod_enabled?: boolean;
          card_enabled?: boolean;
          enabled_providers?: string[];
          test_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      social_links: {
        Row: {
          id: string;
          platform: string;
          url: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          url: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          platform?: string;
          url?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_views: {
        Row: {
          id: string;
          product_id: string | null;
          user_id: string | null;
          session_id: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      search_events: {
        Row: {
          id: string;
          query: string;
          results_count: number;
          user_id: string | null;
          session_id: string | null;
          filters: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          query: string;
          results_count?: number;
          user_id?: string | null;
          session_id?: string | null;
          filters?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          query?: string;
          results_count?: number;
          user_id?: string | null;
          session_id?: string | null;
          filters?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      cart_events: {
        Row: {
          id: string;
          cart_id: string | null;
          event_type: string;
          product_id: string | null;
          quantity: number | null;
          user_id: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cart_id?: string | null;
          event_type: string;
          product_id?: string | null;
          quantity?: number | null;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string | null;
          event_type?: string;
          product_id?: string | null;
          quantity?: number | null;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      checkout_events: {
        Row: {
          id: string;
          cart_id: string | null;
          order_id: string | null;
          event_type: string;
          user_id: string | null;
          session_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          cart_id?: string | null;
          order_id?: string | null;
          event_type: string;
          user_id?: string | null;
          session_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string | null;
          order_id?: string | null;
          event_type?: string;
          user_id?: string | null;
          session_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          is_active: boolean;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          is_active?: boolean;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          is_active?: boolean;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      user_has_role: {
        Args: { _role_names: string[] };
        Returns: boolean;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_management: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      adjust_inventory: {
        Args: {
          _inventory_id: string;
          _quantity_delta: number;
          _reason: string;
          _reference_type?: string | null;
          _reference_id?: string | null;
          _created_by?: string | null;
        };
        Returns: Database["public"]["Tables"]["inventory"]["Row"];
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      log_order_status_change: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
