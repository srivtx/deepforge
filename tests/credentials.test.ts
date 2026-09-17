import { describe, expect, test } from "bun:test";
import {
  CREDENTIAL_PREFIX,
  CREDENTIAL_VERSION,
  canonicalize,
  decodeCredential,
  encodeCredential,
  fingerprintFromCode,
  formatFingerprint,
  verifyCredential,
  verifyUrl,
  type CredentialPayload,
} from "@/lib/credentials";
import {
  buildCertificateText,
  certificateCredentialCode,
  payloadFromCertificate,
  verificationCode,
  type Certificate,
} from "@/lib/certificates";

const BASE: CredentialPayload = {
  v: 1,
  kind: "path",
  ref: "ml-from-scratch",
  title: "ML From Scratch",
  recipient: "Ada Lovelace",
  solved: 12,
  total: 12,
  issued: "2026-09-14",
};

/**
 * Frozen fixture captured from the first credential release. These bytes are
 * load-bearing: every v1 code ever issued hashes exactly this payload, so the
 * canonical form and the derived code must never change.
 */
const FROZEN_PATH_CANONICAL =
  '{"v":1,"kind":"path","ref":"ml-from-scratch","title":"ML From Scratch","recipient":"Ada Lovelace","solved":12,"total":12,"issued":"2026-09-14"}';
const FROZEN_PATH_CODE =
  "dfc1.eyJ2IjoxLCJraW5kIjoicGF0aCIsInJlZiI6Im1sLWZyb20tc2NyYXRjaCIsInRpdGxlIjoiTUwgRnJvbSBTY3JhdGNoIiwicmVjaXBpZW50IjoiQWRhIExvdmVsYWNlIiwic29sdmVkIjoxMiwidG90YWwiOjEyLCJpc3N1ZWQiOiIyMDI2LTA5LTE0In0.45TRP8FAEW40HCVZ";

const LAB_PAYLOAD: CredentialPayload = {
  v: 1,
  kind: "lab",
  ref: "lab-01",
  title: "Application — Logistic Regression, From Scratch",
  recipient: "Ada Lovelace",
  issued: "2026-09-14",
  score: 0.92,
  target: 0.85,
};

const PROJECT_PAYLOAD: CredentialPayload = {
  v: 1,
  kind: "project",
  ref: "gpt",
  title: "Build — Build a GPT from Scratch",
  recipient: "Ada Lovelace",
  issued: "2026-09-14",
  stepsDone: 8,
  stepsTotal: 8,
};

const INTERVIEW_PAYLOAD: CredentialPayload = {
  v: 1,
  kind: "interview",
  ref: "anthropic",
  title: "Interview — Anthropic · Machine Learning Engineer",
  recipient: "Ada Lovelace",
  solved: 5,
  total: 6,
  issued: "2026-09-14",
};

type MutablePayload = Record<string, unknown>;

function encodePayload(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded: string): MutablePayload {
  return JSON.parse(
    Buffer.from(encoded, "base64url").toString("utf8"),
  ) as MutablePayload;
}

/** Re-encode the payload after mutating it, keeping the old fingerprint. */
function tamper(
  code: string,
  mutate: (payload: MutablePayload) => void,
): string {
  const [prefix, encoded, fingerprint] = code.split(".");
  const payload = decodePayload(encoded);
  mutate(payload);
  return `${prefix}.${encodePayload(payload)}.${fingerprint}`;
}

async function rejects(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    return false;
  } catch {
    return true;
  }
}

describe("canonicalization", () => {
  test("fields serialize in a fixed order with no extra whitespace", () => {
    expect(canonicalize(BASE)).toBe(
      '{"v":1,"kind":"path","ref":"ml-from-scratch","title":"ML From Scratch","recipient":"Ada Lovelace","solved":12,"total":12,"issued":"2026-09-14"}',
    );
  });

  test("key insertion order never changes the canonical bytes", () => {
    const reordered = {
      issued: BASE.issued,
      total: BASE.total,
      solved: BASE.solved,
      recipient: BASE.recipient,
      title: BASE.title,
      ref: BASE.ref,
      kind: BASE.kind,
      v: CREDENTIAL_VERSION,
    } as CredentialPayload;
    expect(canonicalize(reordered)).toBe(canonicalize(BASE));
  });

  test("normalizes unicode to NFC and collapses whitespace", () => {
    const canonical = canonicalize({
      ...BASE,
      title: "  ML   From Scratch  ",
      recipient: "Ade\u0301le  Nguyen",
    });
    expect(canonical).toContain('"recipient":"Adéle Nguyen"');
    expect(canonical).toContain('"title":"ML From Scratch"');
  });

  test("escapes quotes and backslashes exactly once", () => {
    const canonical = canonicalize({
      ...BASE,
      title: 'The "Hard" Part \\ 100%',
    });
    expect(canonical).toContain(
      '"title":"The \\"Hard\\" Part \\\\ 100%"',
    );
  });
});

describe("frozen v1 regression", () => {
  test("path, collection, and category codes still verify byte-for-byte", async () => {
    expect(canonicalize(BASE)).toBe(FROZEN_PATH_CANONICAL);
    expect(await encodeCredential(BASE)).toBe(FROZEN_PATH_CODE);
    expect(decodeCredential(FROZEN_PATH_CODE)).toEqual(BASE);

    const result = await verifyCredential(FROZEN_PATH_CODE);
    expect(result.status).toBe("valid");
    expect(result.payload).toEqual(BASE);
    expect(result.recomputed).toBe(result.fingerprint);
  });

  test("collection and category payloads keep their original eight-field order", () => {
    expect(
      canonicalize({
        v: 1,
        kind: "collection",
        ref: "classics",
        title: "The Classics",
        recipient: "Ada Lovelace",
        solved: 3,
        total: 3,
        issued: "2026-09-14",
      }),
    ).toBe(
      '{"v":1,"kind":"collection","ref":"classics","title":"The Classics","recipient":"Ada Lovelace","solved":3,"total":3,"issued":"2026-09-14"}',
    );
    expect(
      canonicalize({
        v: 1,
        kind: "category",
        ref: "algorithms",
        title: "Algorithms Milestone",
        recipient: "Ada Lovelace",
        solved: 316,
        total: 395,
        issued: "2026-09-14",
      }),
    ).toBe(
      '{"v":1,"kind":"category","ref":"algorithms","title":"Algorithms Milestone","recipient":"Ada Lovelace","solved":316,"total":395,"issued":"2026-09-14"}',
    );
  });
});

describe("encoding", () => {
  test("round-trips a payload and verifies as valid", async () => {
    const code = await encodeCredential(BASE);
    expect(decodeCredential(code)).toEqual(BASE);

    const result = await verifyCredential(code);
    expect(result.status).toBe("valid");
    expect(result.reason).toBeNull();
    expect(result.payload).toEqual(BASE);
    expect(result.fingerprint).toBe(result.recomputed);
  });

  test("has the documented three-part shape", async () => {
    const code = await encodeCredential(BASE);
    const parts = code.split(".");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe(CREDENTIAL_PREFIX);
    expect(parts[2]).toMatch(/^[0-9A-HJKMNP-TV-Z]{16}$/);
    expect(fingerprintFromCode(code)).toBe(parts[2]);
  });

  test("is deterministic for equal evidence", async () => {
    const first = await encodeCredential(BASE);
    const second = await encodeCredential({ ...BASE });
    expect(first).toBe(second);
  });

  test("NFC and NFD spellings of a name produce one code", async () => {
    const decomposed = await encodeCredential({
      ...BASE,
      recipient: "Ade\u0301le Nguyen".normalize("NFD"),
    });
    const composed = await encodeCredential({
      ...BASE,
      recipient: "Adéle Nguyen",
    });
    expect(decomposed).toBe(composed);
  });

  test("a changed field changes the code", async () => {
    const original = await encodeCredential(BASE);
    const renamed = await encodeCredential({
      ...BASE,
      recipient: "Ada Byron",
    });
    expect(renamed).not.toBe(original);
  });

  test("rejects malformed payloads", async () => {
    const cases: CredentialPayload[] = [
      { ...BASE, recipient: "" },
      { ...BASE, title: "x".repeat(121) },
      { ...BASE, issued: "yesterday" },
      { ...BASE, issued: "2026-02-31" },
      { ...BASE, solved: -1 },
      { ...BASE, total: 1.5 },
      { ...BASE, v: 2 as unknown as 1 },
    ];
    for (const bad of cases) {
      expect(await rejects(() => encodeCredential(bad))).toBe(true);
    }
  });
});

describe("malformed codes", () => {
  test("unreadable shapes decode to null and verify as malformed", async () => {
    const code = await encodeCredential(BASE);
    const candidates = [
      "",
      "   ",
      "hello",
      code.replace(CREDENTIAL_PREFIX, "dfc2"),
      code.split(".").slice(0, 2).join("."),
      `${code}.extra`,
      code.replace(/\.([^.]*)$/, ".SHORT"),
      code.replace(CREDENTIAL_PREFIX, ""),
    ];
    for (const candidate of candidates) {
      expect(decodeCredential(candidate)).toBeNull();
      const result = await verifyCredential(candidate);
      expect(result.status).toBe("malformed");
      expect(result.payload).toBeNull();
      expect(result.recomputed).toBeNull();
    }
  });

  test("truncated codes never verify and never throw", async () => {
    const code = await encodeCredential(BASE);
    for (let end = 0; end < code.length; end += 3) {
      const piece = code.slice(0, end);
      expect(decodeCredential(piece)).toBeNull();
      const result = await verifyCredential(piece);
      expect(result.status).toBe("malformed");
    }
  });

  test("an unsupported version is reported as malformed/version", async () => {
    const code = await encodeCredential(BASE);
    const future = tamper(code, (payload) => {
      payload.v = 2;
    });
    const result = await verifyCredential(future);
    expect(result.status).toBe("malformed");
    expect(result.reason).toBe("version");
    expect(result.payload).toBeNull();
  });

  test("missing, extra, or out-of-range fields are unreadable", async () => {
    const code = await encodeCredential(BASE);
    const mutations: Array<(payload: MutablePayload) => void> = [
      (payload) => {
        delete payload.total;
      },
      (payload) => {
        payload.extra = "sneaky";
      },
      (payload) => {
        payload.recipient = "";
      },
      (payload) => {
        payload.title = "x".repeat(300);
      },
      (payload) => {
        payload.solved = -5;
      },
      (payload) => {
        payload.issued = "not-a-date";
      },
      (payload) => {
        payload.kind = "badge";
      },
    ];
    for (const mutate of mutations) {
      const candidate = tamper(code, mutate);
      expect(decodeCredential(candidate)).toBeNull();
      expect((await verifyCredential(candidate)).status).toBe("malformed");
    }
  });
});

describe("tamper detection", () => {
  test("altering any field flips the verdict to tampered", async () => {
    const code = await encodeCredential(BASE);
    const mutations: Array<[string, (payload: MutablePayload) => void]> = [
      [
        "recipient",
        (payload) => {
          payload.recipient = "Mallory";
        },
      ],
      [
        "title",
        (payload) => {
          payload.title = "ML From Somewhere Else";
        },
      ],
      [
        "ref",
        (payload) => {
          payload.ref = "other-path";
        },
      ],
      [
        "kind",
        (payload) => {
          payload.kind = "collection";
        },
      ],
      [
        "solved",
        (payload) => {
          payload.solved = 11;
        },
      ],
      [
        "total",
        (payload) => {
          payload.total = 99;
        },
      ],
      [
        "issued",
        (payload) => {
          payload.issued = "2025-01-01";
        },
      ],
    ];
    for (const [label, mutate] of mutations) {
      const result = await verifyCredential(tamper(code, mutate));
      expect(`${label}:${result.status}`).toBe(`${label}:tampered`);
      expect(result.fingerprint).not.toBe(result.recomputed);
      expect(result.payload).not.toBeNull();
      expect(result.reason).toBeNull();
    }
  });

  test("tampering a unicode name still fails", async () => {
    const code = await encodeCredential({
      ...BASE,
      recipient: "Renée 奥 日本語 🚀",
    });
    expect((await verifyCredential(code)).status).toBe("valid");
    const evil = tamper(code, (payload) => {
      payload.recipient = "Renée 奥 日本";
    });
    const result = await verifyCredential(evil);
    expect(result.status).toBe("tampered");
    expect(result.payload?.recipient).toBe("Renée 奥 日本");
  });

  test("re-hashing altered evidence verifies — self-attested math", async () => {
    const forged = await encodeCredential({ ...BASE, recipient: "Mallory" });
    const result = await verifyCredential(forged);
    expect(result.status).toBe("valid");
    expect(result.payload?.recipient).toBe("Mallory");
  });

  test("non-canonical JSON verifies when canonical bytes match", async () => {
    const code = await encodeCredential(BASE);
    const [prefix, , fingerprint] = code.split(".");
    const reordered = JSON.stringify({
      issued: BASE.issued,
      total: BASE.total,
      solved: BASE.solved,
      recipient: BASE.recipient,
      title: BASE.title,
      ref: BASE.ref,
      kind: BASE.kind,
      v: BASE.v,
    });
    const messy = `${prefix}.${encodePayload(JSON.parse(reordered))}.${fingerprint}`;
    expect((await verifyCredential(messy)).status).toBe("valid");
  });
});

describe("lab, project, and interview kinds", () => {
  test("appended evidence serializes after the original fields", () => {
    expect(canonicalize(LAB_PAYLOAD)).toBe(
      '{"v":1,"kind":"lab","ref":"lab-01","title":"Application — Logistic Regression, From Scratch","recipient":"Ada Lovelace","issued":"2026-09-14","score":0.92,"target":0.85}',
    );
    expect(canonicalize(PROJECT_PAYLOAD)).toBe(
      '{"v":1,"kind":"project","ref":"gpt","title":"Build — Build a GPT from Scratch","recipient":"Ada Lovelace","issued":"2026-09-14","stepsDone":8,"stepsTotal":8}',
    );
    expect(canonicalize(INTERVIEW_PAYLOAD)).toBe(
      '{"v":1,"kind":"interview","ref":"anthropic","title":"Interview — Anthropic · Machine Learning Engineer","recipient":"Ada Lovelace","solved":5,"total":6,"issued":"2026-09-14"}',
    );
  });

  test("each new kind round-trips and verifies", async () => {
    for (const payload of [LAB_PAYLOAD, PROJECT_PAYLOAD, INTERVIEW_PAYLOAD]) {
      const code = await encodeCredential(payload);
      expect(decodeCredential(code)).toEqual(payload);
      const result = await verifyCredential(code);
      expect(result.status).toBe("valid");
      expect(result.payload).toEqual(payload);
      expect(await encodeCredential({ ...payload })).toBe(code);
    }
  });

  test("tampering with the appended evidence flips the verdict", async () => {
    const labCode = await encodeCredential(LAB_PAYLOAD);
    for (const mutate of [
      (payload: MutablePayload) => {
        payload.score = 0.7;
      },
      (payload: MutablePayload) => {
        payload.target = 0.6;
      },
    ]) {
      const result = await verifyCredential(tamper(labCode, mutate));
      expect(result.status).toBe("tampered");
      expect(result.fingerprint).not.toBe(result.recomputed);
    }

    const projectCode = await encodeCredential(PROJECT_PAYLOAD);
    const steps = await verifyCredential(
      tamper(projectCode, (payload) => {
        payload.stepsDone = 7;
      }),
    );
    expect(steps.status).toBe("tampered");
    expect(steps.payload).not.toBeNull();
  });

  test("kind-specific fields must match the kind's evidence shape", async () => {
    const labCode = await encodeCredential(LAB_PAYLOAD);
    const projectCode = await encodeCredential(PROJECT_PAYLOAD);
    const labWithCounts = tamper(labCode, (payload) => {
      payload.solved = 1;
      payload.total = 1;
    });
    const projectWithScore = tamper(projectCode, (payload) => {
      payload.score = 0.9;
    });
    const missingTarget = tamper(labCode, (payload) => {
      delete payload.target;
    });
    const missingSteps = tamper(projectCode, (payload) => {
      delete payload.stepsTotal;
    });
    const extra = tamper(projectCode, (payload) => {
      payload.note = "sneaky";
    });
    for (const candidate of [
      labWithCounts,
      projectWithScore,
      missingTarget,
      missingSteps,
      extra,
    ]) {
      expect(decodeCredential(candidate)).toBeNull();
      const result = await verifyCredential(candidate);
      expect(result.status).toBe("malformed");
      expect(result.payload).toBeNull();
    }
  });

  test("out-of-range measures and steps are rejected at encode time", async () => {
    const cases: CredentialPayload[] = [
      { ...LAB_PAYLOAD, score: Number.NaN },
      { ...LAB_PAYLOAD, target: Number.POSITIVE_INFINITY },
      { ...LAB_PAYLOAD, score: 1_000_000_000_001 },
      { ...PROJECT_PAYLOAD, stepsDone: -1 },
      { ...PROJECT_PAYLOAD, stepsTotal: 1.5 },
      { ...PROJECT_PAYLOAD, stepsTotal: 1_000_001 },
    ];
    for (const bad of cases) {
      expect(await rejects(() => encodeCredential(bad))).toBe(true);
    }
  });
});

describe("display helpers", () => {
  test("formatFingerprint groups into fours", async () => {
    const code = await encodeCredential(BASE);
    const fingerprint = fingerprintFromCode(code);
    expect(fingerprint).not.toBeNull();
    expect(formatFingerprint(fingerprint as string)).toMatch(
      /^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/,
    );
  });

  test("fingerprintFromCode returns null for malformed codes", () => {
    expect(fingerprintFromCode("")).toBeNull();
    expect(fingerprintFromCode("dfc1.x")).toBeNull();
    expect(fingerprintFromCode("dfc1.not-really.abc")).toBeNull();
  });

  test("verifyUrl keeps the code intact", async () => {
    const code = await encodeCredential(BASE);
    const url = verifyUrl(code);
    expect(url.startsWith("/verify/")).toBe(true);
    expect(decodeURIComponent(url.slice("/verify/".length))).toBe(code);
  });
});

describe("certificate records", () => {
  const cert: Certificate = {
    id: "path:ml-from-scratch",
    kind: "path",
    refId: "ml-from-scratch",
    title: "ML From Scratch",
    recipient: "Ada Lovelace",
    issuedAt: "2026-01-14T12:00:00.000Z",
    detail: "12 of 12 problems · ML From Scratch path",
  };

  test("payloadFromCertificate derives counts and the issued date", () => {
    expect(payloadFromCertificate(cert)).toEqual({
      v: CREDENTIAL_VERSION,
      kind: "path",
      ref: "ml-from-scratch",
      title: "ML From Scratch",
      recipient: "Ada Lovelace",
      solved: 12,
      total: 12,
      issued: "2026-01-14",
    });
  });

  test("explicit counts win over the detail line", () => {
    const payload = payloadFromCertificate({
      ...cert,
      solved: 0,
      total: 5,
      detail: "",
    });
    expect(payload.solved).toBe(0);
    expect(payload.total).toBe(5);
  });

  test("a certificate produces a code that verifies", async () => {
    const code = await certificateCredentialCode(cert);
    const result = await verifyCredential(code);
    expect(result.status).toBe("valid");
    expect(result.payload?.kind).toBe("path");
    expect(result.payload?.solved).toBe(12);
    expect(result.payload?.issued).toBe("2026-01-14");
  });

  test("buildCertificateText shows the fingerprint when given the code", async () => {
    const code = await certificateCredentialCode(cert);
    const fingerprint = fingerprintFromCode(code) as string;
    const text = buildCertificateText(cert, code);
    expect(text).toContain(
      `Verification code: ${formatFingerprint(fingerprint)}`,
    );
    expect(text).not.toContain(`Verification code: ${verificationCode(cert)}`);
  });

  test("a lab certificate maps its score and target onto the payload", async () => {
    const labCert: Certificate = {
      id: "lab:lab-01",
      kind: "lab",
      refId: "lab-01",
      title: "Application — Logistic Regression, From Scratch",
      recipient: "Ada Lovelace",
      issuedAt: "2026-01-14T12:00:00.000Z",
      detail: "Accuracy 0.92 vs target 0.85 · Logistic Regression lab",
      score: 0.92,
      target: 0.85,
    };
    expect(payloadFromCertificate(labCert)).toEqual({
      v: CREDENTIAL_VERSION,
      kind: "lab",
      ref: "lab-01",
      title: "Application — Logistic Regression, From Scratch",
      recipient: "Ada Lovelace",
      issued: "2026-01-14",
      score: 0.92,
      target: 0.85,
    });
    const result = await verifyCredential(
      await certificateCredentialCode(labCert),
    );
    expect(result.status).toBe("valid");
    expect(result.payload?.score).toBe(0.92);
    expect(result.payload?.target).toBe(0.85);
    expect(result.payload?.solved).toBeUndefined();
  });

  test("a lab certificate without evidence cannot produce a code", async () => {
    const broken: Certificate = {
      id: "lab:lab-01",
      kind: "lab",
      refId: "lab-01",
      title: "Lab",
      recipient: "Ada Lovelace",
      issuedAt: "2026-01-14T12:00:00.000Z",
      detail: "",
    };
    expect(await rejects(() => certificateCredentialCode(broken))).toBe(true);
  });

  test("project and interview certificates carry their step evidence", async () => {
    const projectCert: Certificate = {
      id: "project:gpt",
      kind: "project",
      refId: "gpt",
      title: "Build — Build a GPT from Scratch",
      recipient: "Ada Lovelace",
      issuedAt: "2026-01-14T12:00:00.000Z",
      detail: "8 of 8 steps · Build a GPT from Scratch project",
      solved: 8,
      total: 8,
    };
    const projectPayload = payloadFromCertificate(projectCert);
    expect(projectPayload.stepsDone).toBe(8);
    expect(projectPayload.stepsTotal).toBe(8);
    expect(projectPayload.solved).toBeUndefined();
    const projectResult = await verifyCredential(
      await certificateCredentialCode(projectCert),
    );
    expect(projectResult.status).toBe("valid");
    expect(projectResult.payload?.stepsDone).toBe(8);

    const interviewCert: Certificate = {
      id: "interview:anthropic",
      kind: "interview",
      refId: "anthropic",
      title: "Interview — Anthropic · Machine Learning Engineer",
      recipient: "Ada Lovelace",
      issuedAt: "2026-01-14T12:00:00.000Z",
      detail: "5 of 6 mock problems · Anthropic interview",
      solved: 5,
      total: 6,
    };
    const interviewPayload = payloadFromCertificate(interviewCert);
    expect(interviewPayload.solved).toBe(5);
    expect(interviewPayload.total).toBe(6);
    const interviewResult = await verifyCredential(
      await certificateCredentialCode(interviewCert),
    );
    expect(interviewResult.status).toBe("valid");
    expect(interviewResult.payload?.kind).toBe("interview");
  });
});
