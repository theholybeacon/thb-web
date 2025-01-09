"use client";
import { useRouter } from "next/navigation";
import { AppShell, Avatar, Button, Group } from "@mantine/core";
import { ColorSchemeButton } from "./layout/ColorSchemeButton";

export default function LoggedOutHeader() {
  const router = useRouter();

  return (
    <AppShell.Header >
      <Group p="xs" justify="space-between" align="center">
        <Group gap={0} align="center" justify="center">
          <Button leftSection={
            <Avatar src="images/logo.png" size={80} alt="The holy beacon logo" p={0} />
          }
            variant="transparent" onClick={() => router.push("/")} p={0} size="lg">
            The Holy Beacon
          </Button>
        </Group>

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

