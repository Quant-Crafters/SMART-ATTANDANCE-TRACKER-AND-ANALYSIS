import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>AttendSmart Dashboard</h1>

      <p>Welcome, {user?.name}</p>
      <p>Role: {user?.role}</p>
      <p>Email: {user?.email}</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}