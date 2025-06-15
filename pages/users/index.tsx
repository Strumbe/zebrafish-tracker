import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import NavBar from "../../components/NavBar";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("auth_id, username, email");
      if (!error) setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NavBar />
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">All Users</h1>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li key={user.auth_id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="font-semibold">{user.username}</span> <span className="text-gray-500">({user.email})</span>
                </div>
                <Link href={`/users/${user.auth_id}`} className="text-blue-600 underline">View Profile</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
