import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { translationsAPI } from "../services/api";

const ViewTranslation = () => {
  const { translator, language } = useParams();
  const navigate = useNavigate();
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [filteredAyahs, setFilteredAyahs] = useState([]);

  // Surah names for dropdown
  const surahNames = [
    "Al-Fatihah",
    "Al-Baqarah",
    "Aali Imran",
    "An-Nisa",
    "Al-Ma'idah",
    "Al-An'am",
    "Al-A'raf",
    "Al-Anfal",
    "At-Tawbah",
    "Yunus",
    "Hud",
    "Yusuf",
    "Ar-Ra'd",
    "Ibrahim",
    "Al-Hijr",
    "An-Nahl",
    "Al-Isra",
    "Al-Kahf",
    "Maryam",
    "Ta-Ha",
    "Al-Anbiya",
    "Al-Hajj",
    "Al-Mu'minun",
    "An-Nur",
    "Al-Furqan",
    "Ash-Shu'ara",
    "An-Naml",
    "Al-Qasas",
    "Al-Ankabut",
    "Ar-Rum",
    "Luqman",
    "As-Sajdah",
    "Al-Ahzab",
    "Saba",
    "Fatir",
    "Ya-Sin",
    "As-Saffat",
    "Sad",
    "Az-Zumar",
    "Ghafir",
    "Fussilat",
    "Ash-Shura",
    "Az-Zukhruf",
    "Ad-Dukhan",
    "Al-Jathiyah",
    "Al-Ahqaf",
    "Muhammad",
    "Al-Fath",
    "Al-Hujurat",
    "Qaf",
    "Adh-Dhariyat",
    "At-Tur",
    "An-Najm",
    "Al-Qamar",
    "Ar-Rahman",
    "Al-Waqi'ah",
    "Al-Hadid",
    "Al-Mujadila",
    "Al-Hashr",
    "Al-Mumtahanah",
    "As-Saff",
    "Al-Jumu'ah",
    "Al-Munafiqun",
    "At-Taghabun",
    "At-Talaq",
    "At-Tahrim",
    "Al-Mulk",
    "Al-Qalam",
    "Al-Haqqah",
    "Al-Ma'arij",
    "Nuh",
    "Al-Jinn",
    "Al-Muzzammil",
    "Al-Muddaththir",
    "Al-Qiyamah",
    "Al-Insan",
    "Al-Mursalat",
    "An-Naba",
    "An-Nazi'at",
    "Abasa",
    "At-Takwir",
    "Al-Infitar",
    "Al-Mutaffifin",
    "Al-Inshiqaq",
    "Al-Buruj",
    "At-Tariq",
    "Al-A'la",
    "Al-Ghashiyah",
    "Al-Fajr",
    "Al-Balad",
    "Ash-Shams",
    "Al-Layl",
    "Ad-Duhaa",
    "Ash-Sharh",
    "At-Tin",
    "Al-Alaq",
    "Al-Qadr",
    "Al-Bayyinah",
    "Az-Zalzalah",
    "Al-'Adiyat",
    "Al-Qari'ah",
    "At-Takathur",
    "Al-Asr",
    "Al-Humazah",
    "Al-Fil",
    "Quraysh",
    "Al-Ma'un",
    "Al-Kawthar",
    "Al-Kafirun",
    "An-Nasr",
    "Al-Masad",
    "Al-Ikhlas",
    "Al-Falaq",
    "An-Nas",
  ];
  useEffect(() => {
    loadTranslation();
  }, [translator, language]);

  useEffect(() => {
    if (ayahs.length > 0) {
      const filtered = ayahs.filter((ayah) => ayah.sura === selectedSurah);
      setFilteredAyahs(filtered);
    }
  }, [selectedSurah, ayahs]);

  const loadTranslation = async () => {
    try {
      setLoading(true);
      const data = await translationsAPI.getByName(
        decodeURIComponent(translator),
        language,
      );
      setAyahs(data.ayahs || []);

      if (data.ayahs && data.ayahs.length > 0) {
        setSelectedSurah(data.ayahs[0].sura);
      }
    } catch (err) {
      console.error("Error loading translation:", err);
      alert("Failed to load translation");
      navigate("/translations");
    } finally {
      setLoading(false);
    }
  };

  const getLanguageFlag = (lang) => {
    const flags = {
      en: "🇬🇧",
      ur: "🇵🇰",
      ar: "🇸🇦",
      tr: "🇹🇷",
      fr: "🇫🇷",
      de: "🇩🇪",
      es: "🇪🇸",
      id: "🇮🇩",
      bn: "🇧🇩",
    };
    return flags[lang] || "🌐";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading translation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getLanguageFlag(language)}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {decodeURIComponent(translator)}
              </h1>
              <p className="text-gray-600 mt-1">
                {language.toUpperCase()} Translation • {ayahs.length} Ayahs
              </p>
            </div>
          </div>
        </div>

        {/* Surah Selector */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Surah:
          </label>
          <select
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
          >
            {surahNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}. {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ayahs Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Surah {selectedSurah}: {surahNames[selectedSurah - 1]}
        </h2>

        {filteredAyahs.length > 0 ? (
          <div className="space-y-4">
            {filteredAyahs.map((ayah) => (
              <div
                key={ayah.id}
                className="border-l-4 border-green-500 bg-gray-50 p-5 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full font-bold">
                      {ayah.aya}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {ayah.text}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Surah {ayah.sura}, Ayah {ayah.aya}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No ayahs found for this surah
          </p>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-center mt-6">
        <Link
          to="/translations"
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          ← Back to Translations
        </Link>
      </div>
    </div>
  );
};

export default ViewTranslation;
