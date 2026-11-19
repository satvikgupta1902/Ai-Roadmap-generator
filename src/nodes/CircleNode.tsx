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
      {/* Enlarged, High-Contrast Flowchart Card */}
      <div
        onClick={handleClick}
        className="w-[360px] bg-white text-gray-900 rounded-2xl shadow-xl border border-slate-200/90 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
      >
        {/* Card Header Bar */}
        <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-[#0066FF] text-white px-3 py-0.5 rounded-full shadow-xs">
              {data.stepNumber || "Step"}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
            <span>View Hierarchy</span>
            <IoOpenOutline className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <h4 className="text-lg font-black text-slate-950 leading-snug mb-2.5 tracking-tight group-hover:text-blue-600 transition-colors">
            {data.title}
          </h4>

          {/* Specific Quantified Target Badge */}
          <div className="mb-3 px-3 py-1.5 bg-sky-50 rounded-xl border border-sky-200/80 flex items-center gap-2 text-xs font-bold text-sky-950">
            <FaBullseye className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{targetText}</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 mb-3">
            {data.description}
          </p>

          {/* Footer Card Info */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <IoSparkles className="w-3.5 h-3.5 text-amber-500" />
              Structured Concepts Included
            </span>
            <span className="text-[11px] font-bold text-blue-600 group-hover:underline">
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
