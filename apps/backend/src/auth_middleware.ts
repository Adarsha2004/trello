import type { NextFunction, Request, Response } from "express";
import { auth } from "@repo/auth/server";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.userId = session.user.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
}
