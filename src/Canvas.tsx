import {
  ReactFlow,
  Controls,
  Background,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
  Panel,
} from "@xyflow/react";

import CircleNode from "./nodes/CircleNode";
import MainNode from "./nodes/MainNode";
import InputNode from "./nodes/InputNode";

interface Subtopic {
  title: string;
  description: string;
  practicalExample: string;
}

const Canvas = ({
  nodes,
  edges,
  onSubtopicClick,
}: {
  nodes: Node[];
  edges: Edge[];
  onSubtopicClick: (subtopic: Subtopic) => void;
}) => {
  const nodeTypes = {
    start: InputNode,
    main: MainNode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    circle: (props: any) => (
      <CircleNode {...props} onSubtopicClick={onSubtopicClick} />
    ),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onInit = (reactFlowInstance: any) => {
    setTimeout(() => {
      reactFlowInstance.fitView({
        padding: 0.18,
        duration: 600,
      });
    }, 100);
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        attributionPosition="bottom-left"
        nodeTypes={nodeTypes}
        minZoom={0.15}
        maxZoom={2}
        panOnScroll={true}
        defaultEdgeOptions={{
          style: {
            strokeWidth: 3,
            stroke: "#0066FF",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#0066FF",
            width: 18,
            height: 18,
          },
        }}
        proOptions={{ hideAttribution: true }}
        onInit={onInit}
      >
        <Controls className="!bg-white !border !border-slate-200 !shadow-lg !rounded-xl !overflow-hidden text-slate-700" />

        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.2}
          color="#cbd5e1"
          bgColor="#f8fafc"
        />

        <Panel position="top-right" className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 text-slate-800">
          <h3 className="font-extrabold text-slate-900 mb-2.5 text-xs uppercase tracking-wider font-mono">
            Flowchart Guide
          </h3>
          <div className="space-y-2 text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3.5 h-3.5 bg-emerald-500 rounded-md shadow-xs"></span>
              <span>Learning Goal (Start)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3.5 h-3.5 bg-[#0066FF] rounded-md shadow-xs"></span>
              <span>Phase Milestones</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-md shadow-xs"></span>
              <span>Subtopics (Click to Expand)</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-blue-600 font-semibold">
            💡 Click any card to expand hierarchy
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Canvas;
