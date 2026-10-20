import fs from "node:fs";
import path from "node:path";
import AllPagesList from "@/components/admin/all-pages-list";

export const dynamic = "force-dynamic";

/*
 * Admin > All Pages — finds every page in the app folder automatically,
 * so new pages show up here without any code change.
 */

const SKIP = /(^|\/)(api|_[^/]*|\.[^/]*)$|backup|disabled|[-_]temp/i;

function findPages(appDir: string) {
  const routes: string[] = [];
  const walk = (dir: string, route: string) => {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((e) => e.isFile() && /^page\.(tsx|jsx|js|ts)$/.test(e.name))) {
      routes.push(route || "/");
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const rel = `${route}/${e.name}`;
      if (SKIP.test(rel)) continue;
      // Route groups like (shop) do not appear in the URL
      const next = /^\(.*\)$/.test(e.name) ? route : rel;
      walk(path.join(dir, e.name), next);
    }
  };
  walk(appDir, "");
  return [...new Set(routes)].sort();
}

export default function AllPagesPage() {
  const root = process.cwd();
  const appDir = fs.existsSync(path.join(root, "src", "app")) ? path.join(root, "src", "app") : path.join(root, "app");
  const routes = findPages(appDir);
  return <AllPagesList routes={routes} />;
}
