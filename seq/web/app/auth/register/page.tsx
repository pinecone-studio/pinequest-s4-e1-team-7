import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <SignUp routing="hash" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
