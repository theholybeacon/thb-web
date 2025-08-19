
"use client";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useRouter } from "next/navigation";

export default function NavbarFooter() {
  const router = useRouter();

  async function logoutHandler(): Promise<void> {
    router.push("/");
  }

  return (
    <>footer</>
  );
}
