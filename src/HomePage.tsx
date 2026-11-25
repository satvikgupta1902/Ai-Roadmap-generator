import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateRoadmapAI } from "./lib/ai";
import { databases } from "./lib/appwrite";
import { ID } from "appwrite";
import { FaCheck, FaStar } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import { HiLightningBolt } from "react-icons/hi";
import { IoReorderFour, IoSparkles } from "react-icons/io5";

const HomePage = () => {
  const navigate = useNavigate();

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleGenerate = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setStatusMessage("Generating your custom roadmap with AI...");

    try {
      console.log("Generating roadmap for:", trimmed);

      const { roadmap: result, modelUsed } = await generateRoadmapAI(trimmed);
      console.log("Roadmap successfully generated using:", modelUsed);

      const documentData: Record<string, string> = {
        prompt: trimmed,
        data: JSON.stringify(result),
      };

      let roadmapId = "";

      if (
        import.meta.env.VITE_APPWRITE_PROJECT_ID &&
        import.meta.env.VITE_APPWRITE_ENDPOINT
      ) {
        try {
          const response = await databases.createDocument(
            "6874d2200030c6ec9e6f",
            "6874d24a0021ae17ca60",
            ID.unique(),
            documentData
          );
          roadmapId = response.$id;
        } catch (dbError) {
          console.warn("Appwrite document creation skipped or failed:", dbError);
        }
      }

      if (!roadmapId) {
        roadmapId = "roadmap_" + Date.now();
      }

      // Save locally to ensure roadmap is always available
      const localRoadmap = {
        $id: roadmapId,
        prompt: trimmed,
        data: JSON.stringify(result),
        $createdAt: new Date().toISOString(),
        modelUsed,
      };

      try {
        const savedRoadmaps = JSON.parse(
          localStorage.getItem("saved_roadmaps") || "[]"
        );
        savedRoadmaps.unshift(localRoadmap);
        localStorage.setItem("saved_roadmaps", JSON.stringify(savedRoadmaps));
        localStorage.setItem(`roadmap_${roadmapId}`, JSON.stringify(localRoadmap));
      } catch (storageError) {
        console.error("Failed to save roadmap to localStorage:", storageError);
      }

      navigate(`/roadmap/${roadmapId}`);
    } catch (error) {
      console.error("Error in handleGenerate:", error);
      // Fallback navigation with timestamp ID
      const fallbackId = "roadmap_" + Date.now();
      navigate(`/roadmap/${fallbackId}`);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col bg-grid-blueprint-light radial-ambient-blue-light selection:bg-blue-600 selection:text-white">
      {/* Crisp White Header Bar */}
      <header className="sticky top-0 z-50 px-6 py-4 border-b border-slate-200/80 backdrop-blur-md bg-white/90 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo.png"
              alt="AI Roadmap Logo"
              className="h-9.5 w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,102,255,0.25)] group-hover:scale-105 transition-transform"
            />
            <img
              src="/wordart-dark.png"
              alt="AI Roadmap"
              className="h-5.5 sm:h-6 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/my-roadmaps")}
              className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100/90 hover:bg-slate-200/80 backdrop-blur-sm px-5 py-2.5 rounded-full transition-all border border-slate-200/80 shadow-xs active:scale-95"
            >
              My Roadmaps
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-16">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12 animate-slide-up">
            {/* Pixel Art Logo Showcase with Tech Orbit Ring */}
            <div className="flex justify-center mb-6">
              <div className="relative group animate-float p-3">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400/35 animate-spin-slow pointer-events-none"></div>
                <div className="absolute -inset-4 bg-blue-500/12 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <img
                  src="/logo.png"
                  alt="AI Roadmap"
                  className="relative w-24 sm:w-32 h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,102,255,0.28)] transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 text-blue-700 px-5 py-2 rounded-full text-xs font-semibold mb-6 shadow-xs tracking-wide">
              <IoSparkles className="w-4 h-4 text-blue-600" />
              <span>AI-Powered Learning Paths</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-950 mb-6 leading-[1.12] tracking-tight">
              Create Learning{" "}
              <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Roadmaps
              </span>{" "}
              <br className="hidden md:block" />
              in Seconds
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal mb-8">
              Transform any learning goal into a structured, visual roadmap with milestones,
              prerequisites, and curated resources.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-600 mb-2 font-medium">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0066FF]"></span>
                </span>
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
                <span>Instant visual charts</span>
              </div>
            </div>
          </div>

          {/* Generator Input Card on White with Interactive Focus Aura */}
          <div
            style={{ animationDelay: "100ms" }}
            className="animate-slide-up bg-white rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_55px_rgba(0,102,255,0.11)] focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(0,102,255,0.12),0_20px_55px_rgba(0,102,255,0.14)] transition-all duration-300 border border-slate-200/90 p-6 sm:p-8 md:p-10 mb-16"
          >
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">
                Describe Your Learning Goal
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                Be specific about what you want to learn or achieve.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Example: 'Master Machine Learning with Python and PyTorch from scratch' or 'Full-stack Next.js and Cloudflare development roadmap'"
                  className="w-full h-44 p-5 sm:p-6 border border-slate-200 rounded-2xl text-base md:text-lg text-slate-900 resize-none outline-none transition-all duration-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-slate-50/70 placeholder-slate-400 font-sans"
                  disabled={isLoading}
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    {inputText.length}/1000 characters
                  </span>
                  {inputText.length > 30 && (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                      <FaCheck className="w-3.5 h-3.5" />
                      <span>Good detail</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <BsInfoCircleFill className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    {statusMessage || "Auto-fallback across preferred AI models"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={inputText.trim().length === 0 || isLoading}
                  className={`
                    btn-tech-shimmer flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 transform select-none cursor-pointer
                    ${
                      inputText.trim().length > 0 && !isLoading
                        ? "bg-[#0066FF] text-white hover:bg-blue-700 hover:scale-[1.03] hover:-translate-y-0.5 shadow-[0_4px_25px_rgba(0,102,255,0.38)] active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Your Roadmap...</span>
                    </>
                  ) : (
                    <>
                      <HiLightningBolt className="w-5 h-5" />
                      <span>Generate Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3 Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div
              style={{ animationDelay: "180ms" }}
              className="tech-card-shine animate-slide-up group text-left p-7 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(0,102,255,0.15)] hover:border-blue-400 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015]"
            >
              <div className="w-13 h-13 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <HiLightningBolt className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 mb-2.5 tracking-tight group-hover:text-blue-600 transition-colors">
                Intelligent Fallback
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Runs your preferred models with seamless automatic fallback.
              </p>
            </div>

            <div
              style={{ animationDelay: "260ms" }}
              className="tech-card-shine animate-slide-up group text-left p-7 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(0,102,255,0.15)] hover:border-blue-400 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015]"
            >
              <div className="w-13 h-13 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-center mb-6 text-sky-600 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <IoReorderFour className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 mb-2.5 tracking-tight group-hover:text-blue-600 transition-colors">
                Structured & Visual
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Interactive graph flows with clickable subtopics, code examples, and study timelines.
              </p>
            </div>

            <div
              style={{ animationDelay: "340ms" }}
              className="tech-card-shine animate-slide-up group text-left p-7 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(0,102,255,0.15)] hover:border-blue-400 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015]"
            >
              <div className="w-13 h-13 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <FaStar className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 mb-2.5 tracking-tight group-hover:text-blue-600 transition-colors">
                Interactive Tutor
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Chat assistant ready to answer questions, explain concepts, and suggest tutorials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
