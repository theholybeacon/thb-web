"use client";
import { Button, Indicator, Title, useMantineColorScheme } from "@mantine/core";
import styles from "./HomePage.module.css";


export default function HomePage() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <div className={styles.content}>
      <main className={styles.main}>
        <Title order={1}>The holy beacon is under development. We will be up soon!</Title>
        <h1 className={styles.h1}>The holy beacon is under development. We will be up soon!</h1>
        <h2 className={styles.h2}>Feel free to contact us to theholybeacon@gmail.com</h2>
        <Indicator color="accent" inline size={10}>
          <Button color="primary" onClick={toggleColorScheme}>
            {colorScheme}
          </Button>
        </Indicator>
      </main>
    </div>
  );
}
