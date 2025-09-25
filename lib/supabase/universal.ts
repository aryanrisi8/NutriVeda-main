// Creates a Supabase client that works in both Server and Client components
// without importing server-only modules (like next/headers) in the browser bundle.

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers")
    const { createServerClient } = await import("@supabase/ssr")

    const cookieStore = await cookies()
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignored in Server Components where setAll is not available
          }
        },
      },
    })
  }

  const { createBrowserClient } = await import("@supabase/ssr")
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


