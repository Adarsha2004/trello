import { Link } from "react-router";
import { Signin } from "@/components/Signin";

export default function SigninPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-4xl flex-col items-center gap-4">
        <Signin />
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
