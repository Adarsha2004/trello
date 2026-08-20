import { Router } from "express";
import { prisma } from "@repo/db/client";
import { requireAuth } from "../auth_middleware";

const router = Router();
router.use(requireAuth);

async function canAccessBoard(userId: string | undefined, boardId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return null;
  const m = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: userId!, orgId: board.orgId } },
  });
  return m?.accepted ? board : null;
}

router.get("/issues", async (req, res) => {
  const { boardId, sectionId } = req.query;
  if (!(await canAccessBoard(req.userId, boardId as string))) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }
  const issues = await prisma.issue.findMany({
    where: { boardId: boardId as string, ...(sectionId ? { sectionId: sectionId as string } : {}) },
    orderBy: { position: "asc" },
  });
  res.json(issues);
});

router.get("/issue/:issueId", async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: req.params.issueId },
    include: {
      users: { include: { user: { select: { id: true, name: true, email: true } } } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!issue || !(await canAccessBoard(req.userId, issue.boardId))) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  res.json(issue);
});

router.post("/issue", async (req, res) => {
  const { title, description, sectionId, boardId, assigneeId } = req.body;
  if (!(await canAccessBoard(req.userId, boardId))) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }
  const last = await prisma.issue.findFirst({
    where: { sectionId },
    orderBy: { position: "desc" },
  });
  const issue = await prisma.issue.create({
    data: {
      title,
      description,
      boardId,
      sectionId,
      position: (last?.position ?? -1) + 1,
    },
  });
  if (assigneeId) {
    await prisma.issueMapping.create({ data: { userId: assigneeId, issueId: issue.id } });
  }
  res.status(201).json(issue);
});

router.put("/issue", async (req, res) => {
  const { issueId, title, description, assigneeId } = req.body;
  const existing = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!existing || !(await canAccessBoard(req.userId, existing.boardId))) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  const issue = await prisma.issue.update({
    where: { id: issueId },
    data: { ...(title !== undefined && { title }), ...(description !== undefined && { description }) },
  });
  if (assigneeId !== undefined) {
    await prisma.issueMapping.deleteMany({ where: { issueId } });
    if (assigneeId) {
      await prisma.issueMapping.create({ data: { userId: assigneeId, issueId } });
    }
  }
  res.json(issue);
});

router.put("/issue/move", async (req, res) => {
  const { issueId, sourceSectionId, targetSectionId, newPosition } = req.body;
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue || !(await canAccessBoard(req.userId, issue.boardId))) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  if (sourceSectionId === targetSectionId) {
    if (newPosition < issue.position) {
      await prisma.issue.updateMany({
        where: { sectionId: targetSectionId, position: { gte: newPosition, lt: issue.position } },
        data: { position: { increment: 1 } },
      });
    } else {
      await prisma.issue.updateMany({
        where: { sectionId: targetSectionId, position: { gt: issue.position, lte: newPosition } },
        data: { position: { decrement: 1 } },
      });
    }
  } else {
    await prisma.issue.updateMany({
      where: { sectionId: sourceSectionId, position: { gt: issue.position } },
      data: { position: { decrement: 1 } },
    });
    await prisma.issue.updateMany({
      where: { sectionId: targetSectionId, position: { gte: newPosition } },
      data: { position: { increment: 1 } },
    });
  }
  res.json(
    await prisma.issue.update({
      where: { id: issueId },
      data: { sectionId: targetSectionId, position: newPosition },
    }),
  );
});

router.delete("/issue", async (req, res) => {
  const { issueId } = req.body;
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue || !(await canAccessBoard(req.userId, issue.boardId))) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  await prisma.issue.delete({ where: { id: issueId } });
  await prisma.issue.updateMany({
    where: { sectionId: issue.sectionId, position: { gt: issue.position } },
    data: { position: { decrement: 1 } },
  });
  res.status(204).send();
});

export default router;
