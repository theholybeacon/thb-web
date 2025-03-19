"use server";

import { sessionGetByIdSS } from "@/app/common/session/service/sessionGetByIdSS";
import SessionView from "./components/session-view/SessionView";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {

  const session = await sessionGetByIdSS(params.id);

  return (
    <SessionView session={session} />
  );
}
