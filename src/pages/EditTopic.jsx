import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quranAPI, topicsAPI } from "../services/api";

const EditTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [topicData, surahsData] = await Promise.all([
        topicsAPI.getById(id),
        quranAPI.getAllSurahs(),
      ]);

      setTopicInfo({
        title: topicData.topic.title,
        description: topicData.topic.description,
        category: topicData.topic.category,
        icon: topicData.topic.icon || "📖",
        color: topicData.topic.color || "#10B981",
      });

      // Remove duplicates using unique ID
      const uniqueAyahs =
        topicData.ayahs?.reduce((acc, curr) => {
          const key = `${curr.surah_number}-${curr.ayah_number}`;
          if (!acc.find((a) => `${a.surah_number}-${a.ayah_number}` === key)) {
            acc.push({
              id: curr.id,
              surah_number: curr.surah_number,
              ayah_number: curr.ayah_number,
              notes: curr.notes || "",
            });
          }
          return acc;
        }, []) || [];

      setAyahs(uniqueAyahs);

      setHadith(
        topicData.hadith?.map((h) => ({
          id: h.id,
          text: h.hadith_text,
          source: h.source,
          narrator: h.narrator || "",
          authenticity: h.authenticity || "Sahih",
        })) || [],
      );

      setSurahs(surahsData.surahs || []);
    } catch (err) {
      console.error("Error loading topic:", err);
      alert("Failed to load topic data");
      navigate("/topics");
    } finally {
      setLoading(false);
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
        ayah_text: data.ayah?.text || "",
      });
    } catch (err) {
      console.error("Error loading ayah:", err);
    }
  };

  const handleAddAyah = () => {
    if (currentAyah.surah_number && currentAyah.ayah_number) {
      // Check if ayah already exists
      const exists = ayahs.find(
        (a) =>
          parseInt(a.surah_number) === parseInt(currentAyah.surah_number) &&
          parseInt(a.ayah_number) === parseInt(currentAyah.ayah_number),
      );

      if (exists) {
        alert("⚠️ This ayah is already added to the topic!");
        return;
      }

      const selectedSurah = surahs.find(
        (s) => s.surah_number === parseInt(currentAyah.surah_number),
      );

      setAyahs([
        ...ayahs,
        {
          id: `new-${Date.now()}`,
          surah_number: currentAyah.surah_number,
          ayah_number: currentAyah.ayah_number,
          notes: currentAyah.notes,
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

  const handleRemoveAyah = (ayahId) => {
    setAyahs(ayahs.filter((a) => a.id !== ayahId));
  };

  const handleAddHadith = () => {
    if (currentHadith.text && currentHadith.source) {
      setHadith([...hadith, { ...currentHadith, id: `new-${Date.now()}` }]);
      setCurrentHadith({
        text: "",
        source: "",
        narrator: "",
        authenticity: "Sahih",
      });
    }
  };

  const handleRemoveHadith = (hadithId) => {
    setHadith(hadith.filter((h) => h.id !== hadithId));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Remove duplicates before sending
      const uniqueAyahs = ayahs.reduce((acc, curr) => {
        const key = `${curr.surah_number}-${curr.ayah_number}`;
        if (!acc.find((a) => `${a.surah_number}-${a.ayah_number}` === key)) {
          acc.push({
            sura: parseInt(curr.surah_number),
            aya: parseInt(curr.ayah_number),
            notes: curr.notes || null,
          });
        }
        return acc;
      }, []);

      const topicData = {
        ...topicInfo,
        ayahs: uniqueAyahs,
        hadith: hadith.map((h) => ({
          hadith_text: h.text,
          source: h.source,
          narrator: h.narrator,
          authenticity: h.authenticity,
        })),
      };

      console.log("Updating topic with data:", topicData);
      await topicsAPI.update(id, topicData);
      alert("✅ Topic updated successfully!");
      navigate("/topics");
    } catch (err) {
      console.error("Error updating topic:", err);
      alert(
        "❌ Failed to update topic: " +
          (err.response?.data?.error || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: 1, name: "Topic Info" },
    { id: 2, name: "Edit Ayahs" },
    { id: 3, name: "Edit Hadith" },
    { id: 4, name: "Review" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading topic...</p>
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
              ✏️ Edit Topic Information
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
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
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
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

        {/* Step 2: Edit Ayahs */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📝 Edit Ayahs
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ Current ayahs are shown below. Add new or remove existing
                ayahs.
              </p>
            </div>

            {/* Add New Ayah Form */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Add New Ayah</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Select Surah *
                </label>
                <select
                  value={currentAyah.surah_number}
                  onChange={(e) => handleSurahChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none mb-4"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none disabled:bg-gray-100 mb-4"
                >
                  <option value="">
                    {!currentAyah.surah_number
                      ? "First select a Surah"
                      : loadingAyahs
                        ? "Loading..."
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
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-right text-xl leading-loose">
                    {currentAyah.ayah_text}
                  </p>
                </div>
              )}

              <input
                type="text"
                value={currentAyah.notes}
                onChange={(e) =>
                  setCurrentAyah({ ...currentAyah, notes: e.target.value })
                }
                placeholder="Add notes (optional)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none mb-4"
              />

              <button
                onClick={handleAddAyah}
                disabled={!currentAyah.surah_number || !currentAyah.ayah_number}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
              >
                ➕ Add Ayah
              </button>
            </div>

            {/* Existing Ayahs */}
            {ayahs.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Current Ayahs ({ayahs.length})
                </h3>
                <div className="space-y-3">
                  {ayahs.map((ayah, index) => (
                    <div
                      key={`${ayah.surah_number}-${ayah.ayah_number}`}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {index + 1}. Surah {ayah.surah_number}, Ayah{" "}
                          {ayah.ayah_number}
                        </p>
                        {ayah.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            {ayah.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveAyah(ayah.id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Edit Hadith */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📚 Edit Hadith
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ Manage hadith references for this topic.
              </p>
            </div>

            {/* Add New Hadith Form */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">
                Add New Hadith
              </h3>

              <textarea
                value={currentHadith.text}
                onChange={(e) =>
                  setCurrentHadith({ ...currentHadith, text: e.target.value })
                }
                placeholder="Hadith text"
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none mb-4"
              ></textarea>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={currentHadith.source}
                  onChange={(e) =>
                    setCurrentHadith({
                      ...currentHadith,
                      source: e.target.value,
                    })
                  }
                  placeholder="Source (e.g., Sahih Bukhari 1234)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />

                <input
                  type="text"
                  value={currentHadith.narrator}
                  onChange={(e) =>
                    setCurrentHadith({
                      ...currentHadith,
                      narrator: e.target.value,
                    })
                  }
                  placeholder="Narrator (optional)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <select
                value={currentHadith.authenticity}
                onChange={(e) =>
                  setCurrentHadith({
                    ...currentHadith,
                    authenticity: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none mb-4"
              >
                <option value="Sahih">Sahih</option>
                <option value="Hasan">Hasan</option>
                <option value="Daif">Daif</option>
              </select>

              <button
                onClick={handleAddHadith}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                ➕ Add Hadith
              </button>
            </div>

            {/* Existing Hadith */}
            {hadith.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Current Hadith ({hadith.length})
                </h3>
                <div className="space-y-3">
                  {hadith.map((h) => (
                    <div
                      key={h.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-800">{h.source}</p>
                        <button
                          onClick={() => handleRemoveHadith(h.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          ✕ Remove
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
              ✅ Review Changes
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Topic Information
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
                <h3 className="font-semibold text-gray-800 mb-2">Ayahs</h3>
                <p>
                  Total:{" "}
                  <strong className="text-green-600">{ayahs.length}</strong>{" "}
                  ayahs
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Hadith</h3>
                <p>
                  Total:{" "}
                  <strong className="text-green-600">{hadith.length}</strong>{" "}
                  hadith
                </p>
              </div>
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
              disabled={saving}
              className="px-8 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
            >
              {saving ? "⏳ Saving..." : "✅ Update Topic"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTopic;
