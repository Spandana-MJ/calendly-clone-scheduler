import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Meeting scheduler
      </h1>
      <p className="mt-4 max-w-lg text-lg text-slate-600">
        Share your link, set weekly availability, and let guests book time that works
        for both of you — with optional Google Calendar sync.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow hover:bg-blue-700"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-800 hover:bg-slate-50"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
