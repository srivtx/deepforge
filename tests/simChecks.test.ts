import { describe, expect, test } from "bun:test";
import {
  checkAnswer,
  dijkstraQuestions,
  neuralNetQuestions,
  optimizerQuestions,
  type SimCheckQuestion,
} from "@/lib/simChecks";

const SIMS = [
  { name: "dijkstra", prefix: "dj-", build: dijkstraQuestions },
  { name: "optimizer", prefix: "opt-", build: optimizerQuestions },
  { name: "neural-net", prefix: "nn-", build: neuralNetQuestions },
] as const;

const ALL = SIMS.flatMap((sim) => sim.build());

function byId(questions: SimCheckQuestion[], id: string): SimCheckQuestion {
  const found = questions.find((question) => question.id === id);
  if (!found) throw new Error(`missing question ${id}`);
  return found;
}

function answerOf(question: SimCheckQuestion): string {
  return question.choices[question.answerIndex];
}

describe("determinism", () => {
  test("two builds are deep-equal for every sim", () => {
    expect(dijkstraQuestions()).toEqual(dijkstraQuestions());
    expect(optimizerQuestions()).toEqual(optimizerQuestions());
    expect(neuralNetQuestions()).toEqual(neuralNetQuestions());
  });

  test("a non-default optimizer lr is stable too", () => {
    expect(optimizerQuestions(0.5)).toEqual(optimizerQuestions(0.5));
    expect(optimizerQuestions(0.02)).toEqual(optimizerQuestions(0.02));
  });
});

describe("structure", () => {
  test("every question has 2-4 distinct choices and a valid correct index", () => {
    expect(ALL.length).toBeGreaterThan(0);
    for (const question of ALL) {
      expect(question.choices.length, question.id).toBeGreaterThanOrEqual(2);
      expect(question.choices.length, question.id).toBeLessThanOrEqual(4);
      expect(new Set(question.choices).size, question.id).toBe(question.choices.length);
      expect(question.answerIndex, question.id).toBeGreaterThanOrEqual(0);
      expect(question.answerIndex, question.id).toBeLessThan(question.choices.length);
      expect(question.prompt.trim().length, question.id).toBeGreaterThan(0);
      expect(question.explain.trim().length, question.id).toBeGreaterThan(0);
    }
  });

  test("each sim offers 3-5 questions with unique ids", () => {
    for (const sim of SIMS) {
      const questions = sim.build();
      expect(questions.length, sim.name).toBeGreaterThanOrEqual(3);
      expect(questions.length, sim.name).toBeLessThanOrEqual(5);
      expect(new Set(questions.map((q) => q.id)).size, sim.name).toBe(questions.length);
    }
  });

  test("no question leaks across sims", () => {
    const owners = new Map<string, string>();
    const prompts = new Set<string>();
    for (const sim of SIMS) {
      for (const question of sim.build()) {
        expect(question.id.startsWith(sim.prefix), question.id).toBe(true);
        expect(owners.get(question.id), `${question.id} also in ${sim.name}`).toBeUndefined();
        owners.set(question.id, sim.name);
        expect(prompts.has(question.prompt), question.prompt).toBe(false);
        prompts.add(question.prompt);
      }
    }
  });
});

describe("checkAnswer", () => {
  test("accepts only the correct index", () => {
    for (const question of ALL) {
      expect(checkAnswer(question, question.answerIndex)).toBe(true);
      for (let i = 0; i < question.choices.length; i++) {
        if (i !== question.answerIndex) expect(checkAnswer(question, i), question.id).toBe(false);
      }
      expect(checkAnswer(question, -1)).toBe(false);
      expect(checkAnswer(question, question.choices.length)).toBe(false);
    }
  });
});

describe("Dijkstra answers match the fixed graph", () => {
  // Finalization order: A C B F E H D G I J; distances A0 B4 C2 D11 E8 F4 G12 H10 I13 J18.
  test("finalization questions", () => {
    const questions = dijkstraQuestions();
    expect(answerOf(byId(questions, "dj-next-after-start"))).toBe("C");
    expect(answerOf(byId(questions, "dj-third-finalized"))).toBe("B");
    expect(answerOf(byId(questions, "dj-last-finalized"))).toBe("J");
  });

  test("shortest-distance questions", () => {
    const questions = dijkstraQuestions();
    expect(answerOf(byId(questions, "dj-distance-d"))).toBe("11");
    expect(answerOf(byId(questions, "dj-distance-g"))).toBe("12");
  });
});

describe("optimizer answers match the fixed surface", () => {
  test("loss comparisons at the default lr", () => {
    const questions = optimizerQuestions();
    expect(answerOf(byId(questions, "opt-momentum-vs-sgd-20"))).toBe("Momentum");
    expect(answerOf(byId(questions, "opt-adagrad-vs-rmsprop-200"))).toBe("RMSProp");
    expect(answerOf(byId(questions, "opt-lowest-after-50"))).toBe("Nesterov");
  });

  test("convergence comparisons at the default lr", () => {
    const questions = optimizerQuestions();
    expect(answerOf(byId(questions, "opt-converge-sgd-vs-adam"))).toBe("Adam");
    expect(answerOf(byId(questions, "opt-converge-momentum-vs-nesterov"))).toBe("Nesterov");
  });
});

describe("neural net answers match the fixed fixtures", () => {
  // Seeded nets from makeNet(h, 1337), trained 200 epochs at lr 0.5.
  test("capacity questions", () => {
    const questions = neuralNetQuestions();
    expect(answerOf(byId(questions, "nn-xor-8-hidden"))).toBe("Yes");
    expect(answerOf(byId(questions, "nn-xor-2-hidden"))).toBe("No");
    expect(answerOf(byId(questions, "nn-circles-2-hidden"))).toBe("No");
  });

  test("parameter and point-count questions", () => {
    const questions = neuralNetQuestions();
    expect(answerOf(byId(questions, "nn-parameter-count"))).toBe("25");
    expect(answerOf(byId(questions, "nn-fewest-points"))).toBe("XOR quadrants");
  });
});
