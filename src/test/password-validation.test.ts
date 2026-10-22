import { describe, expect, it } from "vitest";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  clearPreviewAuth,
  signUpPreview,
  validatePasswordStrength,
} from "@/lib/auth";

describe("password validation", () => {
  it("accepts a strong password with uppercase, number, and symbol", () => {
    expect(validatePasswordStrength("Abcdef1@")).toBeNull();
  });

  it("allows the built-in admin preview account to use the required local admin credentials", () => {
    clearPreviewAuth();
    const created = signUpPreview({
      fullName: "Admin User",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      college: "OPXHUB",
      degree: "Admin",
      gradYear: 2026,
      interests: ["Admin"],
    });

    expect(created).not.toBeNull();
    expect(created?.email).toBe(ADMIN_EMAIL);
  });

  it("rejects weak passwords that do not meet all rules", () => {
    expect(validatePasswordStrength("abc123")).toContain("uppercase");
    expect(validatePasswordStrength("Abcdefgh")).toContain("number");
    expect(validatePasswordStrength("Abcdef1")).toContain("symbol");
    expect(validatePasswordStrength("Ab1@")).toContain("8 characters");
  });
});
