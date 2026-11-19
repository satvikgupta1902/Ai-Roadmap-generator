import { useEffect, useState } from "react";
import { databases } from "./lib/appwrite";
import { Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoReorderFour } from "react-icons/io5";
import { MdOutlineViewList } from "react-icons/md";
import { FaClock, FaTrashAlt } from "react-icons/fa";

interface SavedRoadmap {
  $id: string;
  prompt: string;
  data: string;
  $createdAt: string;
}

const MyRoadmaps = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteRoadmap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;

    try {
      // Remove from state immediately
      setRoadmaps((prev) => prev.filter((r) => r.$id !== id));

      // Remove from localStorage
      const saved = JSON.parse(localStorage.getItem("saved_roadmaps") || "[]");
      const updated = saved.filter((r: any) => r.$id !== id);
      localStorage.setItem("saved_roadmaps", JSON.stringify(updated));
      localStorage.removeItem(`roadmap_${id}`);

      // Attempt remote delete if Appwrite is configured
      if (
        import.meta.env.VITE_APPWRITE_PROJECT_ID &&
        import.meta.env.VITE_APPWRITE_ENDPOINT
      ) {
        try {
          await databases.deleteDocument(
            "6874d2200030c6ec9e6f",
            "6874d24a0021ae17ca60",
            id
          );
        } catch (appwriteErr) {
          console.warn("Could not delete from Appwrite:", appwriteErr);
        }
      }
    } catch (err) {
      console.error("Error deleting roadmap:", err);
    }
  };

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const localRoadmaps: SavedRoadmap[] = JSON.parse(
          localStorage.getItem("saved_roadmaps") || "[]"
        );

        if (
          import.meta.env.VITE_APPWRITE_PROJECT_ID &&
          import.meta.env.VITE_APPWRITE_ENDPOINT
        ) {
          try {
            const response = await databases.listDocuments(
              "6874d2200030c6ec9e6f",
              "6874d24a0021ae17ca60",
              [Query.orderDesc("$createdAt")]
            );
            const remoteDocs = response.documents as unknown as SavedRoadmap[];
            const all = [...localRoadmaps];
            remoteDocs.forEach((doc) => {
              if (!all.some((r) => r.$id === doc.$id)) {
                all.push(doc);
              }
            });
            setRoadmaps(all);
            return;
          } catch (dbError) {
            console.warn("Could not fetch remote roadmaps:", dbError);
          }
        }

        setRoadmaps(localRoadmaps);
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center bg-grid-blueprint-light radial-ambient-blue-light selection:bg-blue-600 selection:text-white">
        <div className="text-center p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl mb-6">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-950 mb-2 tracking-tight">
            Loading Your Roadmaps
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 bg-grid-blueprint-light radial-ambient-blue-light selection:bg-blue-600 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer text-xs font-semibold bg-slate-100/90 hover:bg-slate-200/80 px-4 py-2 rounded-full border border-slate-200/80 shadow-xs active:scale-95"
              >
                <IoChevronBack className="w-4 h-4" />
                <span className="font-medium">Back to Home</span>
              </button>

              <div
                className="hidden sm:flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate("/")}
              >
                <img
                  src="/logo.png"
                  alt="AI Roadmap Logo"
                  className="h-8.5 w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,102,255,0.25)] group-hover:scale-105 transition-transform"
                />
                <img
                  src="/wordart-dark.png"
                  alt="AI Roadmap"
                  className="h-5.5 w-auto object-contain"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-slate-950 tracking-tight hidden md:block">
                My Roadmaps
              </h1>
              <div className="text-xs text-blue-700 font-mono bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full font-semibold">
                {roadmaps.length} {roadmaps.length === 1 ? "Roadmap" : "Roadmaps"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        {roadmaps.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/90 rounded-3xl max-w-xl mx-auto p-10 shadow-[0_15px_45px_rgba(0,0,0,0.06)]">
            <div className="w-20 h-20 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MdOutlineViewList className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950 mb-3 tracking-tight">
              No Roadmaps Yet
            </h2>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              Create your first AI-powered learning roadmap to get started!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#0066FF] hover:bg-blue-700 text-white px-7 py-3 rounded-full font-semibold text-sm transition-all shadow-[0_4px_25px_rgba(0,102,255,0.35)] cursor-pointer"
            >
              Create Your First Roadmap
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roadmaps.map((roadmap) => {
              const parsedData = typeof roadmap.data === "string" ? JSON.parse(roadmap.data) : roadmap.data;
              return (
                <div
                  key={roadmap.$id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-blue-500 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,102,255,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group relative"
                  onClick={() => navigate(`/roadmap/${roadmap.$id}`)}
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-950 line-clamp-2 leading-snug tracking-tight group-hover:text-blue-600 transition-colors flex-1">
                        {parsedData.title}
                      </h3>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRoadmap(roadmap.$id, e)}
                        title="Delete this roadmap"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200 flex-shrink-0 cursor-pointer"
                      >
                        <FaTrashAlt className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-normal">
                      {parsedData.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                        <IoReorderFour className="w-3.5 h-3.5" />
                        {parsedData.nodes?.length || 0} topics
                      </span>
                      {parsedData.estimatedDuration && (
                        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <FaClock className="w-3 h-3 text-blue-600" />
                          {parsedData.estimatedDuration}
                        </span>
                      )}
                    </div>
                    <span>
                      {new Date(roadmap.$createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoadmaps;
