"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Eye, EyeOff, User, KeyRound } from "lucide-react";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { toast } from "@/lib/toast";

type SignUpStep = "form" | "verification";

export default function SignUpPage() {
  const t = useTranslations("auth.signUp");
  const tVerify = useTranslations("auth.verification");
  const tCommon = useTranslations("common");
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<SignUpStep>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      setError(t("passwordMismatch"));
      return;
    }

    // Validate password length
    if (password.length < 8) {
      toast.error(t("passwordTooShort"));
      setError(t("passwordTooShort"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Split name into first and last name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      toast.info(tVerify("subtitle", { email }));
      setStep("verification");
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ code: string; message: string }> };
      if (clerkError.errors?.[0]?.code === "form_identifier_exists") {
        toast.error(t("emailInUse"));
        setError(t("emailInUse"));
      } else {
        toast.error(clerkError.errors?.[0]?.message || tCommon("error"));
        setError(clerkError.errors?.[0]?.message || tCommon("error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success(t("title"));
        router.push("/home");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ code: string; message: string }> };
      if (clerkError.errors?.[0]?.code === "form_code_incorrect") {
        toast.error(tVerify("invalidCode"));
        setError(tVerify("invalidCode"));
      } else if (clerkError.errors?.[0]?.code === "verification_expired") {
        toast.error(tVerify("codeExpired"));
        setError(tVerify("codeExpired"));
      } else {
        toast.error(clerkError.errors?.[0]?.message || tVerify("invalidCode"));
        setError(clerkError.errors?.[0]?.message || tVerify("invalidCode"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      toast.success(tVerify("codeSent"));
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/home",
      });
    } catch (err) {
      console.error("Google sign up error:", err);
      toast.error(tCommon("error"));
    }
  };

  // Verification step
  if (step === "verification") {
    return (
      <div className="flex min-h-screen">
        {/* Left side - Animated Panel */}
        <AuthSidePanel
          title={t("beginJourney")}
          subtitle={t("beginJourneySubtitle")}
        />

        {/* Right side - Verification Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">B</span>
                </div>
                <span className="font-heading text-xl font-bold">The Holy Beacon</span>
              </Link>
              <h2 className="text-2xl font-bold mb-2">{tVerify("title")}</h2>
              <p className="text-muted-foreground">
                {tVerify("subtitle", { email })}
              </p>
            </div>

            <form onSubmit={handleVerification} className="space-y-4">
              {error && (
                <div className={`p-3 text-sm rounded-md border ${
                  error === tVerify("codeSent")
                    ? "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800"
                    : "text-destructive bg-destructive/10 border-destructive/20"
                }`}>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  {tVerify("code")}
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={tVerify("codePlaceholder")}
                  required
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || verificationCode.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tVerify("verifying")}
                  </>
                ) : (
                  tVerify("verify")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {tVerify("resendCode")}{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-primary hover:text-primary/80 font-medium"
              >
                {isLoading ? tVerify("resending") : tVerify("resend")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign up form
  return (
    <div className="flex min-h-screen">
      {/* Left side - Animated Panel */}
      <AuthSidePanel
        title={t("beginJourney")}
        subtitle={t("beginJourneySubtitle")}
      />

      {/* Right side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <span className="font-heading text-xl font-bold">The Holy Beacon</span>
            </Link>
            <h2 className="text-2xl font-bold mb-2">{t("title")}</h2>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={!isLoaded}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("google")}
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("name")}
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t("password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t("confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder")}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("signingUp")}
                </>
              ) : (
                t("signUp")
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t("agreeToTerms")}{" "}
              <Link href="/terms" className="text-primary hover:text-primary/80">
                {t("termsOfService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/80">
                {t("privacyPolicy")}
              </Link>
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
              {t("signIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
