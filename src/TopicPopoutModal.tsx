import { useEffect } from "react";
import { IoClose, IoSparkles } from "react-icons/io5";
import { FaBullseye, FaLaptopCode } from "react-icons/fa6";
import { BsCheckCircleFill, BsChatDots } from "react-icons/bs";
import type { Subtopic } from "./App";

interface TopicPopoutModalProps {
  subtopic: Subtopic | null;
  phaseTitle?: string;
  stepNumber?: string;
  onClose: () => void;
  onOpenChat: (subtopic: Subtopic) => void;
}

export default function TopicPopoutModal({
  subtopic,
  phaseTitle,
  stepNumber,
  onClose,
  onOpenChat,
}: TopicPopoutModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!subtopic) return null;

  const getHierarchyList = (): string[] => {
    if (subtopic.keyTopics && subtopic.keyTopics.length > 0) {
      return subtopic.keyTopics;
    }

    if (subtopic.description) {
      const parts = subtopic.description
        .split(/[.;]\s+/)
        .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
        .filter((s) => s.length > 6);

      if (parts.length >= 2) {
        return [
          `Foundations: ${parts[0]}`,
          `Implementation & Syntax: ${parts[1]}`,
          parts[2] ? `Best Practices: ${parts[2]}` : "Testing & Production Edge Cases",
          "Real-world Architecture & Integration",
        ];
      }
    }

    return [
      `Foundations of ${subtopic.title}`,
      "Core Implementation & API Syntax",
      "Common Design Patterns & Workflows",
      "Debugging, Performance & Production Checklist",
    ];
  };

  const hierarchyList = getHierarchyList();

  const targetText =
    (subtopic as any).specificTarget ||
    `Solve 25-30 targeted practice problems & build 1 functional implementation for ${subtopic.title}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/80 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 px-6 py-4.5 bg-slate-50 text-slate-900 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider bg-[#0066FF] text-white px-3 py-1 rounded-full shadow-sm">
              {stepNumber || "Module Step"}
            </span>
            {phaseTitle && (
              <span className="text-xs text-slate-600 font-semibold truncate max-w-[320px]">
                {phaseTitle}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
              {subtopic.title}
            </h2>
          </div>

          {/* Specific Quantified Target */}
          <div className="p-4.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/90 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs uppercase tracking-wider mb-1.5">
              <FaBullseye className="w-4 h-4 text-blue-600" />
              <span>Concrete Milestone Target:</span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              {targetText}
            </p>
          </div>

          {/* Concept Overview */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Concept Overview & Mechanics
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {subtopic.description}
            </p>
          </div>

          {/* Hierarchical Breakdown */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <IoSparkles className="w-4 h-4 text-blue-600" />
              <span>Complete Topic Hierarchy ({hierarchyList.length} Core Concepts)</span>
            </h3>

            <div className="space-y-2.5">
              {hierarchyList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs transition-all"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-xl bg-[#0066FF] text-white flex items-center justify-center text-xs font-black shadow-xs mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-snug">
                      {item}
                    </p>
                  </div>
                  <BsCheckCircleFill className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5 opacity-80" />
                </div>
              ))}
            </div>
          </div>

          {/* Hands-on Exercise & Problem Numbers */}
          {subtopic.practicalExample && (
            <div className="p-4.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs uppercase tracking-wider mb-1.5">
                <FaLaptopCode className="w-4 h-4 text-amber-600" />
                <span>Hands-on Practice & Exercise:</span>
              </div>
              <p className="text-sm font-semibold text-amber-950/95 leading-relaxed">
                {subtopic.practicalExample}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onOpenChat(subtopic);
                onClose();
              }}
              className="flex-1 py-3.5 px-6 bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-sm rounded-full shadow-[0_0_20px_rgba(0,102,255,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BsChatDots className="w-4 h-4" />
              <span>Discuss Topic with AI Tutor</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-full transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
