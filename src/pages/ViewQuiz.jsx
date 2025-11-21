import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizzesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ViewQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperuser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizzesAPI.getById(id);
      setQuiz(data.quiz);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Error loading quiz:', err);
      alert('Failed to load quiz');
      navigate('/quizzes');
    } finally {
      setLoading(false);
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
          <p className="mt-4 text-gray-600 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">{quiz.name}</h1>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty}
              </span>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {quiz.category}
              </span>
            </div>
          </div>

          {isSuperuser() && (
            <Link
              to={`/quizzes/${id}/edit`}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
            >
              ✏️ Edit
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{questions.length}</p>
            <p className="text-sm text-gray-600">Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{quiz.time_limit_minutes}m</p>
            <p className="text-sm text-gray-600">Time Limit</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{quiz.passing_score}%</p>
            <p className="text-sm text-gray-600">Passing Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{quiz.total_attempts || 0}</p>
            <p className="text-sm text-gray-600">Attempts</p>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">❓ Questions</h2>

        {questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border-l-4 border-green-500 bg-gray-50 p-5 rounded-lg">
                <p className="font-semibold text-gray-800 mb-4">
                  {index + 1}. {question.question_text}
                </p>

                <div className="space-y-2 mb-4">
                  <div className={`p-3 rounded-lg ${question.correct_answer === 'A' ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'}`}>
                    <span className="font-medium">A)</span> {question.option_a}
                    {question.correct_answer === 'A' && <span className="ml-2 text-green-600 font-bold">✓ Correct</span>}
                  </div>
                  
                  <div className={`p-3 rounded-lg ${question.correct_answer === 'B' ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'}`}>
                    <span className="font-medium">B)</span> {question.option_b}
                    {question.correct_answer === 'B' && <span className="ml-2 text-green-600 font-bold">✓ Correct</span>}
                  </div>
                  
                  <div className={`p-3 rounded-lg ${question.correct_answer === 'C' ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'}`}>
                    <span className="font-medium">C)</span> {question.option_c}
                    {question.correct_answer === 'C' && <span className="ml-2 text-green-600 font-bold">✓ Correct</span>}
                  </div>
                  
                  <div className={`p-3 rounded-lg ${question.correct_answer === 'D' ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'}`}>
                    <span className="font-medium">D)</span> {question.option_d}
                    {question.correct_answer === 'D' && <span className="ml-2 text-green-600 font-bold">✓ Correct</span>}
                  </div>
                </div>

                {question.explanation && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No questions added yet</p>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <Link
          to="/quizzes"
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          ← Back to Quizzes
        </Link>
      </div>
    </div>
  );
};

export default ViewQuiz;
