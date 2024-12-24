"use client";
import { AppShell, Center, Loader } from "@mantine/core";
import Navbar from "./navbar/Navbar";
import Header from "./Header";
import { useLoggedUserContext } from "@/app/_state/LoggedUserContext";
import ConfirmEmailAlert from "./ConfirmEmailAlert";
import { Notifications } from "@mantine/notifications";

export default function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedUserContext = useLoggedUserContext();

  console.log(loggedUserContext);
  if (loggedUserContext.loading) {
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Center h="100%" >
          <Loader />
        </Center>
      </div>
    );
  } else {
    return (<AppShell header={{ height: loggedUserContext.user ? 0 : 60 }} padding="xs" navbar={{ width: { sm: 200, lg: 300 }, breakpoint: 'sm' }} >
      <Header />
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
