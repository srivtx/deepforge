#!/usr/bin/env bun
/**
 * External-corpus validator CLI.
 *
 *   bun run scripts/verify-corpus.ts --corpus <path> [options]
 *   npm run verify:corpus -- --corpus <path>
 *   bun run scripts/verify-corpus.ts --list-rules
 *
 * Checks a caller-supplied corpus file against `df-corpus/1` and prints the
 * full filter accounting: how many exercises were accepted, how many were
 * rejected, which rule rejected each one, and what to do about it. Nothing is
 * dropped silently, nothing is repaired, and nothing is defaulted.
 *
 * Exit codes
 *   0  every exercise and candidate passed (advisories do not affect this)
 *   1  the corpus is usable but at least one exercise or candidate was rejected,
 *      or a file-level rule fired; the accounting is still printed in full
 *   2  usage error, or the file could not be read
 *
 * Options
 *   --corpus <path>   the file to check (required unless --list-rules)
 *   --json            print the machine-readable validation report instead of
 *                     the human table (schema `deepforge-external-validation`)
 *   --rules           print the per-rule count of every rule that fired
 *   --quiet           print only the one-line summary
 *   --no-overlap      skip the overlap check against the DeepForge internal
 *                     corpus. This is a disclosure, not a filter, so skipping it
 *                     changes no verdict — but the report then records that the
 *                     check did not happen, and `bun run verify:all` runs it.
 *   --list-rules      print the full rule table with remedies and exit
 *
 * This script measures nothing. It is the door, and the runner
 * (`scripts/external-replication.ts`) refuses to open it on a corpus this
 * rejects.
 */

import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";
import {
  ALL_RULES,
  canonicalJson,
  overlapFindingFor,
  runProvenance,
  sha256OfText,
  validateCorpusFile,
  corpusContentDigest,
  projectExercise,
  UNDECLARED_CATEGORY,
  UNDECLARED_DIFFICULTY,
  type Rejection,
  type ValidationReport,
} from "../src/lib/externalCorpus";

function fail(message: string, code = 2): never {
  console.error(message);
  process.exit(code);
}

interface Options {
  corpus: string | null;
  json: boolean;
  rules: boolean;
  quiet: boolean;
  overlap: boolean;
  listRules: boolean;
}

function parseArgs(argv: readonly string[]): Options {
  const options: Options = {
    corpus: null,
    json: false,
    rules: false,
    quiet: false,
    overlap: true,
    listRules: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--corpus") {
      const value = argv[index + 1];
      if (!value) fail("FAIL: --corpus needs a path");
      options.corpus = value;
      index += 1;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--rules") {
      options.rules = true;
    } else if (arg === "--quiet") {
      options.quiet = true;
    } else if (arg === "--no-overlap") {
      options.overlap = false;
    } else if (arg === "--list-rules") {
      options.listRules = true;
    } else {
      fail(`FAIL: unknown argument "${arg}" (supported: --corpus <path>, --json, --rules, --quiet, --no-overlap, --list-rules)`);
    }
  }
  return options;
}

function printRules(): void {
  console.log(`df-corpus/1 validator — ${String(ALL_RULES.length)} rules`);
  console.log("");
  for (const rule of ALL_RULES) {
    console.log(`${rule.code}`);
    console.log(`  scope    ${rule.kind}`);
    console.log(`  rejects  ${rule.title}`);
    console.log(`  remedy   ${rule.remedy}`);
  }
}

function rejectionLine(rejection: Rejection): string {
  const at = rejection.index === null ? rejection.target : `${rejection.target} (index ${String(rejection.index)})`;
  return `  ${rejection.code.padEnd(46)} ${at}\n      ${rejection.message}\n      path ${rejection.path}\n      remedy: ${rejection.remedy}`;
}

function countTable(counts: Readonly<Record<string, number>>): readonly string[] {
  const entries = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return [];
  return entries.map(([code, count]) => `  ${code.padEnd(46)} ${String(count)}`);
}

function printReport(report: ValidationReport, options: Options, file: string, digest: string): void {
  if (options.quiet) {
    const accounting = report.filterAccounting;
    console.log(
      `${report.ok ? "CORPUS_OK" : "CORPUS_REJECTED"} {"exercises":${String(accounting.exercisesTotal)},` +
        `"accepted":${String(accounting.exercisesAccepted)},"rejected":${String(accounting.exercisesRejected)},` +
        `"candidates":${String(accounting.alibisTotal)},"candidatesAccepted":${String(accounting.alibisAccepted)},` +
        `"fatal":${String(report.fatal.length)}}`,
    );
    return;
  }

  const accounting = report.filterAccounting;
  console.log("External corpus validation — df-corpus/1");
  console.log("");
  console.log(`file        ${file}`);
  console.log(`sha256      ${digest}`);
  if (report.corpus) {
    console.log(
      `corpus      ${report.corpus.id}@${report.corpus.version}  origin "${report.corpus.origin}"  language ${report.corpus.language}`,
    );
    console.log(
      `provenance  maintainer "${report.corpus.maintainer}"  independence "${report.corpus.independence}"  licence ${report.corpus.licenseId}`,
    );
  } else {
    console.log("corpus      <not trusted: a file-level rule fired>");
  }
  console.log("");
  console.log("filter accounting");
  console.log(
    `  exercises  ${String(accounting.exercisesTotal)} submitted = ${String(accounting.exercisesAccepted)} accepted + ${String(accounting.exercisesRejected)} rejected`,
  );
  console.log(
    `  candidates ${String(accounting.alibisTotal)} submitted = ${String(accounting.alibisAccepted)} accepted + ${String(accounting.alibisRejected)} rejected`,
  );
  console.log(`  balances   ${String(accounting.balances)}`);

  const ruleRows = countTable(accounting.rejectionsByRule);
  if (ruleRows.length > 0) {
    console.log("");
    console.log("rejections by rule");
    for (const row of ruleRows) console.log(row);
  }
  const alibiRows = countTable(accounting.alibiRejectionsByRule);
  if (alibiRows.length > 0) {
    console.log("");
    console.log("candidate rejections by rule");
    for (const row of alibiRows) console.log(row);
  }

  if (report.fatal.length > 0) {
    console.log("");
    console.log("file-level rejections (the corpus is not usable)");
    for (const rejection of report.fatal) console.log(rejectionLine(rejection));
  }
  if (accounting.rejections.length > 0) {
    console.log("");
    console.log(
      `rejected exercises (${String(accounting.exercisesRejected)} item(s), ${String(accounting.rejections.length)} rule violation(s))`,
    );
    for (const rejection of accounting.rejections) console.log(rejectionLine(rejection));
  }
  if (accounting.alibiRejections.length > 0) {
    console.log("");
    console.log(
      `rejected candidates (${String(accounting.alibisRejected)} item(s), ${String(accounting.alibiRejections.length)} rule violation(s))`,
    );
    for (const rejection of accounting.alibiRejections) console.log(rejectionLine(rejection));
  }

  console.log("");
  console.log(
    "disclosures (never a filter: these weaken the measurement, they do not remove an exercise)",
  );
  if (accounting.advisories.length === 0) {
    console.log("  none");
  } else {
    for (const advisory of accounting.advisories) {
      const at = advisory.index === null ? advisory.target : `${advisory.target} (index ${String(advisory.index)})`;
      console.log(`  ${advisory.code.padEnd(46)} ${at} x${String(advisory.count)}`);
      console.log(`      ${advisory.message}`);
    }
  }

  if (options.rules) {
    console.log("");
    console.log("every rule in the table, for auditing the validator itself");
    for (const rule of ALL_RULES) {
      const count = accounting.rejectionsByRule[rule.code] ?? accounting.alibiRejectionsByRule[rule.code] ?? 0;
      console.log(`  ${rule.code.padEnd(46)} fired ${String(count)}`);
    }
  }

  console.log("");
  console.log(
    report.ok
      ? `PASS — every submitted exercise and candidate passed; ${String(accounting.advisories.length)} disclosure(s)`
      : `REJECTED — ${String(accounting.exercisesRejected + accounting.alibisRejected)} item(s) rejected; ` +
        "the methodology will not run over this corpus until they are fixed or removed by the submitter",
  );
  console.log(canonicalJson({ ok: report.ok, accepted: accounting.exercisesAccepted }));
}

function main(): number {
  const options = parseArgs(process.argv.slice(2));
  if (options.listRules) {
    printRules();
    return 0;
  }
  if (!options.corpus) fail("FAIL: --corpus <path> is required (or --list-rules)");

  let text: string;
  try {
    const stat = statSync(options.corpus);
    if (!stat.isFile()) fail(`FAIL: ${options.corpus} is not a regular file`);
    text = readFileSync(options.corpus, "utf8");
  } catch (error) {
    fail(`FAIL: cannot read ${options.corpus}: ${(error as Error).message}`);
  }

  let document: unknown;
  try {
    document = JSON.parse(text);
  } catch (error) {
    const message = (error as Error).message;
    console.error(`FAIL: ${options.corpus} is not valid JSON`);
    console.error(`      ${message}`);
    console.error("      remedy: validate with `python3 -m json.tool <file>` and fix the position above");
    return 1;
  }

  const validation = validateCorpusFile(document, { overlapCheck: options.overlap });
  const digest = sha256OfText(text);

  if (options.json) {
    const overlap = overlapFindingFor(validation.accepted, options.overlap);
    const header =
      validation.corpus === null
        ? null
        : runProvenance(
            {
              id: validation.corpus.id,
              name: validation.corpus.name,
              version: validation.corpus.version,
              origin: validation.corpus.origin,
              language: validation.corpus.language,
              provenance: (document as { corpus: { provenance: never } }).corpus.provenance,
              license: (document as { corpus: { license: never } }).corpus.license,
            },
            corpusContentDigest({
              formatVersion: 1,
              exercises: validation.accepted.map((exercise) =>
                projectExercise(
                  {
                    id: exercise.id,
                    reference: exercise.reference,
                    tests: exercise.tests,
                    category: exercise.category ?? UNDECLARED_CATEGORY,
                    difficulty: exercise.difficulty ?? UNDECLARED_DIFFICULTY,
                  }),
              ),
            }),
            overlap,
          );
    const payload = {
      ...validation,
      provenance: header,
      file: { path: basename(options.corpus), sha256: digest, bytes: Buffer.byteLength(text, "utf8") },
    };
    console.log(canonicalJson(payload));
    return validation.ok ? 0 : 1;
  }

  printReport(validation, options, basename(options.corpus), digest);
  if (!validation.corpusUsable) return 1;
  return validation.ok ? 0 : 1;
}

process.exit(main());
