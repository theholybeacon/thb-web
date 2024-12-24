"use client";
import { Button, Divider, Group, Indicator, Title, useMantineColorScheme } from "@mantine/core";
import styles from "./HomePage.module.css";
import { logger } from "./_utils/logger";
import { initialLoadSS } from "./_common/initial-load/service/InitialLoadSS";


const log = logger.child({ module: 'HomePage' });
export default function HomePage() {

  async function loadInfo() {
    log.trace("loadInfo");
    await initialLoadSS();
  }

  return (
    <div className={styles.content}>
      <main className={styles.main}>
        <Title order={1}>The holy beacon is under development. We will be up soon!</Title>
        <h1 className={styles.h1}>The holy beacon is under development. We will be up soon!</h1>
        <h2 className={styles.h2}>Feel free to contact us to theholybeacon@gmail.com</h2>
        <Group>
          <Indicator color="accent" inline size={10}>
            <Button color="primary" onClick={loadInfo}>
              Load
            </Button>
          </Indicator>
          <Divider orientation="vertical" />
        </Group>
      </main>
    </div>
  );
}
