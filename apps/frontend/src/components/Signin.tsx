import { useState } from "react";
import { useNavigate } from "react-router";
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

export function Signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const signinMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) throw new Error(error.message ?? "Failed to sign in");
    },
    onSuccess: () => navigate("/organisations"),
  });

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

  const error = signinMutation.isError
    ? signinMutation.error.message
    : magicLinkMutation.isError
      ? magicLinkMutation.error.message
      : null;
  const canSubmit = email !== "" && password !== "";
  const pending =
    signinMutation.isPending || magicLinkMutation.isPending;

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
          <CardDescription className="text-base">Sign in to access your boards</CardDescription>
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
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {magicLinkSent && (
            <p className="text-sm text-muted-foreground">
              Magic link sent — check your email (or the backend console in dev).
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={!canSubmit || pending}
            onClick={() => signinMutation.mutate()}
          >
            {signinMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            disabled={email === "" || pending}
            onClick={() => magicLinkMutation.mutate()}
          >
            {magicLinkMutation.isPending ? "Sending..." : "Email me a magic link"}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
