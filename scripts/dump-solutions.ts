// Dump all problems as JSON lines for the batch test runner.
import { PROBLEMS } from "../src/data/problems";
for (const p of PROBLEMS) {
  process.stdout.write(
    JSON.stringify({ id: p.id, title: p.title, solution: p.solution }) + "\n",
  );
}
