"use client";

import { Button, Center, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function StudyPage() {

  const router = useRouter();


  function onCreateHandler() {

    router.push("/study/create");

  }

  return (
    <Center>
      <Title order={1}>Studies</Title>
      <Button variant="filled" color="primary" onClick={onCreateHandler} >Create</Button>
      //TODO List all users studies
    </Center>
  );

}
