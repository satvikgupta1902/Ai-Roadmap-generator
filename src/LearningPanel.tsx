import "@xyflow/react/dist/style.css";
import * as Tabs from "@radix-ui/react-tabs";
import { useState, useRef, useEffect } from "react";
import { sendChatMessageAI } from "./lib/ai";
import type { Subtopic } from "./App";
import { marked } from "marked";
import { IoChatbubbleEllipsesSharp, IoSparkles } from "react-icons/io5";
import { BsInfoCircleFill } from "react-icons/bs";
import { HiLightningBolt, HiReply } from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa";
import { FaBullseye } from "react-icons/fa6";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  modelName?: string;
}

interface RoadmapNode {
  title: string;
  duration?: string;
  prerequisite?: string;
  subtopics: Subtopic[];
}

interface RoadmapData {
  title: string;
  description?: string;
  difficultyLevel?: string;
  estimatedDuration?: string;
  nodes: RoadmapNode[];
}

const LearningPanel = ({
  activeTab,
  setActiveTab,
  selectedSubtopic,
  roadmapData,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedSubtopic: Subtopic | null;
  roadmapData?: RoadmapData;
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI learning mentor. I can help explain roadmap topics, provide code examples, and guide you through your learning path.\n\n**What would you like to explore today?**",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateRoadmapContext = (): string => {
    if (!roadmapData) return "";

    const context = `
      Roadmap: ${roadmapData.title}
      Description: ${roadmapData.description || "N/A"}
      Difficulty: ${roadmapData.difficultyLevel || "N/A"}
      Duration: ${roadmapData.estimatedDuration || "N/A"}

      Main Topics:
      ${roadmapData.nodes
        .map(
          (node, index) => `
            ${index + 1}. ${node.title}
              Duration: ${node.duration || "N/A"}
              Prerequisites: ${node.prerequisite || "None"}
              Subtopics: ${node.subtopics.map((sub) => sub.title).join(", ")}
          `
        )
        .join("")}

        Current Context: ${
          selectedSubtopic
            ? `Currently viewing "${selectedSubtopic.title}" - ${selectedSubtopic.description}`
            : "No specific topic selected"
        }
    `;

    return context.trim();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const context = generateRoadmapContext();
      const systemPrompt = `You are an expert learning mentor for a personalized learning roadmap. Your role is to help learners understand concepts, suggest tutorials/youtube videos/resources, explain tricky syntax, and keep learners motivated.

ROADMAP CONTEXT:
${context}

GUIDELINES:
- Provide clear, actionable explanations with code or practical analogies
- Recommend concrete resources (tutorials, official docs, videos)
- If asked about a topic not in the roadmap, still guide the user productively
- Format with markdown (bold, lists, code blocks with syntax highlighting)
- Be encouraging and concise unless deep explanation is requested`;

      const history = newMessages.map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      const { text, modelUsed } = await sendChatMessageAI(history, systemPrompt);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text,
        sender: "ai",
        timestamp: new Date(),
        modelName: modelUsed,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I am ready to help you with your roadmap! What questions do you have about this topic?",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSubtopicHierarchy = (sub: Subtopic): string[] => {
    if (sub.keyTopics && sub.keyTopics.length > 0) {
      return sub.keyTopics;
    }
    if (sub.description) {
      const parts = sub.description
        .split(/[.;]\s+/)
        .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
        .filter((s) => s.length > 6);
      if (parts.length >= 2) {
        return [
          `Core Principles: ${parts[0]}`,
          `Implementation & API: ${parts[1]}`,
          parts[2] ? `Best Practices: ${parts[2]}` : "Testing & Production Patterns",
        ];
      }
    }
    return [
      `Foundations of ${sub.title}`,
      "Syntax & Code Implementation",
      "Patterns, Tooling & Workflow",
    ];
  };

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col h-full bg-white text-slate-900 border-l border-slate-200"
    >
      {/* Tabs Header */}
      <div className="flex-shrink-0 p-3 bg-white border-b border-slate-200">
        <Tabs.List className="flex rounded-full bg-slate-100 p-1 border border-slate-200">
          <Tabs.Trigger
            value="chat"
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 data-[state=active]:bg-[#0066FF] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <IoChatbubbleEllipsesSharp className="size-4" />
              AI Tutor Chat
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="details"
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 data-[state=active]:bg-[#0066FF] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <BsInfoCircleFill className="w-4 h-4" />
              Topic Details
            </div>
          </Tabs.Trigger>
        </Tabs.List>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {/* AI Chat Tab */}
        <Tabs.Content value="chat" className="h-full flex flex-col">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-[#0066FF] text-white rounded-br-sm user-message shadow-sm"
                          : "bg-slate-50 text-slate-800 rounded-bl-sm border border-slate-200/90 shadow-xs"
                      }`}
                    >
                      <div className="text-sm markdown-content">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(message.text, {
                              breaks: true,
                              gfm: true,
                            }) as string,
                          }}
                        />
                      </div>
                      <div
                        className={`flex items-center justify-between gap-2 text-[10px] mt-2 pt-1 border-t ${
                          message.sender === "user"
                            ? "text-blue-100 border-white/20"
                            : "text-slate-400 border-slate-200"
                        }`}
                      >
                        <span>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.modelName && (
                          <span className="font-semibold bg-white px-2 py-0.5 rounded text-blue-700 border border-blue-200">
                            {message.modelName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 text-slate-700 rounded-2xl rounded-bl-sm p-3.5 max-w-[85%] border border-slate-200">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.15s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.3s" }}
                          ></div>
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-white">
              {selectedSubtopic && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 mb-2.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-[#0066FF] rounded-md flex items-center justify-center">
                      <HiReply className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-blue-900 truncate">
                        {selectedSubtopic.title}
                      </h4>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 p-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:opacity-50 bg-slate-50 text-slate-900 placeholder-slate-400"
                  placeholder={
                    isLoading
                      ? "AI is thinking..."
                      : "Ask a question about this roadmap..."
                  }
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-3 bg-[#0066FF] text-white rounded-xl hover:bg-blue-700 transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* Subtopic Tab */}
        <Tabs.Content value="details" className="h-full overflow-y-auto">
          {selectedSubtopic ? (
            <div className="p-4 space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-4.5 border border-slate-800 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-md inline-block mb-1.5">
                  Selected Topic
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {selectedSubtopic.title}
                </h3>
              </div>

              {/* Concrete Milestone Target */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-[11px] uppercase tracking-wider mb-1">
                  <FaBullseye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Concrete Milestone Target:</span>
                </div>
                <p className="text-xs font-bold text-slate-900 leading-relaxed">
                  {(selectedSubtopic as any).specificTarget ||
                    `Solve 25-30 targeted questions and complete 1 hands-on implementation.`}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 font-mono">
                  <BsInfoCircleFill className="w-3.5 h-3.5 text-blue-600" />
                  Description
                </h4>
                <p className="text-slate-700 leading-relaxed text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs font-normal">
                  {selectedSubtopic.description}
                </p>
              </div>

              {/* Hierarchy Concept Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 font-mono">
                  <IoSparkles className="w-3.5 h-3.5 text-blue-600" />
                  Included Topic Hierarchy
                </h4>
                <div className="space-y-1.5">
                  {getSubtopicHierarchy(selectedSubtopic).map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSubtopic.practicalExample && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 font-mono">
                    <HiLightningBolt className="w-3.5 h-3.5 text-amber-500" />
                    Practical Example & Exercise
                  </h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                    <p className="text-amber-950 leading-relaxed text-xs font-medium">
                      {selectedSubtopic.practicalExample}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className="w-full mt-4 py-3 px-4 bg-[#0066FF] hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ask AI Tutor About This Topic</span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <BsInfoCircleFill className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">No Topic Selected</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click any subtopic card in the roadmap to view details
                </p>
              </div>
            </div>
          )}
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
};

export default LearningPanel;
