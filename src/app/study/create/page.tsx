"use client";

import { pageWidth } from "@/app/utils/theme/ThemeValues";
import { Alert, Button, Center, colorsTuple, Slider, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { min } from "drizzle-orm";
import { useRouter } from "next/navigation";
import { useReducer } from "react";


export default function CreateStudyPage() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);


  const router = useRouter();


  function onCreateHandler(values: { name: string; description: string; length: number; depth: number; topic: string; }) {
    console.log(values);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      description: '',
      length: 1,
      depth: 1,
      topic: '',
    },

    validate: {
      name: (value) => (value.length > 3 ? null : 'Name should have at least 3 characters.'),
      description: (value) => (value.length > 3 ? null : 'Please enter description.'),
      topic: (value) => (value.length > 3 ? null : 'Please enter topic.'),
    },
  });

  return (
    <Center>
      <Stack w={pageWidth}>


        <form onSubmit={form.onSubmit((values) => { onCreateHandler(values) })}>
          <Title order={1} ta="center">Create Study</Title>
          <TextInput
            label="Name"
            placeholder="Name"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Description"
            placeholder="Description"
            key={form.key("description")}
            {...form.getInputProps("description")}
          />
          <Text size="sm">Length</Text>
          <Slider
            pb={15}
            label={form.getInputProps("length").value}
            color="primary"
            defaultValue={1}
            marks={[
              { value: 1, label: '5 minutes' },
              { value: 5, label: '2 months' },
              { value: 10, label: '1 year' },
            ]}

            min={1}
            max={10}
            {...form.getInputProps("length", { type: "input" })}
          />

          <Text size="sm" pt={25}>Depth</Text>
          <Slider
            label={form.getInputProps("depth").value}
            color="primary"
            defaultValue={1}
            marks={[
              { value: 1, label: 'Shallow' },
              { value: 10, label: 'Deep' },
            ]}
            min={1}
            max={10}
            {...form.getInputProps("depth", { type: "input" })}
          />
          <TextInput
            py={25}
            label="Topic"

            placeholder="Topic"
            key={form.key("topic")}
            {...form.getInputProps("topic")}
          />
          <Alert variant="outline" color="secondary">
            Enter the topic you'd like to explore in the Bible. This could be a question, a concept, or a specific event you're curious about. For example: 'Lazyness as a sin' or 'What does the Bible say about forgiveness?
          </Alert>

          <Button mt={15} variant="filled" radius="md" type="submit" >Create</Button>
        </form>
      </Stack>
    </Center>
  );

}
