import { Hono } from "hono";
import { authenticationRoutes } from "./authentication-routes";

import { logger } from "hono/logger";

export const allRoutes = new Hono();



allRoutes.route("/authentication", authenticationRoutes);
allRoutes.use(logger());

allRoutes.get("/health", (context) => {
  return context.json(
    {
      message: "All Ok",
    },
    200
  );
});