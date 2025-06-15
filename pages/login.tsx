import { useState } from 'react';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let timeoutId;
    try {
      timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Login timed out. Please try again.');
      }, 15000); // 15 seconds timeout
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      clearTimeout(timeoutId);
      const user = data?.user;
      if (error) {
        setError(error.message);
      } else if (user) {
        // Fetch user data from the custom users table
        const { data: userData, error: userTableError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();
        if (userTableError || !userData) {
          setError('No user profile found. Please register or contact support.');
        } else {
          // Redirect to user profile or dashboard
          window.location.href = `/users/${user.id}`;
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="...styles...">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 mx-auto block"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {loading && <p>Logging in, please wait...</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default Login;