import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translationsAPI } from '../services/api';

const UploadTranslation = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    translator_name: '',
    language: 'en',
    file: null
  });
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.translator_name.trim()) {
      alert('⚠️ Please enter translation name');
      return;
    }

    if (!formData.file) {
      alert('⚠️ Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setProgress('Checking if translation exists...');

      // Check if exists
      const checkData = await translationsAPI.checkExists(
        formData.translator_name, 
        formData.language
      );

      if (checkData.exists) {
        alert(`⚠️ Translation "${formData.translator_name}" in ${formData.language.toUpperCase()} already exists!\n\nPlease use a different name or delete the existing one first.`);
        setUploading(false);
        setProgress('');
        return;
      }

      setProgress('Uploading file...');

      const data = new FormData();
      data.append('file', formData.file);
      data.append('translator_name', formData.translator_name);
      data.append('language', formData.language);

      const result = await translationsAPI.upload(data);

      setProgress('Upload complete!');
      alert(`✅ Translation uploaded successfully!\n\n${result.inserted} ayahs added.`);
      navigate('/translations');
    } catch (err) {
      console.error('Error uploading translation:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Upload failed';
      alert('❌ ' + errorMsg);
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📤 Upload Translation</h1>
          <p className="text-gray-600">Upload a complete Quran translation text file</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">📋 File Format Requirements:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>6236 lines</strong> - One ayah per line</li>
            <li>• <strong>Plain text file (.txt)</strong></li>
            <li>• <strong>UTF-8 encoding</strong></li>
            <li>• Lines should be in order: Surah 1 Ayah 1 to Surah 114 Ayah 6</li>
            <li>• Each line = translation of one ayah</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Translation Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Translation Name * 
              <span className="text-gray-500 text-xs ml-2">(e.g., "Ahmed Ali", "Sahih International")</span>
            </label>
            <input
              type="text"
              value={formData.translator_name}
              onChange={(e) => setFormData({ ...formData, translator_name: e.target.value })}
              placeholder="Enter unique translation name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              required
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This name should be unique. Examples: "Pickthall", "Yusuf Ali", "Fateh Muhammad Jalandhari"
            </p>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              required
              disabled={uploading}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Translation File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                {fileName ? (
                  <div>
                    <p className="text-green-600 font-semibold mb-2">✅ {fileName}</p>
                    <p className="text-sm text-gray-500">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-gray-700 font-medium mb-1">Click to select file</p>
                    <p className="text-sm text-gray-500">Only .txt files (max 10MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-center">
                {uploading && <span className="inline-block animate-spin mr-2">⏳</span>}
                {progress}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/translations')}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !formData.file || !formData.translator_name}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '⏳ Uploading...' : '📤 Upload Translation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadTranslation;
