import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });

  useEffect(() => {
    loadData();
  }, [search, statusFilter, pagination.currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load users with admin endpoint
      const usersResponse = await api.get('/api/admin/users', {
        params: {
          page: pagination.currentPage,
          limit: 20,
          search,
          status: statusFilter
        }
      });
      console.log('Users:', usersResponse.data);
      setUsers(usersResponse.data.data.users || []);
      setPagination(usersResponse.data.data.pagination);

      // Load stats
      const statsResponse = await api.get('/api/user-analytics/stats/platform');
      console.log('Stats:', statsResponse.data);
      setStats(statsResponse.data.stats);
    } catch (err) {
      console.error('Error loading data:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/admin/users/${userId}`);
      alert('User deleted successfully');
      loadData(); // Reload the list
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Change status of "${userName}" to ${newStatus}?`)) {
      return;
    }

    try {
      await api.put(`/api/admin/users/${userId}/status`, { status: newStatus });
      alert(`User status changed to ${newStatus}`);
      loadData(); // Reload the list
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">👥 User Management</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-green-600">{pagination.totalUsers || stats.total_users || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Quiz Attempts</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total_quiz_attempts || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Active Learners</p>
            <p className="text-3xl font-bold text-purple-600">{stats.active_learners || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Avg Quiz Score</p>
            <p className="text-3xl font-bold text-orange-600">{Math.round(parseFloat(stats.avg_quiz_score) || 0)}%</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Users List</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="px-4 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {users.length > 0 ? (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Role</th>
                  <th className="text-center p-3">Created</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-500">{user.email_verified ? '✓ Verified' : '✗ Not Verified'}</p>
                      </div>
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="text-center p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="text-center p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="text-center p-3 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-center p-3">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/users/${user.id}`}
                          className="text-blue-500 hover:text-blue-700 px-2 py-1"
                          title="View Details"
                        >
                          👁️
                        </Link>
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.status || 'active', `${user.first_name} ${user.last_name}`)}
                              className="text-orange-500 hover:text-orange-700 px-2 py-1"
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {user.status === 'active' ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                              className="text-red-500 hover:text-red-700 px-2 py-1"
                              title="Delete User"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalUsers} total users)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Users;
