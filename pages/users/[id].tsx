import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import NavBar from '../../components/NavBar';

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    const getSessionUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user);
    };
    getSessionUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('username, email, auth_id')
        .eq('auth_id', id)
        .single();
      if (error || !data) {
        setError('User not found.');
      } else {
        setUser(data);
        setEditUsername(data.username);
      }
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  const handleEdit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('users')
      .update({ username: editUsername })
      .eq('auth_id', id);
    if (!error) {
      setUser((u) => ({ ...u, username: editUsername }));
      setEditMode(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError(null);
    setDeleteSuccess(false);
    // Delete from users table
    const { error: userTableError } = await supabase.from('users').delete().eq('auth_id', id);
    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(Array.isArray(id) ? id[0] : id);
    if (userTableError || authError) {
      setDeleteError('Failed to delete account.');
    } else {
      setDeleteSuccess(true);
      setTimeout(() => {
        window.location.href = '/register';
      }, 2000);
    }
  };

  if (loading) return <div className="p-8"><NavBar /><div>Loading...</div></div>;
  if (error) return <div className="p-8"><NavBar /><div className="text-red-500">{error}</div></div>;

  // Only allow viewing/editing own profile
  if (!sessionUser || sessionUser.id !== id) {
    return <div className="p-8"><NavBar /><div className="text-red-500">Access denied.</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NavBar />
      <div className="max-w-lg mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <p><strong>Email:</strong> {user.email}</p>
        {editMode ? (
          <form onSubmit={handleEdit} className="mb-4">
            <label className="block mb-2 font-semibold">Username</label>
            <input
              className="border p-2 rounded w-full mb-2"
              value={editUsername}
              onChange={e => setEditUsername(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Save</button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditMode(false)}>Cancel</button>
          </form>
        ) : (
          <p><strong>Username:</strong> {user.username} <button className="ml-2 text-blue-600 underline" onClick={() => setEditMode(true)}>Edit</button></p>
        )}
        <hr className="my-4" />
        <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Delete Account</button>
        {deleteError && <p className="text-red-500 mt-2">{deleteError}</p>}
        {deleteSuccess && <p className="text-green-600 mt-2">Account deleted. Redirecting...</p>}
      </div>
    </div>
  );
}
