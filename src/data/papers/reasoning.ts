import type { Paper } from "./types";

/**
 * Era 3: reasoning. Formal theorem proving (DeepSeek-Prover through V2), the
 * pure-RL reasoning models (DeepSeek-R1, R1-0528), and two research satellites
 * that feed the same pipeline: CodeI/O (reasoning data condensed from code)
 * and DeepSeek-GRM (generalist reward modeling with inference-time scaling).
 *
 * Order is chronological within the era; every number quoted below comes from
 * the linked paper, model card, or release note.
 */
export const REASONING_PAPERS: Paper[] = [
  {
    id: "deepseek-prover",
    slug: "deepseek-prover",
    title:
      "DeepSeek-Prover: Advancing Theorem Proving in LLMs through Large-Scale Synthetic Data",
    short: "DeepSeek-Prover",
    year: 2024,
    date: "2024-05-23",
    arxivId: "2405.14333",
    url: "https://arxiv.org/abs/2405.14333",
    kind: "paper",
    era: "reasoning",
    tier: "advanced",
    tagline:
      "A proof assistant can check a proof exactly, so the bottleneck is not verification but data. Generate eight million synthetic Lean proofs and the model can prove competition theorems.",
    whatItIs:
      "DeepSeek-Prover is the paper that opened the formal-mathematics line at DeepSeek. It takes high-school and undergraduate competition problems, translates them into Lean 4 statements, filters bad ones out, asks a model to write proofs, keeps only proofs the Lean kernel accepts, and retrains on that growing pile. The result is a 7B model whose whole-proof generation accuracy on the miniF2F-test benchmark more than doubles the GPT-4 baseline.",
    theoryMinutes: 14,
    lineage: {
      from: "deepseek-math",
      to: ["deepseek-prover-v1-5"],
      context:
        "Formal proving had the same problem as everything else in late 2023: strong checkers, almost no training data. The paper attacks that gap with synthesis, and the model starts from the same DeepSeekMath 7B checkpoint that the founding era used for math.",
      improved: [
        "Turns informal competition problems into a scalable Lean 4 training set instead of relying on the small human-written corpora of the time.",
        "Trains a 7B prover that reaches 46.3% pass@64 on miniF2F-test, versus 23.0% for GPT-4-turbo and 41.0% for Hypertree Proof Search.",
        "Uses iterative self-training: each round's verified proofs are folded back into the dataset, so the model and its data improve together.",
        "Proves 5 of 148 problems from FIMO while the GPT-4 baseline proves none, evidence that formal provers can handle harder olympiad-level statements.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "What formal verification buys you",
        text: "In a proof assistant like Lean, a proof is a program and the kernel is the checker. You state a theorem in a precise language, write a sequence of tactics, and the kernel either accepts the whole proof or points at the first step it cannot justify. There is no partial credit and no learned judge: the signal is exact, mechanical, and free once the hardware is running. That is why formal proving is such an attractive target for RL later on, because the environment itself hands out ground truth. The price is that the model must learn Lean syntax and the library of already-proved lemmas, which is why data, not compute, is the bottleneck at this stage.",
      },
      {
        kind: "prose",
        heading: "The synthesis pipeline",
        text: "The paper builds data in four stages. First, natural-language problems (from competition archives and math competition sets) are autoformalized: a model writes a Lean 4 statement for each one. Second, low-quality statements are filtered out, because a malformed or trivial statement is worse than no data. Third, a prover model generates proof attempts for the surviving statements. Fourth, every attempt is checked by the Lean kernel; only proofs that compile are kept as training targets. The loop repeats, and each iteration uses the improved model to generate the next round, which the paper calls iterative enhancement.",
      },
      {
        kind: "visual",
        visual: "code-pipeline",
        caption:
          "Synthetic Lean data pipeline: natural-language problems, autoformalization to Lean 4 statements, filtering, proof generation, kernel verification, and a retraining loop that feeds verified proofs back in.",
      },
      {
        kind: "prose",
        heading: "Whole-proof generation and its failure mode",
        text: "This model writes an entire proof in one pass: the prompt is the theorem statement, the completion is the full tactic script. That is cheap to run (one round trip to the model, one call to the verifier) and it is what makes the pass@64 numbers comparable to text generation. The catch is compounding error: because the model never sees intermediate tactic states while writing, one wrong move early poisons everything after it. Fixing that limitation is exactly the job of Prover-V1.5.",
      },
      {
        kind: "formula",
        label: "pass@k",
        expression: "pass@k = 1 - C(n - c, k) / C(n, k)",
        why: "With n sampled proofs of which c are correct, C(n - c, k) / C(n, k) is the probability that a random draw of k samples contains no correct proof, so one minus that is the chance at least one of the k samples is valid. It answers the practical question: how many attempts do I need before the prover succeeds? The paper reports both pass@64 and much larger budgets, and accuracy keeps rising as k grows (30.0% greedy, 46.3% at 64, 50.0% at 65536).",
      },
      {
        kind: "prose",
        heading: "Iteration and data scoring",
        text: "The paper ablates two choices that matter. First, proofs are graded by quality before training, and training only on the higher-scoring classes beats training on everything (42.6% versus 38.1% on miniF2F-test at pass@128 in the reported ablation). Second, repeating the synthesis loop with the improved model beats a single round, because the model that generates round two data is stronger than the one that generated round one. Both findings are the same lesson in different clothes: in a verifier-rich domain, data quality and data quantity can be manufactured on purpose.",
      },
      {
        kind: "prose",
        heading: "Where this approach breaks down",
        text: "A Lean proof certifies that the formal statement is provable, not that the formal statement matches the intended English problem. Autoformalization can silently weaken or strengthen a theorem, so verified proofs are only as meaningful as the statements they prove. The benchmark numbers are also on miniF2F, which is small (244 test problems) and high-school level; FIMO stays hard. Treat this paper as a proof of concept that synthesis works, with the harder questions (fidelity, scale, general math) left open.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Formal theorem proving with LLMs is starved of data. Human-written Lean corpora like mathlib are large but not structured as competition problem solutions, and the community's benchmarks are tiny. The paper asks whether a model can bootstrap its own training data in Lean 4.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Synthetic data generation with kernel verification as the filter, applied iteratively. Section 3 walks through autoformalization, quality filtering, and proof search; Section 4 shows what iteration and proof scoring add. Read the ablations because they are where the paper justifies its design choices rather than just reporting a score.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "An 8-million-statement synthetic dataset with proofs, fine-tuning from DeepSeekMath 7B. Whole-proof generation reaches 46.3% on miniF2F-test at pass@64 and 52.0% cumulatively across iterations, against 23.0% for GPT-4-turbo at the same budget and 41.0% for the Hypertree Proof Search RL baseline. On miniF2F-valid the cumulative number is 60.2%. The model proves 5 of 148 FIMO problems; GPT-4 proves none. Scaling samples from 1 to 65,536 moves miniF2F-test accuracy from 30.0% to 50.0%.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The paper states that the approach targets high-school and undergraduate competition mathematics, and that results depend on the quality of autoformalization. FIMO success is low in absolute terms. There is no RL and no interaction with tactic states yet, so errors compound inside a proof attempt and search is limited to independent samples.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If you have a verifier, you can manufacture supervision: generate candidates, keep what verifies, retrain, repeat. Score and filter data rather than dumping everything in, and expect each loop to pay off. This recipe reappears in every DeepSeek reasoning paper after it, from Prover-V1.5's RL to R1's rule-based rewards.",
      },
    ],
    questions: [
      {
        id: "prover-q1",
        prompt:
          "Why does the paper use the Lean kernel as the filter for synthetic data instead of a learned reward model?",
        options: [
          "The kernel is faster than any neural network at scoring proofs",
          "Kernel acceptance is an exact, unforgeable signal, so a kept proof cannot be a hallucination",
          "Learned reward models cannot read Lean syntax",
          "The kernel was the only verifier available at the time",
        ],
        answer: 1,
        explanation:
          "A learned scorer can be fooled and would need its own training data. The Lean kernel either accepts the proof or rejects it, which makes synthetic data trustworthy by construction. Speed is a nice side effect, not the reason. Prover-V1.5 later reuses this exact property as an RL reward.",
      },
      {
        id: "prover-q2",
        prompt:
          "In the synthesis pipeline, why filter formal statements before generating proofs for them?",
        options: [
          "Proofs for bad statements would not compile, wasting generation budget",
          "Filtering makes the dataset smaller so training is faster",
          "Lean requires a statement registry before any proof search",
          "Statements with many symbols are more likely to be true",
        ],
        answer: 0,
        explanation:
          "An ill-formed, trivial, or already-solved statement yields either no usable proof or a useless one. Filtering first spends generation compute where training value exists. Dataset size is a side effect, and Lean has no registry requirement.",
      },
      {
        id: "prover-q3",
        prompt:
          "A prover achieves 46.3% pass@64 on miniF2F-test. What does that number mean?",
        options: [
          "It proves 46.3% of problems on its first attempt",
          "For each problem, at least one valid proof appears among 64 samples in 46.3% of problems",
          "46.3% of its 64 samples per problem are valid proofs",
          "It proves 46.3% of the dataset after 64 training epochs",
        ],
        answer: 1,
        explanation:
          "pass@k is per problem: success means at least one of k samples verifies. It is not first-attempt accuracy and says nothing about how many of the 64 samples work. The distinction matters when comparing whole-proof generation against tree search, which spends its budget differently.",
      },
      {
        id: "prover-q4",
        prompt:
          "The ablation 'excellent/good/above-average proofs only' beats training on all proof classes. What is the lesson?",
        options: [
          "Smaller datasets always generalize better",
          "Model-graded proof quality correlates with training value, so data curation is part of the algorithm",
          "Lean proofs are too long to train on in full",
          "Low-quality proofs must be deleted for copyright reasons",
        ],
        answer: 1,
        explanation:
          "The score classes come from the model's own judgments, and filtering by them improved pass@128 on miniF2F-test. The takeaway is that generation and curation are two halves of the same loop, not a fixed-size-data argument.",
      },
      {
        id: "prover-q5",
        prompt:
          "A generated proof compiles in Lean. What is the strongest thing you can conclude?",
        options: [
          "The original English problem was solved as intended",
          "The formal Lean statement is provable within the given library",
          "The statement is mathematically important",
          "The proof is human-readable",
        ],
        answer: 1,
        explanation:
          "Lean checks the formal statement, not the translation from English. Autoformalization errors can make the proved theorem different from the intended one, which the paper acknowledges as a core limitation of the whole approach.",
      },
    ],
  },
  {
    id: "deepseek-prover-v1-5",
    slug: "deepseek-prover-v1-5",
    title:
      "DeepSeek-Prover-V1.5: Harnessing Proof Assistant Feedback for Reinforcement Learning and Monte-Carlo Tree Search",
    short: "DeepSeek-Prover-V1.5",
    year: 2024,
    date: "2024-08-15",
    arxivId: "2408.08152",
    url: "https://arxiv.org/abs/2408.08152",
    kind: "paper",
    era: "reasoning",
    tier: "advanced",
    tagline:
      "Stop throwing away the compiler's complaints. Truncate a failed proof at its first error, resume from there, and use the Lean verifier as the reward signal for both GRPO and tree search.",
    whatItIs:
      "Prover-V1.5 upgrades the whole-proof approach in two ways. It trains the model with reinforcement learning where the reward is simply whether Lean accepts the proof, and it adds RMaxTS, a Monte-Carlo tree search that treats the tactic state after each successful tactic as a tree node. Failed attempts are chopped at the first error and reused as prefixes, so every verification message becomes useful information instead of a discarded sample.",
    theoryMinutes: 16,
    lineage: {
      from: "deepseek-prover",
      to: ["deepseek-prover-v2"],
      context:
        "The first prover generated independent full proofs and had to redo everything after any early mistake. V1.5 asks what changes if the model can read the verifier's intermediate feedback and, more importantly, if the verifier's verdict itself becomes the learning signal.",
      improved: [
        "Adds online RL from proof assistant feedback (RLPAF) on top of SFT, using GRPO with binary accept/reject rewards from Lean.",
        "Raises miniF2F-test whole-proof accuracy to 60.2% from Prover-V1's 50.0%, and 63.5% when combined with RMaxTS search.",
        "Introduces truncate-and-resume, which turns a failed proof into a tree prefix and makes whole-proof generation compatible with MCTS.",
        "Adds an intrinsic new-node reward with discounted UCB so search keeps exploring sparse-reward proof states instead of stalling.",
        "Lifts ProofNet-test (undergraduate level) to 25.3% with RMaxTS, ahead of ReProver's 13.8% and InternLM2-StepProver's 18.1%.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The feedback the first version ignored",
        text: "Lean does not just say 'no'. When a tactic script fails, the prover reports the first tactic that could not be applied and the state of the goal at that point. A whole-proof model never sees this during generation, so it writes blind past its own mistakes. V1.5 changes the loop: generate a proof, let Lean check it, and if it fails, keep everything before the first error and continue from the current goal state. The paper calls this truncate-and-resume, and it works because a partially correct proof is still a correct prefix.",
      },
      {
        kind: "prose",
        heading: "From prefix to tree",
        text: "Once prefixes are reusable, the natural structure is a tree. Each node is a tactic state; each valid tactic is an edge; the model can expand any node, not just the deepest one. Expansion works like this: take a node, resume the proof from there with the tactic-state comment appended, let the model generate a continuation, verify it, and truncate at the next error. Because whole-proof generation emits a whole continuation, one expansion can add an entire path of nodes to the tree, unlike the single child added in game-playing MCTS.",
      },
      {
        kind: "visual",
        visual: "prover-tree",
        caption:
          "RMaxTS proof tree. Nodes are Lean tactic states, edges are verified tactics, failed continuations are truncated at the first error and merged back as new paths, and fresh nodes trigger the intrinsic reward.",
      },
      {
        kind: "prose",
        heading: "RL where the environment is the reward model",
        text: "The supervised model is further trained with GRPO: for each theorem prompt, sample a group of proofs, score each 1 if Lean verifies it and 0 otherwise, and update toward the proofs that beat their group's average. The paper keeps only theorem prompts where the SFT model succeeds sometimes but not always: 4.5k statements survive filtering. This fixes the sparse-reward problem on the training side, because prompts the model can never solve give a group of all-zero rewards and therefore no gradient. The RL stage uses 32 samples per theorem with a KL coefficient of 0.02 against the SFT reference model.",
      },
      {
        kind: "formula",
        label: "Intrinsic reward and discounted UCB",
        expression:
          "R_intrinsic(tau) = 1[at least one new node is added to the search tree]\nQ_DUCB(s, a) = W_gamma(s, a) / N_gamma(s, a) + sqrt( 2 * ln( sum_{a'} N_gamma(s, a') ) / N_gamma(s, a) )",
        why: "The extrinsic reward is 1 only for a finished proof, which makes deep trees hopeless to explore by value alone. R_intrinsic pays the search for reaching a tactic state it has not seen, and Q_DUCB is the selection rule: the first term exploits (discounted wins over visits), the second explores (a bonus that shrinks as a state-action pair is reused). The discount gamma = 0.99 keeps old feedback from dominating, because the intrinsic reward naturally fades as the tree fills up and the signal is non-stationary.",
      },
      {
        kind: "code",
        title: "Shaping exploration with the new-node reward",
        language: "python",
        code: `import math

GAMMA = 0.99

def d_ucb(visits, rewards):
    # visits: total times this edge was chosen; rewards: list of R(tau) values
    discounted_w = 0.0
    for t, r in enumerate(rewards):
        discounted_w += (GAMMA ** (len(rewards) - 1 - t)) * r
    discounted_n = sum(GAMMA ** t for t in range(visits))
    if discounted_n == 0:
        return float("inf")
    exploit = discounted_w / discounted_n
    parent_visits = sum(visits for visits in [visits])
    explore = math.sqrt(2.0 * math.log(parent_visits) / discounted_n)
    return exploit + explore

def intrinsic_reward(new_nodes_added):
    return 1.0 if new_nodes_added > 0 else 0.0`,
        notes: [
          "Unseen edges get an infinite score so the search tries them first.",
          "The loop shows the discounting idea; a real implementation tracks parent visit counts across the whole sibling set.",
          "The intrinsic reward is deliberately binary: any new node counts once, no matter how many were added.",
        ],
      },
      {
        kind: "prose",
        heading: "What the results actually show",
        text: "RL helps at every sample budget, not just the lucky tail. At 128 attempts the RL model proves 51.6% of miniF2F-test, and the improvement persists as the budget grows to 60.2%, which the authors contrast with DeepSeekMath's finding that RL mostly reshuffles which correct answer is found first. Adding RMaxTS on top reaches 62.7% at 16x6400 and 63.5% at 32x6400. ProofNet-test, which is undergraduate level, goes to 25.3% with search. SFT alone with RMaxTS also reaches 60.2%, so the search machinery and the RL policy each contribute, and they compose.",
      },
      {
        kind: "prose",
        heading: "The honest limits",
        text: "More samples and more search cost more money, and the paper's best numbers use large generation budgets. The model is still 7B and English-to-Lean fidelity issues remain: Lean certifies the formal statement. Finally, the intrinsic reward is a heuristic, not a proof of optimal exploration; it is chosen because sparse-reward proof search is a hard-exploration problem, and the ablations are empirical.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Whole-proof generation without mid-proof feedback compounds errors, and the first prover's verification results were used only to filter data. Can the verifier be used online, both to guide training and to organize search?",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Truncate-and-resume as a state-action abstraction. Section 3.1 defines the nodes and edges, Section 3.2 describes selection and backpropagation, Section 3.3 motivates the intrinsic reward and discounted UCB. Section 2.3 specifies the RL setup: GRPO, binary rewards, prompt filtering.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Training stages on miniF2F-test pass@128: base 29.7%, SFT (CoT) 50.4%, RL (CoT) 51.6%. At larger budgets, RL single-pass reaches 60.2% (against V1's 50.0%), and RL plus RMaxTS reaches 63.5%. ProofNet-test: 22.6% single-pass, 25.3% with RMaxTS. The best comparison lines are ReProver at 13.8% and InternLM2-StepProver at 18.1% on ProofNet. RL with only 3200 raw samples beats InternLM2-StepProver's much larger 64x3200 tree search (54.9% versus 54.5% on miniF2F-test).",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The paper labels RMaxTS a heuristic exploration strategy and keeps the evaluation to two benchmarks. Statement fidelity and the 7B capacity ceiling remain. Search results depend on parallel infrastructure (256 runners, 32 threads per tree), so reproducing the headline accuracy requires serious compute.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When an environment gives you partial feedback, stop discarding it. Truncating failures into reusable prefixes converts one expensive sample into a tree of information, and a cheap intrinsic bonus for novelty keeps exploration alive when the real reward is rare. The GRPO-with-binary-rewards setup here is the same machinery R1 later scales up in natural language.",
      },
    ],
    questions: [
      {
        id: "prover15-q1",
        prompt:
          "Why does MCTS need the proof assistant's feedback signal in this system?",
        options: [
          "Without it the model cannot generate any tactics",
          "The feedback supplies the first-error location and tactic state that define tree nodes and let failed proofs become reusable prefixes",
          "It replaces reward computation during RL",
          "It proves the final theorem without further search",
        ],
        answer: 1,
        explanation:
          "The tree abstraction is built from what Lean reports: which tactic failed and what the goal looked like before it. Without those messages there is no node to truncate to and no state to resume from. The verifier also happens to provide binary rewards, but the tree structure is the deeper dependency.",
      },
      {
        id: "prover15-q2",
        prompt:
          "What problem does the intrinsic new-node reward solve?",
        options: [
          "It makes Lean verification faster",
          "Extrinsic reward is only nonzero for completed proofs, so exploration needs a separate bonus for discovering novel tactic states",
          "It replaces the KL penalty in GRPO",
          "It prevents the model from generating long proofs",
        ],
        answer: 1,
        explanation:
          "Proof search is sparse-reward: an unfinished proof scores zero no matter how promising. Paying for new nodes gives the search gradient-like pressure toward unexplored regions. It says nothing about verification speed and does not remove the KL term from the RL objective.",
      },
      {
        id: "prover15-q3",
        prompt:
          "Why does the RL stage use only theorems where the SFT model sometimes succeeds?",
        options: [
          "Easy theorems are reserved for evaluation",
          "A group with the same reward for every sample has zero advantage and produces no learning signal",
          "The KL coefficient is undefined on easy prompts",
          "Hard theorems would exceed the 2048-token limit",
        ],
        answer: 1,
        explanation:
          "GRPO subtracts the group mean, so a prompt where all 32 samples fail gives all-zero advantages and a wasted rollout. Moderate difficulty keeps both correct and incorrect proofs in the group, which is exactly what group-relative learning needs. The paper retains roughly 4.5k such statements.",
      },
      {
        id: "prover15-q4",
        prompt:
          "In truncate-and-resume, why truncate a failed proof at its first error rather than at the end of the generated text?",
        options: [
          "The remaining text is usually correct and can be kept",
          "Everything before the first error was accepted by Lean, so only that prefix is guaranteed to be a valid partial state",
          "Truncating saves GPU memory",
          "The first error indicates the theorem is unprovable",
        ],
        answer: 1,
        explanation:
          "Lean applies tactics sequentially; the first failure means later tactics were never applied to a valid state. Keeping only the verified prefix is what makes the abstraction sound. A single error says nothing about provability, only about that attempt.",
      },
      {
        id: "prover15-q5",
        prompt:
          "Why does the discounted UCB rule (gamma = 0.99) fit the intrinsic reward better than plain UCB1?",
        options: [
          "gamma makes the tree smaller",
          "The expected intrinsic reward decays as the tree fills up, so recent feedback should outweigh old feedback",
          "UCB1 cannot handle binary rewards",
          "gamma converts the reward into a probability",
        ],
        answer: 1,
        explanation:
          "Novelty is non-stationary: early expansions almost always find new nodes, later ones rarely do. Discounting old observations keeps value estimates aligned with the current phase of exploration. UCB1 would keep averaging in stale, optimistic early rewards.",
      },
    ],
    practice: {
      problems: ["rl-347", "rl-012", "rl-023"],
    },
  },
  {
    id: "deepseek-r1",
    slug: "deepseek-r1",
    title:
      "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
    short: "DeepSeek-R1",
    year: 2025,
    date: "2025-01-22",
    arxivId: "2501.12948",
    url: "https://arxiv.org/abs/2501.12948",
    kind: "paper",
    era: "reasoning",
    tier: "core",
    tagline:
      "Reward only the final answer and the reasoning trace teaches itself: R1-Zero grows long chains of thought, self-checks, and an aha moment, with no supervised reasoning data at all.",
    whatItIs:
      "DeepSeek-R1 is the paper that showed reasoning can be incentivized with pure reinforcement learning on verifiable outcomes. DeepSeek-R1-Zero starts from DeepSeek-V3-Base and trains with GRPO using only rule-based rewards for answer correctness and output format, with no supervised fine-tuning stage. The follow-up model, DeepSeek-R1, adds a small cold-start dataset and a multi-stage pipeline to fix readability, then distills the resulting traces into six dense models.",
    theoryMinutes: 18,
    lineage: {
      from: "deepseek-v3",
      to: ["deepseek-r1-0528", "deepseek-prover-v2"],
      context:
        "The RL algorithm, GRPO, comes straight from the founding era (it was introduced in the DeepSeekMath paper, id deepseek-math), and the base model is DeepSeek-V3. R1 is the moment the two lines meet: a frontier-scale base model plus group-relative RL on verifiable rewards.",
      improved: [
        "Demonstrates that reasoning behaviors (long chains of thought, self-verification, backtracking) emerge from pure RL without any supervised reasoning traces.",
        "Reaches 71.0% pass@1 on AIME 2024 (86.7% with majority voting) from a 15.6% starting point, using only outcome and format rewards.",
        "Reintroduces a small cold-start SFT stage plus a language-consistency reward to fix R1-Zero's readability and language mixing, yielding R1 at 79.8% on AIME 2024 and 97.3% on MATH-500.",
        "Shows distillation beats direct RL for small models: the 32B distilled student reaches 72.6% on AIME 2024 while a 32B model trained with large-scale RL reaches 47.0%.",
        "Releases six dense distilled models (1.5B to 70B) trained on 800k curated samples, putting strong reasoning within reach of ordinary hardware.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "What a reasoning trace is, and why outcome rewards can work",
        text: "A reasoning trace is text the model writes to itself before answering: restating the problem, sketching a plan, doing algebra, checking intermediate results, abandoning an approach and trying another. In RL terms the whole trace plus the final answer is one action sequence, and the reward function only inspects the last few tokens. That sounds too weak to teach good process, but it works in verifiable domains because the environment can check whether the final answer is correct, and the policy gradient raises the probability of every token that was present when a correct answer was produced. Over many problems, steps that tend to lead to correct answers get reinforced even though no one labeled the steps. The paper deliberately avoids a neural process reward model: the authors report that such models can be reward-hacked at scale and cost extra training cycles.",
      },
      {
        kind: "formula",
        label: "The GRPO objective R1 maximizes",
        expression:
          "J(theta) = E[ (1/G) * sum_{i=1..G} ( min( rho_i * A_i, clip(rho_i, 1 - eps, 1 + eps) * A_i ) - beta * KL(pi_theta || pi_ref) ) ]\nrho_i = pi_theta(o_i | q) / pi_theta_old(o_i | q)",
        why: "For each question q the old policy samples G answers; rho_i is how much more (or less) likely the current policy makes answer i. A_i is that answer's advantage (next formula). The min-and-clip term is the PPO-style safety: it stops the update from chasing one lucky answer too far, since the clipped ratio removes the incentive to move probability mass violently. The KL penalty with coefficient beta keeps the policy from drifting away from the reference model, which is the guard against degenerate text that scores well but reads badly. R1 reports beta = 0.001, a clip ratio eps of 10, learning rate 3e-6, temperature 1, and 16 outputs per question.",
      },
      {
        kind: "formula",
        label: "Group-relative advantage",
        expression: "A_i = (r_i - mean({r_1, ..., r_G})) / (std({r_1, ..., r_G}) + eps)",
        why: "GRPO has no value network. It uses the other answers to the same question as the baseline: r_i is the reward of answer i, mean(r) is the average reward of the group, and subtracting it turns absolute rewards into 'better or worse than my siblings'. Dividing by the group's standard deviation makes the scale comparable across questions: a group with rewards 0 and 1 spreads as much as a group with rewards 0, 0.5, 1 after normalization, so easy and hard prompts contribute similar-sized updates. eps guards the division when all rewards are equal (then every advantage is 0 and the group teaches nothing).",
      },
      {
        kind: "code",
        title: "Group advantages in ten lines",
        language: "python",
        code: `def group_advantages(rewards, eps=1e-8):
    n = len(rewards)
    mean_r = sum(rewards) / n
    var_r = sum((r - mean_r) ** 2 for r in rewards) / n
    std_r = var_r ** 0.5
    return [(r - mean_r) / (std_r + eps) for r in rewards]

# a math prompt verified by a rule: two of four answers are correct
print(group_advantages([1.0, 0.0, 1.0, 0.0]))
# a prompt the model always solves: no learning signal
print(group_advantages([1.0, 1.0, 1.0, 1.0]))`,
        notes: [
          "Rewards are just the verifier's verdict, so the same code works for math boxes and unit tests.",
          "All-equal rewards give all-zero advantages: hard or trivial prompts contribute no gradient.",
          "The sign, not the magnitude, is what matters most: correct answers are pushed up, wrong ones down.",
        ],
      },
      {
        kind: "visual",
        visual: "grpo-loop",
        caption:
          "The GRPO loop: sample a group of answers per question, score them with rule-based rewards, normalize within the group to get advantages, then update the policy with the clipped objective minus a KL term.",
      },
      {
        kind: "prose",
        heading: "The cold-start problem and the aha moment",
        text: "R1-Zero's traces are effective but often unreadable: languages mix, formatting meanders, and answers are hard to extract. R1 fixes this by starting from a few thousand curated cold-start examples that model a readable thinking format, then running reasoning RL with two extra ingredients: a format reward that requires the thinking between special tags, and a language-consistency reward equal to the proportion of words written in the target language. The paper notes this alignment slightly lowers benchmark scores but buys readability, an explicit trade. Meanwhile the reward curve itself contains the paper's most quoted phenomenon: at some intermediate checkpoint the model spontaneously starts re-examining its own steps ('wait, wait. Wait. That's an aha moment I can flag here' appears in a sample trace), and average response length climbs throughout training as the model learns to think longer.",
      },
      {
        kind: "visual",
        visual: "rl-reward-curve",
        caption:
          "AIME 2024 accuracy during RL: pass@1 climbs from 15.6% to 71.0% (the paper's later revision reports 77.9% for the same curve) and majority voting lifts it to 86.7%, while average response length grows in step with accuracy.",
      },
      {
        kind: "visual",
        visual: "distillation-flow",
        caption:
          "Distillation: 800k samples from R1 (about 600k reasoning plus 200k non-reasoning) are used to fine-tune six dense students. The 32B student scores 72.6% on AIME 2024 versus 47.0% for a 32B base model trained with large-scale RL, and the 7B student (55.5%) beats QwQ-32B-Preview (44.0%).",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Reasoning capability in LLMs had been bought with human-written reasoning traces. Can it instead be incentivized by outcome rewards alone, without any supervised reasoning data, and what does that change about how models are built?",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Two experiments in one paper. Section 2 is R1-Zero: pure RL from the base model, rule-based rewards, no SFT. Section 3 is R1: cold start, reasoning RL, rejection sampling plus SFT, then a final RL stage with model-based preference rewards for helpfulness and safety. Section 4 distills R1 into smaller dense models.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper must muster",
        text: "R1-Zero on AIME 2024 goes from 15.6% pass@1 to 71.0%, and 86.7% with majority voting, with no supervised reasoning data. R1 scores 79.8% on AIME 2024, 97.3% on MATH-500, 71.5% on GPQA Diamond, 90.8% on MMLU, a 2029 Elo rating on Codeforces (96.3rd percentile of human competitors), and 49.2% on SWE-bench Verified. The distilled students cover 1.5B, 7B, 8B, 14B, 32B, and 70B parameters: the 1.5B student reaches 28.9% on AIME 2024 and 83.9% on MATH-500, and the 32B student reaches 72.6%, 94.3%, and 57.2% on LiveCodeBench. Distillation clearly beats RL on small base models in the paper's own comparison.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The rule-based RL stage is narrow: it targets math, code, and logic with checkable answers, and R1-Zero is weak on writing and open-domain QA (its instruction-following and writing scores trail the instruct models of the time). Language consistency slightly hurts benchmark accuracy. The cold-start and rejection-sampling stages depend on the existing DeepSeek-V3 pipeline. The paper is also upfront that a neural reward model was rejected on reward-hacking grounds, which leaves general, non-verifiable reasoning as unfinished business.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If your task has a verifier, you can teach process with outcome rewards, and you probably do not need a process reward model. Use a group-relative baseline to avoid training a critic, keep a KL leash to a reference model, and seed readability with a small curated cold start. When compute is short, distill a strong reasoner into the model size you can actually serve.",
      },
    ],
    questions: [
      {
        id: "r1-q1",
        prompt: "Why can DeepSeek-R1-Zero forgo SFT entirely?",
        options: [
          "The base model was already fine-tuned on reasoning traces",
          "Verifiable rewards give a usable training signal from the base policy, and GRPO's group baseline needs no critic or labeled reasoning steps",
          "SFT data did not exist for math at the time",
          "The cold-start data replaced SFT but is technically also SFT",
        ],
        answer: 1,
        explanation:
          "R1-Zero relies on rule-checkable outcomes plus the group-relative advantage, so the learning signal comes from the environment rather than from demonstrations. No reasoning labels are needed at any point. R1 later adds cold-start SFT, but that is a fix for readability, not a prerequisite for learning.",
      },
      {
        id: "r1-q2",
        prompt: "What does the KL term in the GRPO objective guard against?",
        options: [
          "Long responses",
          "The policy drifting too far from the reference model in pursuit of reward, which degrades quality and invites reward hacking",
          "Groups with identical rewards",
          "Numerical overflow in the importance ratio",
        ],
        answer: 1,
        explanation:
          "The KL penalty with coefficient beta keeps the updated policy close to the reference. Without it, a policy can collapse onto degenerate text that happens to score well. Identical rewards are handled by the advantage normalization, and length is not regulated by the KL term.",
      },
      {
        id: "r1-q3",
        prompt:
          "Two prompts yield reward groups [0, 0, 0, 1] and [0.4, 0.5, 0.5, 0.6]. Why does GRPO divide by the group standard deviation?",
        options: [
          "To make the sum of advantages equal 1",
          "To rescale both groups so their advantage spreads are comparable instead of letting the higher-variance group dominate updates",
          "Because rewards must lie between 0 and 1",
          "To estimate the value function without a critic",
        ],
        answer: 1,
        explanation:
          "Without division, a binary group has raw spread near 0.5 while the nearly uniform group has spread near 0.07, so the first question would dominate the batch. Standardizing makes the two learning signals comparable. The advantages always have mean zero by construction, not sum one, and the critic is eliminated by the baseline, not the division.",
      },
      {
        id: "r1-q4",
        prompt: "What is the cold-start dataset for?",
        options: [
          "To teach the model mathematics it does not know",
          "To seed a readable thinking format and stabilize the unstable early phase of RL on the base model",
          "To provide the reward model with labeled preferences",
          "To replace the first RL stage entirely",
        ],
        answer: 1,
        explanation:
          "R1-Zero could reason but produced messy, language-mixed traces. The cold start is a small set of curated, human-friendly long chains of thought. It formats behavior; the capability still comes from RL. Preference labels arrive later, in the final alignment stage.",
      },
      {
        id: "r1-q5",
        prompt:
          "The paper rejects a neural process reward model for R1-Zero. What reason does it give?",
        options: [
          "Process reward models cannot read math",
          "Learned reward models can be reward-hacked at large scale and add pipeline complexity and retraining cost",
          "Process supervision always underperforms outcome supervision in every domain",
          "The paper could not afford GPUs for a reward model",
        ],
        answer: 1,
        explanation:
          "The stated concerns are reward hacking under large-scale RL and the extra machinery a learned reward model requires. The alternative, rule-based outcome rewards, is cheap and hard to game. Note the paper still uses model-based preference rewards in R1's final alignment stage, where the objectives are broader.",
      },
    ],
    practice: {
      problems: ["rl-272", "rl-273", "rl-306", "rl-207", "nlp-268", "dl-149"],
      articles: ["art-post-training"],
    },
  },
  {
    id: "code-i-o",
    slug: "code-i-o",
    title:
      "CodeI/O: Condensing Reasoning Patterns via Code Input-Output Prediction",
    short: "CodeI/O",
    year: 2025,
    date: "2025-02-11",
    arxivId: "2502.07316",
    url: "https://arxiv.org/abs/2502.07316",
    kind: "paper",
    era: "reasoning",
    tier: "advanced",
    tagline:
      "Ask a model to predict what a function outputs (or to invent an input that produces a given output) in plain language, and code turns into a scalable supply of verified reasoning practice.",
    whatItIs:
      "CodeI/O is a data-construction method, not a new architecture. It harvests hundreds of thousands of real functions, converts each into an executable form, generates input-output pairs by running the code, and has a strong model (DeepSeek-V2.5) write natural-language chains of thought that predict the answer. Because the ground truth comes from execution, every prediction can be checked, and wrong predictions can be revised instead of discarded. Training on the result improves symbolic, logic, math, scientific, and commonsense benchmarks, not just code tasks.",
    theoryMinutes: 12,
    lineage: {
      context:
        "A research satellite rather than a step on the main lineage: it uses DeepSeek-V2.5 as a synthesizer and targets the same bottleneck R1 attacks from the RL side, namely where diverse reasoning training data comes from. There is no honest single predecessor to point at, so this entry has no 'from' edge.",
      improved: [
        "Turns arbitrary executable code into a reasoning corpus by prediction rather than by code generation, decoupling reasoning structure from syntax.",
        "Scales to 3.5M training instances derived from 454.9K raw code files, with verified ground truth for every input-output pair.",
        "Introduces CodeI/O++, which verifies predictions by re-execution and asks the model to revise its own wrong answers, keeping the data instead of filtering it.",
        "Shows balanced gains across 14 benchmarks for four different base models, where math-only or code-only datasets tend to help some tasks and hurt others.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Reasoning data is scarce because it is expensive",
        text: "Math and code have abundant structured supervision: final answers and unit tests. Most other reasoning domains (logic, state tracking, commonsense chains) have nothing comparable, and manually writing step-by-step solutions does not scale. Code is an interesting middle ground: it is abundant and executable, but the reasoning inside it is implicit and entangled with syntax. Reading code does not automatically teach you to reason; predicting what code does does.",
      },
      {
        kind: "prose",
        heading: "Input-output prediction as reasoning condensation",
        text: "The transformed task is simple to state. Show the model a function and a textual query, then either give an input and ask for the output, or give an output and ask for a feasible input. The answer must be a natural-language chain of thought, not code: trace the flow, track variables, follow branches and loops. That is procedural reasoning with no syntax to hide behind. Because the reference function was executed to make the pair, the prediction has a ground truth, which is rare in open-ended reasoning data.",
      },
      {
        kind: "visual",
        visual: "code-pipeline",
        caption:
          "CodeI/O construction: raw code is cleaned into executable functions with a main entrypoint and an input generator, inputs are sampled and executed to get outputs, DeepSeek-V2.5 synthesizes natural-language prediction CoTs, and re-execution verifies every prediction.",
      },
      {
        kind: "prose",
        heading: "Keep the mistakes: verification and revision",
        text: "A tempting move is rejection sampling: drop every response whose prediction was wrong. The paper tested this and it backfired. Filtering removes about half the data, and the surviving set scored worse on average than a random subset of the same size (56.5 versus 56.7 on the reported average). Instead, CodeI/O++ appends execution feedback as a second turn and asks the model to try again; the revised response is concatenated with the original and the feedback. About 10% of incorrect first-turn predictions are fixed this way, and the resulting dataset beats CodeI/O on every reported model. The lesson is that error correction is more informative than error deletion.",
      },
      {
        kind: "code",
        title: "Checking a prediction by re-execution",
        language: "python",
        code: `def check_prediction(fn, mode, given, predicted):
    """mode is 'output' (given an input, predicted the output)
    or 'input' (given an output, predicted a candidate input)."""
    if mode == "output":
        return fn(given) == predicted
    if mode == "input":
        try:
            return fn(predicted) == given
        except Exception:
            return False
    raise ValueError("unknown mode")

# doubles = lambda x: x * 2
# check_prediction(doubles, "output", 21, 42)  -> True
# check_prediction(doubles, "input", 42, 21)   -> True`,
        notes: [
          "Output prediction is easy to verify by calling the function once.",
          "Input prediction verifies by executing the candidate input inside a try, because a wrong input can crash the function.",
          "This same check is what powers the second-turn revision prompt.",
        ],
      },
      {
        kind: "prose",
        heading: "Why the schedule is two-stage",
        text: "The CodeI/O dataset has far more samples than the general instruction-tuning set. Mixing them in one stage would let prediction samples swamp instruction data, so training runs as code-prediction first (making the base model a stronger reasoner) and general instruction tuning second (making it a usable assistant). The paper compares alternatives and reports that two-stage training beats mixing in every configuration tested, and that first-stage data helps even when the second stage is identical to the single-stage baseline.",
      },
      {
        kind: "prose",
        heading: "What the results show",
        text: "Averaged over 14 benchmarks, Qwen2.5-Coder-7B improves from 54.8 (instruction tuning only) to 57.2 with CodeI/O and 57.7 with CodeI/O++. CRUXEval-O, the benchmark that literally asks for output prediction, rises from 60.0 to 64.9 and then 67.9. LLaMA 3.1 8B goes from 49.3 to 51.2 and 52.1, DeepSeek Coder v2 Lite from 51.6 to 53.6, and Gemma 2 27B from 59.5 to 60.9 and 61.5. Gains also appear on MATH, BBH, and KorBench. Continual pretraining on raw code (7.7M samples, more data than CodeI/O) barely helps, which the authors read as evidence that task design, not data volume, is doing the work.",
      },
      {
        kind: "prose",
        heading: "The honest limits",
        text: "The dataset is built with a strong proprietary-quality synthesizer (DeepSeek-V2.5), and the paper shows synthesis-model quality matters. Leakage is handled with an n-gram audit; overlap is low on most benchmarks, with LeetCode-O at 21.5% and KorBench at 5.1%, and the paper shows gains persist on the non-leaked subsets. Input prediction is only verifiable when the function accepts many valid inputs; deterministic, JSON-serializable outputs are required, so randomness and side effects are excluded. And the benchmark suite is the authors' selection, not an external standard.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Reasoning training data outside math and code is sparse and fragmented. Raw code is abundant but its reasoning signal is implicit, and training on text-to-code generation is constrained by syntax.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Reformulate code learning as input-output prediction in natural language. Section 2 covers the four-stage data pipeline, Section 3 the main results against strong data baselines, and Section 4 the ablations that justify each design choice, especially the rejection-sampling result.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "3.5M instances from 454.9K raw code files, split roughly 50/50 between input and output prediction. CodeI/O and CodeI/O++ lead on average across four base models and 14 benchmarks, beating OpenMathInstruct2, WebInstruct, OpenCoder-SFT-Stage-1, and raw code. The Qwen2.5-Coder-7B average moves 54.8 to 57.2 and 57.7; CRUXEval-O moves 60.0 to 64.9 and 67.9; MATH moves 71.6 to 71.9 and 72.1. A DeepSeek-V2.5 re-synthesis of the WebInstruct baseline still trails CodeI/O, which isolates task design from synthesizer strength.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "LeetCode-O overlap is measured at 21.5% before manual inspection, and the authors rely on subset analysis to argue the gains are real. The domain is restricted to executable, deterministic Python with JSON-serializable inputs and outputs. The instruction-tuning stage uses an in-house dataset, so exact reproduction is impossible from the paper alone.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "An execution engine is a data generator. When you have code, turn it into prediction problems, let execution grade the answers, and revise the wrong ones rather than deleting them. Train this before instruction tuning, expect broad rather than code-specific gains, and treat the synthesizer model as a first-class hyperparameter.",
      },
    ],
    questions: [
      {
        id: "codeio-q1",
        prompt: "Why does CodeI/O ask for input prediction in addition to output prediction?",
        options: [
          "Because outputs are hard to compute",
          "Solving for an input that reaches a given output exercises inverse, search-like reasoning that forward execution does not",
          "Because Lean verifiers only accept inputs",
          "To double the dataset size for its own sake",
        ],
        answer: 1,
        explanation:
          "Output prediction is forward execution; input prediction requires working backward or searching a space of candidates, which is a different reasoning primitive. The paper's ablations show both kinds contribute, with different benchmarks favoring each. Dataset size is a side effect, not the motivation.",
      },
      {
        id: "codeio-q2",
        prompt:
          "The paper tried rejection sampling (dropping wrong predictions) and abandoned it. Why?",
        options: [
          "Wrong predictions are needed to keep the loss nonzero",
          "It discarded about half the data and scored below a random subset of the same size, losing diversity without gaining quality",
          "Execution cannot detect wrong predictions reliably",
          "Rejection sampling doubled training time",
        ],
        answer: 1,
        explanation:
          "The comparison is controlled: a random half-size subset of CodeI/O beat the rejection-sampled set on the average. The alternative, CodeI/O++'s multi-turn revision, keeps the data and corrects some of it. Execution labels mistakes precisely, so deletion is wasteful.",
      },
      {
        id: "codeio-q3",
        prompt: "What does execution-based verification buy over an LLM judge?",
        options: [
          "It is the only way to get a chain of thought",
          "Labels are exact and reproducible, since running the reference function settles the question without a second model's opinion",
          "It can verify any natural-language reasoning task",
          "It removes the need for instruction tuning",
        ],
        answer: 1,
        explanation:
          "The reference function is the ground truth for the prediction task, so checking is deterministic. LLM judges add cost, variance, and their own biases. The scope is still limited to executable functions, which is exactly why the paper stays within that domain.",
      },
      {
        id: "codeio-q4",
        prompt: "Why does the paper train in two stages instead of mixing CodeI/O with instruction data?",
        options: [
          "Instruction data corrupts code reasoning",
          "The prediction corpus dwarfs the instruction set, so mixing would under-train instruction following",
          "Two-stage training is required by the base models' licenses",
          "Mixing causes data leakage between benchmarks",
        ],
        answer: 1,
        explanation:
          "3.5M prediction samples against roughly 1.18M instruction samples means the mixture would be dominated by prediction. Stage one strengthens reasoning; stage two restores assistant behavior. The paper tested mixed variants and found two-stage better in all reported comparisons.",
      },
      {
        id: "codeio-q5",
        prompt:
          "Raw-code continual pretraining (7.7M samples) underperforms CodeI/O (3.5M samples). What does that suggest?",
        options: [
          "Code data is useless for reasoning",
          "The form of the task matters more than the amount of data: prediction forces the reasoning to be expressed, while raw files leave it implicit",
          "Continual pretraining always hurts downstream scores",
          "7.7M samples is too few for pretraining",
        ],
        answer: 1,
        explanation:
          "The underperformance is the point of the paper: the reasoning patterns exist in the code, but turning them into prediction problems with verified answers is what makes them learnable. The authors interpret the gap as evidence that task design, not volume, drives the gains.",
      },
    ],
    practice: {
      problems: ["al-261", "ds-003"],
    },
  },
  {
    id: "itc-grm",
    slug: "itc-grm",
    title: "Inference-Time Scaling for Generalist Reward Modeling",
    short: "DeepSeek-GRM",
    year: 2025,
    date: "2025-04-03",
    arxivId: "2504.02495",
    url: "https://arxiv.org/abs/2504.02495",
    kind: "paper",
    era: "reasoning",
    tier: "advanced",
    tagline:
      "A reward model can think too. Train a 27B model to write principles and critiques, sample it many times, and vote, and it beats reward models hundreds of times larger.",
    whatItIs:
      "This paper is about the part of RL that R1 deliberately sidestepped. Verifiable tasks can be graded by rules, but most useful behavior cannot. The authors build a generative reward model (GRM) that writes principles for judging a query, critiques each candidate response against those principles, and outputs a score. Training (Self-Principled Critique Tuning) combines rejection-sampled fine-tuning with rule-based online RL, and inference scales by sampling many judgments in parallel and aggregating them with a vote guided by a meta reward model.",
    theoryMinutes: 15,
    lineage: {
      context:
        "A research satellite on the reward side of the pipeline. R1 showed that verifiable rewards can drive reasoning; this paper asks how to get reliable rewards for the general case, which is the open problem R1's own limitations section leaves behind. Its 'from' edge is left out because it was not built on a specific earlier curriculum paper.",
      improved: [
        "Proposes pointwise generative reward modeling, where the model writes principles and critiques and then scores, instead of acting as a fixed classifier or judge prompt.",
        "Introduces SPCT (Self-Principled Critique Tuning), an RFT plus rule-based online RL schedule that makes reward generation scale with inference compute.",
        "Shows parallel sampling with voting improves the same 27B model monotonically: RewardBench 86.0 at one sample, 87.7 at 8, 88.5 at 32, and 90.4 with meta-RM filtering.",
        "Adds a meta reward model that predicts whether a judgment is correct and filters bad judgments before voting, improving scaling beyond plain voting.",
        "Demonstrates that inference-time scaling of a 27B reward model beats training-time scaling to 671B, closing a gap that used to require the bigger model.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why reward models matter, and why they are hard",
        text: "RL post-training needs a number for every response the policy produces. When the task is verifiable, a rule supplies that number exactly, as in R1's math and code rewards. For writing, dialogue, or open-ended advice, there is no rule, so a reward model must stand in for human judgment. Classical reward models are discriminative: they read a prompt and a response and output a scalar, which makes them cheap but rigid, since one forward pass must encode every criterion at once. This paper instead treats reward modeling as a generative task, which is what makes it scale with more compute at inference time.",
      },
      {
        kind: "prose",
        heading: "Generative reward modeling: principles, then critiques",
        text: "The pointwise GRM takes a query and one response, proposes the principles it will judge by (for example, correctness, safety, relevance, instruction following), writes a critique against each principle, and only then emits a scalar reward. Judging is now an explicit reasoning process, and like any reasoning process it can be sampled repeatedly. Two properties follow: the model adapts its own criteria per query instead of applying one fixed rubric, and the quality of the judgment can improve simply by generating more attempts, which is the same inference-time scaling idea as letting a reasoner think longer.",
      },
      {
        kind: "prose",
        heading: "SPCT: how the model learns to judge",
        text: "SPCT has two stages. In the first, rejective fine-tuning, the model samples judgments on RM data and keeps the ones that agree with the ground-truth preference, with an optional hint about the correct label attached to some samples. In the second, rule-based online RL sharpens the behavior: reward is computed by comparing the model-generated reward with the known correct ordering, so the training signal stays exact and needs no learned critic of its own. The resulting DeepSeek-GRM-27B is based on Gemma-2-27B. The paper also trains a meta RM, a small classifier over (query, response, judgment) that predicts whether a sampled judgment is correct, and this is what guides voting at inference.",
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "Compute comparisons. Voting over 32 samples from the 27B generative reward model reaches the overall level of much larger reward models, with meta-RM filtering on top; the paper reports this inference-side scaling beats size scaling up to 671B parameters.",
      },
      {
        kind: "formula",
        label: "Plurality voting over sampled judgments",
        expression: "V(c) = sum_{j=1..N} 1[ c = argmax_{c'} r_j(c') ]",
        why: "Each sampled judgment j assigns a score r_j to every candidate response c'. The first term inside the indicator asks which candidate that sample prefers. Summing over N samples counts how many judgments rank each candidate first, and the aggregate reward picks the candidate with the largest V(c). This is inference-time scaling in its cheapest form: more samples, less variance, no retraining. The meta RM changes the aggregation by weighting or filtering samples before the vote, which is why 8 guided samples can match many unguided ones.",
      },
      {
        kind: "code",
        title: "Tallying votes from sampled judgments",
        language: "python",
        code: `def plurality_vote(judgments):
    # judgments: list of samples; each sample is a dict candidate -> score
    tally = {}
    for sample in judgments:
        best = max(sample, key=sample.get)
        tally[best] = tally.get(best, 0) + 1
    return max(tally, key=tally.get)

samples = [
    {"A": 0.8, "B": 0.2},
    {"A": 0.6, "B": 0.7},
    {"A": 0.9, "B": 0.1},
]
print(plurality_vote(samples))  # A wins two of three judgments`,
        notes: [
          "Ties resolve by dictionary order here; production code should break them explicitly.",
          "Every sample is one full generative judgment, so this is where inference cost grows with N.",
          "The meta RM can pre-filter samples before this function runs.",
        ],
      },
      {
        kind: "prose",
        heading: "What the numbers show",
        text: "On RewardBench the 27B model scores 86.0 with a single greedy judgment, 87.7 with 8 samples, 88.5 with 32, and 90.4 when meta-RM filtering guides the vote. The paper's overall average across its RM benchmark suite moves from 69.9 to 70.6 (8 samples) to 71.0 (32 samples) to 72.8 with the meta RM, against 71.3 for GPT-4o and 70.5 for Nemotron-4-340B-Reward, which the paper cites as public reference points. Ablations show principle generation is load-bearing: removing it drops the overall score to 67.5, and removing the rejective sampling or general instruction data hurts as well. Inference-time scaling also outperforms simply training a bigger GRM, the paper's central comparison.",
      },
      {
        kind: "prose",
        heading: "The honest limits",
        text: "The paper admits that DeepSeek-GRM still struggles on some tasks and does not eliminate bias, since a generative judge inherits the biases of its training data. The meta RM is another learned component with its own failure modes, and sampling 32 judgments per evaluation multiplies inference cost, which matters whenever the reward model sits inside an RL loop rather than an offline eval. Voting assumes the majority of samples are right, which can fail systematically on questions where the model's priors are wrong. The authors frame these as open problems for generalist reward systems.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "RL post-training beyond verifiable tasks needs accurate reward signals for arbitrary queries, and classical scalar reward models neither adapt their criteria nor benefit much from extra inference compute.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Make reward modeling generative and the rest follows: principles and critiques can be sampled, samples can be voted, and a meta model can filter. Section 3 defines pointwise GRM and SPCT, Section 4 covers the inference-time scaling strategies including voting and meta-RM guidance.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "DeepSeek-GRM-27B on the paper's suite: RewardBench 86.0 to 90.4 as samples and filtering scale from one to 32; overall average 69.9 to 72.8. Baseline comparisons include LLM-as-a-Judge at 67.8, CLoud-Gemma-2-27B at 68.7, DeepSeek-PairRM-27B at 69.0, and public reference results GPT-4o 71.3 and Nemotron-4-340B-Reward 70.5. Ablations isolate principle generation (67.5 without it) and rejective sampling (68.7 without it) as contributors.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "Residual task failures are reported and attributed to data difficulty and synthesis quality; biases are reduced but not removed. The meta RM adds a learned filter, not a guarantee. Scaling by parallel sampling has real serving cost, and the paper does not claim the approach covers every subjective evaluation.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If you need a reward signal for a non-verifiable task, consider a generative judge that states its criteria, then spend inference compute sampling and aggregating rather than immediately reaching for a larger model. A small meta model that filters judgments is a cheap upgrade to plain voting. And when you evaluate a reward model, always report the number of samples behind each score, because in this design the sample count is part of the model.",
      },
    ],
    questions: [
      {
        id: "grm-q1",
        prompt: "Why does voting help a generative reward model more than a scalar one?",
        options: [
          "Generative models produce random noise that averages out",
          "Each sample is an independent judgment with its own principles and critique, so aggregation reduces variance that a single scalar forward pass cannot escape",
          "Scalar models cannot output probabilities",
          "Voting removes the need for training data",
        ],
        answer: 1,
        explanation:
          "The GRM's judgment is itself a reasoning process, so resampling explores different framings and mistakes decorrelate. A classical scalar RM gives nearly the same number every time, so sampling adds cost without diversity. The paper's scaling curves show the generative path improving monotonically with N.",
      },
      {
        id: "grm-q2",
        prompt: "What is the job of the meta reward model?",
        options: [
          "It generates the principles the GRM critiques against",
          "It predicts whether a sampled judgment is correct so low-quality samples can be filtered before the vote",
          "It replaces the KL penalty during RL",
          "It converts pairwise preferences into pointwise ones",
        ],
        answer: 1,
        explanation:
          "The meta RM is a binary classifier over judgments. Filtering bad judgments before aggregation is what produced the paper's best numbers (90.4 on RewardBench). Principles come from the GRM itself, and the KL term is unrelated.",
      },
      {
        id: "grm-q3",
        prompt: "In SPCT's online RL stage, what serves as the reward for the reward model?",
        options: [
          "A human preference label for every rollout",
          "A rule-based comparison between the generated judgment and the known correct ordering",
          "The policy model's entropy",
          "The meta RM's output",
        ],
        answer: 1,
        explanation:
          "RM training data already contains ground-truth orderings, so correctness of a judgment can be checked mechanically. That keeps the RL signal exact and avoids a second learned reward model, mirroring R1's rule-based design one level up the stack. The meta RM is trained separately and used at inference.",
      },
      {
        id: "grm-q4",
        prompt:
          "The pointwise GRM scores candidates one at a time rather than comparing pairs. What does that buy?",
        options: [
          "Lower latency at every sample count",
          "Flexibility across input types and the ability to resample and aggregate judgments, since each judgment is self-contained",
          "A guarantee of bias-free rewards",
          "Better performance with one sample",
        ],
        answer: 1,
        explanation:
          "Pointwise judgments are independent, which makes parallel sampling and voting straightforward, and the same machinery handles scoring with or without a reference response. Pairwise judgments are comparative by construction and do not decompose into a vote. No reward model is bias-free.",
      },
      {
        id: "grm-q5",
        prompt:
          "The paper claims inference-time scaling beats training-time scaling for this task. What is the practical reading?",
        options: [
          "Small models always beat large ones",
          "A 27B model with enough sampled judgments matches much larger reward models, so spend compute at serving time instead of parameter count",
          "Training bigger models is impossible past 27B",
          "Voting accuracy grows linearly with cost forever",
        ],
        answer: 1,
        explanation:
          "The comparison is between a 27B GRM with parallel sampling and much larger GRMs, and the sampled 27B wins on the reported suite. Gains taper as N grows, so 'forever' overstates it, and the claim is specific to reward modeling, not a general law about model size.",
      },
    ],
    practice: {
      problems: ["rl-225", "rl-178", "rl-206", "rl-207", "dl-149"],
      articles: ["art-post-training"],
    },
  },
  {
    id: "deepseek-prover-v2",
    slug: "deepseek-prover-v2",
    title:
      "DeepSeek-Prover-V2: Advancing Formal Mathematical Reasoning via Reinforcement Learning for Subgoal Decomposition",
    short: "DeepSeek-Prover-V2",
    year: 2025,
    date: "2025-04-30",
    arxivId: "2504.21801",
    url: "https://arxiv.org/abs/2504.21801",
    kind: "paper",
    era: "reasoning",
    tier: "core",
    tagline:
      "Decompose, prove each piece, then compose: a general model splits hard theorems into formal subgoals, a small prover closes them, and RL on the composed cold start turns the whole pipeline into a 671B prover at 88.9% on miniF2F-test.",
    whatItIs:
      "Prover-V2 closes the loop between informal and formal reasoning. DeepSeek-V3 reads a hard theorem, writes a proof sketch in natural language, and formalizes each step as a Lean subgoal. A 7B prover solves the subgoals one by one; when they all succeed, their proofs are stitched together and paired with V3's chain of thought to form cold-start training data. Reinforcement learning with verified binary rewards then trains DeepSeek-Prover-V2-671B on top of DeepSeek-V3-Base, and a 7B variant inherits the same RL stage with an extended context window.",
    theoryMinutes: 16,
    lineage: {
      from: "deepseek-prover-v1-5",
      to: ["deepseek-math-v2"],
      context:
        "This is where the two DeepSeek lines fully merge: the prover lineage supplies formal infrastructure (V1.5's GRPO-from-verification and context handling) and DeepSeek-V3 supplies the general reasoner that plans decompositions. The result is the strongest open formal prover reported at its release.",
      improved: [
        "Replaces single-shot proving with recursive subgoal decomposition: V3 plans and formalizes lemmas, a 7B prover closes them, and completed subgoal proofs are composed into full proofs.",
        "Uses solved-by-subgoals problems as synthetic cold start, pairing complete formal proofs with V3's informal chain of thought so one model learns both modes.",
        "Scales the prover to 671B parameters initialized from DeepSeek-V3-Base and reaches an 88.9% pass ratio on miniF2F-test (82.4% with only 32 samples).",
        "Solves 49 of 658 PutnamBench problems and 37.1% of ProofNet-test with Pass@1024, well beyond prior neural provers on college-level mathematics.",
        "Extends the 7B prover's context from 4,096 to 32,768 tokens and reuses the 671B model's RL rollouts, so the small model also reaches 82.0% on miniF2F-test with CoT prompting.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why humans prove theorems with lemmas",
        text: "No one proves a hard theorem as one monolithic line of reasoning. You isolate a claim, prove it, name it, and use it. Each lemma is small enough to keep in your head, and the final argument becomes a short assembly of trusted pieces. Formal provers benefit from the same structure for the same reason: a tactic script that spans hundreds of steps compounds errors and exhausts context, while a list of named subgoals keeps each search problem local and gives the prover intermediate milestones to celebrate with the verifier.",
      },
      {
        kind: "prose",
        heading: "The recursive pipeline",
        text: "DeepSeek-V3 plays the planner. Given a theorem, it writes a high-level proof sketch and formalizes each lemma of the sketch into Lean, producing a sequence of subgoals. The 7B prover then attacks each subgoal independently; proof search per subgoal is cheap because the goal is small and the context is bounded. When every subgoal is closed, the subgoal proofs are composed into a proof of the original theorem. The composition is the payoff: proving the whole in one shot may be infeasible, but proving its parts is a sequence of tractable searches.",
      },
      {
        kind: "visual",
        visual: "prover-tree",
        caption:
          "Subgoal decomposition tree. The root theorem is split by DeepSeek-V3 into formal lemmas, the 7B prover closes each leaf, and verified leaf proofs are recomposed bottom-up into a complete proof of the root.",
      },
      {
        kind: "prose",
        heading: "Turning the pipeline into a cold start for RL",
        text: "The pipeline is also a data generator. The authors collect problems where the 7B prover cannot solve the theorem end to end but can solve every decomposed subgoal. Composing those subgoal proofs yields a full formal proof, which is paired with V3's informal step-by-step chain of thought. The result is cold-start data that shows one model both how to talk about the proof and how to write it in Lean. Supervised fine-tuning on this mixture gives a model that can generate either mode, and the longer CoT mode is noticeably stronger on the benchmark.",
      },
      {
        kind: "prose",
        heading: "RL with verified rewards, at 671B",
        text: "The cold start then feeds reinforcement learning: GRPO with binary rewards, where each generated Lean proof scores 1 if the kernel accepts it and 0 otherwise. The 671B model is trained from DeepSeek-V3-Base with a learning rate of 5e-6 and a 16,384-token context. The 7B model is built from Prover-V1.5-Base with the context extended from 4,096 to 32,768 tokens, fine-tuned on the 671B model's RL rollouts, and then given the same RL treatment. Curriculum learning matters here too: miniF2F-valid problems are folded into training with subgoal decomposition, while the test set stays untouched for evaluation.",
      },
      {
        kind: "formula",
        label: "Idealized pass@K (the teaching model)",
        expression: "pass@K ~= 1 - (1 - p)^K",
        why: "If each independent sample succeeds with probability p, the chance that at least one of K samples works is one minus the chance all K fail. Real samples are correlated, so the curve in the paper flattens, but the shape is right: the 671B model goes from 61.9% at one sample to 82.4% at 32 and 88.9% at 8192. The formula makes the trade explicit: sample budget is a knob that buys success probability, and it is the reason the paper reports results at several budgets instead of only one.",
      },
      {
        kind: "prose",
        heading: "What the numbers show",
        text: "On miniF2F-test the 671B model reaches 88.9% overall (91.0% on the validation split), and 82.4% with only 32 samples in CoT mode; the non-CoT prompt reaches up to 78.3% at 8192 samples. The same weights generalize to college mathematics: 37.1% of ProofNet-test with Pass@1024 and 49 of 658 PutnamBench problems, compared with earlier provers stuck in the low double digits. The paper also introduces ProverBench, 325 formalized problems including 15 recent AIME problems, of which the prover solves 6 while DeepSeek-V3 solves 8 with majority voting, a gap the authors call substantially narrowed. The 7B variant reaches 82.0% on miniF2F-test with CoT prompting at 8192 samples, and the combination of the 7B prover with V3's decomposition reaches 90.2% on miniF2F-valid, nearly matching the 671B model.",
      },
      {
        kind: "prose",
        heading: "The honest limits",
        text: "Even here, informal reasoning is still ahead on the AIME subset (V3 solves 8 of 15, the formal model 6), so the formal-informal gap has narrowed but not closed. The headline numbers use large sample budgets, up to 8192 attempts per problem, which is only practical because Lean verification is cheap. Benchmarks remain small and competition-oriented; PutnamBench success is under 8% of problems. And the pipeline depends on DeepSeek-V3's decomposition quality: a wrong or too-hard decomposition caps what the 7B prover can assemble.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Formal provers plateau when they must solve a hard theorem in one pass: search is expensive, errors compound, and context runs out. Human mathematics handles this with lemmas, and the paper asks whether an LLM pipeline can do the same recursively and then learn from it.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Subgoal decomposition as both a search strategy and a data source. Section 2 covers the recursive pipeline and cold-start construction; Section 3 reports miniF2F, ProofNet, PutnamBench, and the new ProverBench; the RL details (GRPO, binary rewards, context lengths) are in the training section and appendix.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "88.9% pass ratio on miniF2F-test, 82.4% at Pass@32 with CoT, 90.6% to 91.0% on miniF2F-valid, 49 of 658 PutnamBench problems, 37.1% on ProofNet-test with Pass@1024, and 6 of 15 AIME problems in ProverBench against 8 of 15 for DeepSeek-V3 with majority voting. The 7B model reaches 82.0% on miniF2F-test (CoT, Pass@8192) and the V3 plus 7B decomposition pipeline reaches 90.2% on miniF2F-valid.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The paper notes the persistent gap with informal reasoning on AIME and that performance is measured at large sample budgets. Decomposition quality is inherited from DeepSeek-V3 and is not separately certified. Formal statement fidelity remains the standing caveat of the whole formal-proving program.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When a problem is too big for one search, decompose it with the strongest general model you have and solve the pieces with a specialized small one. Then instrument the pipeline: problems that fail end to end but succeed subgoal by subgoal are exactly the training data that teaches composition. Verified binary rewards plus group-relative RL remain the training backbone, now at 671B scale.",
      },
    ],
    questions: [
      {
        id: "proverv2-q1",
        prompt:
          "Why does the pipeline use a 7B prover for subgoals when a 671B model is available?",
        options: [
          "The 671B model cannot write Lean",
          "Subgoal proving requires many independent search attempts, so a small fast model keeps the cost of the recursive pipeline manageable",
          "The 7B model has a larger context window than the 671B model at initialization",
          "Lean rejects proofs generated by mixture-of-experts models",
        ],
        answer: 1,
        explanation:
          "Decomposition creates many small search problems, and search multiplies samples. Putting a 7B model on each leaf keeps that multiplication affordable, while V3 handles the one-time planning and formalization. The 671B model still trains for end-to-end proving; it is not excluded from Lean.",
      },
      {
        id: "proverv2-q2",
        prompt: "What makes a problem suitable for the cold-start dataset?",
        options: [
          "It is easy enough for the 7B model to solve directly",
          "The end-to-end attempt fails but every decomposed subgoal can be proved, so a composed proof exists and can be paired with V3's chain of thought",
          "It appears in miniF2F-valid",
          "It was formalized by a human exactly once",
        ],
        answer: 1,
        explanation:
          "These are exactly the problems that teach composition: the pieces are provable, the whole is not (yet), and the pipeline supplies both the formal proof and the informal reasoning that explains the decomposition. Easy problems teach nothing new, and the validation split is used for curriculum and reporting, not as the primary cold-start criterion.",
      },
      {
        id: "proverv2-q3",
        prompt:
          "The paper compares its 6 of 15 AIME problems against DeepSeek-V3's 8 of 15. Why include a comparison where the formal model loses?",
        options: [
          "To argue formal proving is unnecessary",
          "To show the formal-informal gap has narrowed substantially, since an earlier generation of formal provers would not be in the same range at all",
          "Because the AIME problems were solved by the 7B prover",
          "To demonstrate that majority voting is invalid",
        ],
        answer: 1,
        explanation:
          "The authors frame the result as evidence of convergence: formal proving used to trail informal reasoning by enormous margins. Losing narrowly on a hard subset is the interesting finding. The 7B model is not the one being measured here, and majority voting is simply V3's evaluation setting.",
      },
      {
        id: "proverv2-q4",
        prompt:
          "A result is reported at 88.9% with Pass@8192 but 82.4% with Pass@32. What should you report when comparing provers?",
        options: [
          "Only the highest number",
          "The sample budget along with the score, because pass@K is meaningless without K",
          "Only Pass@32 because it is cheaper",
          "The average of all reported budgets",
        ],
        answer: 1,
        explanation:
          "Pass@K trades compute for success probability, so two numbers with different K are not directly comparable. The paper reports the full curve, which is the honest way to present a system whose accuracy is a function of budget. Averages across budgets would obscure exactly the scaling behavior readers need.",
      },
      {
        id: "proverv2-q5",
        prompt:
          "How is miniF2F-valid used in this paper, and why does that matter for reading the results?",
        options: [
          "It is the primary test set, so results are optimistic",
          "It is folded into curriculum learning with subgoal decomposition, while miniF2F-test is reserved for evaluation only",
          "It is discarded because V1.5 already used it",
          "It is used only to train the 7B model, never the 671B model",
        ],
        answer: 1,
        explanation:
          "The valid split participates in training via curriculum and is reported as 90.6% to 91.0%, while the test split stays clean at 88.9%. Knowing which split trains and which measures is essential for interpreting any benchmark suite, especially when subgoal decomposition makes curriculum easy to construct.",
      },
    ],
    practice: {
      problems: ["rl-272"],
    },
  },
  {
    id: "deepseek-r1-0528",
    slug: "deepseek-r1-0528",
    title: "DeepSeek-R1-0528 Report",
    short: "DeepSeek-R1-0528",
    year: 2025,
    date: "2025-05-28",
    url: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528",
    kind: "report",
    era: "reasoning",
    tier: "advanced",
    tagline:
      "Same 671B architecture, roughly double the thinking: R1-0528 spends about 23k tokens per AIME question instead of 12k and lifts AIME 2025 from 70.0 to 87.5.",
    whatItIs:
      "This is not a paper but DeepSeek's official model-and-release report: a Hugging Face model card with evaluation tables plus an API changelog entry. R1, trained in January 2025, was re-post-trained with more compute and algorithmic changes announced only in general terms. The model card reports higher scores across math, code, and general benchmarks, a lower hallucination rate, JSON output and function-calling support, and a distilled 8B student that inherits the R1-0528 chain of thought.",
    theoryMinutes: 10,
    lineage: {
      from: "deepseek-r1",
      context:
        "A mid-cycle version bump of the same reasoning model, published by the model card and API changelog rather than as a paper. It is the clearest public demonstration that thinking length is a tunable resource: the same weights family plus longer traces moved benchmark numbers more than most architectural changes of the era.",
      improved: [
        "AIME 2025 accuracy rises from 70.0 to 87.5, with AIME 2024 moving from 79.8 to 91.4, by spending more thinking tokens per problem (about 12K to 23K on average).",
        "GPQA Diamond improves from 71.5 to 81.0, LiveCodeBench from 63.5 to 73.3, Codeforces-Div1 rating from 1530 to 1930, and SWE-bench Verified from 49.2 to 57.6.",
        "Humanity's Last Exam roughly doubles from 8.5 to 17.7, and HMMT 2025 jumps from 41.7 to 79.4.",
        "Adds JSON output and function-calling support (BFCL_v3_MultiTurn 37.0; Tau-bench 53.5 Airline and 63.9 Retail) and reduces hallucinations.",
        "Distills the new chain of thought into DeepSeek-R1-0528-Qwen3-8B, which scores 86.0 on AIME 2024, ahead of Qwen3-8B by 10 points and matching Qwen3-235B thinking on that benchmark.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Thinking length is a compute knob",
        text: "A reasoning model answers a question by spending tokens on a private trace before producing the final answer. Those tokens cost GPU time exactly like output tokens, and they buy something real: more room to try an approach, hit a wall, back up, and verify. R1-0528's headline change is that it uses that budget more generously. On the AIME test set the previous version averaged 12K thinking tokens per question; the new version averages 23K. Accuracy on AIME 2025 rose by 17.5 points. This is inference-time scaling in its simplest form: the model was trained so that it does not stop thinking early.",
      },
      {
        kind: "prose",
        heading: "What the report does and does not say",
        text: "The card states that the improvement comes from 'leveraging increased computational resources and introducing algorithmic optimization mechanisms during post-training'. That is the whole recipe as far as the public is concerned: more post-training compute, plus unspecified changes to the post-training algorithms. Treat the report as an engineering disclosure of results, not a method paper. What is verifiable is the evaluation table, the sampling configuration (temperature 0.6, top-p 0.95, 16 responses per query, 64K maximum generation length), and the behavioral changes users can observe.",
      },
      {
        kind: "visual",
        visual: "scaling-curve",
        caption:
          "The R1-0528 trade curve: thinking tokens per AIME question grew from about 12K to about 23K, and reported accuracy on AIME 2025 went from 70.0 to 87.5. More inference compute buys accuracy, and the model card treats output-token growth as the mechanism rather than a side effect.",
      },
      {
        kind: "formula",
        label: "How the card estimates pass@1",
        expression: "pass@1_hat = (1 / 16) * sum_{j=1..16} 1[ answer_j is correct ]",
        why: "The model card fixes a sampling configuration (temperature 0.6, top-p 0.95) and draws 16 responses per query, then reports the average correctness. This is a Monte-Carlo estimate of the probability that a single sampled answer is right, not a measure of self-consistency. It matters when comparing charts: a number measured this way already includes some of the benefit of sampling, and it is directly sensitive to how much thinking each response is allowed.",
      },
      {
        kind: "prose",
        heading: "Behavioral fixes beyond reasoning",
        text: "The release note bundles several product-level changes: a reduced hallucination rate, JSON output, function calling, better front-end code generation, and a supported system prompt (users no longer need to prepend a special token to force thinking). The card reports tool-use numbers that R1 did not publish, BFCL_v3_MultiTurn at 37.0 accuracy and Tau-bench at 53.5 (Airline) and 63.9 (Retail). For engine, the changelog shows large deltas too (Aider 57.0 to 71.6). One entry in the evaluation table moves the other way: SimpleQA correctness slips from 30.1 to 27.8, a reminder that a single release optimizes a mix of objectives rather than dominating every axis.",
      },
      {
        kind: "prose",
        heading: "The distilled student and why it matters",
        text: "The card also releases DeepSeek-R1-0528-Qwen3-8B, produced by post-training Qwen3 8B Base on chain-of-thought traces from the new model. The student scores 86.0 on AIME 2024 (10 points above Qwen3-8B) and 76.3 on AIME 2025, matching Qwen3-235B thinking on AIME 2024 despite being an 8B dense model. The message is the same as R1's: traces are a transferable artifact, and a smaller model trained on good traces can punch far above its weight class. For practitioners deploying on ordinary hardware, the distilled student is often the more useful release than the 671B teacher.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "What this report is",
        text: "An official model card plus API changelog entry dated 2025-05-28, not a peer-reviewed paper. The primary source is the Hugging Face model card for DeepSeek-R1-0528; the API changelog confirms the deepseek-reasoner upgrade and the token-cost warning.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Two threads: the evaluation table (what improved and by how much) and the mechanism sentence (more post-training compute plus algorithmic optimization, with thinking depth on AIME roughly doubling). The Qwen3-8B distillation section is the most transferable part of the report.",
      },
      {
        kind: "prose",
        heading: "Evidence the report provides",
        text: "AIME 2025: 70.0 to 87.5. AIME 2024: 79.8 to 91.4. GPQA Diamond: 71.5 to 81.0. LiveCodeBench (2408-2505): 63.5 to 73.3. Codeforces-Div1 rating: 1530 to 1930. SWE Verified: 49.2 to 57.6. Aider-Polyglot: 53.3 to 71.6. HMMT 2025: 41.7 to 79.4. Humanity's Last Exam: 8.5 to 17.7. Thinking tokens on AIME: about 12K to about 23K. The distilled Qwen3-8B student: 86.0 on AIME 2024 and 76.3 on AIME 2025.",
      },
      {
        kind: "prose",
        heading: "Limits and caveats",
        text: "There is no method section, so the improvements cannot be attributed to specific training changes from public information. The API changelog itself warns that complex reasoning tasks may consume more tokens than the legacy version, which is a real serving-cost change. SimpleQA regressed (30.1 to 27.8), so hallucination reduction is not uniform. Benchmark scores use sampling with 16 responses per query at 64K max generation, so they are not single-pass numbers.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Before swapping a reasoning model for its mid-cycle upgrade, measure three things: accuracy on your task, average thinking tokens per request, and behavior on the axes you care about that regressed somewhere (here, SimpleQA). Budget for longer traces because they are the mechanism, not an accident. And if the full model is too large to serve, the distilled student built from the same traces is frequently the better deployment target.",
      },
    ],
    questions: [
      {
        id: "r10528-q1",
        prompt:
          "The model card attributes the AIME 2025 jump to increased post-training compute plus algorithmic changes. Which observation directly supports the thinking-depth explanation?",
        options: [
          "The parameter count increased from 671B to 1T",
          "Average thinking tokens per AIME question rose from about 12K to about 23K while accuracy rose from 70.0 to 87.5",
          "The context window shrank to save memory",
          "The tokenizer changed between versions",
        ],
        answer: 1,
        explanation:
          "The card states the token-growth fact next to the accuracy numbers as the explanation: the model spends roughly twice the reasoning budget. Architecture is unchanged (671B total, 37B active), so parameter scaling is ruled out. Long traces are the observable mechanism.",
      },
      {
        id: "r10528-q2",
        prompt:
          "What is the practical cost implication of R1-0528's improvement for a serving system?",
        options: [
          "None, because thinking tokens are free",
          "Requests can need far more output tokens, so latency, cost per request, and timeout budgets all change",
          "It only affects training, not inference",
          "The model uses less memory, so cost always drops",
        ],
        answer: 1,
        explanation:
          "Thinking tokens are generated tokens and are billed and scheduled like any other output. The API changelog explicitly warns that complex reasoning tasks may consume more tokens than the legacy version. Anyone swapping versions should re-measure token counts on their own traffic.",
      },
      {
        id: "r10528-q3",
        prompt:
          "Why does DeepSeek train an 8B student on R1-0528's chain of thought instead of running RL on the 8B base directly?",
        options: [
          "RL cannot be applied to dense models",
          "The R1 paper already found distillation from trace data beats direct large-scale RL at small model scales, so traces are the efficient transfer path",
          "The 8B student is only an API convenience with no real capability",
          "Legal restrictions forbid RL on Qwen models",
        ],
        answer: 1,
        explanation:
          "The R1 paper's own comparison (32B RL at 47.0 versus 32B distilled at 72.6 on AIME 2024) is the precedent. R1-0528's student confirms it again at 8B: 86.0 on AIME 2024, ten points over Qwen3-8B. RL on large models worked; distilling its traces into small ones works better.",
      },
      {
        id: "r10528-q4",
        prompt:
          "The evaluation table shows SimpleQA dropping from 30.1 to 27.8 while most benchmarks improve. What is the right conclusion?",
        options: [
          "The evaluation is invalid",
          "A release optimizes a mix of objectives, so you must check the axis you care about rather than assuming uniform improvement",
          "SimpleQA is a hallucination benchmark that only applies to R1",
          "The old model was better overall",
        ],
        answer: 1,
        explanation:
          "Single-number summaries hide tradeoffs. The card presents a table with regressions as well as gains, and the honest reading is that the update shifted the capability mix. Deployment decisions should be per-axis, which is exactly why the report publishes the full table.",
      },
    ],
  },
  {
    id: "deepseek-math-v2",
    slug: "deepseek-math-v2",
    title:
      "DeepSeekMath-V2: Towards Self-Verifiable Mathematical Reasoning",
    short: "DeepSeekMath-V2",
    year: 2025,
    date: "2025-11-27",
    arxivId: "2511.22570",
    url: "https://arxiv.org/abs/2511.22570",
    kind: "paper",
    era: "reasoning",
    tier: "core",
    tagline:
      "Correct answers do not prove correct reasoning. Train a faithful verifier, use it as the reward model, and reward the generator for finding and fixing its own proof's flaws before finalizing.",
    whatItIs:
      "DeepSeekMath-V2 is the natural-language theorem-proving model built on DeepSeek-V3.2-Exp-Base. Its argument is that outcome rewards have hit their ceiling: they cannot tell a rigorous proof from a lucky one, and they do not exist at all for theorem proving, where there is no final number to check. The paper instead trains an LLM verifier that scores a proof from 0 to 1 with a written analysis, guards it against hallucinated criticisms with a second meta-verifier, and then uses the verifier as the reward model for a proof generator. The generator is trained to write a proof and a self-analysis in one response, and rewarded for honest self-assessment, so the best strategy is to find and fix its own errors before finalizing. With scaled test-time compute the model reaches gold-medal level on IMO 2025 and CMO 2024 and 118/120 on Putnam 2024.",
    theoryMinutes: 15,
    lineage: {
      from: "deepseek-prover-v2",
      context:
        "The reasoning era's final paper closes the loop the era opened: R1 showed that verifiable outcomes can drive reasoning, and this paper asks what to do when the outcome is not a number but a proof. It inherits the verified-reward machinery of the prover line and the self-checking behavior observed in R1's traces, and it runs on the V3.2-Exp base from the frontier era.",
      improved: [
        "Trains a generative verifier that scores a proof 0, 0.5, or 1 with an explicit issue analysis, using RL against expert annotations rather than a fixed classifier.",
        "Adds meta-verification: a second model judges whether the issues the verifier claims actually exist and justify the score, raising analysis quality from 0.85 to 0.96 on the validation split.",
        "Uses the verifier as the reward model for a proof generator and trains the generator to self-analyze, with a reward that pays for faithful error acknowledgment, not just for claiming correctness.",
        "Scales verification compute to auto-label proofs that are hard to verify, creating fresh verifier training data without human annotation and keeping the generation-verification gap productive.",
        "Reports gold-medal scores on IMO 2025 and CMO 2024 and 118/120 on Putnam 2024 with scaled test-time compute, against a best human score of 90 on the same Putnam set.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why final-answer rewards run out",
        text: "Reinforcement learning on verifiable outcomes worked spectacularly on competition mathematics: check the boxed answer, reward the trace that produced it. But two problems remain. First, a correct answer can come from flawed reasoning, and a model trained only on outcomes learns to get lucky as well as to reason. Second, large parts of mathematics do not end in a number at all: a proof is judged on whether every step follows, which is exactly the kind of judgement that final-answer rewards cannot express. The paper's premise is that progress now depends on verifying reasoning itself, and that a verifier good enough to train against must be built rather than borrowed.",
      },
      {
        kind: "prose",
        heading: "A verifier that writes before it scores",
        text: "The verifier is a generative reward model: given a problem and a proof, it produces an analysis of the proof's issues and then a score in {0, 0.5, 1}. It is trained with reinforcement learning against expert annotations, with rewards for format and for matching the expert score. That training has a subtle hole: when the proof is flawed, the model can earn full reward by predicting the right score while inventing issues that do not exist. A verifier that hallucinates criticisms is not usable as a reward model, because the generator would be punished for correct steps.",
      },
      {
        kind: "prose",
        heading: "Meta-verification",
        text: "The fix is a second evaluation layer. A meta-verifier is trained to read the verifier's analysis and judge whether the claimed issues exist and whether they logically justify the score. Verifier training then multiplies its reward by the meta-verifier's quality score, so an analysis that gets the number right for the wrong reasons no longer pays. On a validation split, the average quality of the verifier's analyses rises from 0.85 to 0.96 while score accuracy holds. This is the paper's most transferable idea: any learned judge needs a second judge that checks the first one's reasons, and the check is easier than the original task.",
      },
      {
        kind: "formula",
        label: "The generator's reward",
        expression:
          "R = R_format(Y, Z) * (alpha * R_Y + beta * R_Z)\nR_Z = R_score(s', s) * R_meta(Z)\nalpha = 0.76,  beta = 0.24",
        why: "Y is the proof and Z is the generator's self-analysis. R_Y is the verifier's score for the proof; R_Z pays for self-assessment that is both accurate (s' close to s) and faithfully argued (meta-verification passes). The format term gates everything, so the model cannot earn reward by dropping the analysis. The weighting makes the proof the main objective while keeping honest self-checking worth a quarter of the reward, which is what creates the incentive to find and fix issues before finalizing.",
      },
      {
        kind: "visual",
        visual: "prover-tree",
        caption:
          "Generate, verify, revise: the verifier scores the proof and the meta-verifier audits the criticism. Hard-to-verify proofs get extra verification samples and become training data for the next verifier, keeping the gap between generator and verifier productive.",
      },
      {
        kind: "prose",
        heading: "The generation-verification cycle",
        text: "Verifier and generator improve each other. The verifier trains the generator as a reward model; the improved generator then writes proofs the verifier cannot confidently judge, and those hard cases are exactly the data the verifier needs. Labeling them by hand does not scale, so the paper automates it: for each proof, draw m independent verifier analyses, keep the analyses that report issues (scores 0 or 0.5), and run meta-verification on each. If at least k analyses that assign the lowest score are confirmed by a majority of meta-checks, the proof is labeled with that score; if no legitimate issues survive, it is labeled 1; otherwise it is discarded or sent to a human. RL uses GRPO, and training alternates: improve verification, then initialize the generator from the verifier checkpoint, then consolidate both capabilities into the next verifier through rejection fine-tuning.",
      },
      {
        kind: "code",
        title: "Automated labeling of a hard proof",
        language: "python",
        code: `def label_proof(analyses, meta_checks, m, k, majority=0.5):
    """analyses: list of (score, issues) from the verifier.
    meta_checks: list of booleans per analysis confirming its issues exist."""
    confirmed = [a for a, ok in zip(analyses, meta_checks)
                 if ok and a.score < 1.0]
    if len(confirmed) >= k:
        # trust the lowest score that enough meta-checks validated
        return min(a.score for a in confirmed)
    if all(a.score == 1.0 for a in analyses):
        return 1.0
    return None   # discard or route to a human annotator

# Scaled verification compute means m and k grow with the proof's difficulty,
# so the labeler spends more samples exactly where the verifier is unsure.`,
        notes: [
          "The paper's procedure draws m independent analyses per proof and runs meta-verification on those that report issues; a label is accepted only when enough of them are confirmed.",
          "Returning None is deliberate: uncertain proofs are dropped or escalated rather than given a noisy label that would teach the verifier the wrong thing.",
          "Because the verifier can also write proofs, the same checkpoint family serves both roles, which is what makes the alternating training loop cheap.",
        ],
      },
      {
        kind: "prose",
        heading: "Results and the honest limits",
        text: "With scaled test-time compute the model reaches gold-medal level on IMO 2025 and CMO 2024, and 118 out of 120 on Putnam 2024, above the best human score of 90 on the same paper. Those results depend on the test-time recipe - generate candidates, verify, revise - so the headline is about a system spending compute, not a single greedy decode. The limits are equally important: verification quality is a learned approximation and can still be wrong; the automated labeling keeps humans in the loop for uncertain cases; the domain is competition and undergraduate mathematics, not research mathematics; and the method inherits its base model's weaknesses. The paper's claim is deliberately directional: self-verifiable reasoning looks feasible, and this is an existence proof, not a solved problem.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Outcome-based RL saturates on competition problems without guaranteeing rigorous reasoning, and theorem proving has no final answer to check. The paper asks whether an LLM can learn to verify mathematical proofs well enough to serve as the reward signal for a proof generator.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Three mechanisms: verifier training with RL and expert scores, meta-verification as a faithfulness check, and a generator reward that pays for honest self-analysis. Section 2 builds the verifier and the generator, Section 2.3 describes the alternating cycle and automated labeling. Read the reward equations closely; the alpha and beta weights are the incentive design.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Verifier analysis quality rises from 0.85 to 0.96 under meta-verification on a validation split, at equal proof-score accuracy. The generator reward uses alpha = 0.76 and beta = 0.24. Reported outcomes with scaled test-time compute: gold-medal level on IMO 2025 and CMO 2024, and 118/120 on Putnam 2024, where the best human participant scored 90. The model is built on DeepSeek-V3.2-Exp-Base and evaluated with an accompanying repository.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The verifier remains a learned model with residual failure modes, and the automated labeling deliberately defers uncertain proofs to humans. The evaluation focuses on competition and undergraduate mathematics; research-level problems and open conjectures are explicitly future work. The headline scores come from test-time scaling, so they measure a system with a compute budget rather than a one-shot model.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When your task lacks a final answer to check, build the verifier first and check the verifier itself. Reward reasons, not just verdicts: a judge that writes its criteria can be audited by a second model, and a generator rewarded for honest self-criticism will fix more of its own errors. Then treat verification as a scalable resource, because spending more samples where the verifier is unsure is what keeps the training signal honest.",
      },
    ],
    questions: [
      {
        id: "m2-q1",
        prompt:
          "Why is a correct final answer not a sufficient training signal for theorem proving?",
        options: [
          "Because correct answers are rare in competition mathematics",
          "Because a correct answer does not certify rigorous reasoning, and proof tasks have no final numeric answer to check at all",
          "Because Lean cannot verify natural-language proofs",
          "Because reward models are cheaper than verifiers",
        ],
        answer: 1,
        explanation:
          "The paper's premise is twofold: outcome rewards let a model be right for the wrong reasons, and theorem proving is judged on step-by-step validity rather than on a final value, so the reward has to evaluate the reasoning itself.",
      },
      {
        id: "m2-q2",
        prompt:
          "What failure mode of the verifier does meta-verification fix?",
        options: [
          "The verifier's scores are too slow to compute",
          "The verifier can predict the correct score while hallucinating issues that do not exist, making it untrustworthy as a reward model",
          "The verifier refuses to score proofs above 0.5",
          "The verifier leaks the answer to the generator",
        ],
        answer: 1,
        explanation:
          "Training only on score accuracy leaves the written analysis unconstrained. A meta-verifier checks whether the claimed issues exist and justify the score, and its judgement multiplies the verifier's training reward, raising analysis quality from 0.85 to 0.96.",
      },
      {
        id: "m2-q3",
        prompt:
          "In the generator's reward R = R_format * (0.76 * R_Y + 0.24 * R_Z), what is R_Z?",
        options: [
          "The reward for writing a longer proof",
          "The reward for self-analysis: accurate score prediction times the meta-verification score of the analysis",
          "The KL penalty against the reference model",
          "The verifier's confidence in its own score",
        ],
        answer: 1,
        explanation:
          "R_Z = R_score(s', s) * R_meta(Z): the generator's self-predicted score must match the verifier's score, and the self-analysis must survive meta-verification. Paying for this makes honest error acknowledgment and self-correction profitable.",
      },
      {
        id: "m2-q4",
        prompt:
          "How does the system label hard-to-verify proofs without human annotation?",
        options: [
          "It trusts a single verifier pass",
          "It draws several verifier analyses, meta-checks those that report issues, and accepts the lowest confirmed score only when enough analyses agree; otherwise the proof is dropped or escalated",
          "It asks the generator to label its own proofs",
          "It trains a separate classifier on unlabeled proofs",
        ],
        answer: 1,
        explanation:
          "Multiple analyses plus majority meta-verification turn extra verification compute into a label. The rule accepts a low score only when at least k analyses assigning it are confirmed, labels the proof 1 when no legitimate issues survive, and defers or discards the ambiguous cases.",
      },
      {
        id: "m2-q5",
        prompt:
          "The Putnam result is 118/120, above the best human score of 90. What caveat does the paper itself attach?",
        options: [
          "The human score was measured on a different contest",
          "The result uses scaled test-time compute, so it measures a system that generates, verifies, and revises rather than a single greedy answer",
          "The model was trained on Putnam problems",
          "The score is from an unofficial re-evaluation",
        ],
        answer: 1,
        explanation:
          "The paper is explicit that the strong competition results come with scaled test-time compute. That is a legitimate system-level claim - the verifier is what makes the extra compute useful - but it is not a claim that one forward pass solves Putnam.",
      },
    ],
    practice: {
      concepts: ["stats-spread", "prob-distributions"],
      articles: ["art-post-training"],
      problems: ["rl-272", "rl-273", "rl-306"],
    },
  },
];
