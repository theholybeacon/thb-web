"use client";
import { AppShell, Center, Loader } from "@mantine/core";
import Navbar from "./navbar/Navbar";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import ConfirmEmailAlert from "./ConfirmEmailAlert";
import { Notifications } from "@mantine/notifications";

export default function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedUserContext = useLoggedUserContext();

  if (loggedUserContext.loading) {
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Center h="100%" >
          <Loader />
        </Center>
      </div>
    );
  } else {
    return (
      <AppShell
        layout="alt"
        header={{ height: 80 }}
        padding="xs"
        navbar={loggedUserContext.user ? { width: { sm: 200, lg: 300 }, breakpoint: 'sm' } : undefined} >

        <Navbar />

        <AppShell.Main>
          <Notifications
            zIndex={1000}
            position="top-right"
            containerWidth="300"
          />
          <ConfirmEmailAlert />
          {children}
        </AppShell.Main>
      </AppShell>);

  }
}
