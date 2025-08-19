"use client";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useRouter } from "next/navigation";


export default function NavbarBody() {

  const loggedUser = useLoggedUserContext().user;
  const router = useRouter();

  return (
    <div>
      NAVBAR
    </div>

  );
}
