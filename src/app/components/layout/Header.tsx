"use client";
import { useLoggedUserContext } from "@/app/_state/LoggedUserContext";
import { useRouter } from "next/navigation";
import { AppShell, Button, Group } from "@mantine/core";
import { ColorSchemeButton } from "./ColorSchemeButton";

export default function Header() {
  const loggedUser = useLoggedUserContext().user;
  const router = useRouter();

  if (!loggedUser) {
    return (
      <AppShell.Header >
        <Group p="xs" justify="space-between">
          <Button variant="transparent" onClick={() => router.push("/")}>The Holy Beacon</Button>
          <Group gap="xs">
            <ColorSchemeButton />
            <Group gap="xs">
              <Button variant="filled" radius="xl" color="primary" w={100} onClick={() => router.push("/auth/sign-up")}>Sign Up</Button>
              <Button variant="outline" radius="xl" color="secondary" w={100} onClick={() => router.push("/auth/login")}>Login</Button>
            </Group>
          </Group>
        </Group>
      </AppShell.Header >
    );
  }
}

