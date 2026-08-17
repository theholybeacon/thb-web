/**
 * The providers this group used to mount (LoggedUserProvider + react-query)
 * now live in the root layout — the signed-in shell also renders over the
 * public /bible tree, so both need the same provider instance.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
