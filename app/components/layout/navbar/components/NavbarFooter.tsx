
"use client";
import { useLoggedUserContext } from "../../../../state/LoggedUserContext";
import { AppShell, Button, Menu, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import style from "./NavbarFooter.module.css";
import { IoIosArrowUp, IoIosLogOut, IoIosSettings } from "react-icons/io";
import { FaBook, FaMap, FaMask, FaUser, FaUserFriends } from "react-icons/fa";
import { authLogOutCS } from "../../../../common/auth/service/client/authLogOutCS";
import { FaEnvelope, FaPerson } from "react-icons/fa6";

export default function NavbarFooter() {
  const loggedUser = useLoggedUserContext().user;
  const router = useRouter();

  async function logoutHandler(): Promise<void> {
    router.push("/");
    await authLogOutCS();
  }

  return (
    <AppShell.Section>
      <Stack>

        <Menu withArrow>
          <Menu.Target>
            <Button variant="filled" color="primary" className={style.loggedUserButton} size="lg" radius="lg"
              rightSection={<IoIosArrowUp />}
              styles={{
                label: {
                  whiteSpace: 'normal',
                },
              }}
            >
              <Text >
                {loggedUser?.username}
              </Text>
            </Button>
          </Menu.Target>


          <Menu.Dropdown>
            <Menu.Item
              rightSection={<FaMap />}
              component="a"
              href="/study"
            >
              Studies
            </Menu.Item>

            <Menu.Item
              rightSection={<FaBook />}
              component="a"
              href="/session"
            >
              Sessions
            </Menu.Item>
            <Menu.Item
              rightSection={<IoIosSettings />}
              component="a"
              href="/settings"
            >
              Settings
            </Menu.Item>
            <Menu.Item
              rightSection={<IoIosLogOut />}
              onClick={logoutHandler}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Stack>
    </AppShell.Section>
  );
}
