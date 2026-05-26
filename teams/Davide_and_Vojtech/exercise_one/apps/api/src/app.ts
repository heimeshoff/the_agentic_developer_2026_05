import { SHARED_PACKAGE_NAME } from "@finance/shared";
import Fastify, { type FastifyInstance } from "fastify";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok", shared: SHARED_PACKAGE_NAME };
  });

  return app;
}
