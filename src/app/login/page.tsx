import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-blue-900">ALP Lifter Selector</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Sign in to load your lifter library, jobs, and saved reports.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </div>
        )}

        <form className="space-y-3" action={signIn}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              formAction={signIn}
              className="flex-1 rounded-md bg-blue-900 text-white text-sm font-semibold py-2 hover:bg-blue-800"
            >
              Sign in
            </button>
            <button
              formAction={signUp}
              className="flex-1 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold py-2 hover:bg-slate-50"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
