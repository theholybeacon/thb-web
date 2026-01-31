"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary">
        <Image
          src="/images/login-main-image.png"
          alt="The Holy Beacon"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-foreground">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Continue your spiritual journey with The Holy Beacon.
          </p>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <span className="font-heading text-xl font-bold">The Holy Beacon</span>
            </Link>
            <h2 className="text-2xl font-bold mb-2">Sign in to your account</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your study plans and progress.
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border-border bg-card hover:bg-secondary text-foreground",
                socialButtonsBlockButtonText: "text-foreground font-medium",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                formFieldLabel: "text-foreground font-medium",
                formFieldInput:
                  "bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-ring",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground font-medium",
                footerActionLink: "text-primary hover:text-primary/80",
                identityPreviewEditButton: "text-primary hover:text-primary/80",
                formFieldAction: "text-primary hover:text-primary/80",
                otpCodeFieldInput: "border-input bg-background text-foreground",
                formResendCodeLink: "text-primary hover:text-primary/80",
                footer: "hidden",
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
              },
            }}
            routing="hash"
            signUpUrl="/auth/sign-up"
            forceRedirectUrl="/dashboard"
          />

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-primary hover:text-primary/80 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
