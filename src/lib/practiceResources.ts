export interface PracticeResource {
  label: string;
  url: string;
  type: "practice" | "docs" | "tutorial" | "playground";
  description: string;
}

export interface PracticeDirection {
  category: "dsa" | "frontend" | "backend" | "database" | "devops" | "ml" | "general";
  platformName: string;
  platformBadge: string;
  directionText: string;
  concreteSteps: string[];
  resources: PracticeResource[];
}

/**
 * Clean up topic string for search queries and display
 */
export function cleanTopicName(topic: string): string {
  return topic
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/^(foundations? of|introduction to|learn|basics? of)\s*/i, "")
    .replace(/^step\s*\d+(\.\d+)?:\s*/i, "")
    .trim();
}

/**
 * Intelligent resolver that generates specific practice directions and direct platform links
 * based on the topic keywords (DSA, Frontend, Database, DevOps, ML, Backend, etc.)
 */
export function getPracticeDirections(
  topicTitle: string,
  parentDescription?: string,
  specificTarget?: string
): PracticeDirection {
  const clean = cleanTopicName(topicTitle);
  const lower = (topicTitle + " " + (parentDescription || "") + " " + (specificTarget || "")).toLowerCase();

  // 1. Data Structures & Algorithms / Problem Solving
  const isDSA =
    lower.includes("dsa") ||
    lower.includes("algorithm") ||
    lower.includes("string") ||
    lower.includes("array") ||
    lower.includes("two pointer") ||
    lower.includes("sliding window") ||
    lower.includes("binary search") ||
    lower.includes("linked list") ||
    lower.includes("tree") ||
    lower.includes("bst") ||
    lower.includes("graph") ||
    lower.includes("dfs") ||
    lower.includes("bfs") ||
    lower.includes("heap") ||
    lower.includes("priority queue") ||
    lower.includes("backtrack") ||
    lower.includes("dynamic programming") ||
    lower.includes("dp") ||
    lower.includes("greedy") ||
    lower.includes("bit manipulation") ||
    lower.includes("leetcode") ||
    lower.includes("recursion") ||
    lower.includes("sorting") ||
    lower.includes("trie") ||
    lower.includes("stack") ||
    lower.includes("queue") ||
    lower.includes("hashmap") ||
    lower.includes("hash table");

  if (isDSA) {
    const searchParam = encodeURIComponent(clean);
    return {
      category: "dsa",
      platformName: "LeetCode & NeetCode",
      platformBadge: "LeetCode / NeetCode",
      directionText: `Go to LeetCode or NeetCode.io, filter the problemset by the "${clean}" tag, and practice 20–30 problems. Start with 8–10 Easy questions to master edge cases (e.g. empty inputs, single element, case sensitivity), then advance to 10–15 Medium questions focusing on optimal time & space complexity constraints.`,
      concreteSteps: [
        `Solve 8–10 Easy problems on LeetCode under the "${clean}" topic to master syntax and edge cases`,
        `Solve 10–15 Medium problems focusing on O(N) / O(log N) time and O(1) / O(N) space complexity`,
        "Attempt each problem for at least 20 minutes before looking at discussion hints or NeetCode video walkthroughs",
      ],
      resources: [
        {
          label: `LeetCode ${clean} Problems`,
          url: `https://leetcode.com/problemset/?search=${searchParam}`,
          type: "practice",
          description: "Curated problemset filtered for this topic with acceptance rates and solutions.",
        },
        {
          label: "NeetCode Practice Roadmap",
          url: "https://neetcode.io/practice",
          type: "practice",
          description: "Structured coding interview roadmap with video walkthroughs in Python, Java, C++, JS.",
        },
        {
          label: `GeeksforGeeks ${clean} Practice`,
          url: `https://www.geeksforgeeks.org/explore?page=1&sortBy=sub-submissions&searchTerm=${searchParam}`,
          type: "practice",
          description: "Interactive coding drills with editorial explanations and time complexity analysis.",
        },
        {
          label: `YouTube ${clean} Solutions & Explanations`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + " leetcode tutorial neetcode")}`,
          type: "tutorial",
          description: "Step-by-step video explanations of top questions and optimal algorithms.",
        },
      ],
    };
  }

  // 2. Database & SQL
  const isDatabase =
    lower.includes("sql") ||
    lower.includes("postgres") ||
    lower.includes("mysql") ||
    lower.includes("mongodb") ||
    lower.includes("database") ||
    lower.includes("indexing") ||
    lower.includes("acid") ||
    lower.includes("transaction") ||
    lower.includes("redis") ||
    lower.includes("prisma") ||
    lower.includes("orm") ||
    lower.includes("schema") ||
    lower.includes("query optimization");

  if (isDatabase) {
    const searchParam = encodeURIComponent(clean);
    return {
      category: "database",
      platformName: "LeetCode Database & SQLZoo",
      platformBadge: "LeetCode Database / SQLZoo",
      directionText: `Go to LeetCode Database or SQLZoo, select the "${clean}" section, and write 15–20 queries. Practice complex multi-table JOINs, GROUP BY aggregations, and window functions. Test execution plans with EXPLAIN ANALYZE on a local database to verify index usage.`,
      concreteSteps: [
        `Solve 15 SQL query challenges on SQLZoo & LeetCode Database for "${clean}"`,
        "Write schemas with primary/foreign keys and composite B-Tree indexes",
        "Run EXPLAIN ANALYZE on queries to verify query execution efficiency and index scans",
      ],
      resources: [
        {
          label: "LeetCode Database Challenges",
          url: "https://leetcode.com/problemset/database/",
          type: "practice",
          description: "Real-world database schema challenges, window functions, and SQL query optimizations.",
        },
        {
          label: "SQLZoo Interactive Tutorials",
          url: "https://sqlzoo.net/",
          type: "practice",
          description: "Step-by-step interactive SQL exercises with instant in-browser feedback.",
        },
        {
          label: `PostgreSQL Docs: ${clean}`,
          url: `https://www.postgresql.org/docs/current/search.html?q=${searchParam}`,
          type: "docs",
          description: "Official PostgreSQL documentation covering syntax, performance, and best practices.",
        },
        {
          label: `YouTube ${clean} Database Tutorials`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + " database sql tutorial")}`,
          type: "tutorial",
          description: "High-definition video courses on query design, indexing, and performance tuning.",
        },
      ],
    };
  }

  // 3. Frontend & UI Development
  const isFrontend =
    lower.includes("react") ||
    lower.includes("next.js") ||
    lower.includes("nextjs") ||
    lower.includes("vue") ||
    lower.includes("angular") ||
    lower.includes("css") ||
    lower.includes("tailwind") ||
    lower.includes("html") ||
    lower.includes("javascript") ||
    lower.includes("typescript") ||
    lower.includes("dom") ||
    lower.includes("redux") ||
    lower.includes("state management") ||
    lower.includes("frontend") ||
    lower.includes("ui") ||
    lower.includes("component") ||
    lower.includes("flexbox") ||
    lower.includes("grid") ||
    lower.includes("accessibility") ||
    lower.includes("a11y");

  if (isFrontend) {
    const searchParam = encodeURIComponent(clean);
    return {
      category: "frontend",
      platformName: "MDN Web Docs & Frontend Mentor",
      platformBadge: "MDN / Frontend Mentor / StackBlitz",
      directionText: `Read the official documentation and MDN guides for "${clean}". Then open Frontend Mentor, StackBlitz, or a local sandbox to build an interactive component from scratch. Focus on clean component architecture, responsive mobile/desktop layouts, and accessibility standards.`,
      concreteSteps: [
        `Read core MDN and framework documentation for "${clean}"`,
        "Build 1 isolated interactive component on StackBlitz or CodeSandbox from scratch",
        "Complete a responsive challenge on Frontend Mentor implementing this feature with a11y checks",
      ],
      resources: [
        {
          label: `MDN Web Docs: ${clean}`,
          url: `https://developer.mozilla.org/en-US/search?q=${searchParam}`,
          type: "docs",
          description: "The gold standard for modern web standards, API specs, and interactive examples.",
        },
        {
          label: "Frontend Mentor Real-world Challenges",
          url: "https://www.frontendmentor.io/challenges",
          type: "practice",
          description: "Professional UI challenges with Figma design files to test real-world frontend skills.",
        },
        {
          label: "StackBlitz Instant Web Playground",
          url: "https://stackblitz.com/fork/react",
          type: "playground",
          description: "Instant in-browser Vite/React environment with full Node.js WebContainer runtime.",
        },
        {
          label: `YouTube ${clean} Masterclass`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + " full course tutorial")}`,
          type: "tutorial",
          description: "Comprehensive project-based tutorials and production best practices.",
        },
      ],
    };
  }

  // 4. Cloud, DevOps, Docker & Kubernetes
  const isDevOps =
    lower.includes("docker") ||
    lower.includes("kubernetes") ||
    lower.includes("k8s") ||
    lower.includes("devops") ||
    lower.includes("aws") ||
    lower.includes("gcp") ||
    lower.includes("azure") ||
    lower.includes("terraform") ||
    lower.includes("ci/cd") ||
    lower.includes("github actions") ||
    lower.includes("pipeline") ||
    lower.includes("linux") ||
    lower.includes("bash") ||
    lower.includes("shell") ||
    lower.includes("container") ||
    lower.includes("nginx") ||
    lower.includes("cloud") ||
    lower.includes("deploy");

  if (isDevOps) {
    const searchParam = encodeURIComponent(clean);
    return {
      category: "devops",
      platformName: "Killercoda & Docker Playground",
      platformBadge: "Killercoda / Docker Labs",
      directionText: `Go to Killercoda or Play with Docker for zero-setup browser labs. Practice writing multi-stage Dockerfiles, managing container networks, configuring CI/CD pipelines, and deploying to Kubernetes clusters. Test edge cases by simulating container restarts and resource limits.`,
      concreteSteps: [
        `Complete 2–3 interactive scenarios on Killercoda for "${clean}"`,
        "Write an optimized multi-stage configuration file and build a minimal container under 50MB",
        "Configure an automated GitHub Actions CI pipeline with linting, build, and automated tests",
      ],
      resources: [
        {
          label: "Killercoda Interactive Cloud Labs",
          url: "https://killercoda.com/",
          type: "practice",
          description: "Free interactive Kubernetes, Linux, and Docker environments in your browser.",
        },
        {
          label: `Docker Official Reference: ${clean}`,
          url: `https://docs.docker.com/search/?q=${searchParam}`,
          type: "docs",
          description: "Official containerization guides, CLI flags, and production best practices.",
        },
        {
          label: "Play with Docker Browser Environment",
          url: "https://labs.play-with-docker.com/",
          type: "playground",
          description: "Free browser-based Docker playground to run multi-node clusters instantly.",
        },
        {
          label: `YouTube ${clean} DevOps Tutorials`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + " devops hands on tutorial")}`,
          type: "tutorial",
          description: "Hands-on terminal demonstrations, cloud setups, and real architecture walkthroughs.",
        },
      ],
    };
  }

  // 5. Machine Learning & AI
  const isML =
    lower.includes("python") ||
    lower.includes("pytorch") ||
    lower.includes("tensorflow") ||
    lower.includes("machine learning") ||
    lower.includes("ml") ||
    lower.includes("deep learning") ||
    lower.includes("nlp") ||
    lower.includes("computer vision") ||
    lower.includes("cv") ||
    lower.includes("pandas") ||
    lower.includes("numpy") ||
    lower.includes("scikit") ||
    lower.includes("sklearn") ||
    lower.includes("data science") ||
    lower.includes("llm") ||
    lower.includes("huggingface") ||
    lower.includes("ai") ||
    lower.includes("transformer");

  if (isML) {
    const searchParam = encodeURIComponent(clean);
    return {
      category: "ml",
      platformName: "Kaggle & Google Colab",
      platformBadge: "Kaggle / Google Colab / Hugging Face",
      directionText: `Go to Kaggle or open Google Colab. Find a community dataset or competition related to "${clean}", perform exploratory data analysis (EDA), and train a baseline model from scratch before tuning hyperparameters and validating performance metrics.`,
      concreteSteps: [
        `Run 1 exploratory analysis notebook on Kaggle / Colab on "${clean}"`,
        "Implement the model architecture and evaluate precision, recall, and F1-score",
        "Benchmark against standard open-source models on Hugging Face",
      ],
      resources: [
        {
          label: `Kaggle Datasets & Notebooks: ${clean}`,
          url: `https://www.kaggle.com/search?q=${searchParam}`,
          type: "practice",
          description: "Thousands of public notebooks, competitions, and datasets to train models.",
        },
        {
          label: "Google Colab Free GPU Notebook",
          url: "https://colab.research.google.com/",
          type: "playground",
          description: "Free cloud-hosted Jupyter notebook with GPU acceleration for training models.",
        },
        {
          label: `Papers with Code: ${clean}`,
          url: `https://paperswithcode.com/search?q=${searchParam}`,
          type: "docs",
          description: "Latest research papers paired with verified GitHub implementations and benchmarks.",
        },
        {
          label: `YouTube ${clean} ML Tutorials`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + " python machine learning tutorial")}`,
          type: "tutorial",
          description: "In-depth code walkthroughs from leading AI researchers and engineers.",
        },
      ],
    };
  }

  // 6. Backend, APIs & Server Architecture
  const isBackend =
    lower.includes("node") ||
    lower.includes("express") ||
    lower.includes("nestjs") ||
    lower.includes("fastapi") ||
    lower.includes("django") ||
    lower.includes("flask") ||
    lower.includes("go") ||
    lower.includes("golang") ||
    lower.includes("spring") ||
    lower.includes("backend") ||
    lower.includes("rest") ||
    lower.includes("api") ||
    lower.includes("graphql") ||
    lower.includes("grpc") ||
    lower.includes("auth") ||
    lower.includes("oauth") ||
    lower.includes("jwt") ||
    lower.includes("microservice");

  if (isBackend) {
    const searchParam = encodeURIComponent(clean);
    return {
      category: "backend",
      platformName: "Postman & GitHub Best Practices",
      platformBadge: "Postman / DevDocs / GitHub",
      directionText: `Build a standalone backend API service implementing "${clean}". Create clean route controllers, validation middleware, and database access. Use Postman or curl to test all success and error status codes (200, 400, 401, 403, 404, 500) and implement JWT/OAuth protection.`,
      concreteSteps: [
        `Build 1 REST/GraphQL service with input validation and error handling for "${clean}"`,
        "Test endpoints with automated Postman or integration test suites",
        "Implement authentication, rate limiting, and structured logging",
      ],
      resources: [
        {
          label: `DevDocs API Reference: ${clean}`,
          url: `https://devdocs.io/#q=${searchParam}`,
          type: "docs",
          description: "Fast, offline-capable technical documentation for all major backend languages and frameworks.",
        },
        {
          label: "Postman API Network & Testing",
          url: "https://www.postman.com/explore",
          type: "practice",
          description: "Explore public API collections and test automated endpoint workflows.",
        },
        {
          label: `GitHub ${clean} Best Practices`,
          url: `https://github.com/search?q=${encodeURIComponent(clean + " best practices")}&type=repositories`,
          type: "docs",
          description: "Production repositories and design templates vetted by the developer community.",
        },
        {
          label: `YouTube ${clean} Backend Guides`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + " backend api tutorial")}`,
          type: "tutorial",
          description: "Full-stack and backend architectural walkthroughs from industry practitioners.",
        },
      ],
    };
  }

  // 7. General Software Engineering / Programming
  const searchParam = encodeURIComponent(clean);
  return {
    category: "general",
    platformName: "DevDocs & GitHub Community",
    platformBadge: "DevDocs / GitHub",
    directionText: `Consult the technical documentation for "${clean}". Set up a local test environment, create 2–3 practical exercises covering edge cases, and write unit tests to verify your implementation.`,
    concreteSteps: [
      `Read syntax and API specifications on DevDocs for "${clean}"`,
      "Build 1 end-to-end working implementation locally with test coverage",
      "Write automated test cases verifying error conditions and edge inputs",
    ],
    resources: [
      {
        label: `DevDocs Reference: ${clean}`,
        url: `https://devdocs.io/#q=${searchParam}`,
        type: "docs",
        description: "Comprehensive, searchable API references and language specifications.",
      },
      {
        label: `GitHub Open Source Repos: ${clean}`,
        url: `https://github.com/search?q=${searchParam}&type=repositories`,
        type: "practice",
        description: "Real-world codebases, open-source utilities, and architectural examples.",
      },
      {
        label: `YouTube ${clean} Complete Walkthrough`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + " tutorial full course")}`,
        type: "tutorial",
        description: "Hands-on video lessons and concept breakdowns from top instructors.",
      },
    ],
  };
}
