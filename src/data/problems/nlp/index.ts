import type { Problem } from "@/types/problem";
import { problems as p01 } from "./part-01";
import { problems as p02 } from "./part-02";
import { problems as p03 } from "./part-03";
import { problems as p04 } from "./part-04";
import { problems as p05 } from "./part-05";

export const nlpProblems: Problem[] = [
  ...p01,
  ...p02,
  ...p03,
  ...p04,
  ...p05,
];
