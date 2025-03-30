"use client";

import { Button, Card, Center, Group, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "../state/LoggedUserContext";
import { useQuery } from "@tanstack/react-query";
import { studyGetAllByOwnerIdSS } from "../common/study/service/server/studyGetAllByUserIdSS";
import { sessionGetAllByOwnerId } from "../common/session/service/sessionGetAllByOwnerIdSS";
import { SessionFull } from "../common/session/model/Session";

export default function SessionPage() {

  const loggedUser = useLoggedUserContext().user;
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['studies', loggedUser?.id],
    queryFn: async () => {
      return await sessionGetAllByOwnerId(loggedUser?.id!);
    },
    enabled: Boolean(loggedUser?.id),
  });

  function handleGoToSession(session: SessionFull) {
    router.push(`session/${session.id}`);
  }

  return (
    <Center>
      <Stack>
        <Title ta="center" order={1}>Sessions</Title>
        {
          data?.map((actual) => {
            return (
              <Card key={actual.id}>
                <Group>
                  <Text>{actual.study.name}</Text>
                  <Button onClick={() => { handleGoToSession(actual) }}>Create session</Button>
                </Group>
              </Card>
            );
          })
        }
      </Stack>
    </Center>
  );

}
