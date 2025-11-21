import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Topics
import Topics from './pages/Topics';
import AddTopic from './pages/AddTopic';
import EditTopic from './pages/EditTopic';
import ViewTopic from './pages/ViewTopic';

// Quizzes
import Quizzes from './pages/Quizzes';
import AddQuiz from './pages/AddQuiz';
import EditQuiz from './pages/EditQuiz';
import ViewQuiz from './pages/ViewQuiz';

// Translations
import Translations from './pages/Translations';
import UploadTranslation from './pages/UploadTranslation';
import ViewTranslation from './pages/ViewTranslation';

// Users
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Topics Routes */}
            <Route path="topics" element={<Topics />} />
            <Route path="topics/create" element={<AddTopic />} />
            <Route path="topics/:id" element={<ViewTopic />} />
            <Route path="topics/:id/edit" element={<EditTopic />} />
            
            {/* Quizzes Routes */}
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="quizzes/create" element={<AddQuiz />} />
            <Route path="quizzes/:id" element={<ViewQuiz />} />
            <Route path="quizzes/:id/edit" element={<EditQuiz />} />
            
            {/* Translations Routes */}
            <Route path="translations" element={<Translations />} />
            <Route path="translations/upload" element={<UploadTranslation />} />
            <Route path="translations/:translator/:language" element={<ViewTranslation />} />
            
            {/* Users Routes */}
            <Route path="users" element={<Users />} />
            <Route path="users/:userId" element={<UserDetail />} />
            
            {/* Placeholder routes */}
            <Route path="surahs" element={<div className="p-10"><h1 className="text-3xl font-bold">📖 Surahs</h1><p>Coming soon...</p></div>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
