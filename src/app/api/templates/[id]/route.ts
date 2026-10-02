import { templateRoutes } from "@/server/routes";

export async function GET(_req: Request, ctx: RouteContext<"/api/templates/[id]">) {
  return templateRoutes.get((await ctx.params).id);
}

export async function PUT(req: Request, ctx: RouteContext<"/api/templates/[id]">) {
  return templateRoutes.put((await ctx.params).id, req);
}
