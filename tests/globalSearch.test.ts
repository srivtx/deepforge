import { describe, expect, test } from "bun:test";
import { CATEGORIES } from "@/data/problems/meta";
import { ARTICLES } from "@/data/articles";
import { ARTICLE_INDEX } from "@/data/articleIndex";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { INTERVIEW_TRACKS } from "@/data/interview";
import { POSTS } from "@/data/blog";
import { LABS } from "@/data/labs";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { getAllPaths } from "@/lib/paths";
import { categorySlug } from "@/lib/sections";
import {
  GLOBAL_SEARCH_GROUPS,
  GLOBAL_SEARCH_MIN_LENGTH,
  searchGlobal,
  type GlobalSearchGroup,
  type GlobalSearchItem,
  type GlobalSearchResult,
} from "@/lib/globalSearch";

function groupOf(
  results: GlobalSearchResult[],
  group: GlobalSearchGroup,
): GlobalSearchItem[] {
  return results.find((result) => result.group === group)?.items ?? [];
}

function itemById(
  items: GlobalSearchItem[],
  id: string,
): GlobalSearchItem | undefined {
  return items.find((item) => item.id === id);
}

describe("searchGlobal", () => {
  test("empty and too-short queries return nothing", () => {
    expect(searchGlobal("")).toEqual([]);
    expect(searchGlobal("   ")).toEqual([]);
    expect(searchGlobal("\t\n")).toEqual([]);
    expect(searchGlobal("a")).toEqual([]);
    expect(searchGlobal(" a ")).toEqual([]);
    expect(GLOBAL_SEARCH_MIN_LENGTH).toBe(2);
  });

  test("ignores case and surrounding whitespace", () => {
    const canonical = searchGlobal("linear algebra");
    expect(canonical.length).toBeGreaterThan(0);
    expect(searchGlobal("LINEAR ALGEBRA")).toEqual(canonical);
    expect(searchGlobal("  Linear Algebra  ")).toEqual(canonical);
  });

  test("groups appear in GLOBAL_SEARCH_GROUPS order, at most once", () => {
    for (const query of [
      "deep learning",
      "line",
      "data",
      "graph",
      "time series",
      "interview",
    ]) {
      const results = searchGlobal(query);
      const groups = results.map((result) => result.group);
      const positions = groups.map((group) => GLOBAL_SEARCH_GROUPS.indexOf(group));
      expect(positions.every((value) => value >= 0)).toBe(true);
      expect(positions.every((value, i) => i === 0 || positions[i - 1] < value)).toBe(
        true,
      );
      expect(new Set(groups).size).toBe(groups.length);
      for (const result of results) {
        expect(result.items.length).toBeGreaterThan(0);
      }
    }
  });

  test("ranks prefix over word-boundary over substring", () => {
    // "Linear Algebra Crash Course" is a prefix, "The Essence of Linear
    // Algebra" starts a later word, "Modern LLM Pipeline" only contains it.
    const collections = groupOf(searchGlobal("line"), "Collections").map(
      (item) => item.title,
    );
    expect(collections).toEqual([
      "Linear Algebra Crash Course",
      "The Essence of Linear Algebra",
      "Modern LLM Pipeline",
    ]);
  });

  test("breaks ties by shorter title, then id ascending", () => {
    // Two 20-character titles ("data-scientist-track" < "data-structures-core"
    // by id) rank before the 36-character one.
    const paths = groupOf(searchGlobal("data", 10), "Paths");
    expect(paths.map((item) => item.id)).toEqual([
      "data-scientist-track",
      "data-structures-core",
      "data-pipelines-and-feature-engineering",
    ]);
  });

  test("ranks across groups in canonical group order", () => {
    // "attention" matches one collection and two articles: Collections must
    // precede Articles, and inside Articles a title-prefix match must beat a
    // mid-word one.
    const results = searchGlobal("attention", 10);
    expect(results.map((result) => result.group)).toEqual([
      "Collections",
      "Articles",
    ]);
    expect(groupOf(results, "Collections").map((item) => item.title)).toEqual([
      "Attention Is All You Need",
    ]);
    expect(groupOf(results, "Articles").map((item) => item.title)).toEqual([
      "Attention Is a Heatmap",
      "KV Cache & FlashAttention",
    ]);
  });

  test("limit caps items per group", () => {
    const capped = groupOf(searchGlobal("ing"), "Paths");
    expect(capped).toHaveLength(4);
    const all = groupOf(searchGlobal("ing", 100), "Paths");
    expect(all.length).toBeGreaterThan(4);
    expect(capped).toEqual(all.slice(0, 4));

    for (const result of searchGlobal("deep", 1)) {
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(groupOf(searchGlobal("deep"), result.group)[0]);
    }
    expect(searchGlobal("deep", 0)).toEqual([]);
  });

  test("path hrefs resolve to real registry slugs", () => {
    const paths = getAllPaths();
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      const item = itemById(groupOf(searchGlobal(path.title, 10), "Paths"), path.id);
      expect(item?.href).toBe(`/paths/${path.slug}`);
      expect(item?.subtitle).toBe(path.level);
    }
  });

  test("collection hrefs resolve to real registry ids", () => {
    expect(PREMADE_COLLECTIONS.length).toBeGreaterThan(0);
    for (const collection of PREMADE_COLLECTIONS) {
      const item = itemById(
        groupOf(searchGlobal(collection.name, 10), "Collections"),
        collection.id,
      );
      expect(item?.href).toBe(`/collections/${collection.id}`);
      expect(
        PREMADE_COLLECTIONS.some((candidate) => candidate.id === item?.id),
      ).toBe(true);
    }
  });

  test("interview, blog, and category hrefs resolve to real routes", () => {
    for (const track of INTERVIEW_TRACKS) {
      const item = itemById(
        groupOf(searchGlobal(track.title, 10), "Interview"),
        track.id,
      );
      expect(item?.href).toBe(`/interview/${track.id}`);
    }
    for (const entry of POSTS) {
      const item = itemById(
        groupOf(searchGlobal(entry.post.title, 10), "Blog"),
        entry.post.slug,
      );
      expect(item?.href).toBe(`/blog/${entry.post.slug}`);
    }
    for (const category of CATEGORIES) {
      const item = itemById(
        groupOf(searchGlobal(category.name, 10), "Categories"),
        category.name,
      );
      expect(item?.href).toBe(`/problems?category=${categorySlug(category.name)}`);
    }
  });

  test("article hrefs resolve to real article slugs", () => {
    expect(ARTICLES.length).toBeGreaterThan(0);
    for (const article of ARTICLES) {
      const item = itemById(
        groupOf(searchGlobal(article.title, 100), "Articles"),
        article.slug,
      );
      expect(item, article.id).not.toBeUndefined();
      expect(item?.title).toBe(article.title);
      expect(item?.href).toBe(`/articles/${article.slug}`);
    }
  });

  test("the generated article index is in sync with the registry", () => {
    expect(ARTICLE_INDEX.length).toBe(ARTICLES.length);
    expect(ARTICLE_INDEX.map((entry) => entry.slug)).toEqual(
      ARTICLES.map((article) => article.slug),
    );
    expect(ARTICLE_INDEX.map((entry) => entry.title)).toEqual(
      ARTICLES.map((article) => article.title),
    );
    expect(ARTICLE_INDEX.map((entry) => entry.dek)).toEqual(
      ARTICLES.map((article) => article.dek),
    );
    for (const entry of ARTICLE_INDEX) {
      expect(Object.keys(entry).sort()).toEqual(["dek", "slug", "title"]);
    }
  });

  test("is deterministic and duplicate-free", () => {
    const queries = [
      "deep",
      "line",
      "data",
      "ing",
      "math",
      "interview",
      "attention",
    ];
    const first = JSON.stringify(queries.map((query) => searchGlobal(query)));
    const second = JSON.stringify(queries.map((query) => searchGlobal(query)));
    expect(second).toBe(first);

    for (const query of ["deep", "graph", "learning", "attention"]) {
      for (const result of searchGlobal(query, 100)) {
        const ids = result.items.map((item) => item.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  test("the Articles group is populated from the light index", () => {
    expect(GLOBAL_SEARCH_GROUPS).toContain("Articles");
    const groups = new Set(
      searchGlobal("softmax", 20).map((result) => result.group),
    );
    expect(groups.has("Articles")).toBe(true);
  });

  test("research challenges are searchable by title and href", () => {
    expect(GLOBAL_SEARCH_GROUPS).toContain("Research");
    expect(RESEARCH_CHALLENGES.length).toBeGreaterThan(0);
    for (const challenge of RESEARCH_CHALLENGES) {
      const item = itemById(
        groupOf(searchGlobal(challenge.title, 100), "Research"),
        challenge.id,
      );
      expect(item, challenge.id).not.toBeUndefined();
      expect(item?.href).toBe(`/research/${challenge.id}`);
    }
  });

  test("research challenges match metric and blurb keywords", () => {
    const mse = groupOf(searchGlobal("mse", 100), "Research").map(
      (item) => item.id,
    );
    expect(mse).toContain("nonlinear-regression-chase");
    expect(mse).toContain("noisy-sensor-denoising");
    const f1 = groupOf(searchGlobal("f1", 100), "Research").map(
      (item) => item.id,
    );
    expect(f1).toContain("imbalanced-signal-hunt");
    expect(
      itemById(
        groupOf(searchGlobal("markov", 100), "Research"),
        "mini-language-model",
      ),
    ).not.toBeUndefined();
    expect(
      itemById(
        groupOf(searchGlobal("blobs", 100), "Research"),
        "tabular-classification-showdown",
      ),
    ).not.toBeUndefined();
  });

  test("labs are searchable by title and href", () => {
    expect(GLOBAL_SEARCH_GROUPS).toContain("Labs");
    expect(LABS.length).toBeGreaterThan(0);
    for (const lab of LABS) {
      const item = itemById(groupOf(searchGlobal(lab.title, 100), "Labs"), lab.id);
      expect(item, lab.id).not.toBeUndefined();
      expect(item?.href).toBe(`/labs/${lab.id}`);
    }
  });

  test("labs match category and blurb keywords", () => {
    const clustering = groupOf(searchGlobal("clustering", 100), "Labs").map(
      (item) => item.id,
    );
    expect(clustering).toContain("lab-05");
    const nlp = groupOf(searchGlobal("nlp", 100), "Labs").map(
      (item) => item.id,
    );
    expect(nlp).toContain("lab-02");
    expect(
      itemById(groupOf(searchGlobal("outliers", 100), "Labs"), "lab-07"),
    ).not.toBeUndefined();
    expect(
      itemById(groupOf(searchGlobal("r2", 100), "Labs"), "lab-04"),
    ).not.toBeUndefined();
  });

  test("research and lab entries are duplicate-free within their groups", () => {
    for (const query of ["classification", "regression", "sensor", "lab"]) {
      for (const group of ["Research", "Labs"] as GlobalSearchGroup[]) {
        const ids = groupOf(searchGlobal(query, 100), group).map(
          (item) => item.id,
        );
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });
});
