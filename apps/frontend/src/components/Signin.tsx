import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { signin } from "@/lib/api";
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

  const mutation = useMutation({
    mutationFn: () => signin(email, password),
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      navigate("/");
    },
  });

  const error = mutation.isError ? mutation.error.message : null;
  const canSubmit = email !== "" && password !== "";

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
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
