"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  showDropdown?: boolean;
}

export function UserAvatar({ size = "md", showDropdown = true }: UserAvatarProps) {
  const t = useTranslations("common");
  const { user: clerkUser } = useUser();
  const { user: dbUser } = useLoggedUserContext();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const getInitials = () => {
    if (dbUser?.name) {
      const parts = dbUser.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return dbUser.name.slice(0, 2).toUpperCase();
    }
    if (clerkUser?.firstName) {
      return clerkUser.firstName.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const avatarContent = (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center font-semibold text-primary-foreground cursor-pointer ring-2 ring-primary/30 hover:ring-primary/60 transition-all`}
    >
      <span>{getInitials()}</span>
    </div>
  );

  if (!showDropdown) {
    return avatarContent;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {avatarContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{dbUser?.name || clerkUser?.firstName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {dbUser?.email || clerkUser?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          {t("settings")}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
