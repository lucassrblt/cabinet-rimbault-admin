import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Si connecté, rediriger vers le dashboard
  if (session) {
    redirect("/admin/dashboard")
  }

  // Sinon, rediriger vers la page de login
  redirect("/admin/login")
}
