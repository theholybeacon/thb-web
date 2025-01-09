"use client";
import { Stack } from "@mantine/core";
import { logger } from "./utils/logger";

import LoggedOutHeader from "./components/LoggedOutHeader";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "./state/LoggedUserContext";

const log = logger.child({ module: 'HomePage' });
export default function HomePage() {

  const loggedUserContext = useLoggedUserContext();
  const router = useRouter();
  useEffect(() => {
    if (loggedUserContext.user) {
      router.push("/app");
    }
  });

  return (
    <Stack w="100%">
      <LoggedOutHeader />
    </Stack>
  );
}

