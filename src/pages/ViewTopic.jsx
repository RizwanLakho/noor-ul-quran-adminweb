import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ViewTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperuser } = useAuth();
  const [topic, setTopic] = useState(null);
  const [ayahs, setAyahs] = useState([]);
  const [hadith, setHadith] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopic();
  }, [id]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      const data = await topicsAPI.getById(id);
      setTopic(data.topic);
      setAyahs(data.ayahs || []);
      setHadith(data.hadith || []);
    } catch (err) {
      console.error('Error loading topic:', err);
      alert('Failed to load topic');
      navigate('/topics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading topic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{topic.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{topic.title}</h1>
              <span className="inline-block mt-2 px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-600">
                {topic.category}
              </span>
            </div>
          </div>
          
          {isSuperuser() && (
            <div className="flex gap-2">
              <Link
                to={`/topics/${id}/edit`}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
              >
                ✏️ Edit
              </Link>
            </div>
          )}
        </div>

        <p className="text-gray-600 mt-4">{topic.description}</p>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            <strong className="text-primary-600">{ayahs.length}</strong> Ayahs
          </span>
          <span className="text-sm text-gray-600">
            <strong className="text-primary-600">{hadith.length}</strong> Hadith
          </span>
        </div>
      </div>

      {/* Ayahs Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Ayahs</h2>
        
        {ayahs.length > 0 ? (
          <div className="space-y-4">
            {ayahs.map((ayah, index) => (
              <div key={ayah.id} className="border-l-4 border-primary-500 pl-4 py-2">
                <p className="font-semibold text-gray-800">
                  {index + 1}. Surah {ayah.surah_number}, Ayah {ayah.ayah_number}
                </p>
                {ayah.notes && (
                  <p className="text-sm text-gray-600 mt-1">{ayah.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No ayahs added yet</p>
        )}
      </div>

      {/* Hadith Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Hadith</h2>
        
        {hadith.length > 0 ? (
          <div className="space-y-4">
            {hadith.map((h, index) => (
              <div key={h.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-800">{index + 1}. {h.source}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {h.authenticity}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{h.hadith_text}</p>
                {h.narrator && (
                  <p className="text-sm text-gray-600">Narrator: {h.narrator}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hadith added yet</p>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <Link
          to="/topics"
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          ← Back to Topics
        </Link>
      </div>
    </div>
  );
};

export default ViewTopic;
