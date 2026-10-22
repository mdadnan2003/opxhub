import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("posts migration", () => {
  it("adds the image_url column required by the composer and post queries", () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), "drizzle/migrations/0000_migration.sql"),
      "utf8",
    );

    expect(sql).toContain("create table public.posts");
    expect(sql).toContain("image_url text");
  });
});
