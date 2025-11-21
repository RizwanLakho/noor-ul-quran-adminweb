import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
      <div>
        <h3 className="text-xl font-semibold text-gray-800">
          Welcome, {user?.full_name || user?.username}! 👋
        </h3>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
