"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../app/contexts/AuthContext";

// Temporary basic sidebar implementation
export default function AppSidebar() {
  const pathname = usePathname();

  // Basic navigation items
  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: "dashboard" },
    { title: "Projects", url: "/projects", icon: "projects" }
  ];

  return (
    <div className="h-full w-64 bg-gray-100 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">DMS</h1>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.title} className="mb-2">
              <Link
                href={item.url}
                className={`block rounded p-2 ${
                  pathname === item.url
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
