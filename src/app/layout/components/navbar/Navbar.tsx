"use client";
import NavbarHeader from "./components/NavbarHeader";
import NavbarBody from "./components/NavbarBody";
import NavbarFooter from "./components/NavbarFooter";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";

export default function Navbar() {
  const loggedUser = useLoggedUserContext().user;
  if (loggedUser)
    return (
      <div>
        <NavbarHeader />
        <NavbarBody />
        <NavbarFooter />
      </div>

    );
}
