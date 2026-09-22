import { Signin } from "@/components/Signin";

export default function SigninPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-4xl flex-col items-center gap-4">
        <Signin />
      </div>
    </div>
  );
}
