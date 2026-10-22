import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { clearPreviewAuth, getPreviewUser, signInPreview, signUpPreview } from "./auth";
import { useMe } from "./api";

describe("preview auth", () => {
  beforeEach(() => {
    clearPreviewAuth();
    localStorage.clear();
  });

  it("creates a preview user session and persists it", () => {
    const user = signUpPreview({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
      college: "IIT Delhi",
      degree: "B.Tech CSE",
      gradYear: 2027,
      interests: ["Web Development"],
    });

    expect(user).not.toBeNull();
    expect(user?.email).toBe("test@example.com");
    expect(getPreviewUser()?.email).toBe("test@example.com");
  });

  it("signs in an existing preview account", () => {
    signUpPreview({
      fullName: "Another User",
      email: "another@example.com",
      password: "password123",
      college: "IIT Bombay",
      degree: "B.Tech EE",
      gradYear: 2028,
      interests: ["AI/ML"],
    });

    const session = signInPreview({
      email: "another@example.com",
      password: "password123",
    });

    expect(session?.email).toBe("another@example.com");
  });

  it("rejects invalid credentials", () => {
    signUpPreview({
      fullName: "Existing User",
      email: "existing@example.com",
      password: "password123",
      college: "NIT Trichy",
      degree: "B.Tech CSE",
      gradYear: 2026,
      interests: ["Cybersecurity"],
    });

    expect(signInPreview({ email: "existing@example.com", password: "wrong-pass" })).toBeNull();
    expect(signInPreview({ email: "missing@example.com", password: "password123" })).toBeNull();
  });

  it("resolves the active preview user for auth hooks", async () => {
    const user = signUpPreview({
      fullName: "Preview User",
      email: "preview@example.com",
      password: "password123",
      college: "IIT Kanpur",
      degree: "B.Tech EE",
      gradYear: 2028,
      interests: ["AI/ML"],
    });

    expect(user).not.toBeNull();

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useMe(), { wrapper });

    await waitFor(() => {
      expect(result.current.id).toBe(user?.id);
      expect(result.current.profile?.full_name).toBe("Preview User");
      expect(result.current.isLoading).toBe(false);
    });
  });
});
