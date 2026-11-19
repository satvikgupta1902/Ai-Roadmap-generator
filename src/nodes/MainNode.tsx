import { Handle, Position } from "@xyflow/react";
import { FaClock, FaLayerGroup } from "react-icons/fa6";
import { BsArrowRightCircle } from "react-icons/bs";

interface NodeData {
  label: string;
  order?: number;
  duration?: string;
  prerequisite?: string;
  subtopicCount?: number;
  isRight: boolean;
}

interface MainNodeProps {
  data: NodeData;
}

const MainNode = ({ data }: MainNodeProps) => {
  return (
    <div className="relative group">
      {/* Enlarged Phase Milestone Card */}
      <div className="w-[380px] px-7 py-6 bg-white text-slate-900 shadow-xl rounded-3xl border-2 border-[#0066FF] hover:shadow-2xl transition-all duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-[#0066FF] text-white px-3.5 py-1 rounded-full shadow-sm">
              {data.order ? `Phase ${data.order}` : "Milestone"}
            </span>
          </div>

          {data.duration && (
            <div className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              <FaClock className="w-3.5 h-3.5 text-blue-600" />
              <span>{data.duration}</span>
            </div>
          )}
        </div>

        {/* Phase Title */}
        <h3 className="text-xl font-extrabold text-slate-950 mb-3 leading-snug tracking-tight">
          {data.label}
        </h3>

        {/* Info pills */}
        <div className="space-y-2.5 mt-3 pt-3 border-t border-slate-100">
          {data.prerequisite && data.prerequisite !== "None" && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium">
              <span className="font-bold text-amber-900">Prereq:</span>
              <span className="truncate">{data.prerequisite}</span>
            </div>
          )}

          {typeof data.subtopicCount === "number" && (
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-2">
                <FaLayerGroup className="w-4 h-4 text-blue-600" />
                {data.subtopicCount} Core Modules
              </span>
              <span className="text-blue-600 font-bold flex items-center gap-1">
                Explore <BsArrowRightCircle className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Target handle from above */}
      <Handle
        type="target"
        position={Position.Top}
        id="a"
        className="!w-4 !h-4 !border-2 !border-white !bg-[#0066FF] !-top-2 !shadow-md"
      />

      {/* Source handle to next main phase below */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        className="!w-4 !h-4 !border-2 !border-white !bg-[#0066FF] !-bottom-2 !shadow-md"
      />

      {/* Source handle out to subtopics on Left or Right */}
      <Handle
        type="source"
        position={data.isRight ? Position.Right : Position.Left}
        id="c"
        className={`!w-4 !h-4 !border-2 !border-white !bg-[#0066FF] !shadow-md ${
          data.isRight ? "!-right-2" : "!-left-2"
        }`}
      />
    </div>
  );
};

export default MainNode;
