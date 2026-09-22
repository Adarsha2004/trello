import { useEffect } from "react";
import { Link } from "react-router";
import {
  Building2,
  KanbanSquare,
  MousePointerClick,
  Pencil,
  ShieldCheck,
  Users,
} from "lucide-react";
import landingImage from "@/trello-landing-image.png";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}

function LandingHeader() {
  const { data: user } = useCurrentUser();

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0b0d10]/80 py-3 pr-3 pl-5 backdrop-blur-md">
        <Link to="/" className="text-lg font-bold text-white">
          Trello
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-white"
          >
            How it works
          </a>
          <a href="#about" className="transition-colors hover:text-white">
            About
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-white"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                {initials(user.name)}
              </span>
              <span className="hidden max-w-32 truncate sm:inline">
                {user.name}
              </span>
            </Link>
          ) : (
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { data: user } = useCurrentUser();

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col items-start justify-center gap-6 px-8 py-16 md:px-16 lg:px-24">
        <h1 className="max-w-2xl text-5xl leading-tight font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
          Projects shouldn't feel like spreadsheets.
        </h1>
        <p className="max-w-xl text-lg text-zinc-400 md:text-xl">
          Organize your work visually, keep your team aligned, and always know
          what's moving forward.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-white text-lg text-zinc-950 hover:bg-zinc-200"
        >
          <Link to={user ? "/dashboard" : "/signin"}>Get started</Link>
        </Button>
      </div>
      <div className="hidden w-1/2 md:block">
        <img
          src={landingImage}
          alt="Trello boards"
          className="h-full min-h-screen w-full object-contain"
        />
      </div>
    </div>
  );
}

const features = [
  {
    icon: KanbanSquare,
    title: "Boards for every project",
    description:
      "Create a board for each project, shape it with custom sections, and keep all your work in one place.",
  },
  {
    icon: MousePointerClick,
    title: "Drag and drop issues",
    description:
      "Move issues between sections and reorder them with drag and drop — the order stays correct for everyone.",
  },
  {
    icon: Pencil,
    title: "Inline editing",
    description:
      "Rename sections and rewrite issue titles and descriptions right on the card — no dialogs in your way.",
  },
  {
    icon: Building2,
    title: "Organisations and roles",
    description:
      "Group boards under an organisation, invite members by email, and control access with admin and member roles.",
  },
  {
    icon: Users,
    title: "Live presence",
    description:
      "Presence avatars show who is viewing a board right now, synced instantly over websockets.",
  },
  {
    icon: ShieldCheck,
    title: "Passwordless sign-in",
    description:
      "Sign in with a magic link, Google, or GitHub — no password to create, remember, or reset.",
  },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Everything your team needs
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-zinc-400">
          All the tools to plan, track, and ship your work together.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
                <Icon className="size-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Create your organisation",
    description:
      "Set up a workspace for your team in seconds — every board lives under your organisation.",
  },
  {
    title: "Invite your team",
    description:
      "Add members by email and manage who can edit and who administers with member and admin roles.",
  },
  {
    title: "Plan on boards",
    description:
      "Add sections, create issues, and drag work from to-do to done as it moves forward.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-white/10 py-24"
    >
      <div className="mx-auto max-w-6xl px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          How it works
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-zinc-400">
          From empty board to moving work in three steps.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <span className="text-4xl font-bold text-white/20">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-24 border-t border-white/10 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-8 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            About Trello
          </h2>
          <p className="mt-6 leading-relaxed text-zinc-400">
            Trello brings your projects to life with boards, sections, and
            cards. Create organisations, invite your team, and give every
            project a home that everyone understands.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {[
            "Boards, sections, and cards for any workflow",
            "Organisations with admin and member roles",
            "Passwordless sign-in with magic links, Google, or GitHub",
            "Instant updates over websockets",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white" />
              <p className="text-zinc-400">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  const { data: user } = useCurrentUser();

  return (
    <section className="border-t border-white/10 py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-8 text-center">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
          Ready to ditch the spreadsheet?
        </h2>
        <p className="max-w-xl text-lg text-zinc-400">
          Set up your first board in minutes and see your work clearly.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-white text-lg text-zinc-950 hover:bg-zinc-200"
        >
          <Link to={user ? "/dashboard" : "/signin"}>Get started</Link>
        </Button>
      </div>
    </section>
  );
}

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(4,5,7)]">
      <LandingHeader />
      <Hero />
      <Features />
      <HowItWorks />
      <About />
      <CallToAction />
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 text-sm text-zinc-500">
          <span className="font-semibold text-white">Trello</span>
          <span>Projects shouldn't feel like spreadsheets.</span>
        </div>
      </footer>
    </div>
  );
}
