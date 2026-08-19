import { Link } from "react-router";
import { Signup } from "@/components/Signup";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-4xl flex-col items-center gap-4">
        <Signup />
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
