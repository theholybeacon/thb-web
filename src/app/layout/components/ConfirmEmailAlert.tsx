"use client";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";

export default function ConfirmEmailAlert() {
  const loggedUser = useLoggedUserContext().user;

  if (loggedUser && !loggedUser.isEmailVerified) {
    return (
      <div>
        Your email is not verified. In order to use the app, please verify it and reload the page.
      </div>
    );
  }
}

