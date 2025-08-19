"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NavbarHeader() {
  const router = useRouter();
  return (
    <div>
      <Button onClick={() => router.push("/")}>The Holy Beacon</Button>
    </div>
  );
}
