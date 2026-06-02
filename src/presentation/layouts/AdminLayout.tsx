"use client";

import React from "react";
import {
  Link,
  Button,
  Avatar,
  Dropdown,
  Separator
} from "@heroui/react";
import Logo from "@/presentation/components/Logo";
import LogoutButton from "@/presentation/components/LogoutButton";
import { 
  HomeIcon, 
  UsersIcon, 
  SettingsIcon, 
  ShieldIcon, 
  ChartIcon,
  SearchIcon 
} from "@/presentation/components/icons";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: HomeIcon },
    { label: "Users", href: "/admin/users", icon: UsersIcon },
    { label: "Analytics", href: "/admin/analytics", icon: ChartIcon },
    { label: "Security", href: "/admin/security", icon: ShieldIcon },
    { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-zinc-950 border-r border-divider flex flex-col h-full z-50">
        <div className="p-8 pb-10">
          <Logo size={40} variant="full" />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30" 
                    : "text-zinc-500 hover:bg-blue-600/5 hover:text-blue-600"
                }`}
              >
                <Icon size={20} className={`${isActive ? "text-white" : "group-hover:text-blue-600 transition-colors"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 space-y-2">
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-4 flex items-center gap-3 border border-divider">
             <Avatar.Root className="h-10 w-10 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <Avatar.Image src="https://i.pravatar.cc/150?u=admin" className="rounded-full" />
                <Avatar.Fallback>AD</Avatar.Fallback>
             </Avatar.Root>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold truncate text-foreground">Administrator</p>
               <p className="text-[10px] font-medium text-zinc-500 truncate">admin@system.io</p>
             </div>
          </div>
          <LogoutButton
            variant="full"
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer border-0 bg-transparent"
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-divider flex items-center justify-between px-10 bg-white/50 dark:bg-black/50 backdrop-blur-xl z-40">
           <div className="w-full max-w-md">
              <div className="relative group">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <input 
                   placeholder="Search system logs, users, or records..."
                   className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl h-11 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
           </div>

           <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" className="rounded-xl h-10 w-10 border border-divider hover:bg-zinc-100 dark:hover:bg-zinc-900">
                 <div className="relative">
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse" />
                    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                 </div>
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Dropdown.Root>
                 <Dropdown.Trigger>
                    <button className="flex items-center gap-1 focus:outline-none py-1 px-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                       <span className="text-sm font-bold">System Status</span>
                       <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                    </button>
                 </Dropdown.Trigger>
                 {/* Simplified Dropdown */}
              </Dropdown.Root>
           </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-10">
           {children}
        </main>
      </div>
    </div>
  );
}
