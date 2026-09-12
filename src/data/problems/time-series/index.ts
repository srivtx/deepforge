import type { Problem } from "@/types/problem";
import { problems as p01 } from "./part-01";
import { problems as p02 } from "./part-02";
import { problems as p03 } from "./part-03";
import { problems as p04 } from "./part-04";
import { problems as p05 } from "./part-05";
import { problems as p06 } from "./part-06";
import { problems as p07 } from "./part-07";

export const timeSeriesProblems: Problem[] = [
  ...p01,
  ...p02,
  ...p03,
  ...p04,
  ...p05,
  ...p06,
  ...p07,
];
