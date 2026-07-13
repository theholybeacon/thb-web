"use server";

import { notFound, redirect } from "next/navigation";
import { sessionGetByIdSS } from "@/app/common/session/service/sessionGetByIdSS";
import SessionView from "./components/session-view/SessionView";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let session;
  try {
    session = await sessionGetByIdSS(id);
  } catch (error) {
    // Non-premium/unauthenticated users are sent to upgrade; anything else is a 404.
    if (error instanceof Error && (error.message === "PREMIUM_REQUIRED" || error.message === "UNAUTHENTICATED")) {
      redirect("/subscription");
    }
    notFound();
  }

  if (!session) {
    notFound();
  }

  return (
    <SessionView session={session} />
  );
}
