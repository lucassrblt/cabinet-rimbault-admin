import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Toaster } from "@/components/ui/toaster"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-72">
          <AdminHeader user={session.user} />
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SessionProvider>
  )
}
