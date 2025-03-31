"use client";
import { AppShell, Button } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function NavbarHeader() {
  const router = useRouter();
  return (
    <AppShell.Section>
      <Button variant="transparent" onClick={() => router.push("/")}>The Holy Beacon</Button>
    </AppShell.Section>
  );
}
