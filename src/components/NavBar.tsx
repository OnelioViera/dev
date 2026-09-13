import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import NavTabs from "@/components/NavTabs";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="border-b border-slate-200 bg-white print:hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3 border-b-2 border-blue-900 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/lindsay-precast.png" alt="Lindsay Precast" className="h-9 w-auto shrink-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/alp-supply.png" alt="ALP Supply" className="h-9 w-auto shrink-0" />
            <div className="min-w-0 border-l border-slate-200 pl-3">
              <h1 className="text-lg font-bold text-blue-900 tracking-tight truncate">ALP Lifter Selector</h1>
              <p className="text-xs text-slate-500 truncate">Precast lifting-anchor sizing &amp; report tool</p>
            </div>
          </div>
          <form action={signOut} className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-500 hidden sm:inline">{user.email}</span>
            <button className="text-xs font-semibold text-slate-600 border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
        <NavTabs />
      </div>
    </header>
  );
}
