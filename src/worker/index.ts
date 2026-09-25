import { Hono } from "hono";
import { cors } from "hono/cors";

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  AI_API_KEY?: string;
  OPENAI_API_BASE?: string;
}

import { divineRoutes } from "./routes/divine";
import { userRoutes } from "./routes/user";
import { orderRoutes } from "./routes/order";
import { vipRoutes } from "./routes/vip";
import { promoteRoutes } from "./routes/promote";
import { statsRoutes } from "./routes/stats";

export const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// 健康检查路由
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    service: "tianji-divination-worker",
    time: Date.now(),
    edge: true,
  });
});

// 挂载核心业务路由
app.route("/api/divine", divineRoutes);
app.route("/api/user", userRoutes);
app.route("/api/orders", orderRoutes);
app.route("/api/vip", vipRoutes);
app.route("/api/promote", promoteRoutes);
app.route("/api/stats", statsRoutes);

// 前端静态资源回退
app.notFound(async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text("Tianji AI Divination Worker Running", 404);
});

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> | Response {
    return app.fetch(request, env, ctx);
  },
};
