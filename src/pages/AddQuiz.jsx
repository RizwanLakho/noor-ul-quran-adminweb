import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizzesAPI } from '../services/api';

const AddQuiz = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const handleAddQuestion = () => {
    if (currentQuestion.question_text && 
        currentQuestion.option_a && 
        currentQuestion.option_b && 
        currentQuestion.option_c && 
        currentQuestion.option_d) {
      
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
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

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (questions.length === 0) {
        alert('⚠️ Please add at least one question!');
        return;
      }

      const quizData = {
        title: quizInfo.title,
        description: quizInfo.description,
        category: quizInfo.category,
        difficulty: quizInfo.difficulty,
        time_limit: parseInt(quizInfo.time_limit),
        passing_score: parseInt(quizInfo.passing_score),
        questions: questions.map(q => ({
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }))
      };

      console.log('Creating quiz:', quizData);
      await quizzesAPI.create(quizData);
      alert('✅ Quiz created successfully!');
      navigate('/quizzes');
    } catch (err) {
      console.error('Error creating quiz:', err);
      alert('❌ Failed to create quiz: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'Quiz Info' },
    { id: 2, name: 'Add Questions' },
    { id: 3, name: 'Review' }
  ];

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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Quiz Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
              <input
                type="text"
                value={quizInfo.title}
                onChange={(e) => setQuizInfo({...quizInfo, title: e.target.value})}
                placeholder="e.g., Surah Al-Fatiha Quiz"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={quizInfo.description}
                onChange={(e) => setQuizInfo({...quizInfo, description: e.target.value})}
                placeholder="Brief description of the quiz"
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                required
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

        {/* Step 2: Add Questions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">❓ Add Questions</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ Add multiple choice questions. You can add as many questions as needed.
              </p>
            </div>

            {/* Add Question Form */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">New Question</h3>

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

            {/* Added Questions List */}
            {questions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ✅ Added Questions ({questions.length})
                </h3>
                <div className="space-y-3">
                  {questions.map((q, index) => (
                    <div key={q.id} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-800">
                          {index + 1}. {q.question_text}
                        </p>
                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="text-red-500 hover:text-red-700 font-medium ml-4"
                        >
                          ✕
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Review & Submit</h2>

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
                <p>Total: <strong className="text-green-600">{questions.length}</strong> questions added</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ Please review all information before submitting. You can go back to edit any section.
              </p>
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
              disabled={loading}
              className="px-8 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? '⏳ Creating...' : '✅ Create Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddQuiz;
