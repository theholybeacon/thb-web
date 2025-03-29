"use client";
import { AppShell, Button, Stack } from "@mantine/core";
import NavbarHeader from "./components/NavbarHeader";
import NavbarBody from "./components/NavbarBody";
import NavbarFooter from "./components/NavbarFooter";
import { useLoggedUserContext } from "../../../state/LoggedUserContext";

export default function Navbar() {
  const loggedUser = useLoggedUserContext().user;
  if (loggedUser)
    return (
      <AppShell.Navbar p="md" >
        <NavbarHeader />
        <NavbarBody />
        <NavbarFooter />
      </AppShell.Navbar >

    );
}
