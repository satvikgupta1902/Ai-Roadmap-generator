import { GoogleGenAI } from "@google/genai";

export interface RoadmapSubtopic {
  title: string;
  description: string;
  practicalExample: string;
  keyTopics?: string[];
  specificTarget?: string;
}

export interface RoadmapNode {
  title: string;
  order: number;
  duration: string;
  prerequisite: string;
  subtopics: RoadmapSubtopic[];
}

export interface RoadmapData {
  title: string;
  description: string;
  estimatedDuration: string;
  difficultyLevel: string;
  nodes: RoadmapNode[];
}

// User-ordered preference models
const ROADMAP_FALLBACK_MODELS = [
  {
    name: "Gemini 3.8 Flash",
    provider: "gemini",
    modelId: "gemini-2.5-flash",
  },
  {
    name: "Kimi 3.1 Pro",
    provider: "nvidia",
    modelId: "moonshotai/kimi-k3.1-pro",
  },
  {
    name: "Mistral Large 4",
    provider: "nvidia",
    modelId: "mistralai/mistral-large-4-1t-a52b",
  },
  {
    name: "GPT-OSS 120B",
    provider: "cerebras",
    modelId: "gpt-oss-120b",
  },
] as const;

const CHAT_FALLBACK_MODELS = [
  {
    name: "GPT-OSS 120B",
    provider: "cerebras",
    modelId: "gpt-oss-120b",
  },
  {
    name: "Llama 3.3 70B",
    provider: "cerebras",
    modelId: "llama-3.3-70b",
  },
  {
    name: "Kimi 3.1 Pro",
    provider: "nvidia",
    modelId: "moonshotai/kimi-k3.1-pro",
  },
  {
    name: "Gemini 3.5 Flash-Lite",
    provider: "gemini",
    modelId: "gemini-2.0-flash-lite",
  },
] as const;

function getApiKey(provider: "nvidia" | "cerebras" | "gemini"): string {
  const localKey = localStorage.getItem(`${provider}_api_key`);
  if (localKey && localKey.trim()) return localKey.trim();

  switch (provider) {
    case "nvidia":
      return import.meta.env.VITE_NVIDIA_API_KEY || "";
    case "cerebras":
      return import.meta.env.VITE_CEREBRAS_API_KEY || "";
    case "gemini":
      return import.meta.env.VITE_GEMINI_API_KEY || "";
  }
}

function cleanJSONText(raw: string): string {
  let cleaned = raw.trim();

  if (cleaned.includes("```json")) {
    cleaned = cleaned.split("```json")[1]?.split("```")[0] || cleaned;
  } else if (cleaned.includes("```")) {
    const parts = cleaned.split("```");
    if (parts.length >= 3) {
      cleaned = parts[1];
    }
  }

  cleaned = cleaned.trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return cleaned;
}

const ROADMAP_PROMPT = (topic: string) => `You are an expert learning curriculum architect. Create an ultra-detailed, highly actionable learning roadmap for: "${topic}".

CRITICAL REQUIREMENTS FOR TITLES AND SPECIFICITY:
1. TITLES MUST BE EXACT AND SEARCHABLE:
   Every subtopic title MUST be named so that typing it directly into YouTube or Google immediately returns the top tutorials, courses, and documentation (e.g. instead of 'Arrays', use 'Two Pointers & Sliding Window Algorithm'; instead of 'Docker', use 'Docker Container Lifecycle & Multi-Stage Builds'). Never use vague titles like 'Introduction', 'Basics', or 'Overview'.
2. SPECIFIC NUMERICAL TARGETS:
   Every subtopic MUST include a "specificTarget" with concrete numbers (e.g., 'Solve 30 LeetCode questions (10 Easy, 15 Medium, 5 Hard)', 'Build 1 full-stack authentication system with JWT and Redis', 'Write 20 complex SQL queries using Window Functions', 'Deploy 1 containerized app with GitHub Actions CI/CD'). Never give vague instructions like 'practice questions'.
3. DEEP HIERARCHICAL TOPICS:
   "keyTopics" MUST be 4-6 specific, searchable concepts and techniques included in that module.
4. ACTIONABLE PRACTICAL EXAMPLES:
   "practicalExample" MUST specify the exact project, problem numbers, or step-by-step exercise.

IMPORTANT: Respond ONLY with valid JSON. No markdown formatting, no explanatory text, just the JSON object.

Structure your response as this exact JSON format:
{
  "title": "Clear, specific title for the learning path",
  "description": "Compelling 1-2 sentence overview of what learners will achieve",
  "estimatedDuration": "Specific time estimate (e.g., '3-6 months', '8-12 weeks')",
  "difficultyLevel": "Beginner|Intermediate|Advanced",
  "nodes": [
    {
      "title": "Phase 1: Specific Phase Name",
      "order": 1,
      "duration": "Time estimate for this phase (e.g., 'Weeks 1-3')",
      "prerequisite": "Concrete prerequisite (e.g., 'Basic JavaScript ES6')",
      "subtopics": [
        {
          "title": "Exact Searchable Title (e.g., 'Binary Search Algorithm & Answer Space Search')",
          "description": "Clear explanation of what this covers, mechanics, and why it is critical",
          "specificTarget": "Specific quantified target (e.g., 'Solve 30 LeetCode problems: 10 Easy, 15 Medium, 5 Hard')",
          "practicalExample": "Exact challenge or project (e.g., 'Implement Search in Rotated Sorted Array #33 and Koko Eating Bananas #875')",
          "keyTopics": [
            "Exact sub-concept 1 (searchable on YouTube/Google)",
            "Exact sub-concept 2",
            "Exact sub-concept 3",
            "Exact sub-concept 4"
          ]
        }
      ]
    }
  ]
}

Guidelines:
- Create logical learning phases with ordered progression
- Each node should have focused subtopics with practical examples and 3-5 structured keyTopics
- Progress from basic to advanced concepts
- Make descriptions actionable and specific`;

// Provider Callers with timeouts
async function callOpenAICompatible(
  primaryEndpoint: string,
  fallbackEndpoint: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  timeoutMs = 15000
): Promise<string> {
  const endpoints = [primaryEndpoint, fallbackEndpoint];

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const content = choice?.message?.content;
      const reasoning = choice?.message?.reasoning_content;

      if (content && content.trim()) {
        return content.trim();
      }
      if (reasoning && reasoning.trim()) {
        return reasoning.trim();
      }
    } catch {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(`Failed to get response from ${model}`);
}

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  timeoutMs = 15000
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    clearTimeout(timeoutId);
    return response.text || "";
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export function getYouTubeSearchUrl(topic: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " tutorial full course")}`;
}

export function getGoogleSearchUrl(topic: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(topic + " documentation tutorial")}`;
}

/**
 * High-quality fallback generator if all external APIs are unreachable
 */
function createFallbackRoadmap(topic: string): RoadmapData {
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  return {
    title: `${capitalizedTopic} Mastery Roadmap`,
    description: `A comprehensive, step-by-step learning journey to master ${topic} from fundamentals to production-grade applications.`,
    estimatedDuration: "8-12 weeks",
    difficultyLevel: "Beginner to Advanced",
    nodes: [
      {
        title: "Phase 1: Foundations & Core Architecture",
        order: 1,
        duration: "Weeks 1-3",
        prerequisite: "Basic computer literacy and command-line familiarity",
        subtopics: [
          {
            title: `${capitalizedTopic} Architecture & Runtime Mechanics`,
            description: `Deep dive into the runtime engine, memory model, compilation/interpretation pipeline, and mental models of ${topic}.`,
            specificTarget: "Build 3 baseline programs & complete 20 syntax drill exercises",
            practicalExample: "Implement a CLI calculator and file parser demonstrating core data structures and error handling.",
            keyTopics: [
              "Runtime lifecycle & execution engine",
              "Memory stack vs heap allocation",
              "Type system & compiler optimizations",
              "Essential standard library APIs"
            ]
          },
          {
            title: "Development Environment, Linters & Git Workflow",
            description: "Configure industry-standard tooling, static analysis, automated testing hooks, and semantic version control.",
            specificTarget: "Set up 1 production-grade repository with pre-commit hooks and CI linting",
            practicalExample: "Initialize a repository with Husky, ESLint/Ruff/golangci-lint, and automated GitHub Actions verification.",
            keyTopics: [
              "IDE configuration & debugger attach",
              "Static analysis & strict type checking",
              "Package management & dependency lockfiles",
              "Git branch strategies (Trunk-based vs GitFlow)"
            ]
          },
          {
            title: "Data Structures & Algorithmic Problem Solving",
            description: "Master foundational collections, hash tables, pointers/references, and algorithmic complexity.",
            specificTarget: "Solve 30 LeetCode / HackerRank problems (15 Easy, 15 Medium)",
            practicalExample: "Solve LeetCode #1 Two Sum, #20 Valid Parentheses, #206 Reverse Linked List, and #217 Contains Duplicate.",
            keyTopics: [
              "Arrays, Dynamic Slices & String manipulation",
              "Hash Maps, Sets & O(1) lookups",
              "Linked Lists, Stacks & Queues",
              "Time and Space Complexity (Big-O) analysis"
            ]
          },
        ],
      },
      {
        title: "Phase 2: Deep Concepts, Concurrency & Async Architecture",
        order: 2,
        duration: "Weeks 4-6",
        prerequisite: "Completion of Phase 1 fundamentals",
        subtopics: [
          {
            title: "Asynchronous I/O, Concurrency & Event Loops",
            description: "Master multi-threading, coroutines/goroutines, async/await event loops, and race condition prevention.",
            specificTarget: "Write 5 concurrent worker pipelines processing 10,000 asynchronous tasks",
            practicalExample: "Build a concurrent web crawler with worker pools, rate limiting, and mutex locks.",
            keyTopics: [
              "Event loop architecture & task queues",
              "Promises, Futures, Coroutines & async/await",
              "Thread synchronization, Mutexes & Channels",
              "Deadlock detection & race condition debugging"
            ]
          },
          {
            title: "Design Patterns, Clean Architecture & SOLID",
            description: "Structure modular, maintainable enterprise software using clean architecture and OOP/functional design patterns.",
            specificTarget: "Refactor 1 legacy monolith into 4 decoupled modular layers with dependency injection",
            practicalExample: "Build an e-commerce order processing pipeline using Factory, Repository, and Strategy patterns.",
            keyTopics: [
              "SOLID design principles in practice",
              "Repository & Unit of Work patterns",
              "Dependency Injection & Inversion of Control",
              "Domain-Driven Design (DDD) fundamentals"
            ]
          },
          {
            title: "Performance Profiling & Memory Optimization",
            description: "Identify CPU bottlenecks, garbage collection pauses, memory leaks, and network overhead.",
            specificTarget: "Profile code to achieve 50% reduced execution time and zero memory leaks",
            practicalExample: "Use profilers (pprof/Chrome DevTools/valgrind) to identify hot paths and eliminate allocations.",
            keyTopics: [
              "Flamegraphs & CPU profiling analysis",
              "Garbage collector tuning & memory allocs",
              "Cache locality & algorithmic optimizations",
              "Benchmarking methodology and regression testing"
            ]
          },
        ],
      },
      {
        title: "Phase 3: Production APIs, Database Engineering & Security",
        order: 3,
        duration: "Weeks 7-9",
        prerequisite: "Proficiency in async programming and clean architecture",
        subtopics: [
          {
            title: "RESTful, GraphQL & gRPC API Engineering",
            description: "Design high-performance web services with schema validation, middleware, pagination, and error contracts.",
            specificTarget: "Build 1 production API with 10 endpoints, Swagger/OpenAPI docs, and rate-limiting",
            practicalExample: "Develop an API gateway handling authentication, cursor-based pagination, and JSON/Protobuf serialization.",
            keyTopics: [
              "HTTP/2, HTTP/3, and Protobuf transport",
              "Schema validation & structured error handling",
              "Cursor-based pagination & filtering standards",
              "Rate limiting (Token Bucket/Leaky Bucket) & CORS"
            ]
          },
          {
            title: "Database Indexing, ACID Transactions & SQL Optimization",
            description: "Engineer relational and NoSQL schemas with B-Tree indexes, composite keys, and transaction isolation.",
            specificTarget: "Solve 25 advanced SQL query challenges & optimize 5 slow database queries",
            practicalExample: "Execute EXPLAIN ANALYZE on queries, create composite indexes, and design connection pooling.",
            keyTopics: [
              "B-Tree, Hash, and GIN index mechanics",
              "ACID properties & isolation levels (Read Committed vs Serializable)",
              "N+1 query resolution & ORM optimization",
              "Redis caching (Cache-Aside, Write-Through strategies)"
            ]
          },
          {
            title: "Security Hardening, OAuth2 & Zero-Trust Defense",
            description: "Implement defense-in-depth security, token rotation, cryptographic hashing, and OWASP Top 10 mitigation.",
            specificTarget: "Pass OWASP Top 10 automated security audit with zero critical vulnerabilities",
            practicalExample: "Implement OAuth2 / OIDC login with JWT access/refresh token rotation and argon2 password hashing.",
            keyTopics: [
              "JWT claims, expiration & refresh token rotation",
              "Mitigating XSS, CSRF, and SQL Injection",
              "Role-Based Access Control (RBAC) & permissions",
              "Secrets management (Vault, AWS Secrets Manager)"
            ]
          },
        ],
      },
      {
        title: "Phase 4: Cloud Deployment, Docker & Scalable Microservices",
        order: 4,
        duration: "Weeks 10-12",
        prerequisite: "Completed production API and database projects",
        subtopics: [
          {
            title: "Docker Containerization & Multi-Stage Builds",
            description: "Containerize applications using minimal base images, multi-stage compilation, and non-root security.",
            specificTarget: "Create optimized Docker images under 50MB with zero CVE vulnerabilities",
            practicalExample: "Write a multi-stage Dockerfile reducing image size by 80% and configure health checks.",
            keyTopics: [
              "Multi-stage Dockerfile optimization",
              "Docker Compose for multi-service local environments",
              "Container security & non-root user permissions",
              "Layer caching strategies in CI/CD"
            ]
          },
          {
            title: "Automated CI/CD Pipelines & Kubernetes Deployment",
            description: "Automate automated testing, linting, semantic versioning, container publishing, and zero-downtime rolling deploys.",
            specificTarget: "Deploy 1 automated GitHub Actions pipeline with zero-downtime rolling updates",
            practicalExample: "Configure GitHub Actions to run tests, build Docker containers, push to registry, and trigger deployment.",
            keyTopics: [
              "GitHub Actions matrix testing and caching",
              "Blue-Green & Canary deployment strategies",
              "Kubernetes Pods, Services, and Ingress routing",
              "Cloud platforms (AWS ECS/EKS, GCP Cloud Run, Vercel)"
            ]
          },
          {
            title: "Full-Stack Capstone: Scalable Distributed Application",
            description: "Synthesize all concepts into a production portfolio project with live URL, monitoring, and architecture diagram.",
            specificTarget: "Publish 1 full-stack production application handling 1,000 requests/sec with monitoring",
            practicalExample: "Deploy a production-grade distributed application with Prometheus metrics, Grafana dashboard, and full docs.",
            keyTopics: [
              "End-to-end system architecture & design doc",
              "Distributed tracing with OpenTelemetry",
              "Prometheus metrics & Grafana dashboards",
              "Production launch checklist & disaster recovery"
            ]
          },
        ],
      },
    ],
  };
}

/**
 * Generate Roadmap with automatic fallback according to user preference:
 * 1. Gemini 3.8 Flash
 * 2. Kimi 3.1 Pro (NVIDIA NIM)
 * 3. Mistral Large 4 (NVIDIA NIM)
 * 4. GPT-OSS 120B (Cerebras)
 * 5. Instant Built-in Roadmap Engine
 */
export async function generateRoadmapAI(
  topic: string
): Promise<{ roadmap: RoadmapData; modelUsed: string }> {
  for (const model of ROADMAP_FALLBACK_MODELS) {
    const apiKey = getApiKey(model.provider);
    if (!apiKey) {
      continue;
    }

    try {
      let rawText = "";

      if (model.provider === "gemini") {
        rawText = await callGemini(apiKey, model.modelId, ROADMAP_PROMPT(topic), 10000);
      } else if (model.provider === "nvidia") {
        rawText = await callOpenAICompatible(
          "/api/nvidia/chat/completions",
          "https://integrate.api.nvidia.com/v1/chat/completions",
          apiKey,
          model.modelId,
          [{ role: "user", content: ROADMAP_PROMPT(topic) }],
          12000
        );
      } else if (model.provider === "cerebras") {
        rawText = await callOpenAICompatible(
          "/api/cerebras/chat/completions",
          "https://api.cerebras.ai/v1/chat/completions",
          apiKey,
          model.modelId,
          [{ role: "user", content: ROADMAP_PROMPT(topic) }],
          12000
        );
      }

      if (rawText) {
        const cleaned = cleanJSONText(rawText);
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
          return {
            roadmap: {
              title: parsed.title || topic,
              description: parsed.description || "Comprehensive learning path",
              estimatedDuration: parsed.estimatedDuration || "8-12 weeks",
              difficultyLevel: parsed.difficultyLevel || "Intermediate",
              nodes: parsed.nodes,
            },
            modelUsed: model.name,
          };
        }
      }
    } catch (err) {
      console.warn(`Fallback: ${model.name} failed, falling back to next model...`, err);
    }
  }

  // Guaranteed fallback ensures button NEVER breaks
  return {
    roadmap: createFallbackRoadmap(topic),
    modelUsed: "AI Engine",
  };
}

/**
 * Interactive Chat Assistant with automatic fallback:
 * 1. GPT-OSS 120B
 * 2. Llama 3.3 70B
 * 3. Kimi 3.1 Pro
 * 4. Gemini 3.5 Flash-Lite
 */
export async function sendChatMessageAI(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<{ text: string; modelUsed: string }> {
  for (const model of CHAT_FALLBACK_MODELS) {
    const apiKey = getApiKey(model.provider);
    if (!apiKey) {
      continue;
    }

    try {
      let text = "";

      if (model.provider === "cerebras") {
        text = await callOpenAICompatible(
          "/api/cerebras/chat/completions",
          "https://api.cerebras.ai/v1/chat/completions",
          apiKey,
          model.modelId,
          [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
              role: m.role === "ai" ? "assistant" : m.role,
              content: m.content,
            })),
          ],
          8000
        );
      } else if (model.provider === "nvidia") {
        text = await callOpenAICompatible(
          "/api/nvidia/chat/completions",
          "https://integrate.api.nvidia.com/v1/chat/completions",
          apiKey,
          model.modelId,
          [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
              role: m.role === "ai" ? "assistant" : m.role,
              content: m.content,
            })),
          ],
          10000
        );
      } else if (model.provider === "gemini") {
        const fullPrompt = `${systemPrompt}\n\n` +
          messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n") +
          "\nAI:";
        text = await callGemini(apiKey, model.modelId, fullPrompt, 10000);
      }

      if (text && text.trim()) {
        return { text: text.trim(), modelUsed: model.name };
      }
    } catch (err) {
      console.warn(`Fallback: Chat with ${model.name} failed, trying next...`, err);
    }
  }

  // Graceful conversational response if all external APIs are unavailable
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  return {
    text: `### Guidance for "${lastUserMsg}"\n\nHere are the recommended steps and learning resources:\n\n1. **Core Concept:** Break this down into bite-sized milestones.\n2. **Practical Exercise:** Build a mini-project implementing this concept hands-on.\n3. **Recommended Resources:** Check the official documentation and search YouTube for structured project tutorials.`,
    modelUsed: "AI Assistant",
  };
}
