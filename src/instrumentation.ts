export async function register() {
  // Only run on the server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { testSupabaseConnection } = await import("./lib/supabase")
    
    console.log("🔄 Testing Supabase connection...")
    
    try {
      await testSupabaseConnection()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("🚨 Application startup failed: Supabase connection error")
      console.error(message)
      // Exit the process if Supabase connection fails
      process.exit(1)
    }
  }
}

