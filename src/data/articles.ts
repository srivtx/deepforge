export type DemoKind =
  | "softmax-temperature"
  | "eigenvector"
  | "gradient-descent"
  | "kmeans"
  | "attention";

export interface ProseSection {
  kind: "prose";
  text: string;
}

export interface DemoSection {
  kind: "demo";
  demo: DemoKind;
  params?: Record<string, number>;
}

export type ArticleSection = ProseSection | DemoSection;

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
        text: "A neural network usually ends with a vector of real numbers called logits. Nothing constrains them: they can be negative, they can be huge, and they certainly do not sum to one. To read them as a distribution over next tokens or classes, you need a map from all of R^n to the probability simplex. Softmax is that map. It exponentiates each logit and divides by the total: `p_i = exp(z_i) / sum_j exp(z_j)`. Exponentiation is what makes it work — it turns arbitrary scores into positive numbers, and it preserves their order, so the largest logit always receives the largest probability.",
      },
      {
        kind: "prose",
        text: "Softmax is famously shift-invariant: adding a constant c to every logit changes nothing, because exp(z_i + c) = exp(z_i)·exp(c) and the factor cancels in the ratio. That is not just a curiosity, it is the basis of the numerically stable implementation — subtract the maximum logit before exponentiating so nothing overflows. What softmax is not is scale-invariant. Multiplying every logit by 10 sharpens the distribution dramatically; dividing them by 10 flattens it. The temperature parameter exists to control exactly that scale.",
      },
      {
        kind: "prose",
        text: "Temperature divides the logits before the exponential: `p_i(T) = exp(z_i / T) / sum_j exp(z_j / T)`. At `T = 1` you get the standard softmax. As `T` approaches zero from above, `z_i / T` becomes enormous for the largest logit and negligible for the rest, so the distribution collapses to a one-hot vector pointing at the argmax. As `T` grows, the logits are squashed toward zero and the distribution approaches the uniform distribution `1/n`. In between, temperature is a smooth dial from 'decide' to 'shrug'.",
      },
      {
        kind: "demo",
        demo: "softmax-temperature",
        params: { temp: 1 },
      },
      {
        kind: "prose",
        text: "Here is the fact that surprises people: for any positive T, temperature can never change which class is most likely. Softmax is a monotone transformation, and dividing by a positive number preserves order, so the argmax of the probabilities is always the argmax of the logits. Temperature changes confidence, entropy, and the shape of the distribution — never the ranking. If you want the bars to reorder, you need to touch the logits themselves.",
      },
      {
        kind: "prose",
        text: "What temperature does change is what you sample. Greedy decoding picks the argmax at every step and is deterministic but dull. Sampling from `softmax(z/T)` is the standard alternative, and the Gumbel-max trick makes it concrete: draw one fixed noise vector `g` from the Gumbel distribution, and the sampled token is `argmax_i (z_i / T + g_i)`. Now flip points exist. At very low temperature the argmax of the logits wins; at very high temperature the largest noise term wins. The ticks in the demo mark the exact temperatures where the sampled token changes for one fixed draw.",
      },
      {
        kind: "prose",
        text: "Temperature scaling is also a post-hoc calibration method. Take a trained classifier, hold its weights fixed, and fit a single scalar `T` on a validation set — usually by minimizing negative log-likelihood. A network trained with modern objectives is often overconfident, and a T greater than one softens its probabilities back toward reality without touching accuracy. In knowledge distillation the same idea goes the other way: the teacher's soft targets are generated at a high temperature so the student can see the relative probabilities of the wrong classes, not just the winner.",
      },
      {
        kind: "prose",
        text: "Two implementation notes before you practice. First, never divide by an exact zero: guard the denominator or clamp temperature to a small positive value, because the limit as T goes to zero is a valid distribution only in the limit. Second, negative temperatures are not a bug fix for anything — they invert the ranking, putting the smallest logit first, which is almost never what you want. When you write your own softmax, subtract the maximum before exponentiating; when you add temperature, do it before the max-subtraction so the arithmetic stays stable.",
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
        text: "Stop thinking of a matrix as a table of numbers. A 2x2 matrix is a machine that takes a vector and returns a new vector. It rotates, stretches, shears, and reflects — and when you feed it the whole plane, it warps the grid into a parallelogram. The columns of the matrix tell you where the basis vectors land, which is why you can read a transformation straight off its entries: the first column is where `e1 = (1, 0)` goes, the second is where `e2 = (0, 1)` goes.",
      },
      {
        kind: "prose",
        text: "Almost every vector comes out pointing somewhere new. But for certain special directions the matrix only scales what it is given. The vector may get longer, shorter, or flip to the opposite side, but it stays on the same line through the origin. Those directions are the eigenvectors, and the scale factors are the eigenvalues. Formally, `Av = λv`, with `v` not the zero vector. The equation says that applying A is indistinguishable from multiplying by a single number — for that one direction, a whole matrix collapses into a scalar.",
      },
      {
        kind: "prose",
        text: "For a 2x2 matrix the eigenvalues fall out of the characteristic equation `det(A − λI) = 0`, which expands to `λ² − tr(A)·λ + det(A) = 0`. The trace is the sum of the eigenvalues and the determinant is the product. That gives a quick sanity check on any answer you compute by hand: if your two eigenvalues do not sum to the trace, something is wrong. If the discriminant `tr² − 4·det` is negative, the eigenvalues are complex and the matrix has no real eigendirections — it contains a rotation.",
      },
      {
        kind: "prose",
        text: "Eigenvectors are the skeleton of repeated multiplication. Compute `A^k v` and write v in the eigenbasis: each application simply multiplies the coefficient on eigenvector i by `λ_i^k`. The largest-magnitude eigenvalue dominates as k grows, which is exactly why power iteration works and why it finds PageRank's stationary distribution. In statistics, the eigenvectors of a covariance matrix are the principal components: the directions of maximum variance, ordered by eigenvalue. In dynamics, an eigenvalue above one in magnitude means exponential growth and below one means decay.",
      },
      {
        kind: "demo",
        demo: "eigenvector",
        params: { a: 2, b: 1, c: 0.5, d: 1 },
      },
      {
        kind: "prose",
        text: "Drag the tip of the vector v in the canvas and watch the two arrows. The dark arrow is v; the warm arrow is Av. In general they disagree — the angle between them is a measure of how far v is from an eigendirection. Slide v until the arrows line up: that is an eigenvector, and the ratio of their lengths is its eigenvalue. The dashed lines show where the real eigendirections live for the current matrix, and the readout gives you the Rayleigh quotient `(v·Av)/(v·v)`, which is the best scalar estimate of λ along v and lies between the two eigenvalues.",
      },
      {
        kind: "prose",
        text: "When the matrix has two independent eigenvectors, it can be diagonalized: `A = VΛV⁻¹`, where the columns of V are the eigenvectors and Λ is diagonal. In that basis the matrix is nothing but separate scalings, which is why powers, exponentials, and differential equations all become trivial. Not every matrix cooperates. Repeated eigenvalues can leave only one eigendirection, producing a shear that no change of basis can flatten; those defective matrices are the reason Jordan form exists. For symmetric matrices life is always good: the spectral theorem guarantees real eigenvalues and orthogonal eigenvectors.",
      },
      {
        kind: "prose",
        text: "The practical takeaway is to look for eigenvectors before you compute anything expensive. If a direction is nearly preserved, the residual norm `||Av − λv||` is tiny and you have found structure. The problems below start with checking a claimed eigenpair, move through the 2x2 characteristic polynomial, and end at power iteration — the algorithm that finds the dominant eigenvector without ever forming the characteristic polynomial.",
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
        text: "Training a model is an optimization problem. You choose parameters θ, measure how wrong the model is with a loss `L(θ)`, and then repeatedly take a step downhill: `θ ← θ − η·∇L(θ)`. The learning rate η controls the step size, and the gradient points in the direction of steepest ascent, so the negative gradient is the cheapest local way down. Everything else in deep learning is a variation on this sentence: different losses, different parameterizations, different ways of estimating the gradient from a batch of data.",
      },
      {
        kind: "prose",
        text: "Start with linear regression and mean squared error. The model is `ŷ = w·x + b` and the loss is the average of `(ŷ − y)²`. Its gradient is beautifully simple: the derivative with respect to each weight is `2·(ŷ − y)·x`, and with respect to the bias it is `2·(ŷ − y)`. The error is multiplied by the input. A point far from the line and far from the origin produces a large correction; a point where the model is already right produces none. For linear models this loss is convex, so gradient descent converges to the global optimum given a small enough learning rate.",
      },
      {
        kind: "prose",
        text: "Logistic regression keeps the linear score `z = w·x + b` but pushes it through a sigmoid, `σ(z) = 1/(1 + e^{−z})`, and switches the loss to binary cross-entropy: `L = −[y·log(p) + (1−y)·log(1−p)]` where `p = σ(z)`. The logarithm punishes confident mistakes without bound, unlike squared error, which saturates at one. And then something lovely happens. The gradient of the log loss with respect to the weights is `(p − y)·x` — the same shape as the MSE gradient, with the prediction's probability replacing the raw prediction, and no sigmoid derivative left behind because it cancels against the log.",
      },
      {
        kind: "demo",
        demo: "gradient-descent",
        params: { lr: 0.6 },
      },
      {
        kind: "prose",
        text: "Click the canvas to add points and watch the decision boundary `w·x + b = 0` refit after every addition. Points near the boundary exert the strongest pull: their `p − y` term is largest in magnitude. Points far on the correct side are already classified confidently, so their gradient nearly vanishes and the boundary barely notices them. Switch the update rule between mean squared error and log loss. MSE learns the same sign behavior but its gradient carries an extra `p(1−p)` factor, so it crawls when the model is confidently wrong — one reason cross-entropy is the default for classification.",
      },
      {
        kind: "prose",
        text: "The loss curve underneath tells you whether the learning rate is sane. A curve that descends smoothly and flattens has converged. A curve that jumps up and down, or explodes, means η is too large. A curve that is still falling slowly after hundreds of steps means η is too small, or the data is poorly scaled. Notice too that cycling through the points one at a time gives a noisy, stair-stepping curve rather than a smooth descent — that is stochastic gradient descent, and the noise is a feature: it helps escape flat regions and saddle points that full-batch descent would circle forever.",
      },
      {
        kind: "prose",
        text: "With perfectly separable data, logistic regression has no finite optimum: the weights keep growing so the sigmoid saturates and the loss keeps shrinking toward zero. In the demo the boundary stabilizes visually long before the weights stop moving. In practice you stop early or add L2 regularization, which pulls the weights toward zero and restores a finite optimum. For non-linear models the loss is no longer convex, and gradient descent can land in a local minimum — but in high dimensions, exact minima are rare, and saddle points are the more common obstacle, which is another argument for stochastic updates.",
      },
      {
        kind: "prose",
        text: "Two implementation details matter more than they look. First, batch versus stochastic: the true gradient averages over all examples, while SGD estimates it from one example or a minibatch. Minibatches trade a little noise for much better hardware utilization and smoother curves. Second, feature scaling: gradient descent takes elliptical steps on badly scaled data because the curvature in each direction differs, so standardizing inputs is often the difference between converging in fifty steps and five thousand. The problems below ask for the sigmoid, the logistic gradient, the squared-error gradient, and a single descent step.",
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
        text: "Clustering asks a question with no labels attached: given a cloud of points, what groups are hiding inside it? K-means answers with a concrete objective. Pick a number of clusters k, place k centroids, assign every point to its nearest centroid, and measure the total squared distance between points and their assigned centers. That quantity is called inertia, and k-means is the search for centroids that make it as small as possible. It is a combinatorial problem — the assignments are discrete — but the objective has enough structure to admit a simple iterative attack.",
      },
      {
        kind: "prose",
        text: "The assignment step is exact given the centroids. For each point, compute the squared distance to every centroid and assign it to the closest one. Ties can be broken by index; the objective is indifferent. This step can only decrease inertia: moving a point to its nearest centroid never increases its distance to the center it ends up with. The squared distance `||x − μ_c||²` is cheap to compute, so the whole step costs O(n·k·d) for n points, k clusters, and d dimensions.",
      },
      {
        kind: "prose",
        text: "The update step is exact given the assignments. For each cluster, replace its centroid with the mean of the points assigned to it. This is calculus, not guesswork: the sum of squared distances to a single point μ is minimized when μ is the arithmetic mean of the cluster's members, because the gradient `2·Σ(x_i − μ)` vanishes exactly there. Assignments and updates alternate. Each full iteration weakly decreases inertia, and since there are finitely many possible assignments, the process terminates — usually in a handful of iterations.",
      },
      {
        kind: "prose",
        text: "Step through the demo below and watch inertia in the status line. It drops on every iteration and then stops moving when assignments stop changing. What you are also watching is the weakness of the method: the descent is monotone but not guaranteed to reach the global minimum. Different starting positions can lead to different final clusters, some of them noticeably worse. That is why the initialization step deserves as much attention as the loop itself.",
      },
      {
        kind: "demo",
        demo: "kmeans",
      },
      {
        kind: "prose",
        text: "The standard fix for bad initialization is k-means++, which chooses starting centroids with a randomized rule weighted by squared distance: the first centroid is chosen uniformly from the data, and each subsequent one is drawn with probability proportional to its squared distance from the nearest already-chosen center. Far-apart seeds get picked often, so the clusters start spread out. It is still randomized, but it comes with an approximation guarantee and works well enough that it is the default in most libraries. A related issue is empty clusters: if no point is nearest to a centroid, the usual repair is to keep the old position or re-seed it at the farthest point.",
      },
      {
        kind: "prose",
        text: "K-means assumes clusters are roughly spherical, similar in size, and separated by distances that matter. It will happily slice an elongated cluster in half or merge two nearby ones. It also requires you to choose k. The elbow method plots inertia against k and looks for the point where the curve stops falling quickly; silhouette scores measure how much better each point fits its own cluster than the next nearest, and work without a clear elbow. Whichever you use, remember that inertia decreases with more clusters by construction — it is the rate of improvement, not the raw value, that carries information. The problems below cover a single iteration, the assignment and update steps separately, inertia, and k-means++ initialization.",
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
        text: "Attention starts with a sequence of token vectors, one per position. The question it answers is relational: for this position, which other positions carry information that matters? The mechanism answers with a convex combination — a weighted average — where the weights are learned from the data rather than fixed by position. That is the whole idea. Everything else, the projections, the scaling, the masks, the multiple heads, exists to make that weighted average expressive and stable.",
      },
      {
        kind: "prose",
        text: "Each token is projected three ways. The query `q = x·W_Q` says what this position is looking for. The key `k = x·W_K` says what this position offers. The value `v = x·W_V` is the content that gets mixed. Similarity between a query and a key is measured with a dot product, so a large positive `q·k` means the query is asking for something this key advertises. Stack the queries into a matrix Q and the keys into K, and the entire table of pairwise similarities is one matrix multiply: `Q·Kᵀ`. Its entry `(i, j)` is how much query i likes key j.",
      },
      {
        kind: "prose",
        text: "There is a scaling factor in the denominator: `Q·Kᵀ / √d_k`, where `d_k` is the dimension of each query and key vector. It is not cosmetic. If the components of q and k are independent with mean zero and variance one, their dot product has variance proportional to `d_k`, so scores grow with dimension. Feed large scores into a softmax and it saturates: one weight becomes one and the rest become zero, the gradient through the row dies, and learning stalls. Dividing by `√d_k` keeps the scores at a workable scale regardless of dimension.",
      },
      {
        kind: "prose",
        text: "Softmax is applied to every row independently. Row i of the score matrix becomes a probability distribution over the keys, and those probabilities are the attention weights. Every row sums to exactly one: each query spends its full budget of attention across the keys it can see. High temperature-like concentration in a row means the query is locked onto one position; a flat row means it is spreading its attention broadly. The entropy of the row is a useful summary of which regime it is in.",
      },
      {
        kind: "demo",
        demo: "attention",
      },
      {
        kind: "prose",
        text: "The output is the weighted average of the values: `softmax(QKᵀ/√d)·V`. Row i of the output is a mixture of all value vectors, with the mixture proportions given by row i of the attention weights. The shape is preserved — one output vector per input token, each of the same dimension as the values — which is what makes attention a drop-in layer. Around it sit residual connections, layer normalization, and a position-wise feed-forward network, but the mixing itself is exactly this one multiplication.",
      },
      {
        kind: "prose",
        text: "Real transformers run several attention operations in parallel, each with its own `W_Q`, `W_K`, and `W_V`. These are the heads. One head might track syntactic dependencies, another coreference, another adjacency, because each works in a different learned subspace and can afford different similarity patterns. The heads' outputs are concatenated and passed through an output projection `W_O`, which lets the model combine what the heads found. Splitting d_model across h heads keeps the parameter count and the floating-point cost roughly constant while changing the representational geometry.",
      },
      {
        kind: "prose",
        text: "Two practical facts finish the picture. First, masks: adding −∞ (in practice a very negative number) to forbidden score entries before the softmax forces their weights to zero, which is how causal language models prevent a token from attending to the future and how padding tokens are ignored. Second, cost: the score matrix has n² entries for a sequence of length n, so attention is quadratic in sequence length. That single fact is why context windows are expensive and why so much engineering goes into sparse, sliding-window, and memory-efficient variants. The problems below ask you to scale the scores, softmax the rows, take the weighted sum, and reproduce scaled dot-product attention end to end.",
      },
    ],
  },
];
