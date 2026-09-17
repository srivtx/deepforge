/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: bun run scripts/generate-article-index.ts
 *
 * Light index of the interactive articles: { slug, title, dek } only, so
 * palette search can include the Articles group without importing the prose
 * sections or the figure/demo component graph in src/data/articles.ts.
 */

export interface ArticleIndexEntry {
  slug: string;
  title: string;
  dek: string;
}

function articleIndexEntry(
  slug: string,
  title: string,
  dek: string,
): ArticleIndexEntry {
  return { slug, title, dek };
}

export const ARTICLE_INDEX: ArticleIndexEntry[] = [
  articleIndexEntry("why-softmax-needs-temperature", "Why Softmax Needs Temperature", "A network's raw scores are not probabilities. Temperature is the dial that decides how much the differences between them matter."),
  articleIndexEntry("eigenvectors-you-can-see", "Eigenvectors You Can See", "Most arrows change direction when a matrix acts on them. A few stay on their own line — and those are the ones worth finding."),
  articleIndexEntry("gradient-descent-from-mse-to-logistic", "Gradient Descent from MSE to Logistic", "One update rule, two losses. Watch the same recipe fit a line by squared error and by cross-entropy."),
  articleIndexEntry("k-means-assignment-to-convergence", "K-Means: Assignment to Convergence", "Two alternating steps, one stubborn goal. Step through the loop and watch the total spread only ever fall."),
  articleIndexEntry("attention-is-a-heatmap", "Attention Is a Heatmap", "Strip away the code and attention is a table of dot products, a softmax on every row, and a weighted average of values."),
  articleIndexEntry("tokenization-byte-pair-encoding", "Tokenization: Byte-Pair Encoding", "Before a model reads a word, it reads a merge list. BPE decides how text becomes tokens — and tokens decide cost, context, and where a model fails."),
  articleIndexEntry("embeddings-and-cosine-similarity", "Embeddings & Cosine Similarity", "A good embedding puts dog near puppy and far from semiconductor. Cosine similarity is how that claim gets measured."),
  articleIndexEntry("quantization-int8-to-fp8", "Quantization: INT8 to FP8", "Fewer bits per weight means less memory and faster decoding. The price is a rounding error you can steer."),
  articleIndexEntry("kv-cache-and-flashattention", "KV Cache & FlashAttention", "Attention costs time that grows with the square of the sequence and memory that never shrinks. The KV cache is why long context costs what it costs — and FlashAttention is why it fits."),
  articleIndexEntry("rag-from-chunks-to-citations", "RAG: From Chunks to Citations", "Retrieval-augmented generation is a pipeline, not a prompt. Most failures happen before the model reads a single token."),
  articleIndexEntry("post-training-rlhf-dpo-grpo", "Post-Training: RLHF → DPO → GRPO", "Pretraining teaches the model language. Post-training teaches it behavior — and by 2026 the human preference label gave way to the reward a program can check."),
  articleIndexEntry("pca-and-svd-in-practice", "PCA & SVD in Practice", "The eigenvector article ends at Av = λv. This one starts there: project the cloud, keep the top axes, rebuild — and account for every bit of what you threw away."),
  articleIndexEntry("calibration-and-uncertainty", "Calibration & Uncertainty", "A model that says 90% should be right 90% of the time. Modern networks are not — and one number fitted on held-out data fixes most of the gap."),
  articleIndexEntry("lora-low-rank-fine-tuning", "LoRA / PEFT: Low-Rank Fine-Tuning", "Freeze the model, train a small rank-16 shadow. In 2026 that shadow is most fine-tuning — and at serving time it disappears into the weights."),
];
