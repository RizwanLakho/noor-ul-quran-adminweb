import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizzesAPI } from '../services/api';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'medium',
    time_limit: 15,
    passing_score: 70
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: ''
  });

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizzesAPI.getById(id);

      setQuizInfo({
        title: data.quiz.name,
        description: data.quiz.description,
        category: data.quiz.category,
        difficulty: data.quiz.difficulty,
        time_limit: data.quiz.time_limit_minutes,
        passing_score: data.quiz.passing_score
      });

      // Remove duplicates
      const uniqueQuestions = data.questions?.reduce((acc, curr) => {
        const exists = acc.find(q => q.question_text === curr.question_text);
        if (!exists) {
          acc.push({
            id: curr.id,
            question_text: curr.question_text,
            option_a: curr.option_a,
            option_b: curr.option_b,
            option_c: curr.option_c,
            option_d: curr.option_d,
            correct_answer: curr.correct_answer,
            explanation: curr.explanation || ''
          });
        }
        return acc;
      }, []) || [];

      setQuestions(uniqueQuestions);
    } catch (err) {
      console.error('Error loading quiz:', err);
      alert('Failed to load quiz data');
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (currentQuestion.question_text && 
        currentQuestion.option_a && 
        currentQuestion.option_b && 
        currentQuestion.option_c && 
        currentQuestion.option_d) {
      
      // Check for duplicates
      const exists = questions.find(q => q.question_text === currentQuestion.question_text);
      if (exists) {
        alert('⚠️ This question already exists!');
        return;
      }

      setQuestions([...questions, { ...currentQuestion, id: `new-${Date.now()}` }]);
      setCurrentQuestion({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: ''
      });
    } else {
      alert('⚠️ Please fill all question fields!');
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (questions.length === 0) {
        alert('⚠️ Please add at least one question!');
        return;
      }

      // Remove duplicates before sending
      const uniqueQuestions = questions.reduce((acc, curr) => {
        const exists = acc.find(q => q.question_text === curr.question_text);
        if (!exists) {
          acc.push({
            question_text: curr.question_text,
            option_a: curr.option_a,
            option_b: curr.option_b,
            option_c: curr.option_c,
            option_d: curr.option_d,
            correct_answer: curr.correct_answer,
            explanation: curr.explanation || null
          });
        }
        return acc;
      }, []);

      const quizData = {
        title: quizInfo.title,
        description: quizInfo.description,
        category: quizInfo.category,
        difficulty: quizInfo.difficulty,
        time_limit: parseInt(quizInfo.time_limit),
        passing_score: parseInt(quizInfo.passing_score),
        questions: uniqueQuestions
      };

      console.log('Updating quiz:', quizData);
      await quizzesAPI.update(id, quizData);
      alert('✅ Quiz updated successfully!');
      navigate('/quizzes');
    } catch (err) {
      console.error('Error updating quiz:', err);
      alert('❌ Failed to update quiz: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: 1, name: 'Quiz Info' },
    { id: 2, name: 'Edit Questions' },
    { id: 3, name: 'Review' }
  ];

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
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.id ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">{step.name}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`} style={{ marginTop: '-20px' }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Step 1: Quiz Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✏️ Edit Quiz Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
              <input
                type="text"
                value={quizInfo.title}
                onChange={(e) => setQuizInfo({...quizInfo, title: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={quizInfo.description}
                onChange={(e) => setQuizInfo({...quizInfo, description: e.target.value})}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={quizInfo.category}
                  onChange={(e) => setQuizInfo({...quizInfo, category: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="aqeedah">Aqeedah</option>
                  <option value="fiqh">Fiqh</option>
                  <option value="seerah">Seerah</option>
                  <option value="tafsir">Tafsir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={quizInfo.difficulty}
                  onChange={(e) => setQuizInfo({...quizInfo, difficulty: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="easy">😊 Easy</option>
                  <option value="medium">🤔 Medium</option>
                  <option value="hard">🔥 Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={quizInfo.time_limit}
                  onChange={(e) => setQuizInfo({...quizInfo, time_limit: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quizInfo.passing_score}
                  onChange={(e) => setQuizInfo({...quizInfo, passing_score: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Edit Questions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">❓ Edit Questions</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ Current questions are shown below. Add new or remove existing questions.
              </p>
            </div>

            {/* Add Question Form */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Add New Question</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                <textarea
                  value={currentQuestion.question_text}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, question_text: e.target.value})}
                  placeholder="Enter your question here"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Option A *</label>
                  <input
                    type="text"
                    value={currentQuestion.option_a}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, option_a: e.target.value})}
                    placeholder="First option"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Option B *</label>
                  <input
                    type="text"
                    value={currentQuestion.option_b}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, option_b: e.target.value})}
                    placeholder="Second option"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Option C *</label>
                  <input
                    type="text"
                    value={currentQuestion.option_c}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, option_c: e.target.value})}
                    placeholder="Third option"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Option D *</label>
                  <input
                    type="text"
                    value={currentQuestion.option_d}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, option_d: e.target.value})}
                    placeholder="Fourth option"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                <select
                  value={currentQuestion.correct_answer}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, correct_answer: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                  placeholder="Explain why this is the correct answer"
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                onClick={handleAddQuestion}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                ➕ Add Question
              </button>
            </div>

            {/* Existing Questions */}
            {questions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Current Questions ({questions.length})
                </h3>
                <div className="space-y-3">
                  {questions.map((q, index) => (
                    <div key={q.id} className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-800">
                          {index + 1}. {q.question_text}
                        </p>
                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="text-red-500 hover:text-red-700 font-medium ml-4"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>A: {q.option_a}</p>
                        <p>B: {q.option_b}</p>
                        <p>C: {q.option_c}</p>
                        <p>D: {q.option_d}</p>
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        ✓ Correct: Option {q.correct_answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Review Changes</h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📝 Quiz Information</h3>
                <p><strong>Title:</strong> {quizInfo.title}</p>
                <p><strong>Description:</strong> {quizInfo.description}</p>
                <p><strong>Category:</strong> {quizInfo.category}</p>
                <p><strong>Difficulty:</strong> {quizInfo.difficulty}</p>
                <p><strong>Time Limit:</strong> {quizInfo.time_limit} minutes</p>
                <p><strong>Passing Score:</strong> {quizInfo.passing_score}%</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">❓ Questions</h3>
                <p>Total: <strong className="text-green-600">{questions.length}</strong> questions</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={() => {
              if (currentStep > 1) setCurrentStep(currentStep - 1);
              else navigate('/quizzes');
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            {currentStep === 1 ? '← Cancel' : '← Back'}
          </button>

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-8 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
            >
              {saving ? '⏳ Saving...' : '✅ Update Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;
