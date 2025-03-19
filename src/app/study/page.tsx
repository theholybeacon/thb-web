"use client";

import { Button, Card, Center, Group, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "../state/LoggedUserContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { studyGetAllByOwnerIdSS } from "../common/study/service/server/studyGetAllByUserIdSS";
import { sessionCreateSS } from "../common/session/service/sessionCreateSS";
import { logger } from "../utils/logger";
import { StudyFull, StudyInsert } from "../common/study/model/Study";
import { SessionInsert } from "../common/session/model/Session";

export default function StudyPage() {

  const loggedUser = useLoggedUserContext().user;
  const router = useRouter();


  function onCreateHandler() {
    router.push("/study/create");
  }


  const { data, isLoading, isError } = useQuery({
    queryKey: ['studies', loggedUser?.id],
    queryFn: async () => {
      return await studyGetAllByOwnerIdSS(loggedUser?.id!);
    },
    enabled: Boolean(loggedUser?.id),
  });

  const createSessionMutation = useMutation({
    mutationFn: async (study: StudyFull) => {

      const sessionInsert: SessionInsert = {
        studyId: study.id,
        currentStepId: study.steps[0].id,
        userId: loggedUser?.id!,
      };

      return await sessionCreateSS(sessionInsert);
    },
    onSuccess: (session) => {
      router.push(`/session/${session.id}`);
    },
    onError: (e) => {
      logger.error(e);
    }
  });

  return (
    <Center>
      <Stack>
        <Title ta="center" order={1}>Studies</Title>
        <Button variant="filled" color="primary" onClick={onCreateHandler} >Create</Button>
        {
          data?.map((actual) => {
            return (
              <Card key={actual.id}>
                <Group>
                  <Text>{actual.name}</Text>
                  <Button onClick={() => { createSessionMutation.mutate(actual); }}>Create session</Button>
                </Group>
              </Card>
            );
          })
        }
      </Stack>
    </Center>
  );

}
