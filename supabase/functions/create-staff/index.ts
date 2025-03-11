/// <reference path="../types.d.ts" />

import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  password: string;
  fullName: string;
  role: string;
  mosqueId: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    ) as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, fullName, role, mosqueId } =
      (await req.json()) as RequestBody;

    if (!email || !password || !fullName || !role || !mosqueId) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create user in auth.users
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: role,
        },
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          error: `Error creating auth user: ${authError.message}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create user in public.users
    const { data: publicUser, error: publicUserError } = await supabase
      .from("users")
      .insert({
        id: authUser.user.id,
        email: email,
        full_name: fullName,
        name: fullName,
        role: role,
        token_identifier: authUser.user.id,
        user_id: authUser.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (publicUserError) {
      return new Response(
        JSON.stringify({
          error: `Error creating public user: ${publicUserError.message}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create mosque_admin entry
    const { data: mosqueAdmin, error: mosqueAdminError } = await supabase
      .from("mosque_admins")
      .insert({
        user_id: authUser.user.id,
        mosque_id: mosqueId,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (mosqueAdminError) {
      return new Response(
        JSON.stringify({
          error: `Error creating mosque admin: ${mosqueAdminError.message}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: "Staff member created successfully",
        user: authUser.user,
        mosque_admin: mosqueAdmin,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
