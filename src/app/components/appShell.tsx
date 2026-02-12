"use client";

import { useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import Template from "../template";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Navbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
      <div className="flex min-h-[calc(100vh-65px)]">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 md:ml-72">
          <Template>{children}</Template>
        </main>
      </div>
    </>
  );
}
