import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.get("/", (_req, res) => res.redirect("/Switch-Cat-log/"));

const siteRoot = path.resolve("/home/runner/workspace");
app.use("/Switch-Cat-log", express.static(siteRoot));
app.get("/Switch-Cat-log", (_req, res) => {
  res.sendFile(path.join(siteRoot, "index.html"));
});
app.get("/Switch-Cat-log/", (_req, res) => {
  res.sendFile(path.join(siteRoot, "index.html"));
});

export default app;
