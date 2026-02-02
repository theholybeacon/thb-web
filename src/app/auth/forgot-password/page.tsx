"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { toast } from "@/lib/toast";

type ForgotPasswordStep = "email" | "code" | "reset";

export default function ForgotPasswordPage() {
  const tForgot = useTranslations("auth.forgotPassword");
  const tReset = useTranslations("auth.resetPassword");
  const tVerify = useTranslations("auth.verification");
  const tCommon = useTranslations("common");
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      toast.success(tForgot("emailSent"));
      setStep("code");
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ code: string; message: string }> };
      if (clerkError.errors?.[0]?.code === "form_identifier_not_found") {
        toast.error(tForgot("emailNotFound"));
        setError(tForgot("emailNotFound"));
      } else {
        toast.error(clerkError.errors?.[0]?.message || tCommon("error"));
        setError(clerkError.errors?.[0]?.message || tCommon("error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      if (result.status === "needs_new_password") {
        toast.success(tVerify("title"));
        setStep("reset");
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (newPassword !== confirmPassword) {
      setError(tReset("passwordMismatch"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success(tReset("success"));
        setSuccess(tReset("success"));
        setTimeout(() => router.push("/home"), 2000);
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ code: string; message: string }> };
      toast.error(clerkError.errors?.[0]?.message || tCommon("error"));
      setError(clerkError.errors?.[0]?.message || tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      toast.success(tVerify("codeSent"));
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Animated Panel */}
      <AuthSidePanel
        title={tForgot("title")}
        subtitle={tForgot("subtitle")}
      />

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <span className="font-heading text-xl font-bold">The Holy Beacon</span>
            </Link>

            {step === "email" && (
              <>
                <h2 className="text-2xl font-bold mb-2">{tForgot("title")}</h2>
                <p className="text-muted-foreground">{tForgot("subtitle")}</p>
              </>
            )}

            {step === "code" && (
              <>
                <h2 className="text-2xl font-bold mb-2">{tVerify("title")}</h2>
                <p className="text-muted-foreground">{tVerify("subtitle", { email })}</p>
              </>
            )}

            {step === "reset" && (
              <>
                <h2 className="text-2xl font-bold mb-2">{tReset("title")}</h2>
                <p className="text-muted-foreground">{tReset("subtitle")}</p>
              </>
            )}
          </div>

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {tForgot("email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tForgot("emailPlaceholder")}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tForgot("sending")}
                  </>
                ) : (
                  tForgot("sendLink")
                )}
              </Button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {tForgot("backToLogin")}
              </Link>
            </form>
          )}

          {/* Verification Code Step */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 dark:bg-green-950/50 dark:border-green-800 rounded-md">
                  {success}
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
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={tVerify("codePlaceholder")}
                  required
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tVerify("verifying")}
                  </>
                ) : (
                  tVerify("verify")
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
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
            </form>
          )}

          {/* Reset Password Step */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 dark:bg-green-950/50 dark:border-green-800 rounded-md">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {tReset("newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={tReset("newPasswordPlaceholder")}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {tReset("confirmPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tReset("confirmPasswordPlaceholder")}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tReset("resetting")}
                  </>
                ) : (
                  tReset("reset")
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
