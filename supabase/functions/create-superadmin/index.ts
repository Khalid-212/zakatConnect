import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  email: string;
  password: string;
  role: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, role } = (await req.json()) as RequestBody;

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: 'Email, password, and role are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return new Response(
        JSON.stringify({
          error: `Error creating auth user: ${authError.message}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create user in public.users
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: email,
        full_name: 'Super Admin',
        name: 'Super Admin',
        token_identifier: authUser.user.id,
        user_id: authUser.user.id,
      })
      .select()
      .single();

    if (publicUserError) {
      return new Response(
        JSON.stringify({
          error: `Error creating public user: ${publicUserError.message}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create a default mosque if none exists
    const { data: existingMosques } = await supabase.from('mosques').select('id').limit(1);

    let mosqueId;

    if (!existingMosques || existingMosques.length === 0) {
      const { data: mosque, error: mosqueError } = await supabase
        .from('mosques')
        .insert({
          name: 'Default Mosque',
          city: 'Default City',
          state: 'Default State',
        })
        .select()
        .single();

      if (mosqueError) {
        return new Response(
          JSON.stringify({
            error: `Error creating mosque: ${mosqueError.message}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      mosqueId = mosque.id;
    } else {
      mosqueId = existingMosques[0].id;
    }

    // Create mosque_admin entry
    const { data: mosqueAdmin, error: mosqueAdminError } = await supabase
      .from('mosque_admins')
      .insert({
        user_id: authUser.user.id,
        mosque_id: mosqueId,
        role: role,
      })
      .select()
      .single();

    if (mosqueAdminError) {
      return new Response(
        JSON.stringify({
          error: `Error creating mosque admin: ${mosqueAdminError.message}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Super admin created successfully',
        user: authUser.user,
        mosque_admin: mosqueAdmin,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: `Server error: ${errorMessage}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
