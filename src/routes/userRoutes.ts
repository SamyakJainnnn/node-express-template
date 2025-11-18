import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Protected route example
router.get("/profile", authMiddleware, (req: any, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

export default router;
