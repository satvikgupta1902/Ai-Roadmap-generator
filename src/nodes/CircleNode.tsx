import { Handle, Position } from "@xyflow/react";
import { FaBullseye } from "react-icons/fa6";
import { IoOpenOutline, IoSparkles } from "react-icons/io5";

export interface CircleNodeData {
  title: string;
  description: string;
  practicalExample: string;
  keyTopics?: string[];
  specificTarget?: string;
  stepNumber?: string;
  phaseTitle?: string;
  isRightBranch?: boolean;
}

interface CircleNodeProps {
  data: CircleNodeData;
  positionAbsoluteX: number;
  onSubtopicClick?: (subtopic: CircleNodeData) => void;
}

const CircleNode = ({
  data,
  positionAbsoluteX,
  onSubtopicClick,
}: CircleNodeProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSubtopicClick) {
      onSubtopicClick(data);
    }
  };

  const isRight = positionAbsoluteX >= 0;

  const targetText =
    data.specificTarget ||
    (data.title.toLowerCase().includes("leetcode") || data.title.toLowerCase().includes("algorithm")
      ? "🎯 Solve 30 practice problems"
      : "💡 Complete 1 hands-on milestone");

  return (
    <div className="relative group">
      {/* Enlarged, High-Contrast Flowchart Card with Observable Techie Lift & Shine */}
      <div
        onClick={handleClick}
        className="tech-card-shine w-[360px] bg-white text-gray-900 rounded-2xl shadow-lg border border-slate-200/90 hover:border-blue-500 hover:-translate-y-2 hover:scale-[1.025] hover:shadow-[0_18px_40px_rgba(0,102,255,0.20)] active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer overflow-hidden flex flex-col justify-between"
      >
        {/* Card Header Bar */}
        <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between border-b border-slate-100 transition-colors duration-300 group-hover:bg-blue-50/60">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-[#0066FF] text-white px-3 py-0.5 rounded-full shadow-xs transition-transform duration-300 group-hover:scale-105">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-200 animate-pulse"></span>
              {data.stepNumber || "Step"}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
            <span>View Hierarchy</span>
            <IoOpenOutline className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        {/* Card Body */}
        <div className="px-5 py-4">
          <h4 className="text-lg font-black text-slate-950 leading-snug mb-2 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
            {data.title}
          </h4>

          {/* Specific Quantified Target Badge */}
          <div className="mb-2.5 px-3 py-1.5 bg-sky-50 rounded-xl border border-sky-200/80 flex items-center gap-2 text-xs font-bold text-sky-950">
            <FaBullseye className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{targetText}</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 mb-2.5">
            {data.description}
          </p>

          {/* Footer Card Info */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <IoSparkles className="w-3.5 h-3.5 text-amber-500" />
              Structured Concepts Included
            </span>
            <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
              Pop out ↗
            </span>
          </div>
        </div>
      </div>

      {/* Connection Handle to Main Topic */}
      <Handle
        type="target"
        position={isRight ? Position.Left : Position.Right}
        className={`!w-4 !h-4 !border-2 !border-white !bg-[#0066FF] !shadow-md ${
          isRight ? "!-left-2" : "!-right-2"
        }`}
      />
    </div>
  );
};

export default CircleNode;
