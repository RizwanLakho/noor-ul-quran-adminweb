import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Dashboard = () => {
  const { user, isSuperuser } = useAuth();
  const [stats, setStats] = useState({
    surahs: 0,
    totalAyahs: 0,
    topics: 0,
    quizzes: 0,
  });
  const [recentTopics, setRecentTopics] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for token to be available
    const token = localStorage.getItem("token");
    if (token) {
      loadDashboardData();
    } else {
      // If no token, try again after a short delay
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      // Create axios instance with token
      const api = axios.create({
        baseURL: API_URL,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log(
        "🔄 Loading dashboard with token:",
        token ? "Present" : "Missing",
      );

      // Load data
      const [surahsRes, topicsRes, quizzesRes] = await Promise.allSettled([
        api.get("/api/quran/surahs"),
        api.get("/api/topics"),
        api.get("/api/quizzes"),
      ]);

      console.log("📊 API Responses:", {
        surahs: surahsRes.status,
        topics: topicsRes.status,
        quizzes: quizzesRes.status,
      });

      const surahsData =
        surahsRes.status === "fulfilled"
          ? surahsRes.value.data
          : { total_surahs: 0 };
      const topicsData =
        topicsRes.status === "fulfilled"
          ? topicsRes.value.data
          : { total: 0, topics: [] };
      const quizzesData =
        quizzesRes.status === "fulfilled"
          ? quizzesRes.value.data
          : { total: 0, quizzes: [] };

      setStats({
        surahs: surahsData.total_surahs || 0,
        totalAyahs: 6236,
        topics: topicsData.total || 0,
        quizzes: quizzesData.total || 0,
      });

      setRecentTopics(topicsData.topics?.slice(0, 3) || []);
      setRecentQuizzes(quizzesData.quizzes?.slice(0, 3) || []);
    } catch (err) {
      console.error("❌ Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: "📖",
      label: "Total Surahs",
      value: stats.surahs,
      color: "blue",
      link: "/surahs",
    },
    {
      icon: "📝",
      label: "Total Ayahs",
      value: stats.totalAyahs,
      color: "indigo",
      link: "/surahs",
    },
    {
      icon: "📚",
      label: "Topics",
      value: stats.topics,
      color: "green",
      link: "/topics",
    },
    {
      icon: "❓",
      label: "Quizzes",
      value: stats.quizzes,
      color: "purple",
      link: "/quizzes",
    },
  ];

  const quickActions = [
    { icon: "🌐", title: "Add Translation", link: "/translations" },
    { icon: "📚", title: "Create Topic", link: "/topics" },
    { icon: "❓", title: "Create Quiz", link: "/quizzes" },
    { icon: "👥", title: "Manage Users", link: "/users" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📊 Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back,{" "}
          <span className="font-semibold">
            {user?.full_name || user?.username}
          </span>
          !
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border-l-4 border-${stat.color}-500`}
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{stat.icon}</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stat.value.toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📚 Recent Topics
          </h2>
          {recentTopics.length > 0 ? (
            <div className="space-y-3">
              {recentTopics.map((topic) => (
                <div key={topic.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800">{topic.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {topic.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No topics yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ❓ Recent Quizzes
          </h2>
          {recentQuizzes.length > 0 ? (
            <div className="space-y-3">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800">{quiz.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {quiz.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No quizzes yet</p>
          )}
        </div>
      </div>

      {isSuperuser() && (
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">
            🔐 Superuser Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white/10 hover:bg-white/20 p-6 rounded-xl transition-all"
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <div className="font-semibold text-lg">{action.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
