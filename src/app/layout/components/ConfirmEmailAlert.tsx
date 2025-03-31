"use client";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { Alert } from "@mantine/core";
import { FaInfoCircle } from "react-icons/fa";

export default function ConfirmEmailAlert() {
  const loggedUser = useLoggedUserContext().user;

  if (loggedUser && !loggedUser.isEmailVerified) {
    return (
      <Alert variant="outline" color="red" title="Verify Email" icon={<FaInfoCircle />}>
        Your email is not verified. In order to use the app, please verify it and reload the page.
      </Alert>
    );
  }
}

