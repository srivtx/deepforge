/**
 * Curated certification tracks: short, ordered programs assembled from real
 * paths, collections, labs, projects, interview mocks, and research
 * challenges. Unlike a single milestone, a track gives a learner a route to
 * follow from day one — the certificates page shows every step with live
 * progress and the first unfinished step to pick up next.
 *
 * Every `id` is a real record in the matching data module:
 *   path       → src/data/problems/paths.ts (LEARNING_PATHS)
 *   collection → src/data/collections.ts (PREMADE_COLLECTIONS)
 *   lab        → src/data/labs.ts (LABS)
 *   project    → src/data/projects.ts (PROJECTS)
 *   interview  → src/data/interview.ts (INTERVIEW_TRACKS)
 *   research   → src/data/research.ts (RESEARCH_CHALLENGES)
 *
 * Steps run foundational → applied. Track problem loads stay near a few
 * dozen problems by preferring curated collections (12–20 problems) over
 * full category milestones.
 */

export type CertTrackStepKind =
  | "path"
  | "collection"
  | "lab"
  | "project"
  | "interview"
  | "research";

export interface CertTrackStep {
  kind: CertTrackStepKind;
  id: string;
  note?: string;
}

export interface CertTrack {
  id: string;
  title: string;
  blurb: string;
  level: "foundation" | "practitioner" | "specialist";
  outcome: string;
  steps: CertTrackStep[];
}

export const CERT_TRACKS: CertTrack[] = [
  {
    id: "ml-foundations",
    title: "Machine Learning Foundations",
    blurb:
      "The starting sequence: the vector and matrix intuition every model assumes, closed with your first scored lab.",
    level: "foundation",
    outcome:
      "43 curated problems solved and Logistic Regression passing at its 0.85 accuracy target.",
    steps: [
      {
        kind: "path",
        id: "math-foundations",
        note: "Vectors, matrix products, statistics, probability, and calculus — 25 problems.",
      },
      {
        kind: "collection",
        id: "linear-algebra-crash-course",
        note: "The matrix core as one focused 18-problem run.",
      },
      {
        kind: "lab",
        id: "lab-01",
        note: "Take a classifier you write onto held-out rows.",
      },
    ],
  },
  {
    id: "ml-practitioner",
    title: "Machine Learning Practitioner",
    blurb:
      "Build the classic models from scratch, tune the update rules, and ship a framework with your name on it.",
    level: "practitioner",
    outcome:
      "40 problems, the credit-default lab at 0.85 F1, and a working neural network framework.",
    steps: [
      {
        kind: "path",
        id: "ml-from-scratch",
        note: "Regression, k-NN, trees, naive Bayes, and PCA — 28 problems.",
      },
      {
        kind: "collection",
        id: "optimizers-deep-dive",
        note: "Every update rule from SGD to the adaptive methods.",
      },
      {
        kind: "lab",
        id: "lab-06",
        note: "Catch defaulters on held-out rows.",
      },
      {
        kind: "project",
        id: "nn-framework",
        note: "Turn the forward passes and gradients into an autograd engine.",
      },
    ],
  },
  {
    id: "deep-learning-specialist",
    title: "Deep Learning Specialist",
    blurb:
      "From backprop by hand to a transformer, closed by assembling a GPT from the building blocks you implemented.",
    level: "specialist",
    outcome:
      "39 problems, the XOR boundary lab, and a transformer built from scratch.",
    steps: [
      {
        kind: "path",
        id: "deep-learning-essentials",
        note: "Activations, tokenization, backprop, and attention — 27 problems.",
      },
      {
        kind: "collection",
        id: "backprop-from-scratch",
        note: "Gradients through the loss as one run.",
      },
      {
        kind: "lab",
        id: "lab-08",
        note: "Break the linear boundary on XOR.",
      },
      {
        kind: "project",
        id: "gpt",
        note: "Assemble a working transformer end to end.",
      },
    ],
  },
  {
    id: "llm-nlp-engineer",
    title: "LLM & NLP Engineer",
    blurb:
      "The modern language-model pipeline, a frontier-lab interview screen, and a research baseline to beat.",
    level: "specialist",
    outcome:
      "The LLM pipeline, the spam-filter lab, a DeepMind-style mock at 80%, and every research baseline beaten.",
    steps: [
      {
        kind: "collection",
        id: "modern-llm-pipeline",
        note: "Tokenization, attention, and serving in one set.",
      },
      {
        kind: "lab",
        id: "lab-02",
        note: "Ship a spam filter at 0.85 F1.",
      },
      {
        kind: "interview",
        id: "google-deepmind",
        note: "Research-scientist style mock problems.",
      },
      {
        kind: "research",
        id: "mini-language-model",
        note: "Beat every research baseline, the language model included.",
      },
    ],
  },
  {
    id: "rl-reasoning",
    title: "Reinforcement Learning & Reasoning",
    blurb:
      "Agents that learn by acting, from returns and TD updates to policy gradients, checked against a frontier-lab mock.",
    level: "specialist",
    outcome:
      "24 problems, the noisy-quadratic lab at R² 0.88, and 80% on an OpenAI-style mock.",
    steps: [
      {
        kind: "collection",
        id: "reinforcement-learning-foundations",
        note: "Returns, value iteration, TD, SARSA, and REINFORCE.",
      },
      {
        kind: "collection",
        id: "policy-gradients-to-ppo",
        note: "Policy gradients through PPO as one run.",
      },
      {
        kind: "lab",
        id: "lab-04",
        note: "Fit the noisy quadratic at R² 0.88.",
      },
      {
        kind: "interview",
        id: "openai",
        note: "Research-engineer style mock problems.",
      },
    ],
  },
  {
    id: "math-for-ml",
    title: "Mathematics for Machine Learning",
    blurb:
      "Calculus and probability computed numerically, so the formulas behind optimization and backprop stop being magic.",
    level: "foundation",
    outcome:
      "44 problems across calculus and probability, plus the house-price regression lab.",
    steps: [
      {
        kind: "path",
        id: "calculus-for-ml",
        note: "Gradients, Jacobians, Hessians, and ODEs — 24 problems.",
      },
      {
        kind: "collection",
        id: "probability-statistics-core",
        note: "Counting through Bayes and the limit theorems.",
      },
      {
        kind: "lab",
        id: "lab-03",
        note: "Fit house prices under the MSE target.",
      },
    ],
  },
];
