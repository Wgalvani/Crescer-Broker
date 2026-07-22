export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      criteria: {
        Row: {
          active: boolean
          chapter: Database["public"]["Enums"]["chapter"]
          code: string
          compliance_min_pct: number | null
          counts_toward_chapter: boolean
          created_at: string
          data_source: string | null
          description: string | null
          display_order: number
          evaluator: Database["public"]["Enums"]["evaluator"]
          id: string
          is_compliance: boolean
          max_points: number | null
          module: string
          official_rule_text: string | null
          per_sales_org: boolean
          periodicity: Database["public"]["Enums"]["periodicity"]
          points_pending_review: boolean
          program_version_id: string
          responsible_department:
            | Database["public"]["Enums"]["department"]
            | null
          scoring_rule: Json
          source_page: number | null
          title: string
          updated_at: string
          zeroes_on_failure: boolean
        }
        Insert: {
          active?: boolean
          chapter: Database["public"]["Enums"]["chapter"]
          code: string
          compliance_min_pct?: number | null
          counts_toward_chapter?: boolean
          created_at?: string
          data_source?: string | null
          description?: string | null
          display_order?: number
          evaluator: Database["public"]["Enums"]["evaluator"]
          id?: string
          is_compliance?: boolean
          max_points?: number | null
          module: string
          official_rule_text?: string | null
          per_sales_org?: boolean
          periodicity: Database["public"]["Enums"]["periodicity"]
          points_pending_review?: boolean
          program_version_id: string
          responsible_department?:
            | Database["public"]["Enums"]["department"]
            | null
          scoring_rule: Json
          source_page?: number | null
          title: string
          updated_at?: string
          zeroes_on_failure?: boolean
        }
        Update: {
          active?: boolean
          chapter?: Database["public"]["Enums"]["chapter"]
          code?: string
          compliance_min_pct?: number | null
          counts_toward_chapter?: boolean
          created_at?: string
          data_source?: string | null
          description?: string | null
          display_order?: number
          evaluator?: Database["public"]["Enums"]["evaluator"]
          id?: string
          is_compliance?: boolean
          max_points?: number | null
          module?: string
          official_rule_text?: string | null
          per_sales_org?: boolean
          periodicity?: Database["public"]["Enums"]["periodicity"]
          points_pending_review?: boolean
          program_version_id?: string
          responsible_department?:
            | Database["public"]["Enums"]["department"]
            | null
          scoring_rule?: Json
          source_page?: number | null
          title?: string
          updated_at?: string
          zeroes_on_failure?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "criteria_program_version_id_fkey"
            columns: ["program_version_id"]
            isOneToOne: false
            referencedRelation: "program_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean
          cnpj: string | null
          code: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["org_kind"]
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          cnpj?: string | null
          code: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["org_kind"]
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          cnpj?: string | null
          code?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["org_kind"]
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          module: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          module: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          module?: string
        }
        Relationships: []
      }
      pre_assessment_entries: {
        Row: {
          criterion_id: string
          id: string
          notes: string | null
          pre_assessment_id: string
          status: Database["public"]["Enums"]["conformity_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          criterion_id: string
          id?: string
          notes?: string | null
          pre_assessment_id: string
          status?: Database["public"]["Enums"]["conformity_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          criterion_id?: string
          id?: string
          notes?: string | null
          pre_assessment_id?: string
          status?: Database["public"]["Enums"]["conformity_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_assessment_entries_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_assessment_entries_pre_assessment_id_fkey"
            columns: ["pre_assessment_id"]
            isOneToOne: false
            referencedRelation: "pre_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_assessment_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_assessments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string
          opened_on: string
          organization_id: string
          program_version_id: string
          status: Database["public"]["Enums"]["assessment_status"]
          target_audit_on: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          opened_on?: string
          organization_id: string
          program_version_id: string
          status?: Database["public"]["Enums"]["assessment_status"]
          target_audit_on?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          opened_on?: string
          organization_id?: string
          program_version_id?: string
          status?: Database["public"]["Enums"]["assessment_status"]
          target_audit_on?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_assessments_program_version_id_fkey"
            columns: ["program_version_id"]
            isOneToOne: false
            referencedRelation: "program_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string
          id: string
          organization_id: string
          phone: string | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string
          id: string
          organization_id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email?: string
          full_name?: string
          id?: string
          organization_id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      program_versions: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          effective_from: string
          effective_to: string | null
          id: string
          name: string
          source_document: string | null
          status: Database["public"]["Enums"]["program_status"]
          updated_at: string
          year: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          name: string
          source_document?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          year: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name?: string
          source_document?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: string
          name?: string
        }
        Relationships: []
      }
      sales_organizations: {
        Row: {
          active: boolean
          channel: string | null
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          channel?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          channel?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          organization_id: string
          profile_id: string
          role_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          organization_id: string
          profile_id: string
          role_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          organization_id?: string
          profile_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
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
      assessment_status: "aberta" | "fechada"
      chapter: "performance" | "excelencia_operacional" | "compliance"
      conformity_status:
        | "nao_avaliado"
        | "conforme"
        | "parcial"
        | "nao_conforme"
        | "nao_aplicavel"
      department:
        | "comercial"
        | "merchandising"
        | "logistica"
        | "supply_chain"
        | "ti"
        | "rh"
        | "financeiro"
        | "diretoria"
        | "compliance"
      evaluator:
        | "sede_nestle"
        | "coord_excelencia"
        | "sede_operacoes_brokers"
        | "broker"
      org_kind: "matriz" | "filial"
      periodicity: "mensal" | "trimestral" | "semestral" | "anual"
      profile_status: "ativo" | "inativo"
      program_status: "draft" | "active" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assessment_status: ["aberta", "fechada"],
      chapter: ["performance", "excelencia_operacional", "compliance"],
      conformity_status: [
        "nao_avaliado",
        "conforme",
        "parcial",
        "nao_conforme",
        "nao_aplicavel",
      ],
      department: [
        "comercial",
        "merchandising",
        "logistica",
        "supply_chain",
        "ti",
        "rh",
        "financeiro",
        "diretoria",
        "compliance",
      ],
      evaluator: [
        "sede_nestle",
        "coord_excelencia",
        "sede_operacoes_brokers",
        "broker",
      ],
      org_kind: ["matriz", "filial"],
      periodicity: ["mensal", "trimestral", "semestral", "anual"],
      profile_status: ["ativo", "inativo"],
      program_status: ["draft", "active", "archived"],
    },
  },
} as const
