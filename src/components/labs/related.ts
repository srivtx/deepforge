export interface LabRelated {
  category: string;
  problems: string[];
}

export const LAB_RELATED: Record<string, LabRelated> = {
  "lab-01": {
    category: "ML Fundamentals",
    problems: ["ml-002", "ml-103", "ml-014"],
  },
  "lab-02": {
    category: "NLP",
    problems: ["nlp-002", "nlp-003", "ml-009"],
  },
  "lab-03": {
    category: "ML Fundamentals",
    problems: ["ml-001", "ml-011", "st-341"],
  },
  "lab-04": {
    category: "ML Fundamentals",
    problems: ["ml-085", "ml-162", "ml-051"],
  },
  "lab-05": {
    category: "ML Fundamentals",
    problems: ["ml-003", "ml-032", "ml-145"],
  },
  "lab-06": {
    category: "ML Fundamentals",
    problems: ["ml-009", "ml-239", "ml-048"],
  },
  "lab-07": {
    category: "Statistics",
    problems: ["st-341", "st-342", "st-354"],
  },
  "lab-08": {
    category: "Deep Learning",
    problems: ["dl-004", "dl-005", "ml-117"],
  },
};

export function getLabRelated(labId: string): LabRelated | undefined {
  return LAB_RELATED[labId];
}
