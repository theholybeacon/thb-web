import { BibleHeader } from "./components/BibleHeader";

export default function BibleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <BibleHeader />
      {children}
    </div>
  )
}
