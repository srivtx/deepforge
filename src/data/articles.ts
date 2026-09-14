import type { ComponentType } from "react";
import {
  AttentionHeatmap,
  AttentionPipeline,
  BpeMergeCascade,
  DescentContours,
  EigenvectorGrid,
  EmbeddingGeometry,
  KMeansLoop,
  KvMemoryTiling,
  PostTrainingPipeline,
  QuantizationNumberLine,
  RagPipeline,
  SoftmaxTemperatureCurve,
} from "@/components/articles/figures";

export type DemoKind =
  | "softmax-temperature"
  | "eigenvector"
  | "gradient-descent"
  | "kmeans"
  | "attention"
  | "bpe-merge"
  | "embedding-cosine"
  | "quantization-scale"
  | "kv-cache"
  | "rag-retrieval"
  | "post-training";

export type FigureKind =
  | "softmax-temperature-curve"
  | "eigenvector-grid"
  | "descent-contours"
  | "kmeans-loop"
  | "attention-pipeline"
  | "attention-heatmap"
  | "bpe-merge-cascade"
  | "embedding-geometry"
  | "quantization-number-line"
  | "kv-memory-tiling"
  | "rag-pipeline"
  | "post-training-pipeline";

export interface ProseSection {
  kind: "prose";
  text: string;
}

export interface DemoSection {
  kind: "demo";
  demo: DemoKind;
  params?: Record<string, number>;
}

export interface FigureSection {
  kind: "figure";
  figure: FigureKind;
  caption?: string;
}

export type ArticleSection = ProseSection | DemoSection | FigureSection;

export const FIGURES: Record<FigureKind, ComponentType> = {
  "softmax-temperature-curve": SoftmaxTemperatureCurve,
  "eigenvector-grid": EigenvectorGrid,
  "descent-contours": DescentContours,
  "kmeans-loop": KMeansLoop,
  "attention-pipeline": AttentionPipeline,
  "attention-heatmap": AttentionHeatmap,
  "bpe-merge-cascade": BpeMergeCascade,
  "embedding-geometry": EmbeddingGeometry,
  "quantization-number-line": QuantizationNumberLine,
  "kv-memory-tiling": KvMemoryTiling,
  "rag-pipeline": RagPipeline,
  "post-training-pipeline": PostTrainingPipeline,
};

export interface Article {
  id: string;
  slug: string;
  title: string;
  dek: string;
  readMinutes: number;
  category: string;
  problemIds: string[];
  sections: ArticleSection[];
}

export const ARTICLES: Article[] = [
  {
    id: "art-softmax-temperature",
    slug: "why-softmax-needs-temperature",
    title: "Why Softmax Needs Temperature",
    dek: "Logits are not probabilities. Temperature is the dial that decides how much you care about the difference between them.",
    readMinutes: 7,
    category: "Deep Learning",
    problemIds: ["dl-021", "ml-065", "nlp-075", "dl-003", "la-149"],
    sections: [
      {
        kind: "prose",
        text: "A neural network usually ends with a vector of real numbers called logits. Nothing constrains them. They can be negative, they can be huge, and they do not sum to one. To read them as a distribution over next tokens or classes, you need a map from all of R^n to the probability simplex. Softmax is that map: `p_i = exp(z_i) / sum_j exp(z_j)`.\n\nExponentiation is what makes it work. It turns arbitrary scores into positive numbers. It also preserves their order, so the largest logit always receives the largest probability.",
      },
      {
        kind: "prose",
        text: "Softmax is famously shift-invariant: adding a constant c to every logit changes nothing. That follows from `exp(z_i + c) = exp(z_i)·exp(c)`, since the factor cancels in the ratio.\n\nThis is not just a curiosity. It is the basis of the numerically stable implementation: subtract the maximum logit before exponentiating so nothing overflows.\n\nSoftmax is not scale-invariant, though. Multiplying every logit by 10 sharpens the distribution dramatically. Dividing them by 10 flattens it. The temperature parameter exists to control exactly that scale.",
      },
      {
        kind: "prose",
        text: "Temperature divides the logits before the exponential: `p_i(T) = exp(z_i / T) / sum_j exp(z_j / T)`. At `T = 1` this is the standard softmax.\n\nAs `T` approaches zero from above, `z_i / T` becomes enormous for the largest logit and negligible for the rest. The distribution collapses to a one-hot vector pointing at the argmax.\n\nAs `T` grows, the logits are squashed toward zero. The distribution approaches the uniform distribution `1/n`. In between, temperature is a smooth dial from 'decide' to 'shrug'.",
      },
      {
        kind: "demo",
        demo: "softmax-temperature",
        params: { temp: 1 },
      },
      {
        kind: "prose",
        text: "Here is the fact that surprises people: for any positive T, temperature can never change which class is most likely. Softmax is a monotone transformation, and dividing by a positive number preserves order. The argmax of the probabilities is always the argmax of the logits.\n\nTemperature changes confidence, entropy, and the shape of the distribution. It never changes the ranking. If you want the bars to reorder, you need to touch the logits themselves.",
      },
      {
        kind: "figure",
        figure: "softmax-temperature-curve",
        caption:
          "Temperature rescales confidence, never the ranking — class 1 stays the argmax from a near one-hot spike at T = 0.2 to a near-uniform shrug at T = 5.",
      },
      {
        kind: "prose",
        text: "What temperature does change is what you sample. Greedy decoding picks the argmax at every step. It is deterministic but dull. Sampling from `softmax(z/T)` is the standard alternative.\n\nThe Gumbel-max trick makes it concrete. Draw one fixed noise vector `g` from the Gumbel distribution. The sampled token is `argmax_i (z_i / T + g_i)`.\n\nNow flip points exist. At very low temperature the argmax of the logits wins. At very high temperature the largest noise term wins. The ticks in the demo mark the exact temperatures where the sampled token changes for one fixed draw.",
      },
      {
        kind: "prose",
        text: "Temperature scaling is also a post-hoc calibration method. Take a trained classifier, hold its weights fixed, and fit a single scalar `T` on a validation set — usually by minimizing negative log-likelihood.\n\nA network trained with modern objectives is often overconfident. A `T` greater than one softens its probabilities back toward reality without touching accuracy.\n\nKnowledge distillation runs the same idea in reverse. The teacher's soft targets are generated at a high temperature. That lets the student see the relative probabilities of the wrong classes, not just the winner.",
      },
      {
        kind: "prose",
        text: "Two implementation notes before you practice. First, never divide by an exact zero. Guard the denominator or clamp temperature to a small positive value. The limit as T goes to zero is a valid distribution only in the limit.\n\nSecond, negative temperatures are not a bug fix for anything. They invert the ranking and put the smallest logit first, which is almost never what you want.\n\nWhen you write your own softmax, subtract the maximum before exponentiating. When you add temperature, do it before the max-subtraction so the arithmetic stays stable.",
      },
    ],
  },
  {
    id: "art-eigenvectors",
    slug: "eigenvectors-you-can-see",
    title: "Eigenvectors You Can See",
    dek: "Most vectors get knocked off their direction by a matrix. A few refuse — and those are the ones worth finding.",
    readMinutes: 8,
    category: "Linear Algebra",
    problemIds: ["la-040", "la-083", "la-084", "la-050", "la-174"],
    sections: [
      {
        kind: "prose",
        text: "Stop thinking of a matrix as a table of numbers. A 2x2 matrix is a machine that takes a vector and returns a new vector. It rotates, stretches, shears, and reflects. Feed it the whole plane and it warps the grid into a parallelogram.\n\nThe columns of the matrix tell you where the basis vectors land. That is why you can read a transformation straight off its entries. The first column is where `e1 = (1, 0)` goes, the second is where `e2 = (0, 1)` goes.",
      },
      {
        kind: "prose",
        text: "Almost every vector comes out pointing somewhere new. For certain special directions, the matrix only scales what it is given. The vector may get longer, shorter, or flip to the opposite side. It stays on the same line through the origin.\n\nThose directions are the eigenvectors, and the scale factors are the eigenvalues. Formally, `Av = λv`, with `v` not the zero vector.\n\nThe equation says that applying A is indistinguishable from multiplying by a single number. For that one direction, a whole matrix collapses into a scalar.",
      },
      {
        kind: "prose",
        text: "For a 2x2 matrix the eigenvalues fall out of the characteristic equation `det(A − λI) = 0`. It expands to `λ² − tr(A)·λ + det(A) = 0`.\n\nThe trace is the sum of the eigenvalues, and the determinant is the product. That gives a quick sanity check on any answer you compute by hand: if your two eigenvalues do not sum to the trace, something is wrong.\n\nIf the discriminant `tr² − 4·det` is negative, the eigenvalues are complex. The matrix has no real eigendirections — it contains a rotation.",
      },
      {
        kind: "prose",
        text: "Eigenvectors are the skeleton of repeated multiplication. Compute `A^k v` and write v in the eigenbasis: each application simply multiplies the coefficient on eigenvector i by `λ_i^k`. The largest-magnitude eigenvalue dominates as k grows. That is exactly why power iteration works and why it finds PageRank's stationary distribution.\n\nIn statistics, the eigenvectors of a covariance matrix are the principal components: the directions of maximum variance, ordered by eigenvalue. In dynamics, an eigenvalue above one in magnitude means exponential growth, and below one means decay.",
      },
      {
        kind: "demo",
        demo: "eigenvector",
        params: { a: 2, b: 1, c: 0.5, d: 1 },
      },
      {
        kind: "prose",
        text: "Drag the tip of the vector v in the canvas and watch the two arrows. The dark arrow is v, and the warm arrow is Av.\n\nIn general they disagree. The angle between them is a measure of how far v is from an eigendirection. Slide v until the arrows line up: that is an eigenvector, and the ratio of their lengths is its eigenvalue.\n\nThe dashed lines show where the real eigendirections live for the current matrix. The readout gives you the Rayleigh quotient `(v·Av)/(v·v)`. It is the best scalar estimate of λ along v, and it lies between the two eigenvalues.",
      },
      {
        kind: "figure",
        figure: "eigenvector-grid",
        caption:
          "A matrix warps the whole grid, but an eigendirection only stretches: Av stays on the same dashed line as v while w visibly rotates off its own.",
      },
      {
        kind: "prose",
        text: "When the matrix has two independent eigenvectors, it can be diagonalized: `A = VΛV⁻¹`, where the columns of V are the eigenvectors and Λ is diagonal. In that basis the matrix is nothing but separate scalings. That is why powers, exponentials, and differential equations all become trivial.\n\nNot every matrix cooperates. Repeated eigenvalues can leave only one eigendirection, producing a shear that no change of basis can flatten. Those defective matrices are the reason Jordan form exists. For symmetric matrices life is always good: the spectral theorem guarantees real eigenvalues and orthogonal eigenvectors.",
      },
      {
        kind: "prose",
        text: "The practical takeaway is to look for eigenvectors before you compute anything expensive. If a direction is nearly preserved, the residual norm `||Av − λv||` is tiny, and you have found structure.\n\nThe problems below start with checking a claimed eigenpair. They move through the 2x2 characteristic polynomial and end at power iteration. That algorithm finds the dominant eigenvector without ever forming the characteristic polynomial.",
      },
    ],
  },
  {
    id: "art-gradient-descent",
    slug: "gradient-descent-from-mse-to-logistic",
    title: "Gradient Descent from MSE to Logistic",
    dek: "One optimizer, two losses. Watch the same update rule pull a line through data by squared error and by cross-entropy.",
    readMinutes: 9,
    category: "Optimization",
    problemIds: ["ml-103", "ml-012", "op-001", "ml-083", "ml-002"],
    sections: [
      {
        kind: "prose",
        text: "Training a model is an optimization problem. You choose parameters θ, measure how wrong the model is with a loss `L(θ)`, and then repeatedly take a step downhill: `θ ← θ − η·∇L(θ)`.\n\nThe learning rate η controls the step size. The gradient points in the direction of steepest ascent, so the negative gradient is the cheapest local way down.\n\nEverything else in deep learning is a variation on this sentence: different losses, different parameterizations, different ways of estimating the gradient from a batch of data.",
      },
      {
        kind: "prose",
        text: "Start with linear regression and mean squared error. The model is `ŷ = w·x + b` and the loss is the average of `(ŷ − y)²`.\n\nIts gradient is beautifully simple. The derivative with respect to each weight is `2·(ŷ − y)·x`, and with respect to the bias it is `2·(ŷ − y)`. The error is multiplied by the input.\n\nA point far from the line and far from the origin produces a large correction. A point where the model is already right produces none. For linear models this loss is convex, so gradient descent converges to the global optimum given a small enough learning rate.",
      },
      {
        kind: "prose",
        text: "Logistic regression keeps the linear score `z = w·x + b` but pushes it through a sigmoid, `σ(z) = 1/(1 + e^{−z})`. It switches the loss to binary cross-entropy: `L = −[y·log(p) + (1−y)·log(1−p)]` where `p = σ(z)`.\n\nThe logarithm punishes confident mistakes without bound. Squared error, by contrast, saturates at one.\n\nAnd then something lovely happens. The gradient of the log loss with respect to the weights is `(p − y)·x`. That is the same shape as the MSE gradient, with the prediction's probability replacing the raw prediction. No sigmoid derivative is left behind, because it cancels against the log.",
      },
      {
        kind: "demo",
        demo: "gradient-descent",
        params: { lr: 0.6 },
      },
      {
        kind: "prose",
        text: "Click the canvas to add points and watch the decision boundary `w·x + b = 0` refit after every addition.\n\nPoints near the boundary exert the strongest pull: their `p − y` term is largest in magnitude. Points far on the correct side are already classified confidently. Their gradient nearly vanishes, so the boundary barely notices them.\n\nSwitch the update rule between mean squared error and log loss. MSE learns the same sign behavior, but its gradient carries an extra `p(1−p)` factor. It crawls when the model is confidently wrong — one reason cross-entropy is the default for classification.",
      },
      {
        kind: "figure",
        figure: "descent-contours",
        caption:
          "Same update rule, same start, same step size: circular contours give a straight path, elongated ones force a zig-zag — conditioning, not the algorithm, decides.",
      },
      {
        kind: "prose",
        text: "The loss curve underneath tells you whether the learning rate is sane. A curve that descends smoothly and flattens has converged. A curve that jumps up and down, or explodes, means η is too large. A curve still falling slowly after hundreds of steps means η is too small, or the data is poorly scaled.\n\nCycling through the points one at a time gives a noisy, stair-stepping curve. That is stochastic gradient descent, and the noise is a feature. It helps escape flat regions and saddle points that full-batch descent would circle forever.",
      },
      {
        kind: "prose",
        text: "With perfectly separable data, logistic regression has no finite optimum. The weights keep growing, so the sigmoid saturates and the loss keeps shrinking toward zero. In the demo the boundary stabilizes visually long before the weights stop moving.\n\nIn practice you stop early or add L2 regularization. That pulls the weights toward zero and restores a finite optimum.\n\nFor non-linear models the loss is no longer convex, and gradient descent can land in a local minimum. But in high dimensions, exact minima are rare. Saddle points are the more common obstacle, which is another argument for stochastic updates.",
      },
      {
        kind: "prose",
        text: "Two implementation details matter more than they look. First, batch versus stochastic. The true gradient averages over all examples, while SGD estimates it from one example or a minibatch. Minibatches trade a little noise for much better hardware utilization and smoother curves.\n\nSecond, feature scaling. Gradient descent takes elliptical steps on badly scaled data because the curvature in each direction differs. Standardizing inputs is often the difference between converging in fifty steps and five thousand.\n\nThe problems below ask for the sigmoid, the logistic gradient, the squared-error gradient, and a single descent step.",
      },
    ],
  },
  {
    id: "art-kmeans",
    slug: "k-means-assignment-to-convergence",
    title: "K-Means: Assignment to Convergence",
    dek: "Two alternating steps, one stubborn objective. Step through the loop and watch inertia only ever fall.",
    readMinutes: 7,
    category: "ML Fundamentals",
    problemIds: ["ml-003", "ml-032", "ml-033", "ml-034", "ml-145"],
    sections: [
      {
        kind: "prose",
        text: "Clustering asks a question with no labels attached: given a cloud of points, what groups are hiding inside it? K-means answers with a concrete objective.\n\nPick a number of clusters k and place k centroids. Assign every point to its nearest centroid. Measure the total squared distance between points and their assigned centers. That quantity is called inertia.\n\nK-means is the search for centroids that make inertia as small as possible. It is a combinatorial problem, because the assignments are discrete. But the objective has enough structure to admit a simple iterative attack.",
      },
      {
        kind: "prose",
        text: "The assignment step is exact given the centroids. For each point, compute the squared distance to every centroid and assign it to the closest one. Ties can be broken by index; the objective is indifferent.\n\nThis step can only decrease inertia. Moving a point to its nearest centroid never increases its distance to the center it ends up with. The squared distance `||x − μ_c||²` is cheap to compute. The whole step costs O(n·k·d) for n points, k clusters, and d dimensions.",
      },
      {
        kind: "prose",
        text: "The update step is exact given the assignments. For each cluster, replace its centroid with the mean of the points assigned to it. This is calculus, not guesswork. The sum of squared distances to a point μ is minimized when μ is the arithmetic mean of the cluster's members, because the gradient `2·Σ(x_i − μ)` vanishes exactly there.\n\nAssignments and updates alternate. Each full iteration weakly decreases inertia, and since there are finitely many possible assignments, the process terminates — usually in a handful of iterations.",
      },
      {
        kind: "demo",
        demo: "kmeans",
      },
      {
        kind: "prose",
        text: "Step through the demo and watch inertia in the status line. It drops on every iteration, then stops moving when assignments stop changing.\n\nWhat you are also watching is the weakness of the method. The descent is monotone, but it is not guaranteed to reach the global minimum. Different starting positions can lead to different final clusters, some of them noticeably worse. That is why the initialization step deserves as much attention as the loop itself.",
      },
      {
        kind: "figure",
        figure: "kmeans-loop",
        caption:
          "Assignment and update are each exact given the other, so inertia can only fall or stay flat — the loop never climbs, it plateaus.",
      },
      {
        kind: "prose",
        text: "The standard fix for bad initialization is k-means++, which chooses starting centroids with a randomized rule weighted by squared distance. The first centroid is chosen uniformly from the data. Each subsequent one is drawn with probability proportional to its squared distance from the nearest already-chosen center.\n\nFar-apart seeds get picked often, so the clusters start spread out. It is still randomized, but it comes with an approximation guarantee and works well enough to be the default in most libraries.\n\nA related issue is empty clusters. If no point is nearest to a centroid, the usual repair is to keep the old position or re-seed it at the farthest point.",
      },
      {
        kind: "prose",
        text: "K-means assumes clusters are roughly spherical, similar in size, and separated by distances that matter. It will happily slice an elongated cluster in half or merge two nearby ones. It also requires you to choose k.\n\nThe elbow method plots inertia against k and looks for the point where the curve stops falling quickly. Silhouette scores measure how much better each point fits its own cluster than the next nearest, and they work without a clear elbow.\n\nWhichever you use, remember that inertia decreases with more clusters by construction. It is the rate of improvement, not the raw value, that carries information. The problems below cover a single iteration, the assignment and update steps separately, inertia, and k-means++ initialization.",
      },
    ],
  },
  {
    id: "art-attention",
    slug: "attention-is-a-heatmap",
    title: "Attention Is a Heatmap",
    dek: "Strip away the code and attention is a table of dot products, a softmax on every row, and a weighted average of values.",
    readMinutes: 8,
    category: "Deep Learning",
    problemIds: ["dl-034", "dl-035", "dl-036", "nlp-050", "nlp-072"],
    sections: [
      {
        kind: "prose",
        text: "Attention starts with a sequence of token vectors, one per position. The question it answers is relational: for this position, which other positions carry information that matters?\n\nThe mechanism answers with a convex combination — a weighted average — where the weights are learned from the data rather than fixed by position. That is the whole idea. The projections, the scaling, the masks, and the multiple heads all exist to make that average expressive and stable.",
      },
      {
        kind: "prose",
        text: "Each token is projected three ways. The query `q = x·W_Q` says what this position is looking for. The key `k = x·W_K` says what this position offers. The value `v = x·W_V` is the content that gets mixed.\n\nSimilarity between a query and a key is measured with a dot product. A large positive `q·k` means the query is asking for something this key advertises.\n\nStack the queries into a matrix Q and the keys into K, and the entire table of pairwise similarities is one matrix multiply: `Q·Kᵀ`. Its entry `(i, j)` is how much query i likes key j.",
      },
      {
        kind: "prose",
        text: "There is a scaling factor in the denominator: `Q·Kᵀ / √d_k`, where `d_k` is the dimension of each query and key vector. It is not cosmetic.\n\nIf the components of q and k are independent with mean zero and variance one, their dot product has variance proportional to `d_k`. Scores grow with dimension. Feed large scores into a softmax and it saturates: one weight becomes one and the rest become zero.\n\nThe gradient through the row dies, and learning stalls. Dividing by `√d_k` keeps the scores at a workable scale regardless of dimension.",
      },
      {
        kind: "prose",
        text: "Softmax is applied to every row independently. Row i of the score matrix becomes a probability distribution over the keys, and those probabilities are the attention weights.\n\nEvery row sums to exactly one: each query spends its full budget of attention across the keys it can see. A concentrated row means the query is locked onto one position. A flat row means it is spreading its attention broadly. The entropy of the row is a useful summary of which regime it is in.",
      },
      {
        kind: "demo",
        demo: "attention",
      },
      {
        kind: "prose",
        text: "The output is the weighted average of the values: `softmax(QKᵀ/√d)·V`. Row i of the output is a mixture of all value vectors, with the mixture proportions given by row i of the attention weights.\n\nThe shape is preserved: one output vector per input token, each of the same dimension as the values. That is what makes attention a drop-in layer. Around it sit residual connections, layer normalization, and a position-wise feed-forward network, but the mixing itself is exactly this one multiplication.",
      },
      {
        kind: "figure",
        figure: "attention-pipeline",
        caption:
          "The whole mechanism in one pass: project to Q, K, and V; score every query against every key; scale and softmax each row; then average the values.",
      },
      {
        kind: "prose",
        text: "Real transformers run several attention operations in parallel, each with its own `W_Q`, `W_K`, and `W_V`. These are the heads.\n\nOne head might track syntactic dependencies, another coreference, another adjacency. Each works in a different learned subspace and can afford different similarity patterns.\n\nThe heads' outputs are concatenated and passed through an output projection `W_O`, which lets the model combine what the heads found. Splitting d_model across h heads keeps the parameter count and the floating-point cost roughly constant while changing the representational geometry.",
      },
      {
        kind: "figure",
        figure: "attention-heatmap",
        caption:
          "Softmax turns every row into a distribution that sums to 1 — peaked when one key wins, flat when attention spreads — and the causal mask keeps the future at zero.",
      },
      {
        kind: "prose",
        text: "Two practical facts finish the picture. First, masks. Adding −∞ (in practice a very negative number) to forbidden score entries before the softmax forces their weights to zero. That is how causal language models prevent a token from attending to the future, and how padding tokens are ignored.\n\nSecond, cost. The score matrix has n² entries for a sequence of length n, so attention is quadratic in sequence length. That single fact is why context windows are expensive and why so much engineering goes into sparse, sliding-window, and memory-efficient variants.\n\nThe problems below ask you to scale the scores, softmax the rows, take the weighted sum, and reproduce scaled dot-product attention end to end.",
      },
    ],
  },
  {
    id: "art-bpe",
    slug: "tokenization-byte-pair-encoding",
    title: "Tokenization: Byte-Pair Encoding",
    dek: "Before a model reads a word, it reads a merge table. BPE decides how text becomes tokens — and tokens set the units of cost, context, and failure.",
    readMinutes: 7,
    category: "NLP",
    problemIds: ["nlp-001", "nlp-022", "nlp-096", "nlp-099", "nlp-235", "nlp-238"],
    sections: [
      {
        kind: "prose",
        text: "A model does not read text. It reads a sequence of integer ids, and a tokenizer is the program that produces them.\n\nThe simplest tokenizer splits on whitespace. It breaks on `don't`, on `state-of-the-art`, and on every language that does not put spaces between words. It also throws away casing and punctuation unless you write special rules for each case.\n\nSplitting into single characters avoids all of that. Nothing is unknown, but a sentence becomes long. Longer sequences cost more to train and more to serve, because attention is quadratic in length.",
      },
      {
        kind: "prose",
        text: "Whole words fail the other way. A vocabulary that holds every word form of a morphologically rich language is enormous, and any form outside it has no id at all. A single new name or a typo becomes an unknown token.\n\nSubword tokenization is the middle ground. Keep frequent pieces whole and split rare pieces into parts. The model still sees `low` inside `lowest`, and `est` stays a reusable piece.",
      },
      {
        kind: "prose",
        text: "Byte-pair encoding, or BPE, builds those pieces from data. It starts with a tiny alphabet: the characters in the corpus, plus a marker for the end of a word, written `</w>` or `·`.\n\nThen it counts every adjacent pair across the corpus and merges the most frequent one into a single new symbol. It adds that merge to an ordered list and counts again on the updated corpus.\n\nEach round repeats the same move. The result is a ranked merge list. That list plus the base alphabet is the whole tokenizer.",
      },
      {
        kind: "demo",
        demo: "bpe-merge",
      },
      {
        kind: "prose",
        text: "What you just stepped through is greedy. At every step BPE merges the single most frequent pair, then looks again. That is not the globally best vocabulary, but it is fast, deterministic, and still standard in 2026.\n\nTwo details matter. Ties are broken by scan order, so the direction of the scan is part of the algorithm. And merges apply left to right, which can combine a pair that blocks a different merge inside the same word.",
      },
      {
        kind: "prose",
        text: "After training, encoding is one pass. Split the text, append the end marker to each word, then apply the merge list in rank order. The number of resulting tokens is the cost. It sets the context budget, the latency, and the price of an API call.\n\nFertility is the average number of tokens per word. English sits around 1.3. A language whose script the tokenizer never learned can sit at 5 or 10. The same sentence then costs several times as much — tokenizer quality is a fairness problem, not only an engineering one.",
      },
      {
        kind: "figure",
        figure: "bpe-merge-cascade",
        caption:
          "The most frequent pair collapses first and each merge removes that pair's count from the corpus: 95 tokens become 86, then 77, then 68 while the vocabulary only grows.",
      },
      {
        kind: "prose",
        text: "Byte-level BPE drops the character alphabet entirely and starts from the 256 byte values. Every string is then representable, so there is no `[UNK]` token and no crash on emoji, rare names, or code.\n\nThe cost moves into length. Byte-level tokenizers need more tokens for the same text, so the effective training sequence grows. Most modern models accept that trade.",
      },
      {
        kind: "prose",
        text: "Special tokens sit on top of the learned vocabulary. `[BOS]`, `[EOS]`, `[PAD]`, chat roles, and tool markers get reserved ids that the merge process never touches.\n\nA tokenizer is frozen when training starts, because the embedding matrix is indexed by token id. Swap the tokenizer later and every learned vector points at the wrong symbol.\n\nThe problems below start with a token count, move through byte-level BPE and WordPiece, and end at fertility and characters per token.",
      },
    ],
  },
  {
    id: "art-embeddings",
    slug: "embeddings-and-cosine-similarity",
    title: "Embeddings & Cosine Similarity",
    dek: "A good embedding puts dog near puppy and far from semiconductor. Cosine similarity is how that claim gets measured.",
    readMinutes: 8,
    category: "NLP",
    problemIds: ["la-025", "la-130", "ml-046", "nlp-005", "nlp-067", "nlp-247"],
    sections: [
      {
        kind: "prose",
        text: "An embedding turns an object into a vector. A word, a sentence, an image, a user. No single coordinate carries a label. Meaning lives in direction and distance.\n\nTraining pushes vectors together when the objects appear in similar contexts and apart when they do not. That is the whole trick. After enough data, `dog` lands near `puppy`, and both land far from `semiconductor`.\n\nOnce meaning is geometry, every question about similarity becomes a question about vectors.",
      },
      {
        kind: "prose",
        text: "The dot product measures agreement: `a·b = Σ a_i·b_i`. It is large and positive when two vectors point the same way, zero when they are perpendicular, and negative when they disagree.\n\nThe dot product also grows with length. Double one vector and the dot product doubles, even though the relationship did not change. Raw dot products are therefore a poor similarity score unless the vectors are already normalized.\n\nCosine similarity removes the lengths: `cos(a,b) = a·b / (‖a‖·‖b‖)`. It compares directions only.",
      },
      {
        kind: "prose",
        text: "Cosine lives between -1 and 1. One means identical direction, zero means orthogonal, and minus one means exactly opposite. Values in between equal `cos θ`, where `θ` is the angle between the vectors.\n\nAfter normalization, magnitude carries no semantics. A short vector and a long vector that point the same way have cosine one. In many training setups, magnitude tracks frequency or confidence rather than meaning.\n\nSo the standard pipeline normalizes once, stores unit vectors, and lets a plain dot product act as cosine.",
      },
      {
        kind: "demo",
        demo: "embedding-cosine",
      },
      {
        kind: "prose",
        text: "Drag the query around the space and watch the ranking. The angle arc shows `θ` against the best neighbor, and the list re-sorts as the direction changes.\n\nSwitch the metric and the order can change. The dot product prefers long vectors. Euclidean distance cares about absolute position. Cosine ignores length by construction — drag the query far out along one ray and its scores barely move.",
      },
      {
        kind: "prose",
        text: "Normalization is also an engineering choice. With unit vectors, a dot product replaces a division, and that matters when a vector index scores millions of pairs per query. Quantized storage cuts the bill further: one byte per dimension with little retrieval loss, or Matryoshka embeddings truncated from 1024 dimensions to 256.\n\nThe ranking in the demo is exact nearest neighbors. Production systems use approximate indexes and trade a small amount of recall for a large amount of speed.",
      },
      {
        kind: "figure",
        figure: "embedding-geometry",
        caption:
          "Cosine is a projection onto the unit circle: it is 1 for identical directions, 0 at 90°, and −1 for opposites, and no amount of scaling moves it.",
      },
      {
        kind: "prose",
        text: "One ranking hides a subtlety. Two words can be close and still be wrong neighbors, because they are close for the wrong reason. Hard negatives are pairs that look similar but mean different things. Training on them sharpens the space.\n\nStack many queries against many candidates and retrieval becomes one matrix of cosine values. Top-k over that matrix is semantic search, and it is the core of every retrieval-augmented system.",
      },
      {
        kind: "prose",
        text: "Cosine is not the only choice. Euclidean distance is common in clustering and image pipelines. Dot product is standard inside attention, where learned projections already control the scale. Pick the metric that matches how the vectors were trained.\n\nThe problems below compute cosine between vectors, build cosine matrices, and rank embeddings by similarity.",
      },
    ],
  },
  {
    id: "art-quantization",
    slug: "quantization-int8-to-fp8",
    title: "Quantization: INT8 to FP8",
    dek: "Halving the bits roughly halves memory and doubles decode throughput. The price is a rounding error you can steer.",
    readMinutes: 9,
    category: "Deep Learning",
    problemIds: ["dl-058", "dl-059", "dl-060", "dl-077", "dl-195", "dl-451"],
    sections: [
      {
        kind: "prose",
        text: "Serving a model is a memory problem before it is a compute problem. Every weight sits in memory, and every generated token moves those weights through the chip. Halving the bytes roughly halves the transfer, which often doubles decode throughput.\n\nQuantization maps a wide range of floats onto a small set of codes. INT8 gives 256 levels and needs one byte per weight. That is four times smaller than float32 and half of float16 or bfloat16.\n\nThe price is rounding error. Quantization is lossy compression, and the job is to put the error where it hurts least.",
      },
      {
        kind: "prose",
        text: "The usual map is affine: `x ≈ scale · (q − zero_point)`. Pick a `scale` and a `zero_point`, round each value to the nearest integer code, and store `q`.\n\nSymmetric quantization centers the range on zero, so `zero_point = 0` and the scale is `absmax / 127`. Zero maps to zero exactly, which is why it is popular for weights.\n\nAsymmetric quantization fits the actual `[min, max]` range, so the zero point is usually not zero. It spends all 256 codes when the data is skewed, at the cost of a little extra bookkeeping.",
      },
      {
        kind: "prose",
        text: "Outliers decide how much resolution you lose. One weight at 5 while the rest sit in `[-2, 2]` forces a large scale, and every normal value gets a coarse step. The fix is to clip the range.\n\nClipping is a trade. A narrow range gives typical values finer steps, and everything outside becomes a constant at the edge. That error is the one you can steer.\n\nGranularity decides how local the scale is. Per-tensor shares one scale across the whole tensor, so one outlier damages every value. Per-channel gives each row or column its own scale, which isolates the damage. Per-tensor is cheaper; per-channel is the default for weights.\n\nFP8 enters here. An 8-bit float spends bits on an exponent, so its levels pack densely near zero and stretch far out. It covers a wide range without a custom scale, and Hopper and Blackwell run it at full speed.",
      },
      {
        kind: "demo",
        demo: "quantization-scale",
      },
      {
        kind: "prose",
        text: "Drag the clip threshold and watch the error bars. Lower it and typical values get finer steps while the outliers pay. Raise it and the outliers survive at the cost of coarser steps everywhere.\n\nThe error histogram shows who pays. A tight distribution means the format fits the data. Long tails mean the range is too wide.\n\nSQNR summarizes the trade in decibels: signal power over error power. Above roughly 40 dB, a quantized model usually matches the original on benchmarks.",
      },
      {
        kind: "prose",
        text: "Turn on per-channel and the histogram narrows at once. That is the outlier story in one click. Four channels carry four scales, so the large value only distorts its own channel.\n\nIn practice, weights use per-channel INT8 or grouped INT4. Activations are harder because they change with every input, so they use per-tensor scales calibrated on sample data or scales computed at run time.\n\nW8A8 keeps weights and activations in 8 bits and speeds up both prefill and decode. W4A16 keeps weights in 4 bits and runs the math in 16, which saves memory but not compute. GPTQ and AWQ are the common recipes for that split.",
      },
      {
        kind: "figure",
        figure: "quantization-number-line",
        caption:
          "Uniform steps cover the clipped range evenly, an outlier at 5.2 collapses to 2.5 with a visible error, and fp8 packs its levels near zero instead of spreading them flat.",
      },
      {
        kind: "prose",
        text: "Error compounds through layers. A layer that receives quantized inputs quantizes its own outputs on top, so end-to-end accuracy is the number that matters. Per-layer error is only a proxy.\n\nCalibration data should look like production data. If the distribution shifts, a scale fitted on the old data clips the new values. Monitoring activation ranges catches the drift.\n\nThe format must also match the silicon. INT8 kernels are everywhere. FP8 needs Hopper, Blackwell, or newer hardware. NVFP4 and MXFP4 are Blackwell-native. Choosing a format the deployment chip does not accelerate is the most expensive quantization mistake.",
      },
      {
        kind: "prose",
        text: "Quantization is also how large models fit on small hardware. QLoRA keeps the base model in 4-bit NF4 and trains small 16-bit adapters on top. The frozen base never changes, so its error is fixed and the adapters learn around it.\n\nKV cache quantization is the decode-time cousin. Caching keys and values in FP8 instead of BF16 nearly halves the memory per token, which is why FP8 KV is a common default at long context.",
      },
      {
        kind: "prose",
        text: "The problems below compute an INT8 scale, quantize and dequantize, work through per-channel scales, and compare INT4 against INT8 memory.\n\nWhen you write the code by hand, watch two things: the rounding mode and the clamp. A scale without a clamp silently overflows, and a clamp without the right scale throws away range for nothing.",
      },
    ],
  },
  {
    id: "art-kv-cache",
    slug: "kv-cache-and-flashattention",
    title: "KV Cache & FlashAttention",
    dek: "Attention is O(n²) compute and O(n) memory that never shrinks. The KV cache is why long context costs what it costs — and FlashAttention is why it fits.",
    readMinutes: 11,
    category: "Deep Learning",
    problemIds: ["dl-075", "dl-124", "dl-186", "dl-211", "dl-370", "dl-401"],
    sections: [
      {
        kind: "prose",
        text: "Attention scores every query against every key. In training and in prefill, the whole sequence arrives at once, so that table can be built in a single pass. Decoding is different. It produces one token at a time, and each new token needs keys and values from every token that came before it.\n\nWithout a cache, generating token 1,000 would recompute the keys and values of the first 999 tokens, in every layer, on every step. The arithmetic is identical every time. The KV cache removes the repetition: keep the K and V vectors you already computed, and append exactly one new key and one new value per layer per token.",
      },
      {
        kind: "prose",
        text: "The cache has a closed-form size: `2 × layers × KV heads × head dim × bytes per element` per token. The 2 is for K and V. The rest is the shape of the projections.\n\nWork a number. A 7B model with 32 layers, 32 query heads, head dim 128, stored in bf16, needs `2 × 32 × 32 × 128 × 2 = 524,288` bytes per token. That is 512 KiB per token, or 64 GiB at 128k tokens for a single sequence. The weights are 14 GB. At long context the cache is several times the model it serves.\n\nThat is the whole lesson in one multiplication: the cost of context is linear in tokens and quadratic in nothing. It is simply the projection shape, times the sequence length.",
      },
      {
        kind: "prose",
        text: "Three architectural choices shrink the multiplier. Grouped-query attention (GQA) shares one key/value projection across several query heads — at 8 query heads per KV head the cache drops 8×. Multi-query attention (MQA) goes all the way to one KV head for every query head. Multi-head latent attention (MLA) compresses K and V into a shared low-rank latent and re-expands them on the fly, which buys 7–14×.\n\nDtype is the other lever. FP8 halves the bytes against bf16 with sub-1% accuracy cost on validated paths, which is why it is a common serving default. GQA and FP8 together routinely turn 64 GiB of cache into 8.",
      },
      {
        kind: "demo",
        demo: "kv-cache",
      },
      {
        kind: "prose",
        text: "In the decode panel, watch the cache grow one token at a time. Each append is cheap — two small projections per layer. The cost is bandwidth. Decode is memory-bound: every generated token streams the weights and the entire cache through the chip just to compute one new row of attention.\n\nThat is why batching raises throughput so much. The same cache read serves several sequences at once. It is also why a paged allocator matters: sequences start short and grow, so the cache must be allocated in blocks rather than one contiguous buffer reserved for the worst case.",
      },
      {
        kind: "prose",
        text: "FlashAttention attacks the other half of the problem. The naive implementation materializes the n×n score matrix in HBM, softmaxes each row, and multiplies by V. HBM can hold those bytes, but moving them is the bottleneck; a large intermediate that is written once and read once is exactly the wrong thing to put there.\n\nFlashAttention never writes the matrix. It tiles Q, K, and V into blocks that fit in on-chip SRAM, computes scores for one tile, updates a running softmax state, and discards the tile. The final output is bit-for-bit close to exact attention; only the memory traffic changes.",
      },
      {
        kind: "figure",
        figure: "kv-memory-tiling",
        caption:
          "The cache overtakes 7B bf16 weights near 16k tokens and reaches 9× them at 128k, while FlashAttention keeps the n×n score matrix inside SRAM instead of HBM.",
      },
      {
        kind: "prose",
        text: "The running state is a pair: the maximum score seen so far, `m`, and the sum of exponentials so far, `l`. When a new tile arrives, its maximum may be larger than `m`. The old sum is now out of date, so it is rescaled: `l_new = l_old · exp(m_old − m_new) + Σ exp(s_i − m_new)`.\n\nThe partial output is rescaled by the same ratio. Because `m` only ever grows, every value corrected for the old maximum is corrected for the new one in a single multiply. Everything a tile needs lives in registers, so the full row never has to be revisited. That is the online softmax at the heart of every memory-efficient attention kernel.",
      },
      {
        kind: "prose",
        text: "The trade changes with the phase. Prefill processes the whole prompt at once, so each weight read amortizes over many tokens and the kernel becomes compute-bound. Tiled attention wins there, because the score matrix never leaves SRAM. Decode is bandwidth-bound on the cache, so the wins come from GQA, FP8 KV, and eviction instead.\n\nA practical serving stack usually runs all three: GQA for the architecture, FP8 for the cache dtype, and a paged allocator that keeps memory contiguous as sequences grow. None of them changes what attention computes.",
      },
      {
        kind: "prose",
        text: "Long-output reasoning models broke the old assumption that the input is the problem. A 2k-token prompt can trigger 100k tokens of generation, so the cache keeps growing while the model thinks. Two families of fixes exist.\n\nEviction keeps a budget. A sliding window drops the oldest tokens; attention sinks always keep the first few, which carry disproportionate weight; heavy-hitter policies keep the tokens whose accumulated attention is largest. Compression rewrites entries instead: quantize further, merge similar keys, or skip layers. Both trade a measurable accuracy loss for a fixed memory ceiling.",
      },
      {
        kind: "prose",
        text: "The problems below compute bytes per token, the full cache for a sequence, an append step, the online-softmax rescale, and the savings from GQA and tiled attention. They are pure arithmetic, so every number can be checked against the formulas above.",
      },
    ],
  },
  {
    id: "art-rag",
    slug: "rag-from-chunks-to-citations",
    title: "RAG: From Chunks to Citations",
    dek: "Retrieval-augmented generation is a pipeline, not a prompt. Most failures happen before the model reads a single token.",
    readMinutes: 10,
    category: "NLP",
    problemIds: ["nlp-141", "nlp-148", "nlp-184", "nlp-185", "nlp-242", "nlp-252"],
    sections: [
      {
        kind: "prose",
        text: "Retrieval-augmented generation is usually drawn as one box: query in, answer out. In practice it is a pipeline of six or seven stages, and most of its failures happen before the generator reads a single token.\n\nThe shape is fixed. Documents are parsed into text, split into chunks, indexed, retrieved for a query, fused and reranked into a short list, then packed into a context window with citation ids. The model's only job is to ground an answer in the passages it was handed.",
      },
      {
        kind: "prose",
        text: "Chunking decides what can be retrieved. Chunks that are too large dilute the embedding and waste context; chunks that are too small lose the sentence that explains them. Overlap between neighboring chunks is the standard patch, because a span that straddles a boundary is invisible to retrieval unless some chunk contains it whole.\n\nContextual retrieval pushes further. Before embedding, each chunk is prefixed with a short model-generated summary of its place in the document. The chunk now carries its own context instead of relying on the retriever to guess it.",
      },
      {
        kind: "prose",
        text: "Lexical retrieval scores term overlap. BM25 weights each query term by inverse document frequency and saturates term frequency, so a rare name or error code matches exactly while common words contribute little. It is fast, interpretable, and blind to paraphrase.\n\nDense retrieval embeds the query and the chunks into one vector space and scores cosine similarity. It matches meaning: `how do I reset my password` finds `change your passphrase`. It misses exact tokens that never appeared in training, like an order number.",
      },
      {
        kind: "prose",
        text: "Hybrid retrieval runs both and keeps both ranked lists. Neither score is calibrated against the other — a BM25 score of 12 and a cosine of 0.71 are not comparable numbers — so the fusion step works on ranks instead. Ranks are always comparable, which is the whole trick.\n\nThe demo below makes the difference visible. Switch between BM25, dense, and hybrid on the same query, then move the fusion constant `k` and watch how much first place is trusted.",
      },
      {
        kind: "demo",
        demo: "rag-retrieval",
      },
      {
        kind: "prose",
        text: "Reciprocal rank fusion is one line: `RRF(d) = Σ 1/(k + rank_i(d))`, summed over the lists where document d appears, with `k` commonly 60. A document that ranks high in either list scores well; a document near the top of both gets two contributions and usually wins.\n\nThe constant `k` damps the top of each list. Small `k` trusts first place, large `k` flattens the lists toward a vote. Because RRF only reads order, it survives score drift between retriever versions — one reason it is the default fusion in production stacks.",
      },
      {
        kind: "prose",
        text: "Fusion produces candidates, not a final order. A cross-encoder reranker takes each query-chunk pair, concatenates the text, and runs a small transformer over both at once. Unlike the bi-encoder behind dense retrieval, it sees the interaction between query and chunk, which is exactly what separates a related passage from a supporting one.\n\nReranking is the highest-leverage upgrade in the pipeline. Skipping it costs 10–30 recall@5 points; adding it after contextual retrieval cuts retrieval failures by roughly half, with published stacks reporting 49–67% reductions.",
      },
      {
        kind: "figure",
        figure: "rag-pipeline",
        caption:
          "Parse, chunk with overlap, contextualize, index twice, retrieve both ways, fuse by rank, rerank with a cross-encoder, then cite — or refuse when nothing clears the evidence threshold.",
      },
      {
        kind: "prose",
        text: "The context pack is a budget problem. Deduplicate near-identical chunks, sort by rerank score, cut at a token limit, and attach an id to every passage. Those ids are what make citations possible: the generator is instructed to attribute each claim to a bracketed source, and the interface can link that bracket back to the exact span.\n\nWithout span ids, citations are decorative. With them, a reader can verify a claim in one click, which is the entire point of retrieval.",
      },
      {
        kind: "prose",
        text: "Not every query deserves an answer. If the best reranked score falls below a threshold, the system should refuse rather than let the model answer from its weights — that is how a RAG system hallucinates with a straight face.\n\nThe threshold is a calibrated number, chosen so real evidence clears it and out-of-corpus queries do not. The refusal is a feature, not an admission of failure: a grounded 'I don't know' is worth more than a confident wrong answer.",
      },
      {
        kind: "prose",
        text: "Retrieval quality is measured before generation enters the picture. Precision@k counts how many of the k returned chunks are relevant, recall@k counts how many relevant chunks were returned, and mean reciprocal rank rewards putting the first relevant chunk high in the list. Chunk overlap and reranking are the two knobs that move recall the most.\n\nThe problems below compute top-k selection, precision and recall at k, reciprocal rank fusion, chunk overlap coverage, and mean reciprocal rank.",
      },
    ],
  },
  {
    id: "art-post-training",
    slug: "post-training-rlhf-dpo-grpo",
    title: "Post-Training: RLHF → DPO → GRPO",
    dek: "Pretraining teaches the model language. Post-training teaches it behavior — and by 2026 the preference label gave way to the verifiable reward.",
    readMinutes: 11,
    category: "Reinforcement Learning",
    problemIds: ["dl-180", "dl-182", "rl-204", "rl-205", "rl-274", "rl-275"],
    sections: [
      {
        kind: "prose",
        text: "Pretraining teaches a model the statistics of text. It does not teach it to follow instructions, to prefer helpful answers, or to show its work. Those are behaviors, and behaviors come from post-training.\n\nThe modern stack has three rungs. Supervised fine-tuning imitates demonstrations. Preference optimization learns from comparisons — this answer is better than that one. Reinforcement learning from verifiable rewards trains on tasks a checker can grade. Each rung teaches something the previous one cannot.",
      },
      {
        kind: "prose",
        text: "RLHF was the original recipe. Start with SFT on demonstrations. Collect human comparisons between pairs of responses. Fit a reward model to predict which response a human would prefer, using the Bradley–Terry model `P(y_w ≻ y_l) = σ(r_w − r_l)`. Then optimize the policy against that reward with PPO while a KL penalty keeps it close to the reference model it started from.\n\nThe KL term is not decoration. Without it the policy drifts toward whatever maximizes the reward model, including the reward model's own mistakes. That failure is called reward hacking, and closing the gap between reward and quality is most of RLHF engineering.",
      },
      {
        kind: "prose",
        text: "PPO is an online algorithm: sample from the current policy, score the samples, update, repeat. It carries a critic — a value network that estimates expected return at each token — to reduce the variance of the policy gradient. The clipped objective `min(r·A, clip(r, 1−ε, 1+ε)·A)` limits how far one update can move the policy.\n\nThe critic is a second model to train, tune, and store. Removing it is one reason GRPO took over.",
      },
      {
        kind: "demo",
        demo: "post-training",
      },
      {
        kind: "prose",
        text: "DPO skips the reward model entirely. For the same Bradley–Terry preference model, the optimal policy has a closed form, and it implies an implicit reward `β·log(π_θ(y) / π_ref(y))`. Substituting that into the preference likelihood leaves a loss over preference pairs alone: `L = −log σ(β·[(log π_θ(y_w) − log π_ref(y_w)) − (log π_θ(y_l) − log π_ref(y_l))])`.\n\nNo sampling, no critic, no reward model. DPO is a classification loss on log-ratios, which is why it is the stable default. Published comparisons put it within about 0.3 MT-Bench points of PPO at roughly a tenth of the compute.",
      },
      {
        kind: "prose",
        text: "GRPO keeps the online loop and drops the critic. For each prompt it samples a group of G completions, scores them, and normalizes the rewards inside the group: `A_i = (r_i − mean(r)) / std(r)`. The group mean is the baseline, so no value network is needed.\n\nWhen the reward comes from a program that can verify the answer — a math checker, a unit test, a schema validator — the loop becomes RLVR: reinforcement learning from verifiable rewards. There is no reward model to hack, because the checker is the ground truth. GRPO with RLVR is the standard way reasoning models are trained, and DAPO and GSPO are refinements that stabilize its clipping and normalization.",
      },
      {
        kind: "figure",
        figure: "post-training-pipeline",
        caption:
          "SFT imitates, preference optimization compares, RLVR verifies — and GRPO replaces PPO's learned critic with the group mean, crossed out above.",
      },
      {
        kind: "prose",
        text: "The choice depends on the data and the budget. DPO wins when preferences are static and pairs already exist, because it is one pass over a fixed dataset. GRPO wins when outcomes can be verified, because fresh rollouts explore beyond the demonstrations and the verifier cannot be gamed. SFT still owns format, tone, and tool-call syntax.\n\nRankings invert across scale. A controlled 2026 comparison found different winners at different model sizes, so 'best method' is always relative to where you measure. The QLoRA aside matters here too: a 4-bit base with 16-bit adapters is how DPO or GRPO fits on a single node.",
      },
      {
        kind: "prose",
        text: "Three failure modes are worth naming. Reward hacking: the policy finds the reward model's blind spot, so reward rises while humans disagree. Length bias: longer answers score higher, so the model learns to ramble. Distribution collapse: too much KL pressure or too little exploration narrows the policy until it gives one safe answer to everything.\n\nThe defenses are boring and effective. Hold out a human- or verifier-graded set, monitor response length, cap the KL or the update ratio, and refresh the reward model as the policy moves.",
      },
      {
        kind: "prose",
        text: "The problems below implement the Bradley–Terry likelihood, the reward-model loss, the DPO loss, its implicit reward gap, and the PPO clipped objective. Together they are the arithmetic behind every rung of the stack.",
      },
    ],
  },
];
