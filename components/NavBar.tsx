import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function NavBar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const sections = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Strains", path: "/strains" },
    { title: "Tank Tracker", path: "/tanks" },
    { title: "Breeding Log", path: "/breeding" },
    { title: "Users", path: "/users" },
    { title: "Tank Archive", path: "/tanks/archive" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email);
        // Fetch username from users table
        const { data, error } = await supabase
          .from("users")
          .select("username")
          .eq("auth_id", user.id)
          .single();
        if (data && data.username) {
          setUsername(data.username);
        }
      } else {
        setUserId(null);
        setUserEmail(null);
        setUsername(null);
      }
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => getUser());
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUserId(null);
      setUserEmail(null);
      setUsername(null);
      router.push("/login");
    } else {
      alert("Logout failed. Please try again.");
    }
  };

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
      {username ? (
        <div className="flex items-center gap-3 px-4 py-2 rounded bg-green-100 text-green-700">
          <span>
            Signed in as{" "}
            <span className="font-semibold">{userEmail}</span>
          </span>
          <Link href={`/users/${userId}`} className="underline">
            {username}
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 px-2 py-1 rounded bg-red-200 text-red-800 hover:bg-red-300"
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <Link href="/login">
            Login
          </Link>
          <Link href="/register">
            Register
          </Link>
        </>
      )}
    </nav>
  );
}
