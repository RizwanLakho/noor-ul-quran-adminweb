import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isSuperuser } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/surahs', icon: '📖', label: 'Surahs' },
    { to: '/topics', icon: '📚', label: 'Topics' },
    { to: '/quizzes', icon: '❓', label: 'Quizzes' },
  ];

  const superuserItems = [
    { to: '/translations', icon: '🌐', label: 'Translations' },
    { to: '/users', icon: '👥', label: 'Users' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold mb-2">🕌 Quran Admin</h2>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 uppercase">
          {user?.role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-all ${
                isActive ? 'bg-primary-500/20 text-white border-l-4 border-primary-500' : ''
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isSuperuser() && (
          <>
            <div className="px-6 py-2 mt-6 text-xs font-semibold text-gray-500 uppercase">
              Superuser Only
            </div>
            {superuserItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-all ${
                    isActive ? 'bg-primary-500/20 text-white border-l-4 border-primary-500' : ''
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
