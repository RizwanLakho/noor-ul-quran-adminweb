import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Topics = () => {
  const { user, isSuperuser } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, topic: null });

  // DEBUG: Check user and superuser status
  useEffect(() => {
    console.log('🔍 Topics Page - User:', user);
    console.log('🔍 Topics Page - isSuperuser():', isSuperuser());
    console.log('🔍 Topics Page - user?.role:', user?.role);
  }, [user]);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await topicsAPI.getAll();
      setTopics(data.topics || []);
    } catch (err) {
      console.error('Error loading topics:', err);
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (topicId) => {
    try {
      await topicsAPI.delete(topicId);
      setTopics(topics.filter(t => t.id !== topicId));
      setDeleteModal({ show: false, topic: null });
      alert('✅ Topic deleted successfully!');
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('❌ Failed to delete topic: ' + (err.response?.data?.error || err.message));
    }
  };

  // Debug render
  const superuserCheck = isSuperuser();
  console.log('🎨 Rendering Topics - Show buttons?', superuserCheck);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* DEBUG INFO - Remove after testing */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
        <p className="font-bold text-yellow-800">🔍 DEBUG INFO:</p>
        <p className="text-sm">User: {user?.username}</p>
        <p className="text-sm">Role: {user?.role}</p>
        <p className="text-sm">isSuperuser(): {superuserCheck ? 'TRUE ✅' : 'FALSE ❌'}</p>
        <p className="text-sm">Should show buttons: {superuserCheck ? 'YES' : 'NO'}</p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Topics Management</h1>
          <p className="text-gray-600">Manage Quran topics with Ayahs and Hadith references</p>
        </div>
        
        {/* Add Topic Button - FORCED to show for testing */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Superuser: {superuserCheck ? 'Yes' : 'No'}</p>
          {superuserCheck && (
            <Link
              to="/topics/create"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span className="text-xl">➕</span>
              Add New Topic
            </Link>
          )}
          
          {/* TEMPORARY - Always show button for testing */}
          {!superuserCheck && (
            <div>
              <p className="text-red-600 text-sm mb-2">❌ Not superuser - Button hidden</p>
              <Link
                to="/topics/create"
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold"
              >
                🔧 TEST BUTTON (Always Visible)
              </Link>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      {/* Topics Grid */}
      {topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-green-500"
            >
              {/* Topic Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-4xl">{topic.icon || '📖'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{topic.title}</h3>
                    <span className="inline-block text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 mt-1">
                      {topic.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {topic.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-green-600">{topic.ayah_count || 0}</span>
                  <span>Ayahs</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-green-600">{topic.hadith_count || 0}</span>
                  <span>Hadith</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/topics/${topic.id}`}
                  className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  👁️ View
                </Link>
                
                {/* Show these if superuser */}
                {superuserCheck && (
                  <>
                    <Link
                      to={`/topics/${topic.id}/edit`}
                      className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => setDeleteModal({ show: true, topic })}
                      className="flex-1 text-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
                
                {/* Show debug info if NOT superuser */}
                {!superuserCheck && (
                  <div className="flex-1 text-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-xs">
                    ⚠️ Buttons hidden (not superuser)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Topics Yet</h3>
          <p className="text-gray-600 mb-6">Create your first topic to get started</p>
          <Link
            to="/topics/create"
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            ➕ Add First Topic
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Delete Topic</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteModal.topic?.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, topic: null })}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.topic.id)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topics;
