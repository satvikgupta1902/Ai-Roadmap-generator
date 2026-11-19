import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { MarkerType, type Node, type Edge } from "@xyflow/react";
import Canvas from "./Canvas";
import { databases } from "./lib/appwrite";
import { useParams, useNavigate } from "react-router-dom";
import LearningPanel from "./LearningPanel";
import TopicPopoutModal from "./TopicPopoutModal";
import { IoIosArrowBack } from "react-icons/io";
import { FaDesktop } from "react-icons/fa6";

export interface Subtopic {
  title: string;
  description: string;
  practicalExample: string;
  keyTopics?: string[];
}

interface RoadmapNode {
  id: string;
  title: string;
  duration: string;
  order: 1;
  prerequisite: string;
  subtopics: Subtopic[];
}

interface RoadmapData {
  title: string;
  description: string;
  difficultyLevel: string;
  estimatedDuration: string;
  nodes: RoadmapNode[];
}

const OverviewFlow = () => {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [data, setData] = useState<RoadmapData>();
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(
    null
  );
  const [popoutSubtopic, setPopoutSubtopic] = useState<Subtopic | null>(null);
  const [popoutStepNumber, setPopoutStepNumber] = useState<string>("");
  const [popoutPhaseTitle, setPopoutPhaseTitle] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("chat");

  const handleSubtopicClick = (subtopic: any) => {
    setSelectedSubtopic(subtopic);
    setPopoutSubtopic(subtopic);
    setPopoutStepNumber(subtopic.stepNumber || "");
    setPopoutPhaseTitle(subtopic.phaseTitle || "");
    setActiveTab("details");
  };

  const generateNodeEdges = (data: RoadmapData): void => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Cleaned Roadmap Title
    const cleanTitle = (data.title || "Learning Roadmap")
      .replace(/^["'\s]+|["'\s]+$/g, "")
      .replace(/^(create\s+a\s+roadmap\s+for|roadmap\s+for)\s*/i, "");

    // 1. Sleek Goal/Start Node at top
    const startNodeId = "start-goal-node";
    nodes.push({
      id: startNodeId,
      type: "start",
      data: {
        label: cleanTitle,
        duration: data.estimatedDuration,
        level: data.difficultyLevel,
      },
      position: { x: -210, y: -240 },
    });

    let currentY = 10;
    let previousMainNodeId = startNodeId;

    data.nodes.forEach((mainTopic, mainIndex) => {
      const mainNodeId = `main-node-${mainIndex + 1}`;
      const isRightSide = mainIndex % 2 === 0; // alternate right and left branches for balanced diagram
      const subtopicCount = mainTopic.subtopics.length;
      // Vertical spacing between subtopics inside a phase
      const subtopicSpacingY = 260;

      // Main Milestone Node vertically centered alongside its subtopics
      const mainNodeY =
        subtopicCount > 1
          ? currentY + ((subtopicCount - 1) * subtopicSpacingY) / 2
          : currentY;

      nodes.push({
        id: mainNodeId,
        type: "main",
        position: { x: -190, y: mainNodeY },
        data: {
          label: mainTopic.title,
          order: mainIndex + 1,
          duration: mainTopic.duration,
          prerequisite: mainTopic.prerequisite,
          subtopicCount: subtopicCount,
          isRight: isRightSide,
        },
      });

      // Spine edge from previous node to this main phase node
      edges.push({
        id: `spine-edge-${mainIndex}`,
        source: previousMainNodeId,
        target: mainNodeId,
        sourceHandle: mainIndex === 0 ? "1" : "b",
        targetHandle: "a",
        type: "smoothstep",
        style: { stroke: "#0066FF", strokeWidth: 4 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#0066FF",
          width: 20,
          height: 20,
        },
      });

      previousMainNodeId = mainNodeId;

      // Subtopic Nodes for this phase (enlarged 360px cards)
      const subtopicBranchX = isRightSide ? 320 : -680;

      mainTopic.subtopics.forEach((subtopic, subIndex) => {
        const subtopicNodeId = `sub-${mainIndex + 1}-${subIndex + 1}`;
        const subtopicY = currentY + subIndex * subtopicSpacingY;

        nodes.push({
          id: subtopicNodeId,
          type: "circle",
          position: {
            x: subtopicBranchX,
            y: subtopicY,
          },
          data: {
            title: subtopic.title,
            description: subtopic.description,
            practicalExample: subtopic.practicalExample,
            keyTopics: (subtopic as any).keyTopics,
            specificTarget: (subtopic as any).specificTarget,
            phaseTitle: mainTopic.title,
            stepNumber: `Step ${mainIndex + 1}.${subIndex + 1}`,
            isRightBranch: isRightSide,
          },
        });

        // Connector edge from main phase to subtopic
        edges.push({
          id: `branch-edge-${subtopicNodeId}`,
          source: mainNodeId,
          target: subtopicNodeId,
          sourceHandle: "c",
          type: "smoothstep",
          animated: true,
          style: {
            stroke: isRightSide ? "#0066FF" : "#38bdf8",
            strokeWidth: 3,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isRightSide ? "#0066FF" : "#38bdf8",
            width: 16,
            height: 16,
          },
        });
      });

      // Advance Y position with 30% more reduction between phases
      const phaseHeight =
        subtopicCount > 1
          ? (subtopicCount - 1) * subtopicSpacingY + 140
          : 155;
      currentY += phaseHeight + 35;
    });

    setNodes(nodes);
    setEdges(edges);
  };

  useEffect(() => {
    (async () => {
      if (!roadmapId) return;

      try {
        // First check localStorage
        const localItem = localStorage.getItem(`roadmap_${roadmapId}`);
        if (localItem) {
          const parsed = JSON.parse(localItem);
          const roadmapData = (typeof parsed.data === "string" ? JSON.parse(parsed.data) : parsed.data) as RoadmapData;
          setNodes([]);
          setEdges([]);
          setData(roadmapData);
          generateNodeEdges(roadmapData);
          document.title = roadmapData.title;
          return;
        }

        const savedList = JSON.parse(localStorage.getItem("saved_roadmaps") || "[]");
        const found = savedList.find((r: { $id: string }) => r.$id === roadmapId);
        if (found) {
          const roadmapData = (typeof found.data === "string" ? JSON.parse(found.data) : found.data) as RoadmapData;
          setNodes([]);
          setEdges([]);
          setData(roadmapData);
          generateNodeEdges(roadmapData);
          document.title = roadmapData.title;
          return;
        }

        if (
          import.meta.env.VITE_APPWRITE_PROJECT_ID &&
          import.meta.env.VITE_APPWRITE_ENDPOINT
        ) {
          const response = await databases.getDocument(
            "6874d2200030c6ec9e6f",
            "6874d24a0021ae17ca60",
            roadmapId
          );

          const data = (await JSON.parse(response.data)) as unknown as RoadmapData;
          setNodes([]);
          setEdges([]);

          setData(data);
          generateNodeEdges(data);
          document.title = data.title;
        }
      } catch (error) {
        console.error("Error loading roadmap:", error);
      }
    })();
  }, [roadmapId]);

  if (!data) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center bg-grid-blueprint-light radial-ambient-blue-light">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl mb-6">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
            Loading Your Roadmap
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Preparing your personalized learning journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Small Screen */}
      <div className="lg:hidden min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 bg-grid-blueprint-light">
        <div className="text-center max-w-md mx-auto bg-white border border-slate-200 p-8 rounded-3xl shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl mb-6">
            <FaDesktop className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
            Desktop Required
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-blue-700 text-white rounded-full transition-all font-semibold text-sm shadow-md cursor-pointer"
          >
            <IoIosArrowBack className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/4 min-w-[300px] max-w-[400px] bg-white border-r border-slate-200 flex flex-col overflow-scroll text-slate-900">
          <div className="p-5 border-b border-slate-200 flex-shrink-0">
            {/* Header Brand */}
            <div
              className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-200 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <img
                src="/logo.png"
                alt="AI Roadmap Logo"
                className="h-7 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,102,255,0.25)] group-hover:scale-105 transition-transform"
              />
              <img
                src="/wordart-dark.png"
                alt="AI Roadmap"
                className="h-4.5 w-auto object-contain"
              />
            </div>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full border border-slate-200 w-fit cursor-pointer"
            >
              <IoIosArrowBack className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <h1 className="text-2xl font-black text-slate-950 mb-2 leading-tight tracking-tight">
              {data.title}
            </h1>

            {data.description && (
              <p className="text-xs text-slate-600 mb-4 leading-relaxed font-normal">
                {data.description}
              </p>
            )}

            {data.difficultyLevel && (
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    data.difficultyLevel.toLowerCase() === "beginner"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : data.difficultyLevel.toLowerCase() === "intermediate"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {data.difficultyLevel}
                </span>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <div className="w-2 h-2 bg-[#0066FF] rounded-full shadow-[0_0_6px_rgba(0,102,255,0.4)]"></div>
                <span>
                  {data.nodes.length} Main Topics
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.4)]"></div>
                <span>
                  {data.nodes.reduce(
                    (acc, node) => acc + node.subtopics.length,
                    0
                  )}{" "}
                  Learning Steps
                </span>
              </div>
              {data.estimatedDuration && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <div className="w-2 h-2 bg-sky-500 rounded-full shadow-[0_0_6px_rgba(14,165,233,0.4)]"></div>
                  <span>
                    {data.estimatedDuration}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-5">
            <h3 className="text-xs font-bold text-slate-500 mb-3.5 uppercase tracking-wider font-mono">
              Learning Path
            </h3>
            <div className="space-y-3">
              {data.nodes.map((node, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl transition-all border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-xs shadow-xs"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-sm text-slate-900 leading-tight">
                      {index + 1}. {node.title}
                    </div>

                    {node.duration && (
                      <span className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold">
                        {node.duration}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 mb-2">
                    {node.subtopics.length} subtopics
                  </div>

                  {node.prerequisite && (
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl font-medium">
                      Prerequisite: {node.prerequisite}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* canvas */}
        <div className="flex-1 border-r border-l border-slate-200 bg-[#F8FAFC] relative overflow-hidden">
          <Canvas
            nodes={nodes}
            edges={edges}
            onSubtopicClick={handleSubtopicClick}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-1/3 min-w-[350px] max-w-[450px] bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden text-slate-900">
          <LearningPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedSubtopic={selectedSubtopic}
            roadmapData={data}
          />
        </div>
      </div>

      {/* Floating Popout Hierarchy Modal */}
      <TopicPopoutModal
        subtopic={popoutSubtopic}
        stepNumber={popoutStepNumber}
        phaseTitle={popoutPhaseTitle}
        onClose={() => setPopoutSubtopic(null)}
        onOpenChat={(sub) => {
          setSelectedSubtopic(sub);
          setActiveTab("chat");
        }}
      />
    </div>
  );
};

export default OverviewFlow;
