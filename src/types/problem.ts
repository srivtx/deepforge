export type Difficulty = "Easy" | "Medium" | "Hard";

export type Category =
  | "Linear Algebra"
  | "Calculus"
  | "Statistics"
  | "Probability"
  | "ML Fundamentals"
  | "Deep Learning"
  | "NLP"
  | "Optimization"
  | "Algorithms"
  | "Data Structures";

export interface TestCase {
  /** Positional arguments to the user's function (JSON-serializable). */
  input: any[];
  /** Expected return value (JSON-serializable). */
  expected: any;
}

export interface Problem {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  description: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  hint?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  problemIds: string[];
  estimatedHours: number;
}

export interface CategoryMeta {
  name: Category;
  blurb: string;
  icon: string;
}
