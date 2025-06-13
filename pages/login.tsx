import { useState } from 'react';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signIn({ email, password });
    if (error) {
      setError(error.message);
    } else {
      alert('Login successful!');
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
        >
          Login
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;