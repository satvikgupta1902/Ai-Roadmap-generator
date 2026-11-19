import { Handle, Position } from "@xyflow/react";
import { FaFlagCheckered } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";

interface InputNodeData {
  label: string;
  duration?: string;
  level?: string;
}

interface InputNodeProps {
  data: InputNodeData;
}

const InputNode = ({ data }: InputNodeProps) => {
  const cleanTitle = (data.label || "Learning Roadmap")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/^(create\s+a\s+roadmap\s+for|roadmap\s+for)\s*/i, "");

  return (
    <div className="relative group">
      {/* Enlarged Start Goal Card */}
      <div className="w-[420px] px-8 py-6 bg-white text-slate-900 shadow-xl rounded-3xl border-2 border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:border-emerald-600">
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
              <FaFlagCheckered className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Start Point
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-semibold">
            <IoSparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mastery Goal</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-2 leading-snug">
          {cleanTitle}
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Sequential professional learning roadmap with concrete milestone targets
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="1"
        className="!w-4 !h-4 !border-2 !border-white !bg-emerald-500 !-bottom-2 !shadow-md"
      />
    </div>
  );
};

export default InputNode;
