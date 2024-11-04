"use client";
import { AppShell, Avatar, Burger, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import styles from "./AppPage.module.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  return (

    <AppShell
      header={{ height: 50 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      aside={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      className={styles.content}
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header zIndex={100}>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <Avatar src="images/logo.png" size={50} alt="The holy beacon logo" />
      </AppShell.Header>

      <AppShell.Navbar p="md" zIndex={300}>
        <AppShell.Section grow component={ScrollArea}>
          Navbar main section, it will
        </AppShell.Section>
        <AppShell.Section>
          Navbar footer – always at the bottom
        </AppShell.Section></AppShell.Navbar>

      <AppShell.Main>
        {children}

      </AppShell.Main>

      <AppShell.Aside zIndex={300}>Aside</AppShell.Aside>
    </AppShell>
  );
}
