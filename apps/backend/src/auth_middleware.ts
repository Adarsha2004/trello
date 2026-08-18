import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    req.userId = payload.userId as string | undefined;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
  
}
