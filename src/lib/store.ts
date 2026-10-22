// Tiny in-memory client store for the wireframe (resets on reload — no backend).
import { useSyncExternalStore } from "react";
import {
  initialPosts,
  opportunities as mockOpportunities,
  hackathons as mockHackathons,
  type Post,
  type Opportunity,
  type Hackathon,
} from "./mock-data";

export type ChatMessage = {
  id: string;
  from: string;
  text: string;
  time?: string;
};

export type Conversation = {
  id: string;
  kind: "direct" | "group";
  name: string;
  userId?: string;
  members: string[];
  unread: number;
  messages: ChatMessage[];
};

export type OpenSourceProject = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  featured?: boolean;
};

export type ProfileOverride = {
  headline?: string | undefined;
  location?: string | undefined;
  about?: string | undefined;
  college?: string | undefined;
  degree?: string | undefined;
  year?: number | undefined;
  skills?: string[] | undefined;
};

type State = {
  posts: Post[];
  opportunities: Opportunity[];
  hackathons: Hackathon[];
  openSourceProjects: OpenSourceProject[];
  liked: Set<string>;
  saved: Set<string>;
  savedOpps: Set<string>;
  connected: Set<string>;
  pending: Set<string>;
  joined: Set<string>;
  conversations: Conversation[];
  profileOverrides: Record<string, ProfileOverride>;
};

let state: State = {
  posts: initialPosts,
  opportunities: [...mockOpportunities],
  hackathons: [...mockHackathons],
  openSourceProjects: [
    {
      id: "oss-1",
      title: "Campus contribution board",
      description:
        "A lightweight issue tracker where students can discover beginner-friendly tasks across campus projects.",
      tags: ["Frontend", "Docs", "UX"],
      featured: true,
    },
    {
      id: "oss-2",
      title: "Student community starter kit",
      description:
        "Reusable starter project for club events, hackathons, and builder communities to launch faster.",
      tags: ["Full-stack", "Templates", "DevTools"],
      featured: true,
    },
    {
      id: "oss-3",
      title: "Project roadmap template",
      description:
        "A structured roadmap board that helps teammates align tasks, milestones, and weekly progress.",
      tags: ["Product", "Planning", "Collaboration"],
    },
  ],
  liked: new Set(),
  saved: new Set(["p2"]),
  savedOpps: new Set(),
  connected: new Set(["meera", "kabir"]),
  pending: new Set(),
  joined: new Set(["web-dev", "iitm-bs"]),
  profileOverrides: {},
  conversations: [
    {
      id: "teamup-core",
      kind: "group",
      name: "TeamUp Core",
      members: ["aarav", "priya", "kabir"],
      unread: 1,
      messages: [
        {
          id: "g1",
          from: "priya",
          text: "Let’s ship the onboarding flow before Friday.",
          time: "09:10",
        },
        {
          id: "g2",
          from: "aarav",
          text: "Perfect — I’ll finish the project board and share the prototype.",
          time: "09:14",
        },
      ],
    },
    {
      id: "m1",
      kind: "direct",
      name: "Priya Nair",
      userId: "priya",
      members: ["aarav", "priya"],
      unread: 2,
      messages: [
        { id: "m1-1", from: "priya", text: "Hey Aarav! Saw TeamUp, super clean.", time: "08:41" },
        { id: "m1-2", from: "aarav", text: "Thanks Priya! Congrats on HackBLR 🏆", time: "08:52" },
        { id: "m1-3", from: "priya", text: "Want to team up for BuildWithAI?", time: "08:58" },
      ],
    },
    {
      id: "m2",
      kind: "direct",
      name: "Meera Iyer",
      userId: "meera",
      members: ["aarav", "meera"],
      unread: 0,
      messages: [
        { id: "m2-1", from: "meera", text: "Are you still free for SIH?", time: "Yesterday" },
        {
          id: "m2-2",
          from: "aarav",
          text: "Yes! Send me the problem statement.",
          time: "Yesterday",
        },
      ],
    },
  ],
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getState() {
  return state;
}

export function setState(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) };
  emit();
}
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => sel(state),
    () => sel(state),
  );
}
export function toggleIn(
  key: "liked" | "saved" | "savedOpps" | "connected" | "pending" | "joined",
  id: string,
) {
  setState((s) => {
    const next = new Set(s[key]);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return { [key]: next } as Partial<State>;
  });
}

export function upsertOpportunity(value: Opportunity) {
  setState((s) => {
    const exists = s.opportunities.some((item) => item.id === value.id);
    return {
      opportunities: exists
        ? s.opportunities.map((item) => (item.id === value.id ? value : item))
        : [value, ...s.opportunities],
    };
  });
}

export function removeOpportunity(id: string) {
  setState((s) => ({ opportunities: s.opportunities.filter((item) => item.id !== id) }));
}

export function upsertHackathon(value: Hackathon) {
  setState((s) => {
    const exists = s.hackathons.some((item) => item.id === value.id);
    return {
      hackathons: exists
        ? s.hackathons.map((item) => (item.id === value.id ? value : item))
        : [value, ...s.hackathons],
    };
  });
}

export function removeHackathon(id: string) {
  setState((s) => ({ hackathons: s.hackathons.filter((item) => item.id !== id) }));
}

export function updateProfile(id: string, changes: ProfileOverride) {
  setState((s) => ({
    profileOverrides: {
      ...s.profileOverrides,
      [id]: {
        ...(s.profileOverrides[id] ?? {}),
        ...changes,
      },
    },
  }));
}

export function upsertOpenSourceProject(value: OpenSourceProject) {
  setState((s) => {
    const exists = s.openSourceProjects.some((item) => item.id === value.id);
    return {
      openSourceProjects: exists
        ? s.openSourceProjects.map((item) => (item.id === value.id ? value : item))
        : [value, ...s.openSourceProjects],
    };
  });
}

export function removeOpenSourceProject(id: string) {
  setState((s) => ({ openSourceProjects: s.openSourceProjects.filter((item) => item.id !== id) }));
}

export function addTeamGroup(
  teamName: string,
  members: string[],
  introText?: string,
  projectId?: string,
) {
  const cleanMembers = [...new Set(members.filter(Boolean))];
  const groupId = projectId ?? `team-${crypto.randomUUID()}`;

  if (!cleanMembers.length) return;

  setState((s) => ({
    conversations: [
      {
        id: groupId,
        kind: "group",
        name: teamName,
        members: cleanMembers,
        unread: 0,
        messages: [
          {
            id: `${groupId}-intro`,
            from: "system",
            text:
              introText ??
              `Welcome to ${teamName}. This is your project group for planning, tasks, and quick discussions.`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      },
      ...s.conversations,
    ],
  }));
}
