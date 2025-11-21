import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { translationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Translations = () => {
  const { isSuperuser } = useAuth();
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, translation: null });

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      setLoading(true);
      const data = await translationsAPI.getAll();
      setTranslations(data.translations || []);
    } catch (err) {
      console.error('Error loading translations:', err);
      setError('Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (translator, language) => {
    try {
      await translationsAPI.delete(translator, language);
      setTranslations(translations.filter(t => 
        !(t.translator === translator && t.language === language)
      ));
      setDeleteModal({ show: false, translation: null });
      alert('✅ Translation deleted successfully!');
    } catch (err) {
      console.error('Error deleting translation:', err);
      alert('❌ Failed to delete translation: ' + (err.response?.data?.error || err.message));
    }
  };

  const getLanguageFlag = (lang) => {
    const flags = {
      'en': '🇬🇧', 'ur': '🇵🇰', 'ar': '🇸🇦', 'tr': '🇹🇷',
      'fr': '🇫🇷', 'de': '🇩🇪', 'es': '🇪🇸', 'id': '🇮🇩', 'bn': '🇧🇩'
    };
    return flags[lang] || '🌐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌐 Translations Management</h1>
          <p className="text-gray-600">Manage Quran translations in different languages</p>
        </div>
        {isSuperuser() && (
          <Link
            to="/translations/upload"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="text-xl">📤</span>
            Upload Translation
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          ℹ️ Upload complete Quran translations as text files (6236 lines, one ayah per line). 
          The system will automatically map them to the Quran structure.
        </p>
      </div>

      {/* Translations Grid */}
      {translations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {translations.map((translation) => (
            <div
              key={`${translation.translator}-${translation.language}`}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-green-500"
            >
              {/* Translation Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{getLanguageFlag(translation.language)}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 uppercase">
                      {translation.language}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{translation.translator}</h3>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="font-semibold text-green-600">{translation.total_ayahs}</p>
                  <p className="text-xs">Ayahs</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    Added: {new Date(translation.added_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/translations/${encodeURIComponent(translation.translator)}/${translation.language}`}
                  className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  👁️ View
                </Link>
                {isSuperuser() && (
                  <button
                    onClick={() => setDeleteModal({ show: true, translation })}
                    className="flex-1 text-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Translations Yet</h3>
          <p className="text-gray-600 mb-6">Upload your first translation to get started</p>
          {isSuperuser() && (
            <Link
              to="/translations/upload"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              📤 Upload First Translation
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Delete Translation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteModal.translation?.translator}</strong> ({deleteModal.translation?.language})? 
              This will delete <strong>{deleteModal.translation?.total_ayahs} ayahs</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, translation: null })}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.translation.translator, deleteModal.translation.language)}
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

export default Translations;
