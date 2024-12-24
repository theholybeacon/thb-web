"use client";
import { useLoggedUserContext } from "@/app/_state/LoggedUserContext";
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
