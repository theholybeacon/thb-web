"use client";
import { useLoggedUserContext } from "../../../../state/LoggedUserContext";
import { AppShell } from "@mantine/core";
import { useRouter } from "next/navigation";


export default function NavbarBody() {

  const loggedUser = useLoggedUserContext().user;
  const router = useRouter();


  return (
    <AppShell.Section grow>
      NAVBAR

    </AppShell.Section>
  );
}
