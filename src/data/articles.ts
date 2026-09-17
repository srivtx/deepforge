import type { ComponentType } from "react";
import {
  AttentionHeatmap,
  AttentionPipeline,
  BpeMergeCascade,
  CalibrationReliability,
  DescentContours,
  EigenvectorGrid,
  EmbeddingGeometry,
  KMeansLoop,
  KvMemoryTiling,
  LoraAdapterDiagram,
  PcaEllipseScree,
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
  | "post-training"
  | "pca-projection"
  | "calibration-uncertainty"
  | "lora-rank";

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
  | "post-training-pipeline"
  | "pca-ellipse-scree"
  | "calibration-reliability"
  | "lora-adapter";

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
  "pca-ellipse-scree": PcaEllipseScree,
  "calibration-reliability": CalibrationReliability,
  "lora-adapter": LoraAdapterDiagram,
};

export interface Article {
  id: string;
  slug: string;
  title: string;
  dek: string;
  readMinutes: number;
  category: string;
  problemIds: string[];
  relatedLabIds?: string[];
  relatedResearchIds?: string[];
  sections: ArticleSection[];
}

export const ARTICLES: Article[] = [
  {
    id: "art-softmax-temperature",
    slug: "why-softmax-needs-temperature",
    title: "Why Softmax Needs Temperature",
    dek: "A network's raw scores are not probabilities. Temperature is the dial that decides how much the differences between them matter.",
    readMinutes: 7,
    category: "Deep Learning",
    problemIds: ["dl-021", "ml-065", "nlp-075", "dl-003", "la-149"],
    relatedLabIds: ["lab-02"],
    relatedResearchIds: ["mini-language-model"],
    sections: [
      {
        kind: "prose",
        text: "A model that has to choose the next word from 50,000 possibilities, or label an email as spam or not spam, first produces one raw score per option. These raw scores are called logits. A logit is just a number the model found convenient: it can be negative, it can be 12, and the scores do not add up to anything in particular.\n\nWe want probabilities instead — numbers between 0 and 1 that add up to 1. Why not simply divide each score by their total? Because the scores can be negative, and a total can be zero or negative, which produces nonsense. Softmax fixes this in two moves. First, raise e (about 2.718) to each score, which turns any number into a positive one. Second, divide each result by the total. Bigger scores stay bigger, so the ranking never changes. In symbols, `p_i = exp(z_i) / sum_j exp(z_j)`: the probability of option i is e to the power of its score z_i, divided by the sum of e to the power of every score.",
      },
      {
        kind: "prose",
        text: "Softmax has a handy property: adding the same number c to every logit changes nothing. The reason is the rule `exp(z_i + c) = exp(z_i)·exp(c)`. The factor exp(c) appears in every term on top and bottom, so it cancels. This is not just trivia. It is how code stays numerically safe: subtract the largest logit before exponentiating, so the biggest exponent becomes 0 and nothing overflows. The answer is identical.\n\nSoftmax is not scale-invariant, though. Multiply every logit by 10 and the differences explode, so the winner takes almost all of the probability. Divide them by 10 and everything flattens toward equal odds. Temperature is the dial that sets this scale.",
      },
      {
        kind: "prose",
        text: "Temperature is a number we divide the logits by before exponentiating: `p_i(T) = exp(z_i / T) / sum_j exp(z_j / T)`. With `T = 1` this is ordinary softmax.\n\nDividing by a small T makes every gap between scores wider. As T approaches 0, one probability approaches 1 and the rest approach 0: the model commits to the single best option. Dividing by a large T shrinks every gap toward zero, and the distribution approaches `1/n` — complete indifference, where n is the number of options. Temperature is a smooth dial between 'decide' and 'shrug'.",
      },
      {
        kind: "demo",
        demo: "softmax-temperature",
        params: { temp: 1 },
      },
      {
        kind: "prose",
        text: "Here is the fact that surprises people: no positive temperature can change which option is most likely. Dividing by a positive number keeps the order of the scores, and exponentiating keeps it too. So the largest logit always gets the largest probability. Temperature changes how confident the model sounds, never the ranking. If the ranking itself must change, you have to change the scores.",
      },
      {
        kind: "figure",
        figure: "softmax-temperature-curve",
        caption:
          "Temperature rescales confidence, never the ranking: class 1 stays the top choice, from a near-certain spike at T = 0.2 to a near-uniform shrug at T = 5.",
      },
      {
        kind: "prose",
        text: "So what does temperature change? It changes what you draw when you sample instead of always taking the top option. Greedy decoding always picks the largest probability; it is repeatable but dull. A common alternative is to draw from `softmax(z/T)`.\n\nThe Gumbel-max trick makes that concrete. Draw one random number g_i for each option from the Gumbel distribution, a standard source of noise with a particular shape. Then pick the option with the largest `z_i / T + g_i`. This gives exactly the same odds as sampling from the softmax, but it turns sampling into a race. At low temperature the scores decide the winner; at high temperature the noise does. The tick marks in the demo show the exact temperatures where the sampled option changes for one fixed set of random numbers.",
      },
      {
        kind: "prose",
        text: "Temperature scaling is also used after training to repair overconfident probabilities. Take a trained classifier, freeze its weights, and fit one number T on a held-out set by minimizing negative log-likelihood — a score that punishes confident mistakes. Neural networks are often too sure of themselves, so a T above 1 softens their probabilities toward reality. Accuracy does not move, because ranking does not move.\n\nKnowledge distillation uses the same idea in reverse. A large, already-trained teacher model is asked for soft targets at a high temperature, and a smaller student is trained to match them. The soft targets tell the student how the teacher ranked the wrong answers, not just which answer won.",
      },
      {
        kind: "prose",
        text: "Two practical warnings before you practice. First, never divide by zero. Clamp T to a small positive value; the limit as T reaches zero is only valid in the limit. Second, negative temperatures are not a fix for anything. They reverse the ranking and put the worst option first, which is almost never what you want.\n\nWhen you write softmax yourself, subtract the largest logit before exponentiating. Apply temperature before that subtraction so the arithmetic stays safe.",
      },
    ],
  },
  {
    id: "art-eigenvectors",
    slug: "eigenvectors-you-can-see",
    title: "Eigenvectors You Can See",
    dek: "Most arrows change direction when a matrix acts on them. A few stay on their own line — and those are the ones worth finding.",
    readMinutes: 8,
    category: "Linear Algebra",
    problemIds: ["la-040", "la-083", "la-084", "la-050", "la-174"],
    sections: [
      {
        kind: "prose",
        text: "Stop thinking of a matrix as a table of numbers and start with what it does. A vector is a list of numbers, which you can picture as an arrow starting at the origin. A 2x2 matrix is a machine that takes in an arrow and returns a new arrow: it can stretch it, shrink it, turn it, or flip it. Feed the whole plane through the machine and the square grid warps into a parallelogram.\n\nYou can read the machine straight off its four numbers. The first column says where the arrow `(1, 0)` lands. The second column says where `(0, 1)` lands. Every other arrow is just a combination of those two.",
      },
      {
        kind: "prose",
        text: "Almost every arrow comes out pointing somewhere new. For a few special directions, the machine only resizes the arrow. It may get longer, shorter, or flip to the opposite side, but it stays on the same line through the origin.\n\nThose directions are the eigenvectors, and the stretch factors are the eigenvalues. In symbols, `A v = λ v`. Here A is the matrix, v is an eigenvector (and never the zero arrow), and λ — the Greek letter lambda — is its eigenvalue. Read it in words: applying the matrix to v gives the same result as multiplying v by the single number λ. Along that one direction, an entire matrix collapses into one scale factor.",
      },
      {
        kind: "prose",
        text: "For a 2x2 matrix, the eigenvalues come out of the equation `det(A − λI) = 0`. Here I is the identity matrix, the do-nothing matrix with ones on the diagonal and zeros elsewhere, and det is the determinant, the number that says how much the matrix scales area. Why zero? Because `A v = λ v` can be rewritten as `(A − λI) v = 0`, which asks when the matrix `A − λI` crushes some nonzero arrow to nothing. That happens only when its determinant is zero.\n\nExpanding the equation gives the quadratic `λ² − tr(A)·λ + det(A) = 0`. The trace `tr(A)` is the sum of the two diagonal entries. Two free sanity checks follow: the two eigenvalues always add up to the trace and multiply to the determinant. If your hand calculation fails either test, it is wrong. One more clue: if `tr² − 4·det` is negative, the eigenvalues are complex numbers. The matrix has no real eigendirection, which means it contains a rotation.",
      },
      {
        kind: "prose",
        text: "Eigenvectors are the skeleton of repeated multiplication. Write an arrow v as a mixture of eigenvectors, apply the matrix k times, and each eigenvector is simply multiplied by its eigenvalue k times: `λ_i^k`. As k grows, the largest-magnitude eigenvalue dominates. That is why power iteration — apply the matrix to a vector over and over — finds the dominant eigenvector, and why the same trick computes Google's PageRank.\n\nThe idea reaches everywhere. In statistics, the eigenvectors of a covariance matrix (a table that records how each feature moves with every other) are the principal components: the directions where the data spreads out most. In dynamic systems, an eigenvalue larger than 1 in size means growth and one smaller than 1 means decay.",
      },
      {
        kind: "demo",
        demo: "eigenvector",
        params: { a: 2, b: 1, c: 0.5, d: 1 },
      },
      {
        kind: "prose",
        text: "Drag the tip of the arrow labeled v and watch two arrows. The dark one is v. The warm one is A v, the result of feeding v through the matrix.\n\nIn general the two point in different directions. The angle between them measures how far v is from an eigendirection. Slide v until the arrows line up: you have found an eigenvector, and the ratio of their lengths is its eigenvalue.\n\nThe dashed lines mark the true eigendirections for the current matrix. The readout shows the Rayleigh quotient, `(v·Av)/(v·v)` — the best single-number estimate of the eigenvalue along your chosen direction. It always lies between the two true eigenvalues. The little dot in `v·Av` means multiply matching entries and add the products.",
      },
      {
        kind: "figure",
        figure: "eigenvector-grid",
        caption:
          "A matrix warps the whole grid, but an eigenvector only stretches: A v stays on the same dashed line as v, while w visibly turns off its own.",
      },
      {
        kind: "prose",
        text: "When a matrix has two independent eigenvectors, we can switch to a coordinate system built from them: `A = VΛV⁻¹`. V has the eigenvectors as its columns, Λ (capital lambda) is a diagonal table holding the eigenvalues, and V⁻¹ is the inverse of V — the matrix that undoes V. In that basis, the matrix does nothing more than scale each axis separately, so powers and equations become easy.\n\nNot every matrix cooperates. Repeated eigenvalues can leave only one eigendirection, creating a shear that no change of coordinates can flatten; those defective matrices are what the Jordan form describes. Symmetric matrices — ones that look the same when flipped across their diagonal — are always well behaved: their eigenvalues are real and their eigenvectors meet at right angles.",
      },
      {
        kind: "prose",
        text: "The practical habit is to look for eigenvectors before doing expensive work. If some direction is nearly unchanged, the leftover `A v − λ v` is tiny, and you have found real structure.\n\nThe problems below start by checking a claimed eigenpair, move through the 2x2 quadratic, and finish with power iteration, which finds the dominant eigenvector without ever writing down the characteristic equation.",
      },
    ],
  },
  {
    id: "art-gradient-descent",
    slug: "gradient-descent-from-mse-to-logistic",
    title: "Gradient Descent from MSE to Logistic",
    dek: "One update rule, two losses. Watch the same recipe fit a line by squared error and by cross-entropy.",
    readMinutes: 9,
    category: "Optimization",
    problemIds: ["ml-103", "ml-012", "op-001", "ml-083", "ml-002"],
    relatedLabIds: ["lab-01", "lab-03", "lab-04", "lab-08"],
    relatedResearchIds: ["tabular-classification-showdown", "imbalanced-signal-hunt"],
    sections: [
      {
        kind: "prose",
        text: "Training a model means searching for the numbers that make it wrong as little as possible. Those numbers are called parameters, written θ (the Greek letter theta). 'Wrong' needs a number too: a loss function `L(θ)` that turns all the model's mistakes into a single score, where smaller is better.\n\nPicture standing on a hill in fog, wanting the bottom. The gradient `∇L(θ)` is a list of slopes: how the loss changes when you nudge each parameter one way or the other. It points uphill. So step the other way: `θ ← θ − η·∇L(θ)`. The Greek letter η (eta) is the learning rate — how big a step you take. Too big and you leap across the valley; too small and you crawl.\n\nAlmost everything in deep learning is a variation on that one sentence: different ways to measure wrongness, different numbers to move, different ways to estimate the slope from a sample of data.",
      },
      {
        kind: "prose",
        text: "Start with the simplest model, a straight line: `ŷ = w·x + b`. Here x is the input, w is the slope (called a weight), b is where the line crosses zero (the bias), and ŷ is the prediction. Measure wrongness with mean squared error, the average of `(ŷ − y)²` over all the data, where y is the true answer. Squaring makes errors in both directions count and makes big misses count extra.\n\nThe slope of that loss is refreshingly simple. For each weight it is `2·(ŷ − y)·x`, and for the bias it is `2·(ŷ − y)`. In words: the correction is the error, multiplied by the input. A point where the model is far off and the input is large gets a big nudge; a point the model already gets right gets none. This loss has a single valley and no false bottoms, so with a small enough learning rate, descent finds the best line.",
      },
      {
        kind: "prose",
        text: "Logistic regression keeps the same straight-line score `z = w·x + b` but turns it into a probability with the sigmoid function, `σ(z) = 1/(1 + e^{−z})`. The sigmoid squeezes any number between 0 and 1. Wrongness is then measured with cross-entropy, a loss built from logarithms: `L = −[y·log(p) + (1−y)·log(1−p)]`, where p is the predicted probability of the positive class and y is the true label, 1 for that class and 0 for the other. When the model is confident and right, this loss is near zero. When it is confident and wrong, the logarithm explodes: the penalty has no upper limit. Squared error, by comparison, tops out at 1, so it stops caring exactly when caring matters most.\n\nThen something elegant happens. The slope of the cross-entropy loss with respect to the weights is `(p − y)·x` — the same shape as the squared-error slope, except the raw prediction is replaced by the probability. The sigmoid's own derivative cancels perfectly against the logarithm.",
      },
      {
        kind: "demo",
        demo: "gradient-descent",
        params: { lr: 0.6 },
      },
      {
        kind: "prose",
        text: "Click the canvas to add points and watch the boundary line `w·x + b = 0` refit after each one. That line is where the model is exactly 50/50.\n\nPoints near the boundary pull hardest: their `p − y` has the largest size. Points far on the correct side are already called correctly with confidence, so their pull nearly vanishes. Switch the update rule between mean squared error and log loss. Squared error picks the same direction but carries an extra `p(1−p)` factor, so it slows to a crawl when the model is confidently wrong. That is one reason cross-entropy is the default for classification.",
      },
      {
        kind: "figure",
        figure: "descent-contours",
        caption:
          "Same update rule, same start, same step size: round valleys give a straight path, elongated ones force a zig-zag. The shape of the loss, not the algorithm, decides.",
      },
      {
        kind: "prose",
        text: "The loss curve below the plot tells you whether the learning rate is sane. Falling smoothly and then flattening means converged. Jumping up and down or blowing up means the step size is too large. Still creeping down after hundreds of steps means it is too small, or the inputs sit on wildly different scales.\n\nUpdating after every single point gives a noisy staircase. That is stochastic gradient descent, and the noise is useful: it shakes the model out of flat spots and saddle points — places that slope down one way and up another — where full-batch descent could circle forever.",
      },
      {
        kind: "prose",
        text: "With data that can be split perfectly by a line, logistic regression has no best answer. The weights can keep growing forever, making the sigmoid more certain and the loss smaller. In the demo the boundary stops moving visually long before the weights do.\n\nIn practice you stop early or add L2 regularization: a small penalty on large weights that pulls them toward zero and makes the best answer finite again.\n\nFor nonlinear models the loss surface has many valleys, so descent can settle into a local minimum. In high dimensions, though, true dead ends are rare; saddle points are the usual obstacle — another reason the randomness of stochastic updates helps.",
      },
      {
        kind: "prose",
        text: "Two implementation details matter more than they look. First, batch versus stochastic. The true gradient averages the slope over all examples. Stochastic methods estimate it from one example or a small batch. Small batches trade a little noise for much better hardware speed and smoother curves.\n\nSecond, scale your features. When one input ranges over thousands and another over fractions, the loss surface becomes a long thin valley and descent zig-zags instead of heading straight down. Standardizing the inputs is often the difference between converging in fifty steps and five thousand.\n\nThe problems below ask for the sigmoid, both gradients, and a single descent step.",
      },
    ],
  },
  {
    id: "art-kmeans",
    slug: "k-means-assignment-to-convergence",
    title: "K-Means: Assignment to Convergence",
    dek: "Two alternating steps, one stubborn goal. Step through the loop and watch the total spread only ever fall.",
    readMinutes: 7,
    category: "ML Fundamentals",
    problemIds: ["ml-003", "ml-032", "ml-033", "ml-034", "ml-145"],
    relatedLabIds: ["lab-05"],
    sections: [
      {
        kind: "prose",
        text: "Clustering asks a question with no labels attached: given a cloud of points, what groups are hiding inside it? K-means answers with a concrete goal.\n\nFirst choose k, the number of groups you want. Place k centers, called centroids, among the points. Assign every point to its nearest centroid. Then add up the squared distances between each point and its assigned center — written `Σ ‖x − μ_c‖²`, where x runs over points, μ_c is the center of the group x joined, and the double bars mean distance. That total is called inertia. Small inertia means tight, compact groups.\n\nK-means searches for centroid positions that make inertia as small as possible. Because each point belongs to exactly one group, the assignments are discrete and there are far too many combinations to try them all. But the goal has enough structure for a simple two-step loop to make steady progress.",
      },
      {
        kind: "prose",
        text: "The assignment step is exact once the centroids are fixed. For every point, measure its distance to each centroid and give the point to the nearest one. Ties can go to the lower index; inertia does not care.\n\nThis step can only lower inertia, because moving a point to its nearest center never increases its distance to the center it ends up with. The cost is mild: with n points, k clusters, and d dimensions, the step takes roughly n·k·d operations.",
      },
      {
        kind: "prose",
        text: "The update step is exact once the assignments are fixed. For each cluster, replace its centroid with the average of the points in it. This is calculus, not guesswork: the sum of squared distances to a center is smallest when the center sits at the arithmetic mean of its members, because that is where the slope of the sum is zero.\n\nAssignment and update then alternate. Every full round either lowers inertia or leaves it unchanged, and there are only finitely many ways to assign the points, so the loop must eventually stop — usually after a handful of rounds.",
      },
      {
        kind: "demo",
        demo: "kmeans",
      },
      {
        kind: "prose",
        text: "Step through the demo and watch inertia in the status line. It falls after every round, then freezes once the assignments stop changing.\n\nThe same picture shows the method's weakness. The descent is monotone, but it is not guaranteed to find the best possible clustering. Different starting positions can lead to different final clusters, some clearly worse. Initialization deserves as much attention as the loop itself.",
      },
      {
        kind: "figure",
        figure: "kmeans-loop",
        caption:
          "Assignment and update are each exact given the other, so inertia can only fall or stay flat — the loop never climbs, it plateaus.",
      },
      {
        kind: "prose",
        text: "The standard fix for bad starting centers is k-means++. The first center is chosen uniformly at random from the data. Each next center is drawn at random too, but with probability proportional to its squared distance from the nearest already-chosen center. Far-apart seeds are likely to be picked, so the clusters start spread out. It is still random, but it comes with a guarantee of near-optimal results, which is why it is the default in most libraries.\n\nA related snag is an empty cluster: a centroid that no point is nearest to. The usual repair is to keep its old position or to move it onto the farthest point.",
      },
      {
        kind: "prose",
        text: "K-means assumes groups are roughly round, similar in size, and separated by distances that mean something. It will cheerfully slice an elongated cluster in half or merge two nearby ones. It also makes you choose k in advance.\n\nThe elbow method plots inertia against k and looks for the bend where the curve stops falling quickly. Silhouette scores compare how well each point fits its own cluster versus the next nearest one, and they work even when there is no clear bend.\n\nEither way, remember that inertia always shrinks as k grows, since more centers can only help. The interesting signal is how fast it shrinks, not its raw value. The problems below cover one iteration, the two steps separately, inertia, and k-means++ seeding.",
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
    relatedResearchIds: ["mini-language-model"],
    sections: [
      {
        kind: "prose",
        text: "Attention begins with a sequence of vectors, one per token — a token being a word, a piece of a word, or any other unit the model works with. Each vector describes what that position means so far. The question attention answers is relational: for this position, which other positions carry information I need?\n\nThe answer is a weighted average of the other positions' vectors, where the weights are learned from data rather than fixed by distance. Each position gets its own private set of weights. That is the whole idea. Everything else in this article exists to make that average expressive and stable.",
      },
      {
        kind: "prose",
        text: "Each token's vector is projected three ways, 'projected' meaning multiplied by a matrix the model learned during training.\n\n- The query `q = x·W_Q` is what this position is looking for.\n- The key `k = x·W_K` is what this position offers to others.\n- The value `v = x·W_V` is the content that gets passed along if this position is chosen.\n\nHere x is the token's vector, and W_Q, W_K, and W_V are the three learned matrices. A query and a key are compared with a dot product: multiply matching entries and add the products. A large positive `q·k` means the query is looking for something this key advertises.\n\nGather all the queries into a matrix Q, all the keys into K, and all the values into V. Then every comparison at once becomes one matrix multiplication, `Q·Kᵀ`, where the small T means rows and columns are swapped. Entry (i, j) of the result says how much query i likes key j.",
      },
      {
        kind: "prose",
        text: "The scores are divided by `√d_k`, where d_k is the number of entries in each query and key vector. The square root keeps the numbers from growing with dimension.\n\nSuppose the entries of q and k are independent random numbers with average zero and spread one. Their dot product is then a sum of d_k terms, so it gets bigger as d_k grows. Feed huge scores into the step that turns them into weights and it saturates: one weight becomes 1 and the rest become 0. The slope that learning needs dies, and training stalls. Dividing by `√d_k` holds the scores at a workable scale no matter how wide the vectors are.",
      },
      {
        kind: "prose",
        text: "The step that turns scores into weights is called softmax. It is applied to each row of scores separately, and each row becomes weights between 0 and 1 that add up to exactly 1 — a budget of attention spent across the keys.\n\nA peaked row means the query is locked onto one position. A flat row means it is spreading its attention widely. The entropy of the row, a number that measures how spread out the weights are, summarizes which case you are in.",
      },
      {
        kind: "demo",
        demo: "attention",
      },
      {
        kind: "prose",
        text: "In the demo, flip between the raw scaled scores and the attention weights, and hover a cell to see one query-key pair. Then follow the output. It is the weighted average of the values: `softmax(QKᵀ/√d_k)·V`. Row i of the output mixes all the value vectors, using the weights from row i of the attention table.\n\nNotice what the shapes do: one output vector per input token, each of the same length as the values. That is what lets attention slot into a larger network. Around it sit residual connections (which add a layer's input back to its output), normalization steps, and a small feed-forward network, but the mixing itself is exactly this one multiplication.",
      },
      {
        kind: "figure",
        figure: "attention-pipeline",
        caption:
          "The whole mechanism in one pass: project every token into a query, a key, and a value; score every query against every key; soften each row; then average the values.",
      },
      {
        kind: "prose",
        text: "A real transformer runs several attention operations side by side, each with its own W_Q, W_K, and W_V. These parallel copies are called heads.\n\nOne head might track grammar, another might track which pronoun refers to which noun, another might just look at nearby words. Each head has its own learned subspace and can develop its own notion of similarity.\n\nThe heads' outputs are stitched together and passed through one more learned matrix, W_O, so the model can combine what the heads found. Splitting the model's width d_model across h heads keeps the parameter count and the arithmetic roughly constant while giving the model several ways to look at the same sequence.",
      },
      {
        kind: "figure",
        figure: "attention-heatmap",
        caption:
          "Softmax turns every row into weights that add up to 1 — peaked when one key wins, flat when attention spreads — and the mask keeps forbidden positions at zero.",
      },
      {
        kind: "prose",
        text: "Two practical facts complete the picture. First, masks. If a position must not be looked at — say the future in a language model, or padding at the end of a batch — add a very large negative number (negative infinity in theory) to its score before the softmax. The exponential of that number is zero, so the forbidden position receives no attention.\n\nSecond, cost. For a sequence of length n, the table of scores has n² entries. Doubling the sequence length quadruples the table. That single fact is why long context windows are expensive and why so much engineering goes into sparse, sliding-window, and memory-saving variants.\n\nThe problems below ask you to scale the scores, soften the rows, take the weighted sum, and reproduce the whole computation end to end.",
      },
    ],
  },
  {
    id: "art-bpe",
    slug: "tokenization-byte-pair-encoding",
    title: "Tokenization: Byte-Pair Encoding",
    dek: "Before a model reads a word, it reads a merge list. BPE decides how text becomes tokens — and tokens decide cost, context, and where a model fails.",
    readMinutes: 7,
    category: "NLP",
    problemIds: ["nlp-001", "nlp-022", "nlp-096", "nlp-099", "nlp-235", "nlp-238"],
    relatedResearchIds: ["mini-language-model"],
    sections: [
      {
        kind: "prose",
        text: "A language model does not read text. It reads a sequence of whole numbers, and a tokenizer is the program that turns text into those numbers. That choice decides the length of every prompt, the price of every call, and how the model handles unusual words.\n\nThe simplest tokenizer splits on spaces. It breaks on `don't`, on `state-of-the-art`, and on every language that does not put spaces between words. It also throws away capitalization and punctuation unless you write a special rule for each case.\n\nSplitting into single characters avoids all of that. Nothing is ever unknown, but a sentence becomes long, and long sequences cost more to train and to serve.",
      },
      {
        kind: "prose",
        text: "Treating every whole word as one token fails the other way. A vocabulary holding every form of every word in a language that builds many forms from one root is enormous, and any word outside it has no number at all. A new name or a typo becomes a blank.\n\nSubword tokenization is the middle road. Frequent pieces stay whole; rare words break into reusable parts. The model sees `low` inside `lowest`, and `est` remains a shared ending.",
      },
      {
        kind: "prose",
        text: "Byte-pair encoding, BPE for short, builds those pieces from the data. It starts with a small alphabet: every character in the corpus — the training text — plus a marker for the end of a word, written `</w>`.\n\nThen it counts every neighboring pair of symbols across the corpus and merges the most frequent pair into one new symbol. That merge goes onto an ordered list, and the counts are refreshed. Repeat.\n\nEvery round performs the same move. What comes out is a ranked list of merges. That list plus the starting alphabet is the entire tokenizer.",
      },
      {
        kind: "demo",
        demo: "bpe-merge",
      },
      {
        kind: "prose",
        text: "What you just stepped through is greedy: each round takes the single most frequent pair. That is not the theoretically best vocabulary, but it is fast, repeatable, and still standard in 2026.\n\nTwo details matter. Ties are broken by the order of the scan, so scan direction is part of the algorithm. And merges apply left to right, so one merge can hide a pair that another merge would have used.",
      },
      {
        kind: "prose",
        text: "After training, encoding is one pass: split the text, mark the end of every word, then apply the merges in rank order. How many tokens come out is the cost. It sets the context budget, the response time, and the price of an API call.\n\nFertility is the average number of tokens per word. English runs about 1.3. A language whose writing system the tokenizer rarely saw during training can run 5 or 10. The same sentence then costs several times more — tokenizer quality is a fairness problem, not just an engineering one.",
      },
      {
        kind: "figure",
        figure: "bpe-merge-cascade",
        caption:
          "The most frequent pair merges first, and each merge removes that pair from the counts: 95 tokens become 86, then 77, then 68, while the vocabulary only grows.",
      },
      {
        kind: "prose",
        text: "Byte-level BPE skips the character alphabet and starts from the 256 possible byte values instead. Every string is representable that way, so there is no unknown token and no crash on emoji, unusual names, or code.\n\nThe price moves into length. Byte-level tokenizers need more tokens for the same text, so the effective training sequence grows. Most modern models accept that trade.",
      },
      {
        kind: "prose",
        text: "Special tokens sit on top of the learned vocabulary. Markers such as `[BOS]` (beginning of sequence), `[EOS]` (end), and `[PAD]` (filler), plus chat roles and tool markers, receive reserved numbers the merge process never touches.\n\nA tokenizer is frozen when training starts, because the model's embedding table is indexed by token number. Swap the tokenizer later and every learned vector points at the wrong symbol.\n\nThe problems below start with counting tokens, move through byte-level BPE and WordPiece (another subword method), and end at fertility and characters per token.",
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
    relatedLabIds: ["lab-05"],
    sections: [
      {
        kind: "prose",
        text: "An embedding turns a thing into a vector — a list of numbers. The thing could be a word, a sentence, an image, a user. No single number carries a name; meaning lives in the direction the vector points.\n\nTraining nudges vectors together when two things appear in similar contexts, and apart when they do not. That is the whole trick. After enough examples, `dog` lands near `puppy`, and both land far from `semiconductor`.\n\nOnce meaning becomes geometry, every question about similarity becomes a question about arrows.",
      },
      {
        kind: "prose",
        text: "The dot product measures agreement between two vectors: multiply matching entries and add the products, `a·b = Σ a_i·b_i`, where a_i and b_i are the entries of a and b. The result is large and positive when the arrows point the same way, zero when they meet at a right angle, and negative when they disagree.\n\nBut the dot product also grows with length. Double one vector and the score doubles, even though the relationship did not change. Raw dot products are therefore a poor similarity measure unless every vector has the same length.\n\nCosine similarity removes length: `cos(a,b) = a·b / (‖a‖·‖b‖)`. The double bars `‖a‖` mean the length of a, so the formula divides the dot product by both lengths. What remains depends only on direction.",
      },
      {
        kind: "prose",
        text: "Cosine similarity always lands between −1 and 1. One means the same direction, zero means perpendicular, and −1 means exactly opposite. In between, the value equals the cosine of the angle θ (theta) between the arrows — which is exactly what the name says.\n\nAfter vectors are normalized to length one, size carries no meaning: a short arrow and a long arrow pointing the same way have cosine 1. In many trained systems, length tracks how common a thing is or how confident the model is, not what it means.\n\nSo the standard pipeline normalizes once, stores unit-length vectors, and lets a plain dot product do the work of cosine.",
      },
      {
        kind: "demo",
        demo: "embedding-cosine",
      },
      {
        kind: "prose",
        text: "Drag the query arrow around the space and watch the ranking. The arc shows the angle θ to the best match, and the list re-sorts as the direction changes.\n\nSwitch the metric and the order can change. The dot product prefers long arrows. Euclidean distance — straight-line distance between arrow tips — cares about exact position. Cosine ignores length by design: drag the query far out along the same ray and its scores barely move.",
      },
      {
        kind: "prose",
        text: "Normalization is also an engineering choice. With unit-length vectors, a dot product replaces a division, which matters when a vector search index scores millions of pairs per query. Storing fewer bytes per number cuts the bill further: one byte per dimension with little loss in retrieval quality, or trimming a 1024-dimension vector down to 256 — the 'Matryoshka' trick, where the first coordinates already carry most of the meaning.\n\nThe ranking in the demo is exact. Production systems use approximate indexes, trading a little accuracy for a large amount of speed.",
      },
      {
        kind: "figure",
        figure: "embedding-geometry",
        caption:
          "Cosine similarity is a projection onto the unit circle: it is 1 for the same direction, 0 at a right angle, and −1 for opposites, and no amount of stretching changes it.",
      },
      {
        kind: "prose",
        text: "One ranking hides a subtlety: two words can be close for the wrong reason. Hard negatives are pairs that look similar but mean different things. Training on them sharpens the space and separates lookalikes.\n\nLine up many queries against many candidates and retrieval becomes one table of cosine values. Picking the top k from that table is semantic search — the core of every system that finds documents to feed a model.",
      },
      {
        kind: "prose",
        text: "Cosine is not the only option. Euclidean distance is common in clustering and image work. Dot product is standard inside attention, where learned projections already control the scale. The right choice is the metric the vectors were trained with.\n\nThe problems below compute cosine between vectors, build cosine tables, and rank embeddings by similarity.",
      },
    ],
  },
  {
    id: "art-quantization",
    slug: "quantization-int8-to-fp8",
    title: "Quantization: INT8 to FP8",
    dek: "Fewer bits per weight means less memory and faster decoding. The price is a rounding error you can steer.",
    readMinutes: 9,
    category: "Deep Learning",
    problemIds: ["dl-058", "dl-059", "dl-060", "dl-077", "dl-195", "dl-451"],
    sections: [
      {
        kind: "prose",
        text: "Serving a model is a memory problem before it is a computing problem. Every weight sits in memory, and every generated token pulls those weights through the processor. Cut the bytes per weight in half and you roughly double the speed at which tokens come out.\n\nQuantization means storing numbers with fewer possible values. A standard 32-bit float takes 4 bytes. A quantized weight can use one byte, which allows 256 possible values. That is four times smaller than float32 and half the size of the 16-bit formats used for training.\n\nThe price is rounding error. Quantization is lossy compression, and the engineering job is to put the error where it hurts the model least.",
      },
      {
        kind: "prose",
        text: "The usual recipe is a straight-line map: `x ≈ scale · (q − zero_point)`. Here x is the original value, q is the stored integer code, `scale` says how much real value one step of code is worth, and `zero_point` is the code that represents real zero.\n\nSymmetric quantization centers the range on zero. Then zero maps to exactly zero, the zero point is 0, and the scale is `absmax / 127`, where `absmax` is the largest absolute value in the data and 127 is the largest code in the signed 8-bit range. It is popular for weights because zero stays exact.\n\nAsymmetric quantization fits the actual smallest and largest values, so its zero point is usually not zero. It spends all 256 codes on the range you really have, which pays off when the values are lopsided, at the cost of the extra bookkeeping.",
      },
      {
        kind: "prose",
        text: "Outliers decide how much precision everything else loses. If one weight is 5 while the rest sit between −2 and 2, the scale must cover 5, and every ordinary value gets a coarse step. The repair is clipping: cap the range at a threshold and accept error on the few values beyond it.\n\nClipping is a trade. A narrower range gives typical values finer steps, and everything outside becomes a constant at the edge. That is the error you can steer.\n\nGranularity decides how local the scale is. A tensor is just the general word for a grid of numbers. Per-tensor quantization shares one scale across the whole grid, so a single outlier damages every value. Per-channel gives each row or column its own scale, so the outlier only distorts its own channel. Per-tensor is cheaper; per-channel is the default for weights.\n\nFP8 — an 8-bit float — enters here. It spends some bits on an exponent, which records a number's scale, the way 10⁷ records the scale in scientific notation. This packs levels tightly near zero and stretches them far out, covering a wide range without a custom scale. Recent GPUs run FP8 at full speed.",
      },
      {
        kind: "demo",
        demo: "quantization-scale",
      },
      {
        kind: "prose",
        text: "Drag the clip threshold and watch the error bars. Pull it down and typical values get finer steps while the outliers pay more. Push it up and the outliers survive at the cost of coarser steps everywhere.\n\nThe error histogram shows who pays. A tight clump means the number format fits the data. Long tails mean the range is too wide.\n\nSQNR — signal-to-quantization-noise ratio — captures the trade in decibels: signal power divided by error power, on a log scale. Above roughly 40 dB, a quantized model usually matches the original on benchmarks.",
      },
      {
        kind: "prose",
        text: "Turn on per-channel and the histogram narrows immediately. That is the outlier story in one click: with four channels there are four scales, so the big value only distorts its own channel.\n\nIn practice, weights use per-channel 8-bit codes, or 4-bit codes in small groups. Activations — the intermediate values computed while the model runs — are harder, because they change with every input, so they use one scale per tensor, calibrated on sample data or computed on the fly.\n\nW8A8 means weights and activations both use 8 bits, which speeds up both prompt processing and token generation. W4A16 keeps weights in 4 bits and runs the arithmetic in 16, which saves memory but not compute. GPTQ and AWQ are the common recipes for that split.",
      },
      {
        kind: "figure",
        figure: "quantization-number-line",
        caption:
          "Even steps cover the clipped range, an outlier at 5.2 collapses to 2.5 with a visible error, and fp8 packs its levels near zero instead of spreading them flat.",
      },
      {
        kind: "prose",
        text: "Error compounds through layers. A layer that receives quantized inputs quantizes its own outputs on top of them, so end-to-end accuracy is the number that matters; per-layer error is only a hint.\n\nCalibration data should look like production data. If the input distribution shifts, a scale fitted on the old data clips the new values. Monitoring the ranges catches the drift.\n\nThe format must also match the hardware. INT8 kernels are everywhere. FP8 needs Hopper, Blackwell, or newer chips. NVFP4 and MXFP4 are Blackwell-native. Choosing a format the deployment chip does not accelerate is the most expensive quantization mistake.",
      },
      {
        kind: "prose",
        text: "Quantization is also how large models fit on small hardware. QLoRA keeps the frozen base model in a 4-bit format called NF4 and trains small 16-bit adapters on top. The base never changes, so its error is fixed and the adapters learn around it.\n\nKV cache quantization is the decoding-time cousin. Caching attention keys and values in FP8 instead of the usual 16-bit format nearly halves the memory per token, which is why FP8 is a common default for long contexts.",
      },
      {
        kind: "prose",
        text: "The problems below compute an INT8 scale, quantize and dequantize, work through per-channel scales, and compare 4-bit against 8-bit memory.\n\nWhen you write the arithmetic by hand, watch two things: how you round and where you clamp. A scale without a clamp silently overflows, and a clamp without the right scale throws away range for nothing.",
      },
    ],
  },
  {
    id: "art-kv-cache",
    slug: "kv-cache-and-flashattention",
    title: "KV Cache & FlashAttention",
    dek: "Attention costs time that grows with the square of the sequence and memory that never shrinks. The KV cache is why long context costs what it costs — and FlashAttention is why it fits.",
    readMinutes: 11,
    category: "Deep Learning",
    problemIds: ["dl-075", "dl-124", "dl-186", "dl-211", "dl-370", "dl-401"],
    relatedResearchIds: ["mini-language-model"],
    sections: [
      {
        kind: "prose",
        text: "Attention compares every position with every earlier position. During training, and during the first pass over a prompt, the whole sequence is available at once, so all those comparisons happen together.\n\nGenerating text is different. The model produces one token at a time, and each new token needs to look back at the keys and values — the vectors that say what earlier positions offer and pass along — of every token before it. Without a shortcut, token number 1,000 would recompute the keys and values of the first 999 tokens, in every layer, at every step. The arithmetic is identical every time.\n\nThe KV cache removes the repetition. Keep the keys and values already computed, and append exactly one new key and one new value per layer per token.",
      },
      {
        kind: "prose",
        text: "The cache size has a closed-form formula: `2 × layers × KV heads × head dim × bytes per element` per token. Each factor is plain. Layers: how many repeated blocks the model stacks. KV heads: how many parallel key/value projections it has. Head dim: how many numbers are in each key or value vector. Bytes per element: 2 for the usual 16-bit format. The leading 2 counts keys and values separately.\n\nWork an example. A 7-billion-parameter model with 32 layers, 32 key/value heads, and 128 numbers per head, stored in 16 bits, needs `2 × 32 × 32 × 128 × 2 = 524,288` bytes per token — 512 kilobytes for a single token. At 128,000 tokens that is 64 gigabytes for one conversation, while the model's weights take about 14 gigabytes. At long context the cache is several times larger than the model it serves.\n\nThat multiplication is the whole lesson: cache cost grows in a straight line with the number of tokens, and the slope is set by the projection shapes.",
      },
      {
        kind: "prose",
        text: "Three architecture choices shrink the slope. Grouped-query attention lets several query heads share one key/value projection; at 8 query heads per key/value head, the cache drops 8-fold. Multi-query attention goes all the way to one key/value head for every query head. Multi-head latent attention compresses keys and values into a small shared vector and expands them again when needed, buying 7 to 14 times less memory.\n\nNumber format is the other lever. Storing the cache in 8-bit floats instead of 16-bit halves the bytes with under 1 percent accuracy loss on validated setups, which is why it is a common serving default. Together, grouped-query attention and 8-bit storage regularly turn 64 gigabytes of cache into 8.",
      },
      {
        kind: "demo",
        demo: "kv-cache",
      },
      {
        kind: "prose",
        text: "In the decode panel, watch the cache grow one token at a time. Each append is cheap: two small projections per layer. The real cost is moving bytes. Decoding is memory-bound: every generated token streams the weights and the whole cache through the chip just to compute one new row of attention.\n\nThat is why batching raises throughput so much: one read of the cache serves several sequences at once. It is also why a paged allocator matters. Sequences start short and grow, so the cache should be handed out in blocks rather than one large buffer reserved for the worst case.",
      },
      {
        kind: "prose",
        text: "FlashAttention attacks the other half of the problem: the intermediate table produced while computing attention. The straightforward implementation writes the full n×n table of scores into the chip's main memory (HBM), softens each row, and multiplies by V. Main memory can hold those bytes, but moving them is the bottleneck, and a large intermediate that is written once and read once is exactly what you do not want to push through it.\n\nFlashAttention never stores the table. It slices the queries, keys, and values into blocks that fit in the chip's fast on-board memory (SRAM), computes the scores for one block, folds the result into a running summary, and throws the block away. The final answer is essentially identical to exact attention; only the memory traffic changes.",
      },
      {
        kind: "figure",
        figure: "kv-memory-tiling",
        caption:
          "The cache passes 7B 16-bit weights around 16k tokens and reaches 9× their size at 128k, while FlashAttention keeps the n×n score table in fast on-chip memory instead of main memory.",
      },
      {
        kind: "prose",
        text: "The running summary is a pair of numbers: m, the largest score seen so far, and l, the sum of exponentials so far. When a new block arrives, its largest score may exceed m. The old sum is then out of date and must be rescaled: `l_new = l_old · exp(m_old − m_new) + Σ exp(s_i − m_new)`, where the sum runs over the scores s_i in the new block.\n\nThe partial output is rescaled by the same ratio. Because m only ever grows, a single multiply corrects everything that was computed against the old maximum. Every number a block needs lives in fast registers, so no row ever has to be revisited. That is the online softmax at the heart of every memory-efficient attention kernel.",
      },
      {
        kind: "prose",
        text: "The trade changes with the phase. Processing a prompt happens all at once, so each weight read pays off across many tokens and the work becomes compute-bound. Tiled attention wins there, because the score table never leaves fast memory. Decoding, one token at a time, is bandwidth-bound on the cache, so the wins come from grouped-query attention, 8-bit cache storage, and dropping entries instead.\n\nA practical serving stack usually runs all three: grouped-query attention in the architecture, 8-bit storage for the cache, and a paged allocator that keeps memory compact as sequences grow. None of them changes what attention computes.",
      },
      {
        kind: "prose",
        text: "Long-answer reasoning models broke the old assumption that the prompt is the problem. A 2,000-token question can trigger 100,000 tokens of thinking, so the cache keeps growing while the model works. Two families of fixes exist.\n\nEviction keeps a budget. A sliding window drops the oldest tokens. Attention sinks always keep the first few, which carry outsized weight. Heavy-hitter policies keep the tokens that have received the most attention so far. Compression rewrites entries instead: store fewer bits, merge similar keys, or skip layers. Both families trade a measurable accuracy loss for a fixed memory ceiling.",
      },
      {
        kind: "prose",
        text: "The problems below compute bytes per token, the cache for a whole sequence, one append step, the online-softmax rescale, and the savings from grouped-query attention and tiled attention. It is all arithmetic, so every number can be checked against the formulas above.",
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
        text: "Retrieval-augmented generation, RAG for short, is usually drawn as one box: a question goes in, an answer comes out. In reality it is a pipeline of six or seven steps, and most of its failures happen before the generator reads a single word.\n\nThe shape is fixed. Documents are parsed into plain text, cut into chunks, and indexed. A query is matched against that index, the candidates are merged and re-ranked into a short list, and the list is packed into the model's context window with a citation number on every passage. The model's only job is to ground an answer in the passages it was handed.",
      },
      {
        kind: "prose",
        text: "Chunking decides what can be found later. Chunks that are too large blur the embedding — the vector that stands for the chunk — and waste context space; chunks that are too small lose the sentence that explains them. Overlapping neighboring chunks is the standard patch: if a sentence straddles a boundary, some chunk still contains it whole.\n\nContextual retrieval pushes further. Before embedding, each chunk is prefixed with a short model-written summary of where it sits in the document. The chunk then carries its own context instead of relying on the search step to guess it.",
      },
      {
        kind: "prose",
        text: "Lexical retrieval scores word overlap. BM25 weights each query word by how rare it is across the documents (the inverse document frequency) and caps how much repeating a word can help, so a rare name or error code matches exactly while common words contribute little. It is fast, easy to inspect, and blind to paraphrase.\n\nDense retrieval turns the query and the chunks into vectors and compares them with cosine similarity, a measure of the angle between vectors where 1 means the same direction and 0 means unrelated. It matches meaning: `how do I reset my password` finds `change your passphrase`. It misses exact strings it never saw in training, like an order number.",
      },
      {
        kind: "prose",
        text: "Hybrid retrieval runs both methods and keeps both ranked lists. The two scores are not comparable — a BM25 score of 12 and a cosine of 0.71 do not share a scale — so the merge step works on positions instead. Positions are always comparable, and that is the whole trick.\n\nThe demo below makes the difference visible. Switch between BM25, dense, and hybrid on the same query, then move the fusion constant k and watch how much first place is trusted.",
      },
      {
        kind: "demo",
        demo: "rag-retrieval",
      },
      {
        kind: "prose",
        text: "Reciprocal rank fusion is one line: `RRF(d) = Σ 1/(k + rank_i(d))`. For each list where document d appears, take its position (the first position counts as 0), add the constant k, and add up one divided by that number across all lists. A document near the top of either list scores well; a document near the top of both gets two contributions and usually wins.\n\nThe constant k, commonly 60, dampens the top of each list. A small k trusts first place heavily; a large k flattens the lists toward a simple vote. Because the fusion only reads order, it survives score drift between retriever versions, which is one reason it is the default merge in production.",
      },
      {
        kind: "prose",
        text: "Merging produces candidates, not a final order. A reranker reads the query and one chunk together, as a single piece of text, and produces a relevance score. Unlike the dense method above, which scores the query and each chunk separately, it can see how the words interact — which is exactly what separates a related passage from one that answers the question.\n\nReranking is the highest-value upgrade in the pipeline. Skipping it costs 10 to 30 points of recall@5 — the share of queries whose top five results contain the relevant passage. Adding it after contextual retrieval cuts retrieval failures roughly in half, with published stacks reporting 49 to 67 percent reductions.",
      },
      {
        kind: "figure",
        figure: "rag-pipeline",
        caption:
          "Parse, chunk with overlap, add context, index twice, retrieve both ways, merge by rank, rerank with a cross-encoder, then cite — or refuse when nothing clears the evidence threshold.",
      },
      {
        kind: "prose",
        text: "Packing the context is a budget problem. Remove near-duplicate chunks, sort by rerank score, cut at a token limit, and attach an id to every passage. Those ids are what make citations possible: the model is told to tag each claim with its source, and the interface can turn that tag into a link to the exact passage.\n\nWithout passage ids, citations are decoration. With them, a reader can verify a claim in one click, which is the entire point of retrieval.",
      },
      {
        kind: "prose",
        text: "Not every query deserves an answer. If the best reranked score falls below a threshold, the system should say it does not know rather than let the model answer from memory. Answering from memory is how a RAG system hallucinates with a straight face.\n\nThe threshold is a calibrated number: real evidence must clear it, and questions with nothing relevant in the corpus must not. Refusal is a feature, not an admission of failure — a grounded 'I don't know' is worth more than a confident wrong answer.",
      },
      {
        kind: "prose",
        text: "Retrieval quality is measured before the generator enters the picture. Precision@k asks how many of the k returned chunks are relevant. Recall@k asks how many of the relevant chunks were returned at all. Mean reciprocal rank rewards putting the first relevant chunk high in the list. Chunk overlap and reranking are the two settings that move recall the most.\n\nThe problems below compute top-k selection, precision and recall at k, reciprocal rank fusion, chunk overlap coverage, and mean reciprocal rank.",
      },
    ],
  },
  {
    id: "art-post-training",
    slug: "post-training-rlhf-dpo-grpo",
    title: "Post-Training: RLHF → DPO → GRPO",
    dek: "Pretraining teaches the model language. Post-training teaches it behavior — and by 2026 the human preference label gave way to the reward a program can check.",
    readMinutes: 11,
    category: "Reinforcement Learning",
    problemIds: ["dl-180", "dl-182", "rl-204", "rl-205", "rl-274", "rl-275"],
    sections: [
      {
        kind: "prose",
        text: "Pretraining teaches a model the statistics of text. It does not teach the model to follow instructions, to prefer helpful answers, or to show its reasoning. Those are behaviors, and behaviors come from a second stage called post-training.\n\nThe modern stack has three rungs. Supervised fine-tuning imitates demonstrations: show the model good examples and it copies their style. Preference optimization learns from comparisons: this answer is better than that one. Reinforcement learning from verifiable rewards trains on tasks a program can check, such as a math answer or a passing unit test. Each rung teaches something the one below cannot.",
      },
      {
        kind: "prose",
        text: "RLHF, reinforcement learning from human feedback, was the original recipe. Step one: supervised fine-tuning on demonstrations. Step two: collect human comparisons between pairs of responses. Step three: train a reward model to predict which response a human would prefer. Step four: adjust the model to earn a high score from that reward model.\n\nThe comparison step uses a simple probability model. If the preferred answer scores `r_w` and the rejected one scores `r_l`, the chance a human picks the preferred answer is `σ(r_w − r_l)`, where σ is the sigmoid function that squeezes any number between 0 and 1. The reward model is trained to make that probability high.\n\nOne guardrail matters. The adjusted model is also penalized for drifting too far from the model it started from, measured by KL divergence, a number that says how different two probability distributions are. Without that penalty, the model — from here on called the policy, because it decides what to do — learns whatever tricks maximize the reward model, including the reward model's own mistakes. That failure is called reward hacking, and closing the gap between reward score and real quality is most of RLHF engineering.",
      },
      {
        kind: "prose",
        text: "PPO (proximal policy optimization) is the workhorse optimizer for that loop. It is online: sample answers from the current model, score them, update, and repeat. It also carries a critic, a second network that predicts how much reward the rest of an answer is likely to earn. The critic reduces the noise in the update direction.\n\nPPO limits how far one update can move the model with a clipped objective: `min(r·A, clip(r, 1−ε, 1+ε)·A)`. Here r is the ratio between the new and old probability of an answer, A is the advantage — how much better the answer did than the critic expected — and ε (epsilon) is a small cap such as 0.2. The clip says: do not chase a large ratio further than this.\n\nThe catch is that the critic is another model to train, tune, and store. Removing it is one reason GRPO took over.",
      },
      {
        kind: "demo",
        demo: "post-training",
      },
      {
        kind: "prose",
        text: "DPO, direct preference optimization, skips the reward model entirely. For the same comparison model, the best possible adjusted policy has an exact mathematical answer, and it implies an implicit reward: `β·log(π_θ(y) / π_ref(y))`. In words: how much more likely the current model makes answer y than the original model did, multiplied by β (beta), a positive number that controls how far the model may drift.\n\nSubstituting that into the comparison probability leaves a loss built from preference pairs alone: `L = −log σ(β·[(log π_θ(y_w) − log π_ref(y_w)) − (log π_θ(y_l) − log π_ref(y_l))])`. The preferred answer y_w should gain probability relative to the original model more than the rejected answer y_l does. Here π_θ is the model being trained and π_ref is the frozen copy it started from.\n\nNo sampling, no critic, no reward model. DPO is a classification loss on log-ratios, which is why it is the stable default. Published comparisons put it within about 0.3 points of PPO on MT-Bench, a standard chat-quality benchmark, at roughly a tenth of the compute.",
      },
      {
        kind: "prose",
        text: "GRPO (group relative policy optimization) keeps the online loop and drops the critic. For each question it samples a group of G answers, scores them all, and compares each score to the average of the group: `A_i = (r_i − mean(r)) / std(r)`. An answer better than the group average gets a positive advantage; a worse one gets a negative advantage. Dividing by the standard deviation — a measure of how spread out the scores are — keeps the advantages on a consistent scale. The group average replaces the critic's prediction.\n\nWhen the score comes from a program that can check the answer — a math checker, a unit test, a schema validator — the loop is called RLVR: reinforcement learning from verifiable rewards. There is no reward model to hack, because the checker knows the truth. GRPO with verifiable rewards is the standard way reasoning models are trained, and DAPO and GSPO are refinements that stabilize its clipping and normalization.",
      },
      {
        kind: "figure",
        figure: "post-training-pipeline",
        caption:
          "SFT imitates, preference optimization compares, and verifiable rewards check — while GRPO replaces PPO's learned critic with the group average, crossed out above.",
      },
      {
        kind: "prose",
        text: "The choice depends on the data and the budget. DPO wins when preferences are fixed and pairs already exist, because it is one pass over a fixed dataset. GRPO wins when outcomes can be verified, because fresh attempts explore beyond the demonstrations and the verifier cannot be fooled. Supervised fine-tuning still owns format, tone, and tool-call syntax.\n\nRankings flip with model size. A controlled 2026 comparison found different winners at different sizes, so 'best method' always depends on where you measure. One practical note applies throughout: a 4-bit base model with 16-bit adapters is how these methods fit on a single machine.",
      },
      {
        kind: "prose",
        text: "Three failure modes are worth naming. Reward hacking: the model finds the reward model's blind spot, so the score rises while human judges disagree. Length bias: longer answers score higher, so the model learns to ramble. Distribution collapse: too much pressure to stay near the original model, or too little exploration, narrows the model until it gives one safe answer to everything.\n\nThe defenses are boring and effective. Hold out a test set graded by humans or by the checker, watch response length, cap how far each update may move the model, and refresh the reward model as the policy changes.",
      },
      {
        kind: "prose",
        text: "The problems below implement the comparison probability, the reward-model loss, the DPO loss, its implicit reward gap, and the PPO clipped objective. Together they are the arithmetic behind every rung of the stack.",
      },
    ],
  },
  {
    id: "art-pca-svd",
    slug: "pca-and-svd-in-practice",
    title: "PCA & SVD in Practice",
    dek: "The eigenvector article ends at Av = λv. This one starts there: project the cloud, keep the top axes, rebuild — and account for every bit of what you threw away.",
    readMinutes: 8,
    category: "Linear Algebra",
    problemIds: ["ml-041", "la-139", "la-249", "la-250", "la-251", "la-089"],
    sections: [
      {
        kind: "prose",
        text: "The eigenvector article answered a theoretical question: which directions does a matrix leave alone? Practice asks a different one: given a cloud of data points, which directions carry the signal?\n\nThe recipe starts by centering: subtract the average point so the cloud sits around the origin. Then build the covariance matrix `C = (1/n)·XᵀX`. Here X is the table of centered points with one row per point, n is the number of points, and the small T means rows and columns are swapped. The covariance matrix records how each feature varies with every other. Its eigenvectors are the principal components, and its eigenvalues are the variance — the amount of spread — along each one.\n\nThe first principal component is the single direction that captures the most spread when the points are projected onto it. The second is the best direction at a right angle to the first, and so on. The cloud does not have to be two-dimensional: the covariance table grows with the number of features, but the ordering story stays the same.",
      },
      {
        kind: "prose",
        text: "The principal components are also the right singular vectors of the centered data matrix. The singular value decomposition writes any matrix as `X = UΣVᵀ`. V holds the principal directions. Σ (capital sigma) is a diagonal table of numbers called singular values — the square roots of the eigenvalues. U holds each point's coordinates in the new basis. SVD works on rectangular tables, not just square ones, which is why it is the version that ships in software.\n\nThe rank of a matrix is the number of genuinely independent directions it contains. For any rank r — keeping the top r directions and dropping the rest — `X_r = U_rΣ_rV_rᵀ` is the best possible rank-r approximation of the data, and the squared error equals exactly the sum of the squared singular values you dropped, `Σ_{i>r} σ_i²`. That is the Eckart–Young theorem. Truncating an SVD is not a guess; it is provably optimal.",
      },
      {
        kind: "prose",
        text: "Preprocessing changes the answer, so it is part of the method. Centering moves the axes so they explain spread around the average point instead of around the origin. Standardizing makes each feature's spread equal to one before the analysis, which turns the covariance table into a correlation table. Then a feature measured in centimeters cannot dominate one measured in kilometers.\n\nThat is usually what you want when the units differ, and usually not when they do not. PCA on standardized data is a genuinely different decomposition: the axes swing and the eigenvalues change. The demo lets you watch it happen.",
      },
      {
        kind: "demo",
        demo: "pca-projection",
      },
      {
        kind: "prose",
        text: "Start in the project tab and drag the tip of the direction arrow u. The dashed blue lines are the true principal axes for the current preprocessing choice, and the residual readout is the variance your chosen direction leaves on the table.\n\nDrag u onto the first principal axis and the residual hits its lowest possible value, which equals the second eigenvalue. Every other direction explains less. That is what makes PCA a maximization problem rather than a change of basis you pick by eye.\n\nSwitch to reconstruct and keep one component. Every point collapses onto the first principal axis, and the warm segments show exactly what each point lost. Keep two and the rebuild is exact, because the space itself is two-dimensional. Toggle centering and standardization and watch the axes — and the reconstruction — change under the same cloud.",
      },
      {
        kind: "figure",
        figure: "pca-ellipse-scree",
        caption:
          "The covariance matrix is a shape: the ellipse is one standard deviation out, its axes are the eigenvectors, and the scree plot says how much variance each direction holds. Dropping the tail is the Eckart–Young optimum, not a guess.",
      },
      {
        kind: "prose",
        text: "At scale nobody forms the full covariance table. Randomized SVD computes the top k components by multiplying the data by a small random sketch, cleaning up the result so its columns meet at right angles, and running a tiny decomposition on what is left. A few passes recover the dominant directions to high accuracy, and the cost grows with k instead of cubing with the dimension.\n\nWhat people do with the components falls into four buckets. Denoise: drop the tail, where the noise lives. Compress: store only the top r coordinates. Whiten: rescale the components to equal variance so later models see uncorrelated features. Diagnose: read the scree plot, which shows how much variance each component holds, to see whether the data is closer to rank 3 or rank 300.",
      },
      {
        kind: "prose",
        text: "Low-rank thinking is everywhere in 2026. Matryoshka embeddings are trained so that cutting a 1024-dimension vector down to its first 256 coordinates keeps most of the retrieval quality — the PCA truncation argument baked into the loss. LoRA fine-tunes a model by learning a low-rank update `ΔW = BA` instead of the full matrix.\n\nNeither trick runs an explicit SVD at inference time, but both are understandable only if you know what truncation costs. The pseudoinverse — the closest thing to an inverse for a table that cannot be inverted — is the same story from the other side: `X⁺ = VΣ⁺Uᵀ`, where tiny singular values are replaced rather than inverted — ridge regression in disguise.\n\nThe problems below center the data, build a rank-1 approximation, reconstruct at rank r, run power iteration for singular vectors, and compute the pseudoinverse and 2x2 singular values by hand.",
      },
    ],
  },
  {
    id: "art-calibration",
    slug: "calibration-and-uncertainty",
    title: "Calibration & Uncertainty",
    dek: "A model that says 90% should be right 90% of the time. Modern networks are not — and one number fitted on held-out data fixes most of the gap.",
    readMinutes: 7,
    category: "ML Fundamentals",
    problemIds: ["ml-065", "ml-072", "ml-101", "ml-337", "dl-086", "ml-291"],
    relatedLabIds: ["lab-06", "lab-07"],
    sections: [
      {
        kind: "prose",
        text: "A classifier that outputs 0.9 is making a promise: among the cases it labels with 90 percent confidence, about nine in ten should be correct. Calibration means the promise holds.\n\nAccuracy and calibration are different things, and a model can be good at one and bad at the other. Modern deep networks are usually overconfident: they report 0.96 on cases they get right 86 percent of the time. The score is a ranking signal that was never trained to be a real probability.\n\nThe standard picture is the reliability diagram. Group predictions by confidence, measure the average accuracy in each group, and plot accuracy against confidence. A perfectly calibrated model lies on the diagonal. Points below the diagonal mean overconfidence; points above mean underconfidence.",
      },
      {
        kind: "prose",
        text: "The headline number is expected calibration error: `ECE = Σ (n_b/n)·|accuracy_b − confidence_b|`. For each confidence group b, take the gap between its average accuracy and its average confidence, then weight that gap by how many samples landed there: n_b samples out of n total. The weighting stops the sparse extremes from dominating the score.\n\nHow you build the groups matters more than people expect. Equal-width bins cut the confidence range into fixed slices, which can leave the extremes empty or crowded. Equal-frequency bins sort the predictions and cut them into groups of equal size, so every group has enough samples to say something.\n\nThe same model can report a different gap under each scheme. That is a property of the measure, not a contradiction: the number is only as meaningful as the grouping behind it.",
      },
      {
        kind: "prose",
        text: "Temperature scaling is the cheapest fix that works. Take the raw scores (the logits) from the model, divide them all by a single number T, and choose T on data the model has not seen by minimizing negative log-likelihood — the score that punishes confident mistakes. It is the same temperature as in the softmax article, used for a different purpose: there it shaped random sampling, here it repairs probabilities.\n\nBecause T is positive, it cannot change the ranking. Accuracy and every threshold-free measure stay exactly where they were. Only the confidences move — and that is precisely what a refusal threshold or an agent's self-report reads.",
      },
      {
        kind: "demo",
        demo: "calibration-uncertainty",
      },
      {
        kind: "prose",
        text: "The demo's fixture is 320 predictions from a deliberately overconfident model, with the scores inflated by a factor of 2.4. At `T = 1` the points sit well below the diagonal and the calibration error is high. Raising T softens the confidences toward the accuracy line while accuracy itself stays pinned.\n\nPress Fit T to jump to the best temperature, then switch the bin mode and watch equal-width and equal-frequency disagree about the exact number. Both report a large drop. The story never changes: overconfidence shrinks, ordering does not.",
      },
      {
        kind: "figure",
        figure: "calibration-reliability",
        caption:
          "Below the diagonal is overconfidence, above it is underconfidence. Temperature scaling holds accuracy and ranking fixed and moves the points straight onto the diagonal — which is what turns a threshold into a decision.",
      },
      {
        kind: "prose",
        text: "Calibration stopped being a statistics footnote. A RAG system refuses when the best evidence scores below a threshold, so that score has to mean something; otherwise the system either answers without evidence or refuses everything. Agent confidence is monitored as a live signal. And any language model used as a judge is calibrated against human labels before it is trusted to grade a pipeline — published guidance puts the target around 80 to 85 percent agreement.\n\nSelective prediction is the deployment face of calibration: pick a confidence threshold, abstain below it, answer above it, and the coverage–accuracy curve shows whether abstaining buys reliability or just hides the hard cases.",
      },
      {
        kind: "prose",
        text: "Two caveats keep the method honest. Calibration is not sharpness: a model that says 0.5 for everything can be perfectly calibrated and useless, so read the calibration error next to a scoring rule such as negative log-likelihood or the Brier score, which measures squared error on probabilities. And calibration does not travel: a temperature fitted on last quarter's data fails silently when the inputs shift, so refit it whenever the inputs move.\n\nThe problems below compute temperature scaling, build calibration bins, and measure expected calibration error three ways, including equal-frequency bins and the uplift variant.",
      },
    ],
  },
  {
    id: "art-lora",
    slug: "lora-low-rank-fine-tuning",
    title: "LoRA / PEFT: Low-Rank Fine-Tuning",
    dek: "Freeze the model, train a small rank-16 shadow. In 2026 that shadow is most fine-tuning — and at serving time it disappears into the weights.",
    readMinutes: 9,
    category: "Deep Learning",
    problemIds: ["dl-151", "dl-152", "dl-153", "dl-154", "dl-219", "dl-220"],
    sections: [
      {
        kind: "prose",
        text: "Full fine-tuning updates every weight in the model. That means storing a gradient for every weight, optimizer state for every weight, and a full-size checkpoint for every task — plus a separate deployment for every adaptation.\n\nThe memory arithmetic is large. A 16-bit weight takes 2 bytes. Its gradient takes 2 more. The two standard Adam optimizer tables take 8 (4 bytes each). That is about 12 bytes per parameter, so a 7-billion-parameter model needs on the order of 84 gigabytes before activations — the intermediate values produced during a forward pass — are even counted.\n\nLoRA starts from an observation: most of the useful change is low-rank. Adapting a pretrained model to one task does not need to move every direction independently. It needs to move a few directions a lot.",
      },
      {
        kind: "prose",
        text: "The method does exactly that. Freeze the original weight matrix W and learn only a correction, `ΔW = B·A`. Here A is a small matrix with r rows, B is a small matrix with r columns, and r — the rank — is tiny, say 16. The layer computes `h = Wx + (α/r)·BAx`, where x is the layer's input, h is its output, and α (alpha) is a scaling number that keeps the correction's size steady when you change r.\n\nB starts at zero, so the model begins as the pretrained model, and A starts with small random numbers so the first learning signal is informative. The number of trained parameters drops from `d_in·d_out` to `r(d_in + d_out)`, where d_in and d_out are the input and output widths of the layer: the product becomes a sum, times the small rank.\n\nWith width 4096 and rank 16, that is 131,000 parameters instead of 16.8 million — about 0.8 percent. And the frozen base needs no optimizer state. Training a 7-billion-parameter model on one 24-gigabyte card becomes routine rather than heroic.",
      },
      {
        kind: "prose",
        text: "QLoRA pushes the frozen base even smaller. Store it in a 4-bit format, unpack each value on the fly during the forward pass, and keep the adapter — the learned pair A and B — in 16-bit. Paged optimizers absorb memory spikes, and the base costs half a byte per parameter.\n\nThe 4-bit rounding is fixed, because the frozen base never changes; the adapters learn around it. A smarter initialization called LoftQ starts the factor pair from a quantization-aware decomposition instead of zeros and recovers a little of the gap.\n\nWhich layers you adapt matters more than the rank. Early LoRA attached only to the query and value projections in attention. Current guidance is every linear layer — the attention projections and the feed-forward network — because that is where the useful change lives.",
      },
      {
        kind: "demo",
        demo: "lora-rank",
      },
      {
        kind: "prose",
        text: "The canvas shows the target update ΔW, its best rank-r approximation B·A, and the two merged together. Raise the rank and the error collapses: most of the change's energy sits in the first component, and B·A is the provably best rank-r approximation, so no other rank-r pair can do better.\n\nThe calculator applies the same arithmetic to real model shapes. At width 4096 and rank 16, the adapter is a rounding error next to the dense matrix, and the QLoRA toggle shows where a 7-billion-parameter base actually fits. Flip Merge adapter and watch `W + BA` fold into one matrix: after merging there is nothing extra to run, no additional kernel, no added latency.",
      },
      {
        kind: "figure",
        figure: "lora-adapter",
        caption:
          "W stays frozen and the narrow pair B·A learns the task: r(d_in + d_out) parameters instead of d_in·d_out, and a merge that makes the adapter invisible at serving time.",
      },
      {
        kind: "prose",
        text: "Serving is where LoRA pays off twice. A merged adapter adds zero inference overhead. An unmerged one can be swapped per request, so a single base model serves many tasks from a library of small adapters.\n\nThe memory economics are the same as prefix caching, where the repeated opening of a prompt is computed once and reused. In agent and multi-tenant workloads, prompt openings repeat constantly, and cache hit rates of 60 to 85 percent mean most of the prompt is never recomputed. Adapters change which weights answer the request; prefix caches avoid re-reading the context that leads up to it.\n\nA rank of 8 to 16, with alpha around twice the rank and all linear layers as targets, is the 2026 default. Bigger ranks help less than a better target set, and they cost checkpoint size and overfitting risk.",
      },
      {
        kind: "prose",
        text: "The failure modes are ordinary training failures with a low-rank accent. Too much rank on too little data overfits. Too few target layers plateau at a mediocre loss. Merging into a quantized base without unpacking it first corrupts the weights. Adapters fitted on drifting data go stale like any model.\n\nOne honest rule: LoRA is not a free replacement for full fine-tuning when the task needs a genuinely new capability. It steers what is already there. Prompt tuning is the even lighter cousin — a handful of learned vectors and no weight changes at all — and it is the right tool when the shift is style or format rather than knowledge.\n\nThe problems below count LoRA and adapter parameters, size a QLoRA run, merge the update back into W, and compute a prefix cache hit ratio.",
      },
    ],
  },
];
