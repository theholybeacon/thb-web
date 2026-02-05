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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Moon, Sun, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

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

  const getProfilePicture = () => {
    // Only use dbUser's profile picture, not Clerk's default gradient avatar
    return dbUser?.profilePicture || null;
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const avatarContent = (
    <Avatar className={`${sizeClasses[size]} cursor-pointer ring-2 ring-primary/30 hover:ring-primary/60 transition-all`}>
      <AvatarImage src={getProfilePicture() || undefined} alt={dbUser?.name || "User"} />
      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );

  if (!showDropdown) {
    return avatarContent;
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("signOut"));
    router.push("/");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleSubscription = () => {
    router.push("/subscription");
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
        <DropdownMenuItem className="cursor-pointer" onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={handleSubscription}>
          <Crown className="mr-2 h-4 w-4" />
          {t("subscription")}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              {t("lightMode")}
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              {t("darkMode")}
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
