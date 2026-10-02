import { projectRoutes } from "@/server/routes";

export async function GET(_req: Request, ctx: RouteContext<"/api/projects/[id]">) {
  return projectRoutes.get((await ctx.params).id);
}

export async function PUT(req: Request, ctx: RouteContext<"/api/projects/[id]">) {
  return projectRoutes.put((await ctx.params).id, req);
}
