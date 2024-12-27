"use client";
import { Title } from "@mantine/core";
import { logger } from "./_utils/logger";



const log = logger.child({ module: 'HomePage' });
export default function HomePage() {



  return (
    <Title order={1}>HOME</Title>
  );
}
