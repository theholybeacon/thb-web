"use client";

import { StudyInsert, StudyInsertFull } from "@/app/common/study/model/Study";
import { studyCreateWithAISS } from "@/app/common/study/service/server/studyCreateWithAISS";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useReducer, useState } from "react";


export default function CreateStudyPage() {

  const loggedUser = useLoggedUserContext().user;

  const router = useRouter();


  const createProgramMutation = useMutation({
    mutationFn: async () => {
      // return await studyCreateWithAISS(submittedValues as StudyInsert);
    },
    onSuccess: () => {
      router.push("/study");
    },
    onError: (error) => {
    },

  });


  function onSubmitHandler(values: any): void {
    createProgramMutation.mutate();
  }

  return (
    <div>commented</div>
    // <Center>
    //   <Stack w={pageWidth}>
    //
    //
    //     <form onSubmit={form.onSubmit(onSubmitHandler)}>
    //       <Title order={1} ta="center">Create Study</Title>
    //       <TextInput
    //         label="Name"
    //         placeholder="Name"
    //         key={form.key("name")}
    //         {...form.getInputProps("name")}
    //       />
    //       <TextInput
    //         label="Description"
    //         placeholder="Description"
    //         key={form.key("description")}
    //         {...form.getInputProps("description")}
    //       />
    //       <Text size="sm">Length</Text>
    //       <Slider
    //         pb={15}
    //         label={form.getInputProps("length").value}
    //         color="primary"
    //         defaultValue={1}
    //         marks={[
    //           { value: 1, label: '5 minutes' },
    //           { value: 5, label: '2 months' },
    //           { value: 10, label: '1 year' },
    //         ]}
    //
    //         min={1}
    //         max={10}
    //         {...form.getInputProps("length", { type: "input" })}
    //       />
    //
    //       <Text size="sm" pt={25}>Depth</Text>
    //       <Slider
    //         label={form.getInputProps("depth").value}
    //         color="primary"
    //         defaultValue={1}
    //         marks={[
    //           { value: 1, label: 'Shallow' },
    //           { value: 10, label: 'Deep' },
    //         ]}
    //         min={1}
    //         max={10}
    //         {...form.getInputProps("depth", { type: "input" })}
    //       />
    //       <TextInput
    //         py={25}
    //         label="Topic"
    //
    //         placeholder="Topic"
    //         key={form.key("topic")}
    //         {...form.getInputProps("topic")}
    //       />
    //       <Alert variant="outline" color="secondary">
    //         Enter the topic you'd like to explore in the Bible. This could be a question, a concept, or a specific event you're curious about. For example: 'Lazyness as a sin' or 'What does the Bible say about forgiveness?
    //       </Alert>
    //
    //       <Button mt={15} variant="filled" radius="md" type="submit" loading={createProgramMutation.isLoading} >Create</Button>
    //     </form>
    //   </Stack>
    // </Center>
  );

}
