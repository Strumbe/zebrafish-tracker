import { useRouter } from "next/router";
import Link from "next/link";

export default function NavBar() {
  const router = useRouter();

  const sections = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Strains", path: "/strains" },
    { title: "Tank Tracker", path: "/tanks" },
    { title: "Breeding Log", path: "/breeding" },
    { title: "Users", path: "/users" },
    { title: "Tank Archive", path: "/tanks/archive" },
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-3">
      {sections.map((section) => (
        <button
          key={section.title}
          onClick={() => router.push(section.path)}
          className={`px-4 py-2 rounded ${
            router.pathname === section.path
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {section.title}
        </button>
      ))}
      <Link href="/login" legacyBehavior>
        <a className="px-4 py-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
          Login
        </a>
      </Link>
      <Link href="/register" legacyBehavior>
        <a className="px-4 py-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
          Register
        </a>
      </Link>
    </nav>
  );
}
