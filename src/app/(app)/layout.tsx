import ClientProvider from "@/app/layout/components/ClientProviders"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientProvider>
      {children}
    </ClientProvider>
  )
}
