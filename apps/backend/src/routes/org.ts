import { Router } from "express";
import { prisma } from "@repo/db/client";
import { requireAuth } from "../auth_middleware";

const router = Router();
router.use(requireAuth);

router.get("/organizations", async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: req.userId, accepted: true },
    include: { org: true },
  });
  
  res.json(memberships.map((m) => ({ ...m.org, role: m.role })));
});

router.post("/organization", async (req, res) => {
  const { orgName } = req.body;

  if (!orgName) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const org = await prisma.org.create({ data: { name: orgName } });

  await prisma.membership.create({
    data: { userId: req.userId!, orgId: org.id, role: "ADMIN", accepted: true },
  });

  res.json(org);
});

router.delete("/organization", async (req, res) => {
  const { orgId } = req.body;

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: req.userId!, orgId: orgId } },
  });
  
  if (!membership || membership.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  
  await prisma.org.delete({ where: { id: orgId } });
  
  res.json({
    message: "Org deleted"
  });
  
});

router.get("/members", async (req, res) => {
  const { orgId } = req.query;

  const caller = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: req.userId!, orgId: orgId as string } },
  });
  if (!caller || !caller.accepted) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }

  const memberships = await prisma.membership.findMany({
    where: { orgId: orgId as string, accepted: true },
    select: {
      user: { select: { id: true, name: true, email: true } },
      role: true,
    },
    orderBy: { user: { name: "asc" } },
  });

  res.json(memberships.map((m) => ({ ...m.user, role: m.role })));
});

router.get("/invitations", async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: req.userId, accepted: false },
    include: { org: { select: { id: true, name: true, description: true } } },
  });

  res.json(memberships.map((m) => ({ ...m.org, role: m.role })));
});

router.get("/user-exists", async (req, res) => {
  const { email, orgId } = req.query;

  const caller = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: req.userId!, orgId: orgId as string } },
  });
  if (!caller || caller.role !== "ADMIN" || !caller.accepted) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email as string } });

  res.json({ exists: !!user });
});

router.post("/invite", async (req, res) => {
  const { email, orgId } = req.body;

  const caller = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: req.userId!, orgId: orgId } },
  });

  if (!caller || caller.role !== "ADMIN" || !caller.accepted) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    res.status(404).json({ error: "No user with that email" });
    return;
  }
  
  const existing = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: orgId } },
  });
  
  if (existing?.accepted) {
    res.status(409).json({ error: "User is already a member" });
    return;
  }
  
  const membership = existing
    ? existing
    : await prisma.membership.create({ data: { userId: user.id, orgId: orgId, accepted: false } });

  const org = await prisma.org.findUnique({ where: { id: orgId } });

  if (process.env.RESEND_API_KEY && org) {
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    try {
      const mail = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM ?? "Trello <onboarding@resend.dev>",
          to: email,
          subject: `You've been invited to join ${org.name}`,
          text: `You've been invited to join "${org.name}". Accept it here: ${frontendUrl}/organisations`,
          html: `<p>You've been invited to join <strong>${org.name}</strong>.</p><p><a href="${frontendUrl}/organisations">Accept invitation</a></p>`,
        }),
      });
      if (!mail.ok) {
        console.error(`[invite] Resend error ${mail.status}:`, await mail.text());
      }
    } catch (err) {
      console.error("[invite] Failed to send email:", err);
    }
  }

  res.json({
    message: "Invitation sent"
  });
});

router.post("/accept", async (req, res) => {
  const { orgId } = req.body;
  
  const membership = await prisma.membership.update({
    where: { userId_orgId: { userId: req.userId!, orgId } },
    data: { accepted: true },
  });
  
  res.json({
    message: "Invite Accepted"
  });
});

router.delete("/membership", async (req, res) => {
  const { userId, orgId } = req.body;
  
  const callerId = req.userId!;
  
  if (callerId !== userId) {
    const caller = await prisma.membership.findUnique({
      where: { userId_orgId: { userId: callerId, orgId } },
    });
    
    if (!caller || caller.role !== "ADMIN" || !caller.accepted) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
  }
  
  await prisma.membership.delete({ where: { userId_orgId: { userId, orgId } } });
  
  res.json({
    messgae:"Member deleted"
  });
});

export default router;
