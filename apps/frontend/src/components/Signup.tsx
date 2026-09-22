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

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (error) throw new Error(error.message ?? "Failed to sign up");
    },
    // Better Auth signs the user in on signup (session cookie is set).
    onSuccess: () => navigate("/organisations"),
  });

  const error = mutation.isError ? mutation.error.message : null;
  const canSubmit = name !== "" && email !== "" && password !== "";

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
          <CardDescription className="text-base">Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Adarsha Natia"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Creating account..." : "Sign up"}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
