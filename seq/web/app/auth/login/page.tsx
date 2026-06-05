import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <SignIn routing="hash" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
