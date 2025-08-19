
"use client";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useRouter } from "next/navigation";
import { authLogOutCS } from "@/app/common/auth/service/client/authLogOutCS";

export default function NavbarFooter() {
  const loggedUser = useLoggedUserContext().user;
  const router = useRouter();

  async function logoutHandler(): Promise<void> {
    router.push("/");
    await authLogOutCS();
  }

  return (
    <>footer</>
  );
}
