import { Router } from "express";
import { prisma } from "@repo/db/client";
import { requireAuth } from "../auth_middleware";

const router = Router();
router.use(requireAuth);

async function canAccessIssue(userId: string | undefined, issueId: string) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) return null;
  const board = await prisma.board.findUnique({ where: { id: issue.boardId } });
  const m = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: userId!, orgId: board!.orgId } },
  });
  return m?.accepted ? issue : null;
}

router.post("/comment", async (req, res) => {
  const { issueId, content } = req.body;
  if (!(await canAccessIssue(req.userId, issueId))) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  const comment = await prisma.comment.create({
    data: { userId: req.userId!, issueId, content },
    include: { user: { select: { id: true, name: true } } },
  });
  res.status(201).json(comment);
});

router.put("/comment", async (req, res) => {
  const { commentId, content } = req.body;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== req.userId) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  res.json(
    await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: { user: { select: { id: true, name: true } } },
    }),
  );
});

router.delete("/comment", async (req, res) => {
  const { commentId } = req.body;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== req.userId) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  await prisma.comment.delete({ where: { id: commentId } });
  res.status(204).send();
});

export default router;
