import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { normalizeAuthErrorMessage } from "@/lib/auth";
import { getState, removeOpportunity, updateProfile, upsertOpportunity } from "@/lib/store";
import { Logo } from "@/components/opx/primitives";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

describe("Landing page branding", () => {
  it("supports a dedicated home-page image logo without changing the default wordmark", () => {
    render(<Logo imageSrc="/opxhub-home-logo.png" imageAlt="OPXHUB" className="h-20" />);

    const logo = screen.getByAltText("OPXHUB");

    expect(logo).toHaveAttribute("src", "/opxhub-home-logo.png");
    expect(logo).toHaveClass("object-contain");
  });
});

describe("Supabase auth feedback", () => {
  it("explains email confirmation requirements clearly", () => {
    expect(normalizeAuthErrorMessage("Email not confirmed")).toBe(
      "Check your inbox and confirm your email before logging in.",
    );
    expect(normalizeAuthErrorMessage("Invalid login credentials")).toBe(
      "Invalid email or password.",
    );
  });
});

describe("Admin content management", () => {
  it("creates and removes an opportunity card through the shared store", () => {
    const before = getState().opportunities.length;

    upsertOpportunity({
      id: "temp-admin-opportunity",
      title: "Campus Ops Intern",
      org: "OPXHUB",
      mode: "Remote",
      type: "Internship",
      category: "Engineering",
      eligibility: "2nd/3rd year students",
      deadline: "2026-12-15",
      verified: true,
      link: "#",
    });

    expect(getState().opportunities.some((opp) => opp.id === "temp-admin-opportunity")).toBe(true);

    removeOpportunity("temp-admin-opportunity");

    expect(getState().opportunities.length).toBe(before);
  });
});

describe("Profile editing", () => {
  it("updates the stored profile details for a clicked user", () => {
    const original = getState().profileOverrides["aarav"];

    updateProfile("aarav", {
      headline: "Product engineer · Shipping products and experiments",
      location: "Bengaluru",
      about: "I build interfaces and love talking with users.",
      skills: ["React", "Product", "Design"],
    });

    expect(getState().profileOverrides["aarav"]?.headline).toBe(
      "Product engineer · Shipping products and experiments",
    );
    expect(getState().profileOverrides["aarav"]?.location).toBe("Bengaluru");
    expect(getState().profileOverrides["aarav"]?.about).toBe(
      "I build interfaces and love talking with users.",
    );
    expect(getState().profileOverrides["aarav"]?.skills).toEqual(["React", "Product", "Design"]);

    if (original) {
      updateProfile("aarav", original);
    }
  });
});
