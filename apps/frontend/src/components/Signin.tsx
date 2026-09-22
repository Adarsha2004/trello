import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@repo/auth/client";
import trelloSignin from "@/trello_signin.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.193-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  );
}

export function Signin() {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const magicLinkMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signIn.magicLink({
        email,
        // Absolute URL: verify runs on the backend origin, so a relative
        // path would redirect there instead of back to the SPA.
        callbackURL: `${window.location.origin}/organisations`,
      });
      if (error) throw new Error(error.message ?? "Failed to send magic link");
    },
    onSuccess: () => setMagicLinkSent(true),
  });

  const error = magicLinkMutation.isError ? magicLinkMutation.error.message : null;

  return (
    <Card className="w-full max-w-4xl overflow-hidden p-0 md:flex-row">
      <div className="relative hidden w-1/2 md:block">
        <img
          src={trelloSignin}
          alt="Trello boards"
          className="h-full min-h-125 w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-6 py-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Trello</CardTitle>
          <CardDescription className="text-base">
            Sign in to access your boards
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {magicLinkSent && (
            <p className="text-muted-foreground text-sm">
              Link sent to your mail
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={email === "" || magicLinkMutation.isPending}
            onClick={() => magicLinkMutation.mutate()}
          >
            {magicLinkMutation.isPending ? "Sending..." : "Get link"}
          </Button>
          <div className="flex w-full items-center gap-3">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs">or</span>
            <span className="bg-border h-px flex-1" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled
            title="Coming soon"
          >
            <GoogleIcon />
            Sign in with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled
            title="Coming soon"
          >
            <GithubIcon />
            Sign in with GitHub
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
