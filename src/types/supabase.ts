export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          address: string | null
          city: string | null
          code: string | null
          created_at: string | null
          email: string | null
          family_members: number | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          region: string | null
          remark: string | null
          status: string | null
          sub_city: string | null
          updated_at: string | null
          woreda: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          family_members?: number | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          region?: string | null
          remark?: string | null
          status?: string | null
          sub_city?: string | null
          updated_at?: string | null
          woreda?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          family_members?: number | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          region?: string | null
          remark?: string | null
          status?: string | null
          sub_city?: string | null
          updated_at?: string | null
          woreda?: string | null
        }
        Relationships: []
      }
      givers: {
        Row: {
          address: string | null
          code: string | null
          created_at: string | null
          email: string | null
          family_members: number | null
          id: string
          mosque_id: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          family_members?: number | null
          id?: string
          mosque_id?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          family_members?: number | null
          id?: string
          mosque_id?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "givers_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      mosque_admins: {
        Row: {
          created_at: string | null
          id: string
          mosque_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mosque_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mosque_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mosque_admins_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mosque_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mosques: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          sub_city: string | null
          updated_at: string | null
          website: string | null
          woreda: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          sub_city?: string | null
          updated_at?: string | null
          website?: string | null
          woreda?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          sub_city?: string | null
          updated_at?: string | null
          website?: string | null
          woreda?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      product_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price: number
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price: number
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits: string | null
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          role: string | null
          staff_code: string | null
          subscription: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          role?: string | null
          staff_code?: string | null
          subscription?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          role?: string | null
          staff_code?: string | null
          subscription?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      zakat_collections: {
        Row: {
          amount: number
          collected_by: string | null
          collection_date: string | null
          created_at: string | null
          description: string | null
          giver_id: string | null
          id: string
          mosque_id: string
          product_type_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          collected_by?: string | null
          collection_date?: string | null
          created_at?: string | null
          description?: string | null
          giver_id?: string | null
          id?: string
          mosque_id: string
          product_type_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          collected_by?: string | null
          collection_date?: string | null
          created_at?: string | null
          description?: string | null
          giver_id?: string | null
          id?: string
          mosque_id?: string
          product_type_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zakat_collections_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zakat_collections_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "givers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zakat_collections_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zakat_collections_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      zakat_distributions: {
        Row: {
          amount: number
          beneficiary_id: string
          created_at: string | null
          description: string | null
          distributed_by: string | null
          distribution_date: string | null
          id: string
          mosque_id: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          beneficiary_id: string
          created_at?: string | null
          description?: string | null
          distributed_by?: string | null
          distribution_date?: string | null
          id?: string
          mosque_id: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          beneficiary_id?: string
          created_at?: string | null
          description?: string | null
          distributed_by?: string | null
          distribution_date?: string | null
          id?: string
          mosque_id?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zakat_distributions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zakat_distributions_distributed_by_fkey"
            columns: ["distributed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zakat_distributions_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "super-admin" | "admin" | "clerk"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
