import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizzesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Quizzes = () => {
  const { isSuperuser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, quiz: null });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizzesAPI.getAll();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    try {
      await quizzesAPI.delete(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      setDeleteModal({ show: false, quiz: null });
      alert('✅ Quiz deleted successfully!');
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert('❌ Failed to delete quiz: ' + (err.response?.data?.error || err.message));
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      easy: '😊',
      medium: '🤔',
      hard: '🔥'
    };
    return icons[difficulty] || '📝';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">❓ Quiz Management</h1>
          <p className="text-gray-600">Create and manage interactive Quran quizzes</p>
        </div>
        {isSuperuser() && (
          <Link
            to="/quizzes/create"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Create New Quiz
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      {/* Quizzes Grid */}
      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-green-500"
            >
              {/* Quiz Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{quiz.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                      {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {quiz.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {quiz.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-sm mb-4 pb-4 border-b border-gray-200">
                <div className="text-center">
                  <p className="font-semibold text-green-600">{quiz.total_questions}</p>
                  <p className="text-gray-500 text-xs">Questions</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">{quiz.time_limit_minutes}m</p>
                  <p className="text-gray-500 text-xs">Time</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-600">{quiz.passing_score}%</p>
                  <p className="text-gray-500 text-xs">Pass</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/quizzes/${quiz.id}`}
                  className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  👁️ View
                </Link>
                {isSuperuser() && (
                  <>
                    <Link
                      to={`/quizzes/${quiz.id}/edit`}
                      className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => setDeleteModal({ show: true, quiz })}
                      className="flex-1 text-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Quizzes Yet</h3>
          <p className="text-gray-600 mb-6">Create your first quiz to get started</p>
          {isSuperuser() && (
            <Link
              to="/quizzes/create"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              ➕ Create First Quiz
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Delete Quiz</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteModal.quiz?.name}</strong>? This will also delete all questions. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, quiz: null })}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.quiz.id)}
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

export default Quizzes;
