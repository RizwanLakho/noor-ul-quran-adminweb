import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quranAPI, topicsAPI } from "../services/api";

const AddTopic = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [surahs, setSurahs] = useState([]);
  const [selectedSurahAyahs, setSelectedSurahAyahs] = useState([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);

  const [topicInfo, setTopicInfo] = useState({
    title: "",
    description: "",
    category: "spirituality",
    icon: "📖",
    color: "#10B981",
  });

  const [ayahs, setAyahs] = useState([]);
  const [hadith, setHadith] = useState([]);

  const [currentAyah, setCurrentAyah] = useState({
    surah_number: "",
    ayah_number: "",
    ayah_text: "",
    notes: "",
  });

  const [currentHadith, setCurrentHadith] = useState({
    text: "",
    source: "",
    narrator: "",
    authenticity: "Sahih",
  });

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      const data = await quranAPI.getAllSurahs();
      setSurahs(data.surahs || []);
    } catch (err) {
      console.error("Error loading surahs:", err);
    }
  };

  const handleSurahChange = async (surahNumber) => {
    setCurrentAyah({
      ...currentAyah,
      surah_number: surahNumber,
      ayah_number: "",
      ayah_text: "",
    });

    if (!surahNumber) {
      setSelectedSurahAyahs([]);
      return;
    }

    try {
      setLoadingAyahs(true);
      const selectedSurah = surahs.find(
        (s) => s.surah_number === parseInt(surahNumber),
      );

      if (selectedSurah) {
        // Create array of ayah numbers based on total_ayahs
        const ayahNumbers = Array.from(
          { length: selectedSurah.total_ayahs },
          (_, i) => i + 1,
        );
        setSelectedSurahAyahs(ayahNumbers);
      }
    } catch (err) {
      console.error("Error loading ayahs:", err);
    } finally {
      setLoadingAyahs(false);
    }
  };

  const handleAyahChange = async (ayahNumber) => {
    setCurrentAyah({ ...currentAyah, ayah_number: ayahNumber, ayah_text: "" });

    if (!ayahNumber || !currentAyah.surah_number) return;

    try {
      const data = await quranAPI.getAyah(currentAyah.surah_number, ayahNumber);
      setCurrentAyah({
        ...currentAyah,
        ayah_number: ayahNumber,
        ayah_text: data.ayah?.ayah_arabic || "",
      });
    } catch (err) {
      console.error("Error loading ayah:", err);
    }
  };

  const handleAddAyah = () => {
    if (currentAyah.surah_number && currentAyah.ayah_number) {
      const selectedSurah = surahs.find(
        (s) => s.surah_number === parseInt(currentAyah.surah_number),
      );

      setAyahs([
        ...ayahs,
        {
          ...currentAyah,
          id: Date.now(),
          surah_name: selectedSurah?.surah_name_english || "",
        },
      ]);

      setCurrentAyah({
        surah_number: "",
        ayah_number: "",
        ayah_text: "",
        notes: "",
      });
      setSelectedSurahAyahs([]);
    }
  };

  const handleRemoveAyah = (id) => {
    setAyahs(ayahs.filter((a) => a.id !== id));
  };

  const handleAddHadith = () => {
    if (currentHadith.text && currentHadith.source) {
      setHadith([...hadith, { ...currentHadith, id: Date.now() }]);
      setCurrentHadith({
        text: "",
        source: "",
        narrator: "",
        authenticity: "Sahih",
      });
    }
  };

  const handleRemoveHadith = (id) => {
    setHadith(hadith.filter((h) => h.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const topicData = {
        ...topicInfo,
        ayahs: ayahs.map((a) => ({
          sura: parseInt(a.surah_number),
          aya: parseInt(a.ayah_number),
          notes: a.notes,
        })),
        hadith: hadith.map((h) => ({
          hadith_text: h.text,
          source: h.source,
          narrator: h.narrator,
          authenticity: h.authenticity,
        })),
      };

      console.log("Creating topic:", topicData);
      await topicsAPI.create(topicData);
      alert("✅ Topic created successfully!");
      navigate("/topics");
    } catch (err) {
      console.error("Error creating topic:", err);
      alert(
        "❌ Failed to create topic: " +
          (err.response?.data?.error || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Topic Info" },
    { id: 2, name: "Add Ayahs" },
    { id: 3, name: "Add Hadith" },
    { id: 4, name: "Review" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 ${
                    currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                  }`}
                  style={{ marginTop: "-20px" }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Step 1: Topic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📝 Topic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Name *
              </label>
              <input
                type="text"
                value={topicInfo.title}
                onChange={(e) =>
                  setTopicInfo({ ...topicInfo, title: e.target.value })
                }
                placeholder="e.g., Patience in Islam"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={topicInfo.description}
                onChange={(e) =>
                  setTopicInfo({ ...topicInfo, description: e.target.value })
                }
                placeholder="Brief description of the topic"
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={topicInfo.category}
                  onChange={(e) =>
                    setTopicInfo({ ...topicInfo, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="spirituality">Spirituality</option>
                  <option value="worship">Worship</option>
                  <option value="morality">Morality</option>
                  <option value="history">History</option>
                  <option value="knowledge">Knowledge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  value={topicInfo.icon}
                  onChange={(e) =>
                    setTopicInfo({ ...topicInfo, icon: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="📖">📖 Book</option>
                  <option value="🕌">🕌 Mosque</option>
                  <option value="💚">💚 Heart</option>
                  <option value="⭐">⭐ Star</option>
                  <option value="🌙">🌙 Moon</option>
                  <option value="☪️">☪️ Star and Crescent</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Add Ayahs */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📝 Add Ayahs
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ First select Surah, then select specific Ayah from dropdown.
                You can add multiple Ayahs.
              </p>
            </div>

            {/* Add Ayah Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Select Surah *
                </label>
                <select
                  value={currentAyah.surah_number}
                  onChange={(e) => handleSurahChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="">Choose Surah...</option>
                  {surahs.map((surah) => (
                    <option key={surah.surah_number} value={surah.surah_number}>
                      {surah.surah_number}. {surah.surah_name_english} (
                      {surah.total_ayahs} ayahs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Select Ayah *
                </label>
                <select
                  value={currentAyah.ayah_number}
                  onChange={(e) => handleAyahChange(e.target.value)}
                  disabled={!currentAyah.surah_number || loadingAyahs}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!currentAyah.surah_number
                      ? "First select a Surah"
                      : loadingAyahs
                        ? "Loading ayahs..."
                        : "Choose Ayah number..."}
                  </option>
                  {selectedSurahAyahs.map((ayahNum) => (
                    <option key={ayahNum} value={ayahNum}>
                      Ayah {ayahNum}
                    </option>
                  ))}
                </select>
              </div>

              {currentAyah.ayah_text && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p
                    className="text-right text-xl leading-loose"
                    style={{ fontFamily: "Arial" }}
                  >
                    {currentAyah.ayah_text}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Add Notes (Optional)
                </label>
                <input
                  type="text"
                  value={currentAyah.notes}
                  onChange={(e) =>
                    setCurrentAyah({ ...currentAyah, notes: e.target.value })
                  }
                  placeholder="Add context or explanation about this ayah"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleAddAyah}
                disabled={!currentAyah.surah_number || !currentAyah.ayah_number}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➕ Add Ayah to Topic
              </button>
            </div>

            {/* Added Ayahs List */}
            {ayahs.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ✅ Added Ayahs ({ayahs.length})
                </h3>
                <div className="space-y-3">
                  {ayahs.map((ayah, index) => (
                    <div
                      key={ayah.id}
                      className="flex items-start justify-between bg-green-50 border border-green-200 p-4 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {index + 1}. Surah {ayah.surah_number} (
                          {ayah.surah_name}), Ayah {ayah.ayah_number}
                        </p>
                        {ayah.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            📝 {ayah.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveAyah(ayah.id)}
                        className="ml-4 text-red-500 hover:text-red-700 font-medium"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Add Hadith */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📚 Add Hadith (Optional)
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ Add relevant Hadith to support this topic. You can skip this
                step if not needed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hadith Text
              </label>
              <textarea
                value={currentHadith.text}
                onChange={(e) =>
                  setCurrentHadith({ ...currentHadith, text: e.target.value })
                }
                placeholder="Enter the hadith text"
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={currentHadith.source}
                  onChange={(e) =>
                    setCurrentHadith({
                      ...currentHadith,
                      source: e.target.value,
                    })
                  }
                  placeholder="e.g., Sahih Bukhari 1234"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Narrator
                </label>
                <input
                  type="text"
                  value={currentHadith.narrator}
                  onChange={(e) =>
                    setCurrentHadith({
                      ...currentHadith,
                      narrator: e.target.value,
                    })
                  }
                  placeholder="e.g., Abu Hurairah"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authenticity
              </label>
              <select
                value={currentHadith.authenticity}
                onChange={(e) =>
                  setCurrentHadith({
                    ...currentHadith,
                    authenticity: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="Sahih">Sahih</option>
                <option value="Hasan">Hasan</option>
                <option value="Daif">Daif</option>
              </select>
            </div>

            <button
              onClick={handleAddHadith}
              disabled={!currentHadith.text || !currentHadith.source}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Add Hadith to Topic
            </button>

            {/* Added Hadith List */}
            {hadith.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ✅ Added Hadith ({hadith.length})
                </h3>
                <div className="space-y-3">
                  {hadith.map((h, index) => (
                    <div
                      key={h.id}
                      className="bg-green-50 border border-green-200 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-800">
                          {index + 1}. {h.source}
                        </p>
                        <button
                          onClick={() => handleRemoveHadith(h.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {h.text.substring(0, 150)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ✅ Review & Submit
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  📝 Topic Information
                </h3>
                <p>
                  <strong>Title:</strong> {topicInfo.title}
                </p>
                <p>
                  <strong>Description:</strong> {topicInfo.description}
                </p>
                <p>
                  <strong>Category:</strong> {topicInfo.category}
                </p>
                <p>
                  <strong>Icon:</strong> {topicInfo.icon}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📖 Ayahs</h3>
                <p>
                  Total:{" "}
                  <strong className="text-green-600">{ayahs.length}</strong>{" "}
                  ayahs added
                </p>
                {ayahs.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {ayahs.map((a, i) => (
                      <li key={a.id} className="text-sm text-gray-600">
                        {i + 1}. Surah {a.surah_number}, Ayah {a.ayah_number}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📚 Hadith</h3>
                <p>
                  Total:{" "}
                  <strong className="text-green-600">{hadith.length}</strong>{" "}
                  hadith added
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ Please review all information before submitting. You can go
                back to edit any section.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={() => {
              if (currentStep > 1) setCurrentStep(currentStep - 1);
              else navigate("/topics");
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            {currentStep === 1 ? "← Cancel" : "← Back"}
          </button>

          {currentStep < 4 ? (
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
              className="px-8 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Creating..." : "✅ Create Topic"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTopic;
