// All data here is MOCK data for the wireframe. Nothing is persisted to a backend.
import hackathonImg from "@/assets/post-hackathon.jpg";
import projectImg from "@/assets/post-project.jpg";

export type User = {
  id: string;
  name: string;
  headline: string;
  college: string;
  degree: string;
  year: number;
  location?: string;
  skills: string[];
  connections: number;
  available?: boolean;
  mutual?: number;
};

export const users: User[] = [
  { id: "aarav", name: "Aarav Mehta", headline: "Full-stack dev · Building in public", college: "IIT Madras", degree: "BS Data Science", year: 2027, location: "Chennai", skills: ["React", "Node.js", "PostgreSQL", "TypeScript"], connections: 842, available: true },
  { id: "priya", name: "Priya Nair", headline: "ML engineer intern · Kaggle Expert", college: "BITS Pilani", degree: "B.E. Computer Science", year: 2026, location: "Pilani", skills: ["PyTorch", "NLP", "Python"], connections: 1204, available: true, mutual: 12 },
  { id: "rohan", name: "Rohan Gupta", headline: "Security researcher · CTF player", college: "NIT Trichy", degree: "B.Tech CSE", year: 2027, skills: ["Pentesting", "Rust", "Linux"], connections: 389, mutual: 4 },
  { id: "sara", name: "Sara Khan", headline: "Product designer · UI/UX", college: "NID Ahmedabad", degree: "M.Des Interaction", year: 2026, skills: ["Figma", "Design Systems", "Research"], connections: 671, available: true, mutual: 7 },
  { id: "dev", name: "Dev Patel", headline: "Founder @ StudyStack · Startups", college: "IIIT Hyderabad", degree: "B.Tech ECE", year: 2025, skills: ["Go", "Startups", "Growth"], connections: 2310, mutual: 19 },
  { id: "meera", name: "Meera Iyer", headline: "Data science · Visualization nerd", college: "IIT Madras", degree: "BS Data Science", year: 2028, skills: ["SQL", "Pandas", "Tableau"], connections: 214, available: true, mutual: 3 },
  { id: "kabir", name: "Kabir Singh", headline: "Open source · Web performance", college: "DTU Delhi", degree: "B.Tech IT", year: 2026, skills: ["Next.js", "Web Vitals", "Rust"], connections: 530, mutual: 9 },
];

export const me = users[0]!;
export const getUser = (id: string) => users.find((u) => u.id === id);

export type Post = {
  id: string;
  authorId: string;
  time: string;
  text: string;
  image?: string;
  kind?: "achievement" | undefined; _k?: "achievement" | "project" | "team" | "opportunity" | "question";
  opportunity?: { title: string; org: string; mode: string; deadline: string };
  likes: number;
  comments: { id: string; authorId: string; text: string }[];
  reposts: number;
};

export const initialPosts: Post[] = [
  { id: "p1", authorId: "priya", time: "2h", kind: "achievement", image: hackathonImg, text: "We won 1st place at HackBLR 2026! 🏆 36 hours, 4 people, too much chai. Our project, MediScan, uses on-device vision models to flag prescription errors for rural pharmacies. Huge thanks to my teammates and every mentor who stayed up with us. Next step: piloting with two clinics in Karnataka. If you work in healthcare tech, I'd love to chat.", likes: 482, reposts: 31, comments: [{ id: "c1", authorId: "dev", text: "Massive! The on-device angle is so smart." }, { id: "c2", authorId: "sara", text: "Congrats Priya 🎉" }] },
  { id: "p2", authorId: "aarav", time: "5h", kind: "project", image: projectImg, text: "Shipped v1 of TeamUp — a real-time task board for student clubs. Stack: React + Node + Postgres, websockets for live updates, deployed on edge functions. Repo and live demo in comments. Feedback very welcome, especially on the onboarding flow.", likes: 213, reposts: 12, comments: [{ id: "c3", authorId: "kabir", text: "Lighthouse score? 👀" }] },
  { id: "p3", authorId: "meera", time: "8h", kind: "team", text: "Looking for teammates for the Smart India Hackathon AI track! 🚀 Need: 1 ML engineer (CV experience) and 1 frontend dev (React). Idea: crop disease detection from phone photos with offline support. Team size 4. DM me if interested!", likes: 96, reposts: 18, comments: [] },
  { id: "p4", authorId: "dev", time: "1d", kind: "opportunity", text: "Sharing for the community — StudyStack is hiring 2 summer interns for backend engineering. Remote friendly, 3rd/4th year students welcome.", opportunity: { title: "Backend Engineering Intern", org: "StudyStack", mode: "Remote", deadline: "Nov 30, 2026" }, likes: 154, reposts: 47, comments: [] },
  { id: "p5", authorId: "kabir", time: "1d", kind: "achievement", text: "Just hit 500 days of coding streak on GitHub 🟩 What started as a 'one commit a day' challenge turned into 3 open source contributions merged into major projects. Consistency > intensity.", likes: 377, reposts: 9, comments: [] },
  { id: "p6", authorId: "rohan", time: "2d", kind: "question", text: "Hot take: LLM-powered code assistants are going to create a new generation of supply-chain vulnerabilities. Prompt-injected dependencies, hallucinated package names that attackers register... How are you all thinking about AI + security in your projects?", likes: 128, reposts: 22, comments: [{ id: "c4", authorId: "priya", text: "Package hallucination is genuinely scary. We pin + verify everything now." }] },
];

export type Opportunity = { id: string; title: string; org: string; mode: "Remote" | "Hybrid" | "On-site"; type: "Internship" | "Job"; category: string; eligibility: string; deadline: string; stipend?: string; verified: boolean; link: string };
export const opportunities: Opportunity[] = [
  { id: "o1", title: "Backend Engineering Intern", org: "StudyStack", mode: "Remote", type: "Internship", category: "Engineering", eligibility: "3rd/4th year, Go or Node", deadline: "2026-11-30", stipend: "Paid", verified: true, link: "#" },
  { id: "o2", title: "ML Research Intern", org: "Sarvam Labs", mode: "Hybrid", type: "Internship", category: "AI/ML", eligibility: "Any year, PyTorch", deadline: "2026-11-12", verified: false, link: "#" },
  { id: "o3", title: "Product Design Intern", org: "Pixelcraft", mode: "On-site", type: "Internship", category: "Design", eligibility: "Portfolio required", deadline: "2026-12-05", stipend: "Paid", verified: true, link: "#" },
  { id: "o4", title: "Junior Data Analyst", org: "Quanta Retail", mode: "Hybrid", type: "Job", category: "Data", eligibility: "2026 graduates, SQL", deadline: "2026-10-28", verified: false, link: "#" },
  { id: "o5", title: "Security Analyst Intern", org: "ShieldOps", mode: "Remote", type: "Internship", category: "Security", eligibility: "CTF experience a plus", deadline: "2026-11-20", verified: false, link: "#" },
];

export type Hackathon = { id: string; name: string; org: string; mode: "Online" | "Offline"; deadline: string; dates: string; prize?: string; location?: string; tags: string[] };
export const hackathons: Hackathon[] = [
  { id: "h1", name: "Smart India Hackathon", org: "Govt. of India", mode: "Offline", deadline: "2026-10-30", dates: "Dec 8–9", location: "Multiple cities", tags: ["AI", "GovTech"] },
  { id: "h2", name: "HackBLR Winter", org: "HackBLR Collective", mode: "Offline", deadline: "2026-11-15", dates: "Dec 14–15", prize: "₹5,00,000", location: "Bengaluru", tags: ["Open"] },
  { id: "h3", name: "BuildWithAI Global", org: "Devpost community", mode: "Online", deadline: "2026-11-02", dates: "Nov 8–10", tags: ["AI/ML", "LLMs"] },
  { id: "h4", name: "Shaastra CodeFest", org: "IIT Madras", mode: "Offline", deadline: "2026-12-01", dates: "Jan 4–6", location: "Chennai", tags: ["Web", "Systems"] },
];

export type TeamPost = { id: string; authorId: string; hackathon: string; idea: string; roles: string[]; size: string };
export const teamPosts: TeamPost[] = [
  { id: "t1", authorId: "meera", hackathon: "Smart India Hackathon", idea: "Offline crop disease detection from phone photos", roles: ["ML Engineer", "React Dev"], size: "2/4" },
  { id: "t2", authorId: "sara", hackathon: "BuildWithAI Global", idea: "AI study buddy that turns lectures into flashcards", roles: ["Backend Dev", "LLM Engineer"], size: "1/3" },
  { id: "t3", authorId: "rohan", hackathon: "Shaastra CodeFest", idea: "Browser extension detecting phishing in real time", roles: ["Frontend Dev"], size: "3/4" },
];

export const communities = [
  { id: "ai-ml", name: "AI & Machine Learning", members: 18420, desc: "Papers, projects, and model talk.", pinned: "Weekly paper reading: Thursdays 8pm IST" },
  { id: "web-dev", name: "Web Development", members: 22105, desc: "Frontend, backend, and everything between.", pinned: "Share your portfolio in the monthly review thread" },
  { id: "cybersecurity", name: "Cybersecurity", members: 7310, desc: "CTFs, bug bounties, and secure coding.", pinned: "CTF team signups open for November" },
  { id: "data-science", name: "Data Science", members: 11250, desc: "Analytics, viz, and Kaggle grind.", pinned: "Dataset of the week: Indian Railways delays" },
  { id: "startups", name: "Startup Builders", members: 5870, desc: "For student founders and builders.", pinned: "Founder AMA with Dev Patel this Saturday" },
  { id: "hackathon-teams", name: "Hackathon Teams", members: 9640, desc: "Find teammates, share wins.", pinned: "Use the template when posting team requests" },
  { id: "iitm-bs", name: "IIT Madras BS Community", members: 14300, desc: "For BS Data Science & Electronic Systems students.", pinned: "Quiz 2 prep groups are forming" },
];

export const notifications = [
  { id: "n1", type: "connect", userId: "priya", text: "sent you a connection request", time: "5m", unread: true },
  { id: "n2", type: "like", userId: "kabir", text: "and 23 others liked your project post", time: "1h", unread: true },
  { id: "n3", type: "comment", userId: "dev", text: "commented: “Would love to feature this!”", time: "3h", unread: true },
  { id: "n4", type: "follow", userId: "sara", text: "started following you", time: "6h", unread: false },
  { id: "n5", type: "accept", userId: "rohan", text: "accepted your connection request", time: "1d", unread: false },
  { id: "n6", type: "hackathon", userId: "meera", text: "mentioned you in a team post for Smart India Hackathon", time: "1d", unread: false },
  { id: "n7", type: "opportunity", userId: "dev", text: "A saved opportunity closes in 3 days: Backend Engineering Intern", time: "2d", unread: false },
];

export const conversations = [
  { id: "m1", userId: "priya", unread: 2, messages: [{ from: "priya", text: "Hey Aarav! Saw TeamUp, super clean." }, { from: "me", text: "Thanks Priya! Congrats on HackBLR 🏆" }, { from: "priya", text: "Want to team up for BuildWithAI?" }, { from: "priya", text: "We need a strong full-stack person 👀" }] },
  { id: "m2", userId: "meera", unread: 0, messages: [{ from: "meera", text: "Are you still free for SIH?" }, { from: "me", text: "Yes! Send me the problem statement." }] },
  { id: "m3", userId: "dev", unread: 1, messages: [{ from: "dev", text: "Would you be up for a quick call about the internship?" }] },
  { id: "m4", userId: "kabir", unread: 0, messages: [{ from: "me", text: "That perf thread was gold." }, { from: "kabir", text: "Haha thanks, part 2 coming soon" }] },
];

export const INTERESTS = ["Web Development", "AI/ML", "Data Science", "Cybersecurity", "UI/UX", "Startups", "Hackathons"];

export function daysLeft(iso: string) {
  const d = Math.ceil((new Date(iso).getTime() - new Date("2026-10-15").getTime()) / 86400000);
  return d;
}
