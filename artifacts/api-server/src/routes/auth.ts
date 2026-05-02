import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxQPLu4QSVJaZp2rJ3Yc5r59jc4KmbwQ7qXL5tAWA5VuJXuYeHDW335g8CYArvLMQdNdw/exec";

router.post("/auth", async (req, res) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(req.body),
      redirect: "follow",
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    logger.error({ err }, "Auth proxy error");
    res.status(500).json({ error: "proxy_error" });
  }
});

export default router;
