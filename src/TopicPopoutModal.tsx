import { useEffect, useState, useRef } from "react";
import { IoClose, IoSparkles, IoOpenOutline } from "react-icons/io5";
import {
  FaBullseye,
  FaLaptopCode,
  FaCompass,
  FaRoute,
  FaCheck,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";
import { BsCheckCircleFill, BsChatDots, BsBookHalf } from "react-icons/bs";
import type { Subtopic } from "./App";
import {
  getPracticeDirections,
  cleanTopicName,
  type PracticeDirection,
} from "./lib/practiceResources";

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
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string>("");
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subtopic) {
      setSelectedTopicTitle(subtopic.title);
    }
  }, [subtopic]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!subtopic) return null;

  const currentTopic = selectedTopicTitle || subtopic.title;

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

  const practiceDirection: PracticeDirection = getPracticeDirections(
    currentTopic,
    subtopic.description,
    (subtopic as any).specificTarget
  );

  const handleTitleClick = () => {
    setSelectedTopicTitle(subtopic.title);
    resourcesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleHierarchyItemClick = (itemTitle: string) => {
    setSelectedTopicTitle(itemTitle);
    resourcesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200/90 custom-scrollbar animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 px-6 py-4.5 bg-white/95 backdrop-blur-md text-slate-900 flex items-center justify-between border-b border-slate-200">
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
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Clickable Title with Interactive Practice Callout */}
          <div
            onClick={handleTitleClick}
            className="group cursor-pointer p-4 -mx-4 rounded-2xl transition-all duration-200 hover:bg-blue-50/60 border border-transparent hover:border-blue-200 relative"
            title="Click to view practice directions and resource links"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full shadow-xs">
                <FaCompass className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
                <span>Click title for practice directions & links</span>
              </span>
              <span className="text-xs text-slate-400 group-hover:text-blue-600 font-semibold flex items-center gap-1">
                <span>View practice</span>
                <FaArrowUpRightFromSquare className="w-3 h-3" />
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
              {subtopic.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Click anywhere on this title to get direct practice platforms and recommended problem sets.
            </p>
          </div>

          {/* Practice Direction & Recommended Resources Panel (re-animates on topic switch) */}
          <div
            key={currentTopic}
            ref={resourcesRef}
            className="animate-slide-up rounded-3xl border-2 border-blue-500/80 bg-gradient-to-br from-blue-50/50 via-white to-sky-50/30 p-6 shadow-sm transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shadow-xs">
                  <FaRoute className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 tracking-tight">
                    Where & How to Practice
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Target: <span className="text-blue-700 font-bold">{cleanTopicName(currentTopic)}</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full shadow-xs">
                {practiceDirection.platformBadge}
              </span>
            </div>

            {/* Actionable Direction Instruction */}
            <div className="bg-white rounded-2xl p-4.5 border border-blue-200/80 shadow-xs mb-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <FaCompass className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 mb-1">
                    Actionable Practice Direction:
                  </h4>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {practiceDirection.directionText}
                  </p>
                </div>
              </div>
            </div>

            {/* Numbered Concrete Steps */}
            <div className="mb-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5 font-mono">
                <FaCheck className="w-3 h-3 text-emerald-600" />
                <span>Recommended Practice Checklist</span>
              </h4>
              <div className="space-y-2">
                {practiceDirection.concreteSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs font-medium text-slate-800 bg-white/90 p-3 rounded-xl border border-slate-200 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct External Resource Links Grid */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5 font-mono">
                <BsBookHalf className="w-3 h-3 text-blue-600" />
                <span>Direct Links & Platforms (Click to Open)</span>
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {practiceDirection.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex flex-col justify-between p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-left cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {res.type}
                        </span>
                        <IoOpenOutline className="w-4 h-4 text-blue-600 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 group-hover/link:text-blue-600 transition-colors leading-snug line-clamp-1">
                        {res.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                        {res.description}
                      </p>
                    </div>
                    <span className="mt-2 text-[11px] font-bold text-blue-600 group-hover/link:underline flex items-center gap-1">
                      Open in {res.label.split(" ")[0]} ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
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

          {/* Hierarchical Breakdown with Clickable Concepts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                <IoSparkles className="w-4 h-4 text-blue-600" />
                <span>Complete Topic Hierarchy ({hierarchyList.length} Core Concepts)</span>
              </h3>
              <span className="text-[11px] text-blue-600 font-bold">
                Click any topic to view its specific practice links
              </span>
            </div>

            <div className="space-y-2.5">
              {hierarchyList.map((item, idx) => {
                const isSelected = selectedTopicTitle === item;
                return (
                  <div
                    key={idx}
                    onClick={() => handleHierarchyItemClick(item)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 shadow-xs"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black shadow-xs mt-0.5 ${
                        isSelected
                          ? "bg-blue-700 text-white"
                          : "bg-[#0066FF] text-white"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {item}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isSelected
                          ? "✓ Active: Practice directions loaded above"
                          : "Click to see practice direction & LeetCode/docs links"}
                      </p>
                    </div>
                    <BsCheckCircleFill
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isSelected ? "text-blue-600" : "text-emerald-500 opacity-80"
                      }`}
                    />
                  </div>
                );
              })}
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
