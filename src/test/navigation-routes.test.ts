import { describe, expect, it } from "vitest";

import { Route as AccountRoute } from "@/routes/_authenticated/settings/account";
import { Route as ConnectionsRoute } from "@/routes/_authenticated/settings/connections";
import { Route as ProjectsRoute } from "@/routes/_authenticated/settings/projects";

describe("settings navigation routes", () => {
  it("registers the account, social links, and projects pages", () => {
    expect(AccountRoute).toBeDefined();
    expect(ConnectionsRoute).toBeDefined();
    expect(ProjectsRoute).toBeDefined();
  });
});
