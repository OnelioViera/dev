import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "ALP Lifter Selector",
  description: "Precast lifting-anchor sizing & report tool",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900 print:bg-white">
        <NavBar />
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 print:p-0 print:max-w-none">
          {children}
        </main>
      </body>
    </html>
  );
}
