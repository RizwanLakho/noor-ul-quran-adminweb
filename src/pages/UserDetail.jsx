import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const UserDetail = () => {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserAnalytics();
  }, [userId]);

  const loadUserAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/user-analytics/${userId}/analytics`);
      setData(response.data);
    } catch (err) {
      console.error('Error loading user analytics:', err);
      setError(err.response?.data?.error || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 text-lg mb-4">❌ {error || 'User not found'}</p>
          <Link to="/users" className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const { user, statistics, quiz_attempts = [], topic_progress = [], bookmarks = [] } = data;

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">{user.first_name} {user.last_name}</h1>
          <p className="text-gray-600">{user.email} • {user.role}</p>
        </div>
        <Link to="/users" className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Quiz Attempts</p>
          <p className="text-3xl font-bold text-blue-600">{statistics.total_quiz_attempts || 0}</p>
          <p className="text-sm text-gray-500 mt-1">{statistics.passed_quizzes || 0} passed</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Avg Score</p>
          <p className="text-3xl font-bold text-green-600">{Math.round(parseFloat(statistics.avg_quiz_score) || 0)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Topics</p>
          <p className="text-3xl font-bold text-purple-600">{statistics.topics_started || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Bookmarks</p>
          <p className="text-3xl font-bold text-orange-600">{statistics.total_bookmarks || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Quiz Attempts</h2>
        {quiz_attempts.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Quiz</th>
                <th className="text-center p-3">Score</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {quiz_attempts.map(attempt => (
                <tr key={attempt.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{attempt.quiz_name}</td>
                  <td className="text-center p-3">
                    <span className={`font-semibold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.round(parseFloat(attempt.score_percentage) || 0)}%
                    </span>
                  </td>
                  <td className="text-center p-3">{attempt.status}</td>
                  <td className="text-center p-3 text-sm text-gray-500">
                    {new Date(attempt.started_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-8">No quiz attempts yet</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Topic Progress</h2>
        {topic_progress.length > 0 ? (
          <div className="space-y-4">
            {topic_progress.map(topic => (
              <div key={topic.id} className="border rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{topic.topic_title}</h3>
                  <span className="text-xl font-bold text-green-600">{Math.round(parseFloat(topic.progress_percentage) || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${parseFloat(topic.progress_percentage) || 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No topics started yet</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🔖 Ayah Bookmarks</h2>
        {bookmarks.length > 0 ? (
          <div className="space-y-3">
            {bookmarks.map(bookmark => (
              <div key={bookmark.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">
                      {bookmark.surah_name_english} ({bookmark.surah_number}:{bookmark.ayah_number})
                    </p>
                    {bookmark.notes && <p className="text-sm text-gray-600 mt-1">{bookmark.notes}</p>}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No bookmarks yet</p>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
