"use server";

import { notFound } from "next/navigation";
import { sessionGetByIdSS } from "@/app/common/session/service/sessionGetByIdSS";
import SessionView from "./components/session-view/SessionView";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await sessionGetByIdSS(id);

  if (!session) {
    notFound();
  }

  return (
    <SessionView session={session} />
  );
}
