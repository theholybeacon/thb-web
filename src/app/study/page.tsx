"use client";

import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "../state/LoggedUserContext";
import { useQuery } from "@tanstack/react-query";
import { studyGetAllByOwnerIdSS } from "../common/study/service/server/studyGetAllByUserIdSS";

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



  return (
    <Center>
      <Stack>
        <Title ta="center" order={1}>Studies</Title>
        <Button variant="filled" color="primary" onClick={onCreateHandler} >Create</Button>
        {
          data?.map((actual) => {
            return <Text>{actual.name}</Text>
          })
        }
      </Stack>
    </Center>
  );

}
