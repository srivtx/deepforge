import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-141",
    title: "VAE Reconstruction Loss",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the mean squared reconstruction error of a variational autoencoder: sum over elements of (x - x_hat)^2 divided by the number of elements.\n\nThe signature is vae_reconstruction_loss(x, x_hat).",
    starterCode: `def vae_reconstruction_loss(x, x_hat):
    # Your code here
    pass`,
    solution: `def vae_reconstruction_loss(x, x_hat):
    n = len(x)
    return sum((x[i] - x_hat[i]) ** 2 for i in range(n)) / n`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 2.0]], expected: 0.0 },
      { input: [[1.0, 2.0], [0.0, 0.0]], expected: 2.5 },
      { input: [[0.5, 0.5, 0.5], [0.0, 1.0, 0.0]], expected: 0.25 },
      { input: [[1.0, -1.0], [2.0, -1.0]], expected: 0.5 },
    ],
    hint: "Reconstruction terms are usually MSE or BCE; here use the mean squared error.",
  },
  {
    id: "dl-142",
    title: "Linear Beta Schedule",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Build the linear diffusion noise schedule: beta_t = beta_start + (beta_end - beta_start) * t / (timesteps - 1) for t from 0 to timesteps - 1.\n\nThe signature is linear_beta_schedule(beta_start, beta_end, timesteps). Return the list of betas.",
    starterCode: `def linear_beta_schedule(beta_start, beta_end, timesteps):
    # Your code here
    pass`,
    solution: `def linear_beta_schedule(beta_start, beta_end, timesteps):
    return [beta_start + (beta_end - beta_start) * t / (timesteps - 1) for t in range(timesteps)]`,
    testCases: [
      { input: [0.0001, 0.02, 5], expected: [0.0001, 0.005075, 0.01005, 0.015025, 0.02] },
      { input: [0.0, 1.0, 3], expected: [0.0, 0.5, 1.0] },
      { input: [0.1, 0.1, 4], expected: [0.1, 0.1, 0.1, 0.1] },
      { input: [0.0, 0.8, 4], expected: [0.0, 0.2666666667, 0.5333333333, 0.8] },
    ],
    hint: "The first and last timesteps hit beta_start and beta_end exactly.",
  },
  {
    id: "dl-143",
    title: "U-Net Downsample Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count how many times a U-Net can halve a spatial dimension before reaching 1: repeatedly floor-divide by 2 and count the steps.\n\nThe signature is unet_downsample_count(image_size). Return an integer.",
    starterCode: `def unet_downsample_count(image_size):
    # Your code here
    pass`,
    solution: `def unet_downsample_count(image_size):
    n = 0
    while image_size > 1:
        image_size //= 2
        n += 1
    return n`,
    testCases: [
      { input: [256], expected: 8 },
      { input: [224], expected: 7 },
      { input: [32], expected: 5 },
      { input: [64], expected: 6 },
      { input: [28], expected: 4 },
    ],
    hint: "This is the number of encoder stages in a typical U-Net.",
  },
  {
    id: "dl-144",
    title: "Causal LM Shift",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Build the shifted input/label pair for causal language modeling: inputs are all tokens except the last and labels are all tokens except the first, so position t predicts token t + 1.\n\nThe signature is causal_lm_shift(tokens). Return [inputs, labels].",
    starterCode: `def causal_lm_shift(tokens):
    # Your code here
    pass`,
    solution: `def causal_lm_shift(tokens):
    return [list(tokens[:-1]), list(tokens[1:])]`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [[1, 2, 3], [2, 3, 4]] },
      { input: [[5]], expected: [[], []] },
      { input: [[1, 2]], expected: [[1], [2]] },
      { input: [[0, 0]], expected: [[0], [0]] },
    ],
    hint: "A one-token shift turns next-token prediction into ordinary token-level classification.",
  },
  {
    id: "dl-145",
    title: "Span Corruption Ratio",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the fraction of tokens hidden by span corruption: the total length of the masked spans divided by the total number of tokens. Spans are given as [start, end) pairs.\n\nThe signature is span_corruption_ratio(masked_spans, total_tokens).",
    starterCode: `def span_corruption_ratio(masked_spans, total_tokens):
    # Your code here
    pass`,
    solution: `def span_corruption_ratio(masked_spans, total_tokens):
    masked = sum(end - start for start, end in masked_spans)
    return masked / total_tokens`,
    testCases: [
      { input: [[[0, 2], [5, 7]], 10], expected: 0.4 },
      { input: [[[0, 3]], 3], expected: 1.0 },
      { input: [[], 5], expected: 0.0 },
      { input: [[[1, 2], [3, 4], [5, 6]], 12], expected: 0.25 },
    ],
    hint: "T5-style span corruption hides contiguous runs rather than individual tokens.",
  },
  {
    id: "dl-146",
    title: "Reward Z-Score Normalization",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Normalize a group of rewards by z-score: (r - mean) / std using the population standard deviation. If the standard deviation is 0, return zeros.\n\nThe signature is reward_normalization(rewards).",
    starterCode: `import math
def reward_normalization(rewards):
    # Your code here
    pass`,
    solution: `import math
def reward_normalization(rewards):
    n = len(rewards)
    mean = sum(rewards) / n
    var = sum((r - mean) ** 2 for r in rewards) / n
    std = math.sqrt(var)
    if std == 0.0:
        return [0.0 for _ in rewards]
    return [(r - mean) / std for r in rewards]`,
    testCases: [
      { input: [[1.0, 3.0]], expected: [-1.0, 1.0] },
      { input: [[5.0, 5.0]], expected: [0.0, 0.0] },
      { input: [[1.0, 2.0, 3.0]], expected: [-1.2247448714, 0.0, 1.2247448714] },
      { input: [[0.0, 10.0, 20.0]], expected: [-1.2247448714, 0.0, 1.2247448714] },
    ],
    hint: "Group-relative normalization is what makes GRPO advantages scale-free.",
  },
  {
    id: "dl-147",
    title: "Length Penalty Reward",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply a length penalty to rewards: r_i - alpha * length_i for each pair of reward and length.\n\nThe signature is length_penalty_reward(rewards, lengths, alpha).",
    starterCode: `def length_penalty_reward(rewards, lengths, alpha):
    # Your code here
    pass`,
    solution: `def length_penalty_reward(rewards, lengths, alpha):
    return [rewards[i] - alpha * lengths[i] for i in range(len(rewards))]`,
    testCases: [
      { input: [[1.0, 2.0], [10, 20], 0.01], expected: [0.9, 1.8] },
      { input: [[0.0], [5], 0.1], expected: [-0.5] },
      { input: [[2.0, 3.0], [0, 4], 0.5], expected: [2.0, 1.0] },
      { input: [[1.0], [3], 0.0], expected: [1.0] },
    ],
    hint: "Penalizing length discourages padding and rambling generations.",
  },
  {
    id: "dl-148",
    title: "Rejection Sampling Pick",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the index of the first candidate whose score is at least threshold, or -1 when no candidate qualifies. Comparison is inclusive (>=).\n\nThe signature is rejection_sampling_pick(scores, threshold).",
    starterCode: `def rejection_sampling_pick(scores, threshold):
    # Your code here
    pass`,
    solution: `def rejection_sampling_pick(scores, threshold):
    for i in range(len(scores)):
        if scores[i] >= threshold:
            return i
    return -1`,
    testCases: [
      { input: [[0.1, 0.5, 0.9], 0.6], expected: 2 },
      { input: [[0.1, 0.5, 0.9], 0.2], expected: 1 },
      { input: [[0.1, 0.5, 0.9], 0.95], expected: -1 },
      { input: [[1.0], 0.5], expected: 0 },
      { input: [[0.3, 0.3], 0.3], expected: 0 },
    ],
    hint: "Rejection sampling keeps generating until a sample passes the threshold.",
  },
  {
    id: "dl-149",
    title: "Self-Consistency Vote",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Majority-vote over several sampled answers and return the most common one. If there is a tie, return the smallest answer according to sorted order.\n\nThe signature is self_consistency_vote(answers).",
    starterCode: `def self_consistency_vote(answers):
    # Your code here
    pass`,
    solution: `def self_consistency_vote(answers):
    counts = {}
    for a in answers:
        counts[a] = counts.get(a, 0) + 1
    best = None
    for a in sorted(counts):
        if best is None or counts[a] > counts[best]:
            best = a
    return best`,
    testCases: [
      { input: [["a", "b", "a"]], expected: "a" },
      { input: [["b", "a", "a", "b"]], expected: "a" },
      { input: [["z"]], expected: "z" },
      { input: [["a", "b", "c", "a", "c"]], expected: "a" },
    ],
    hint: "Iterating keys in sorted order makes ties deterministic.",
  },
  {
    id: "dl-150",
    title: "Nearest Neighbor Explanation",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the label of the training example with the highest cosine similarity to the query. If the query or an example is all zeros, its similarity is 0.0.\n\nThe signature is nearest_neighbor_explanation(query, examples, labels).",
    starterCode: `import math
def nearest_neighbor_explanation(query, examples, labels):
    # Your code here
    pass`,
    solution: `import math
def nearest_neighbor_explanation(query, examples, labels):
    best = None
    best_i = 0
    nq = math.sqrt(sum(v * v for v in query))
    for i in range(len(examples)):
        ex = examples[i]
        dot = sum(query[j] * ex[j] for j in range(len(query)))
        ne = math.sqrt(sum(v * v for v in ex))
        sim = dot / (nq * ne) if nq > 0.0 and ne > 0.0 else 0.0
        if best is None or sim > best:
            best = sim
            best_i = i
    return labels[best_i]`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [10, 20]], expected: 10 },
      { input: [[0.0, 1.0], [[1.0, 0.0], [0.0, 1.0]], [10, 20]], expected: 20 },
      { input: [[0.9, 0.1], [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]], [1, 2, 3]], expected: 1 },
      { input: [[0.1, 0.1], [[1.0, 0.0], [0.0, 1.0]], [7, 8]], expected: 7 },
    ],
    hint: "Example-based explanations justify a prediction with the most similar training point.",
  },
  {
    id: "dl-151",
    title: "LoRA Parameter Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the trainable parameters of a LoRA adapter on a d_in x d_out weight matrix: rank * (d_in + d_out) for the low-rank A and B matrices (biases are frozen).\n\nThe signature is lora_param_count(d_in, d_out, rank). Return an integer.",
    starterCode: `def lora_param_count(d_in, d_out, rank):
    # Your code here
    pass`,
    solution: `def lora_param_count(d_in, d_out, rank):
    return rank * (d_in + d_out)`,
    testCases: [
      { input: [768, 768, 8], expected: 12288 },
      { input: [512, 512, 4], expected: 4096 },
      { input: [1024, 1024, 16], expected: 32768 },
      { input: [64, 32, 2], expected: 192 },
    ],
    hint: "A tiny rank makes adapters hundreds of times smaller than the base matrix.",
  },
  {
    id: "dl-152",
    title: "Adapter Bottleneck Params",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the parameters of a bottleneck adapter: the down projection d_model * bottleneck, the up projection bottleneck * d_model, and, when bias is enabled, one bias of size bottleneck and one of size d_model.\n\nThe signature is adapter_bottleneck_params(d_model, bottleneck, bias=True). Return an integer.",
    starterCode: `def adapter_bottleneck_params(d_model, bottleneck, bias=True):
    # Your code here
    pass`,
    solution: `def adapter_bottleneck_params(d_model, bottleneck, bias=True):
    params = d_model * bottleneck + bottleneck * d_model
    if bias:
        params += bottleneck + d_model
    return params`,
    testCases: [
      { input: [768, 64], expected: 99136 },
      { input: [768, 64, false], expected: 98304 },
      { input: [128, 16], expected: 4240 },
      { input: [64, 8], expected: 1096 },
    ],
    hint: "Adapters project down to a small bottleneck and back up to the model dimension.",
  },
  {
    id: "dl-153",
    title: "Prompt Tuning Params",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the trainable parameters of prompt tuning (soft prompts): num_tokens * d_model, since every virtual token is a learnable embedding.\n\nThe signature is prompt_tuning_params(num_tokens, d_model). Return an integer.",
    starterCode: `def prompt_tuning_params(num_tokens, d_model):
    # Your code here
    pass`,
    solution: `def prompt_tuning_params(num_tokens, d_model):
    return num_tokens * d_model`,
    testCases: [
      { input: [20, 768], expected: 15360 },
      { input: [1, 1], expected: 1 },
      { input: [100, 1024], expected: 102400 },
      { input: [0, 512], expected: 0 },
    ],
    hint: "Prompt tuning adds no new layers, just a handful of soft token embeddings.",
  },
  {
    id: "dl-154",
    title: "QLoRA Memory",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate QLoRA weight memory in bytes: base parameters stored at base_bits plus LoRA adapters stored at lora_bytes, converted with / 8: (base_params * base_bits + lora_params * 8 * lora_bytes) / 8.\n\nThe signature is qlora_memory(base_params, lora_params, base_bits=4, lora_bytes=4). Return a float number of bytes.",
    starterCode: `def qlora_memory(base_params, lora_params, base_bits=4, lora_bytes=4):
    # Your code here
    pass`,
    solution: `def qlora_memory(base_params, lora_params, base_bits=4, lora_bytes=4):
    return (base_params * base_bits + lora_params * 8 * lora_bytes) / 8.0`,
    testCases: [
      { input: [8000000, 160000, 4, 4], expected: 4640000.0 },
      { input: [1000000, 0, 4, 4], expected: 500000.0 },
      { input: [1000000, 1000000, 4, 4], expected: 4500000.0 },
      { input: [1000, 1000, 2, 2], expected: 2250.0 },
    ],
    hint: "4-bit base weights plus fp32 adapters gives large savings with almost no quality loss.",
  },
  {
    id: "dl-155",
    title: "Neuron Activation Frequency",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute how often a neuron fires: the fraction of activations strictly greater than 0.\n\nThe signature is neuron_activation_frequency(activations).",
    starterCode: `def neuron_activation_frequency(activations):
    # Your code here
    pass`,
    solution: `def neuron_activation_frequency(activations):
    count = sum(1 for v in activations if v > 0.0)
    return count / len(activations)`,
    testCases: [
      { input: [[1.0, 0.0, -1.0, 2.0]], expected: 0.5 },
      { input: [[0.0, 0.0]], expected: 0.0 },
      { input: [[1.0, 1.0, 1.0]], expected: 1.0 },
      { input: [[-1.0, -2.0, 3.0, 0.0, 4.0]], expected: 0.4 },
    ],
    hint: "Activation frequency is a cheap proxy for how much a neuron contributes.",
  },
  {
    id: "dl-156",
    title: "Dead Neuron Fraction",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the fraction of dead neurons in a layer. activations is a (num_neurons, num_examples) matrix; a neuron is dead when none of its activations is strictly positive.\n\nThe signature is dead_neuron_fraction(activations).",
    starterCode: `def dead_neuron_fraction(activations):
    # Your code here
    pass`,
    solution: `def dead_neuron_fraction(activations):
    dead = sum(1 for row in activations if all(v <= 0.0 for v in row))
    return dead / len(activations)`,
    testCases: [
      { input: [[[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [-1.0, 1.0, 0.0]]], expected: 0.3333333333 },
      { input: [[[0.0]]], expected: 1.0 },
      { input: [[[1.0], [2.0]]], expected: 0.0 },
      { input: [[[0.0, 0.0], [0.0, 1.0], [0.0, 0.0], [0.0, -1.0]]], expected: 0.75 },
    ],
    hint: "Dead ReLU units never recover once their pre-activations stay negative.",
  },
  {
    id: "dl-157",
    title: "VAE KL Term (1D)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the KL divergence from a diagonal Gaussian posterior to the standard normal prior: -0.5 * sum(1 + log_var - mu^2 - exp(log_var)). The signature takes log_var, not sigma.\n\nThe signature is vae_kl_term(mu, log_var). Return a scalar.",
    starterCode: `import math
def vae_kl_term(mu, log_var):
    # Your code here
    pass`,
    solution: `import math
def vae_kl_term(mu, log_var):
    return -0.5 * sum(1.0 + log_var[i] - mu[i] * mu[i] - math.exp(log_var[i]) for i in range(len(mu)))`,
    testCases: [
      { input: [[0.0], [0.0]], expected: 0.0 },
      { input: [[1.0, 0.0], [0.0, 0.0]], expected: 0.5 },
      { input: [[0.0], [1.0]], expected: 0.3591409142 },
      { input: [[2.0], [0.5]], expected: 2.0743606354 },
    ],
    hint: "The KL is exactly zero when the posterior equals the standard normal.",
  },
  {
    id: "dl-158",
    title: "VAE Reparameterization (Seeded)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Sample a latent vector with the reparameterization trick: z_i = mu_i + exp(0.5 * log_var_i) * eps_i, where each eps_i is drawn from a standard normal. Call random.seed(seed) first and draw eps with random.gauss(0.0, 1.0) in order.\n\nThe signature is vae_reparameterize(mu, log_var, seed).",
    starterCode: `import math
import random
def vae_reparameterize(mu, log_var, seed):
    # Your code here
    pass`,
    solution: `import math
import random
def vae_reparameterize(mu, log_var, seed):
    random.seed(seed)
    return [mu[i] + math.exp(0.5 * log_var[i]) * random.gauss(0.0, 1.0) for i in range(len(mu))]`,
    testCases: [
      { input: [[0.0, 0.0], [0.0, 0.0], 0], expected: [0.9417154047, -1.3965781047] },
      { input: [[1.0], [0.0], 42], expected: [0.8559096704] },
      { input: [[0.0], [0.0], 7], expected: [-0.2558802884] },
      { input: [[2.0, -1.0], [1.0, 0.0], 123], expected: [2.6664600161, -0.8619886074] },
    ],
    hint: "Sampling eps outside the network keeps the path differentiable with respect to mu and log_var.",
  },
  {
    id: "dl-159",
    title: "Beta-VAE Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Combine the reconstruction term and the KL term with a beta weight: mean squared reconstruction error + beta * KL, using the closed-form KL with log_var.\n\nThe signature is beta_vae_loss(x, x_hat, mu, log_var, beta). Return a scalar.",
    starterCode: `import math
def beta_vae_loss(x, x_hat, mu, log_var, beta):
    # Your code here
    pass`,
    solution: `import math
def beta_vae_loss(x, x_hat, mu, log_var, beta):
    recon = sum((x[i] - x_hat[i]) ** 2 for i in range(len(x))) / len(x)
    kl = -0.5 * sum(1.0 + log_var[i] - mu[i] * mu[i] - math.exp(log_var[i]) for i in range(len(mu)))
    return recon + beta * kl`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 0.0], [0.0], [0.0], 1.0], expected: 2.5 },
      { input: [[0.0], [0.0], [1.0], [0.0], 2.0], expected: 1.0 },
      { input: [[1.0], [0.0], [0.0], [1.0], 0.5], expected: 1.1795704571 },
      { input: [[1.0, 1.0], [0.5, 0.5], [0.5], [-0.5], 0.25], expected: 0.2945663325 },
    ],
    hint: "Higher beta trades reconstruction quality for a more disentangled latent space.",
  },
  {
    id: "dl-160",
    title: "GAN Discriminator Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the binary cross-entropy discriminator loss: -mean(log(D(real))) - mean(log(1 - D(fake))), averaged over all samples together. D outputs probabilities in (0, 1).\n\nThe signature is gan_discriminator_loss(real_probs, fake_probs).",
    starterCode: `import math
def gan_discriminator_loss(real_probs, fake_probs):
    # Your code here
    pass`,
    solution: `import math
def gan_discriminator_loss(real_probs, fake_probs):
    total = 0.0
    for p in real_probs:
        total -= math.log(p)
    for p in fake_probs:
        total -= math.log(1.0 - p)
    return total / (len(real_probs) + len(fake_probs))`,
    testCases: [
      { input: [[0.9], [0.1]], expected: 0.1053605157 },
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.6931471806 },
      { input: [[0.7], [0.3]], expected: 0.3566749439 },
      { input: [[1.0], [0.0]], expected: 0.0 },
    ],
    hint: "The discriminator wants D(real) near 1 and D(fake) near 0.",
  },
  {
    id: "dl-161",
    title: "GAN Generator Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the non-saturating generator loss: -mean(log(D(fake))), where D(fake) are the discriminator probabilities assigned to generated samples.\n\nThe signature is gan_generator_loss(fake_probs).",
    starterCode: `import math
def gan_generator_loss(fake_probs):
    # Your code here
    pass`,
    solution: `import math
def gan_generator_loss(fake_probs):
    return -sum(math.log(p) for p in fake_probs) / len(fake_probs)`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 0.6931471806 },
      { input: [[0.9]], expected: 0.1053605157 },
      { input: [[0.1]], expected: 2.302585093 },
      { input: [[1.0]], expected: 0.0 },
    ],
    hint: "This is the -log D variant that gives useful gradients when the generator is losing.",
  },
  {
    id: "dl-162",
    title: "WGAN Critic Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the Wasserstein critic loss: mean(critic(fake)) - mean(critic(real)). Minimizing it pushes fake scores below real scores.\n\nThe signature is wgan_critic_loss(real_scores, fake_scores).",
    starterCode: `def wgan_critic_loss(real_scores, fake_scores):
    # Your code here
    pass`,
    solution: `def wgan_critic_loss(real_scores, fake_scores):
    return sum(fake_scores) / len(fake_scores) - sum(real_scores) / len(real_scores)`,
    testCases: [
      { input: [[1.0, 2.0], [3.0, 4.0]], expected: 2.0 },
      { input: [[0.0], [0.0]], expected: 0.0 },
      { input: [[5.0], [1.0]], expected: -4.0 },
      { input: [[-1.0, -3.0], [0.0, 2.0]], expected: 3.0 },
    ],
    hint: "The critic outputs unbounded scores, not probabilities.",
  },
  {
    id: "dl-163",
    title: "Diffusion Forward Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Sample a noised latent with the diffusion forward process: x_t = sqrt(alpha_bar) * x_0 + sqrt(1 - alpha_bar) * eps.\n\nThe signature is diffusion_forward(x0, eps, alpha_bar). x0 and eps are vectors of the same length.",
    starterCode: `import math
def diffusion_forward(x0, eps, alpha_bar):
    # Your code here
    pass`,
    solution: `import math
def diffusion_forward(x0, eps, alpha_bar):
    return [math.sqrt(alpha_bar) * x0[i] + math.sqrt(1.0 - alpha_bar) * eps[i] for i in range(len(x0))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 0.0], 1.0], expected: [1.0, 2.0] },
      { input: [[0.0, 0.0], [1.0, 1.0], 0.0], expected: [1.0, 1.0] },
      { input: [[1.0], [1.0], 0.5], expected: [1.4142135624] },
      { input: [[2.0, -2.0], [1.0, -1.0], 0.25], expected: [1.8660254038, -1.8660254038] },
    ],
    hint: "The mixing weights sqrt(alpha_bar) and sqrt(1 - alpha_bar) keep the variance at 1.",
  },
  {
    id: "dl-164",
    title: "Cumulative Alpha Bar",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the cumulative product of (1 - beta_t) over the noise schedule: alpha_bar_t = prod_{i<=t} (1 - beta_i).\n\nThe signature is cumulative_alpha_bar(betas). Return the list of cumulative values.",
    starterCode: `def cumulative_alpha_bar(betas):
    # Your code here
    pass`,
    solution: `def cumulative_alpha_bar(betas):
    out = []
    prod = 1.0
    for b in betas:
        prod *= (1.0 - b)
        out.append(prod)
    return out`,
    testCases: [
      { input: [[0.1, 0.1, 0.1]], expected: [0.9, 0.81, 0.729] },
      { input: [[0.0, 0.5]], expected: [1.0, 0.5] },
      { input: [[1.0]], expected: [0.0] },
      { input: [[0.2, 0.1, 0.4, 0.0]], expected: [0.8, 0.72, 0.432, 0.432] },
    ],
    hint: "alpha_bar measures how much of the original signal survives after t steps.",
  },
  {
    id: "dl-165",
    title: "Diffusion MSE Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the diffusion training loss: mean squared error between the true noise and the predicted noise, mean((eps - eps_pred)^2).\n\nThe signature is diffusion_mse_loss(eps, eps_pred).",
    starterCode: `def diffusion_mse_loss(eps, eps_pred):
    # Your code here
    pass`,
    solution: `def diffusion_mse_loss(eps, eps_pred):
    return sum((eps[i] - eps_pred[i]) ** 2 for i in range(len(eps))) / len(eps)`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 2.0]], expected: 0.0 },
      { input: [[1.0, 2.0], [2.0, 4.0]], expected: 2.5 },
      { input: [[0.5], [1.0]], expected: 0.25 },
      { input: [[-1.0, 0.0, 1.0], [0.0, 0.0, 0.0]], expected: 0.6666666667 },
    ],
    hint: "Predicting the noise is equivalent to predicting the score, up to scaling.",
  },
  {
    id: "dl-166",
    title: "Classifier-Free Guidance Combine",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Combine conditional and unconditional noise predictions for classifier-free guidance: eps = eps_uncond + scale * (eps_cond - eps_uncond).\n\nThe signature is cfg_combine(eps_uncond, eps_cond, scale).",
    starterCode: `def cfg_combine(eps_uncond, eps_cond, scale):
    # Your code here
    pass`,
    solution: `def cfg_combine(eps_uncond, eps_cond, scale):
    return [eps_uncond[i] + scale * (eps_cond[i] - eps_uncond[i]) for i in range(len(eps_uncond))]`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 2.0], 3.0], expected: [3.0, 6.0] },
      { input: [[1.0, 1.0], [1.0, 1.0], 5.0], expected: [1.0, 1.0] },
      { input: [[0.5, -0.5], [1.0, 0.5], 2.0], expected: [1.5, 1.5] },
      { input: [[0.0], [1.0], 0.0], expected: [0.0] },
    ],
    hint: "Scale 1 recovers the conditional model; larger scales sharpen prompt adherence.",
  },
  {
    id: "dl-167",
    title: "Sinusoidal Time Embedding",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Build a DDPM-style sinusoidal timestep embedding of dimension dim (assumed even). Frequencies are exp(-log(10000) * i / (dim/2)) for i = 0 .. dim/2 - 1; the first half of the output is sin(t * freq_i) and the second half is cos(t * freq_i).\n\nThe signature is time_embedding(timestep, dim, max_period=10000.0).",
    starterCode: `import math
def time_embedding(timestep, dim, max_period=10000.0):
    # Your code here
    pass`,
    solution: `import math
def time_embedding(timestep, dim, max_period=10000.0):
    half = dim // 2
    freqs = [math.exp(-math.log(max_period) * i / half) for i in range(half)]
    out = []
    for i in range(half):
        angle = timestep * freqs[i]
        out.append(math.sin(angle))
    for i in range(half):
        angle = timestep * freqs[i]
        out.append(math.cos(angle))
    return out`,
    testCases: [
      { input: [0, 4], expected: [0.0, 0.0, 1.0, 1.0] },
      { input: [1, 4], expected: [0.8414709848, 0.0099998333, 0.5403023059, 0.9999500004] },
      { input: [10, 2], expected: [-0.5440211109, -0.8390715291] },
      { input: [100, 6], expected: [-0.5063656411, -0.9974947164, 0.2137806661, 0.8623188723, -0.0707410121, 0.9768816852] },
    ],
    hint: "Unlike transformer positional encodings, the sines and cosines are concatenated in halves here.",
  },
  {
    id: "dl-168",
    title: "Masked Autoencoder Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the masked autoencoder reconstruction loss: mean squared error over the masked patches only, ignoring visible patches.\n\nThe signature is masked_autoencoder_loss(pred, target, mask_indices). pred and target are (num_patches, patch_dim) matrices.",
    starterCode: `def masked_autoencoder_loss(pred, target, mask_indices):
    # Your code here
    pass`,
    solution: `def masked_autoencoder_loss(pred, target, mask_indices):
    total = 0.0
    count = 0
    for idx in mask_indices:
        for j in range(len(pred[idx])):
            total += (pred[idx][j] - target[idx][j]) ** 2
            count += 1
    return total / count`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.0, 0.0], [3.0, 4.0]], [0]], expected: 2.5 },
      { input: [[[1.0]], [[2.0]], [0]], expected: 1.0 },
      { input: [[[1.0, 1.0], [2.0, 2.0], [3.0, 3.0]], [[0.0, 0.0], [2.0, 2.0], [4.0, 4.0]], [0, 2]], expected: 1.0 },
      { input: [[[1.0, 2.0]], [[1.0, 2.0]], [0]], expected: 0.0 },
    ],
    hint: "MAE only computes loss on masked patches, which makes training much cheaper.",
  },
  {
    id: "dl-169",
    title: "Prefix LM Mask",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Build a prefix-LM attention mask. The first prefix_len tokens attend to all prefix tokens (bidirectional); every other token attends to all prefix tokens plus the suffix tokens up to and including itself.\n\nThe signature is prefix_lm_mask(prefix_len, total_len). Return a total_len x total_len matrix of 1s and 0s.",
    starterCode: `def prefix_lm_mask(prefix_len, total_len):
    # Your code here
    pass`,
    solution: `def prefix_lm_mask(prefix_len, total_len):
    mask = []
    for i in range(total_len):
        row = []
        for j in range(total_len):
            if j < prefix_len or j <= i:
                row.append(1)
            else:
                row.append(0)
        mask.append(row)
    return mask`,
    testCases: [
      { input: [2, 4], expected: [[1, 1, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]] },
      { input: [1, 3], expected: [[1, 0, 0], [1, 1, 0], [1, 1, 1]] },
      { input: [3, 3], expected: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
      { input: [0, 2], expected: [[1, 0], [1, 1]] },
    ],
    hint: "Prefix-LMs combine bidirectional encoding of the prompt with causal decoding of the continuation.",
  },
  {
    id: "dl-170",
    title: "Reward Model Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the Bradley-Terry reward model loss: -mean(log sigmoid(r_chosen - r_rejected)), computed stably with softplus. The loss is 0.0 when chosen rewards exceed rejected rewards by a lot.\n\nThe signature is reward_model_loss(chosen_rewards, rejected_rewards).",
    starterCode: `import math
def reward_model_loss(chosen_rewards, rejected_rewards):
    # Your code here
    pass`,
    solution: `import math
def reward_model_loss(chosen_rewards, rejected_rewards):
    total = 0.0
    n = len(chosen_rewards)
    for i in range(n):
        diff = chosen_rewards[i] - rejected_rewards[i]
        if diff >= 0:
            total += math.log1p(math.exp(-diff))
        else:
            total += -diff + math.log1p(math.exp(diff))
    return total / n`,
    testCases: [
      { input: [[1.0], [0.0]], expected: 0.3132616875 },
      { input: [[0.0], [0.0]], expected: 0.6931471806 },
      { input: [[2.0, 1.0], [0.0, 1.0]], expected: 0.4100375958 },
      { input: [[1.0], [-1.0]], expected: 0.126928011 },
    ],
    hint: "Pairwise preference loss is softplus of the negated reward margin.",
  },
  {
    id: "dl-171",
    title: "Token-Level KL",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the mean over positions of the per-position KL divergence: mean_t sum_k p[t][k] * log(p[t][k] / q[t][k]), skipping terms where p is zero. p and q are lists of probability distributions, one per position.\n\nThe signature is token_level_kl(p, q).",
    starterCode: `import math
def token_level_kl(p, q):
    # Your code here
    pass`,
    solution: `import math
def token_level_kl(p, q):
    total = 0.0
    n = len(p)
    for t in range(n):
        kl = 0.0
        for k in range(len(p[t])):
            if p[t][k] > 0.0:
                kl += p[t][k] * math.log(p[t][k] / q[t][k])
        total += kl
    return total / n`,
    testCases: [
      { input: [[[0.5, 0.5]], [[0.5, 0.5]]], expected: 0.0 },
      { input: [[[0.75, 0.25]], [[0.5, 0.5]]], expected: 0.1308120359 },
      { input: [[[0.9, 0.1], [0.5, 0.5]], [[0.8, 0.2], [0.5, 0.5]]], expected: 0.018345007 },
      { input: [[[0.25, 0.75]], [[0.5, 0.5]]], expected: 0.1308120359 },
    ],
    hint: "Per-token KL is used to keep a finetuned model close to its reference at every position.",
  },
  {
    id: "dl-172",
    title: "Best-of-N Selection",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Score best-of-N candidates. Return [best_index, best_probability], where best_index is the argmax of the scores (ties to the smaller index) and best_probability is the softmax probability of that index under softmax(scores / temperature), computed stably.\n\nThe signature is best_of_n(scores, temperature).",
    starterCode: `import math
def best_of_n(scores, temperature):
    # Your code here
    pass`,
    solution: `import math
def best_of_n(scores, temperature):
    scaled = [s / temperature for s in scores]
    m = max(scaled)
    exps = [math.exp(v - m) for v in scaled]
    total = sum(exps)
    probs = [e / total for e in exps]
    best = 0
    for i in range(1, len(scores)):
        if scores[i] > scores[best]:
            best = i
    return [best, probs[best]]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 1.0], expected: [2, 0.6652409558] },
      { input: [[1.0, 1.0], 1.0], expected: [0, 0.5] },
      { input: [[1.0, 2.0], 0.5], expected: [1, 0.880797078] },
      { input: [[5.0, 4.0, 3.0], 10.0], expected: [0, 0.3671654011] },
    ],
    hint: "Low temperature concentrates the probability on the top candidate.",
  },
  {
    id: "dl-173",
    title: "Logit Lens Argmax",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the logit lens: for every layer's logits, return the argmax token id, breaking ties by the smaller index.\n\nThe signature is logit_lens_argmax(layer_logits). layer_logits is a (num_layers, vocab_size) matrix and the result has one id per layer.",
    starterCode: `def logit_lens_argmax(layer_logits):
    # Your code here
    pass`,
    solution: `def logit_lens_argmax(layer_logits):
    out = []
    for row in layer_logits:
        best = 0
        for j in range(1, len(row)):
            if row[j] > row[best]:
                best = j
        out.append(best)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0], [3.0, 2.0, 1.0]]], expected: [2, 0] },
      { input: [[[0.5, 0.5], [0.5, 0.5]]], expected: [0, 0] },
      { input: [[[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]], expected: [0, 1, 2] },
      { input: [[[2.0, 1.0], [1.0, 3.0]]], expected: [0, 1] },
    ],
    hint: "The logit lens reveals what the residual stream would decode to at each layer.",
  },
  {
    id: "dl-174",
    title: "Attention Rollout",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute attention rollout. Start from the identity matrix, then for each attention matrix A form aug = row-normalized(0.5 * A + 0.5 * I) and update result = aug @ result, so later layers multiply on the left.\n\nThe signature is attention_rollout(attentions). Return the final rollout matrix.",
    starterCode: `def attention_rollout(attentions):
    # Your code here
    pass`,
    solution: `def attention_rollout(attentions):
    seq = len(attentions[0])
    result = [[1.0 if i == j else 0.0 for j in range(seq)] for i in range(seq)]
    for A in attentions:
        aug = [[0.5 * A[i][j] + (0.5 if i == j else 0.0) for j in range(seq)] for i in range(seq)]
        sums = [sum(aug[i]) for i in range(seq)]
        norm = [[aug[i][j] / sums[i] for j in range(seq)] for i in range(seq)]
        result = [[sum(norm[i][k] * result[k][j] for k in range(seq)) for j in range(seq)] for i in range(seq)]
    return result`,
    testCases: [
      { input: [[[[1.0, 0.0], [0.0, 1.0]]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[[0.5, 0.5], [0.5, 0.5]]]], expected: [[0.75, 0.25], [0.25, 0.75]] },
      { input: [[[[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.5], [0.5, 0.5]]]], expected: [[0.75, 0.25], [0.25, 0.75]] },
      { input: [[[[0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [0.5, 0.5]]]], expected: [[0.625, 0.375], [0.375, 0.625]] },
    ],
    hint: "Adding the identity accounts for the residual connection that carries information around each attention layer.",
  },
  {
    id: "dl-175",
    title: "Sparse Autoencoder Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the sparse autoencoder objective: mean squared reconstruction error plus l1_coeff times the mean absolute feature activation.\n\nThe signature is sparse_autoencoder_loss(x, x_hat, features, l1_coeff).",
    starterCode: `def sparse_autoencoder_loss(x, x_hat, features, l1_coeff):
    # Your code here
    pass`,
    solution: `def sparse_autoencoder_loss(x, x_hat, features, l1_coeff):
    recon = sum((x[i] - x_hat[i]) ** 2 for i in range(len(x))) / len(x)
    l1 = sum(abs(f) for f in features) / len(features)
    return recon + l1_coeff * l1`,
    testCases: [
      { input: [[1.0, 0.0], [1.0, 0.0], [0.5, 0.0], 0.1], expected: 0.025 },
      { input: [[1.0, 1.0], [0.0, 0.0], [0.5, 0.5], 1.0], expected: 1.5 },
      { input: [[0.5], [0.5], [-0.2], 2.0], expected: 0.4 },
      { input: [[1.0, 2.0, 3.0], [1.0, 2.0, 3.0], [0.0, 0.0, 0.0], 0.5], expected: 0.0 },
    ],
    hint: "The L1 term keeps the dictionary features sparse and interpretable.",
  },
  {
    id: "dl-176",
    title: "Integrated Gradients Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Evaluate one integrand term of integrated gradients: (x - baseline) * grad, where grad is the gradient of the model output at one interpolation point between the baseline and the input.\n\nThe signature is integrated_gradients_step(x, baseline, grad). Return the element-wise product.",
    starterCode: `def integrated_gradients_step(x, baseline, grad):
    # Your code here
    pass`,
    solution: `def integrated_gradients_step(x, baseline, grad):
    return [(x[i] - baseline[i]) * grad[i] for i in range(len(x))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 0.0], [0.5, 0.5]], expected: [0.5, 1.0] },
      { input: [[1.0, 1.0], [1.0, 1.0], [5.0, 5.0]], expected: [0.0, 0.0] },
      { input: [[3.0, 0.0], [-1.0, 0.0], [2.0, -2.0]], expected: [8.0, 0.0] },
      { input: [[0.5], [0.0], [1.0]], expected: [0.5] },
    ],
    hint: "The full attribution averages this term over many points along the path from baseline to input.",
  },
  {
    id: "dl-177",
    title: "FID Feature Statistics",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the feature statistics used by FID: the mean vector and the covariance matrix (divided by N - 1) of a (num_samples, dim) feature matrix.\n\nThe signature is fid_feature_stats(features). Return [mean, covariance].",
    starterCode: `def fid_feature_stats(features):
    # Your code here
    pass`,
    solution: `def fid_feature_stats(features):
    n = len(features)
    d = len(features[0])
    mean = [sum(features[i][j] for i in range(n)) / n for j in range(d)]
    cov = [[0.0] * d for _ in range(d)]
    for i in range(n):
        for a in range(d):
            for b in range(d):
                cov[a][b] += (features[i][a] - mean[a]) * (features[i][b] - mean[b])
    for a in range(d):
        for b in range(d):
            cov[a][b] /= (n - 1)
    return [mean, cov]`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]]], expected: [[0.5, 0.5], [[0.5, -0.5], [-0.5, 0.5]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], expected: [[3.0, 4.0], [[4.0, 4.0], [4.0, 4.0]]] },
      { input: [[[0.0, 0.0], [0.0, 0.0]]], expected: [[0.0, 0.0], [[0.0, 0.0], [0.0, 0.0]]] },
      { input: [[[2.0, 1.0, 0.0], [1.0, 2.0, 3.0]]], expected: [[1.5, 1.5, 1.5], [[0.5, -0.5, -1.5], [-0.5, 0.5, 1.5], [-1.5, 1.5, 4.5]]] },
    ],
    hint: "FID compares the mean and covariance of real and generated features.",
  },
  {
    id: "dl-178",
    title: "Fréchet Distance 1D",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the 1D Fréchet distance between two sample sets: (mean_a - mean_b)^2 + (var_a - var_b)^2, using population variances.\n\nThe signature is frechet_distance_1d(samples_a, samples_b). Return a scalar.",
    starterCode: `def frechet_distance_1d(samples_a, samples_b):
    # Your code here
    pass`,
    solution: `def frechet_distance_1d(samples_a, samples_b):
    def stats(s):
        n = len(s)
        mean = sum(s) / n
        var = sum((v - mean) ** 2 for v in s) / n
        return mean, var

    m1, v1 = stats(samples_a)
    m2, v2 = stats(samples_b)
    return (m1 - m2) ** 2 + (v1 - v2) ** 2`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]], expected: 0.0 },
      { input: [[0.0, 2.0], [1.0, 3.0]], expected: 1.0 },
      { input: [[1.0, 1.0, 1.0], [3.0, 3.0, 3.0]], expected: 4.0 },
      { input: [[0.0, 1.0, 2.0], [3.0, 4.0, 5.0]], expected: 9.0 },
    ],
    hint: "In one dimension the covariance matrices are scalars, so the trace term simplifies greatly.",
  },
  {
    id: "dl-179",
    title: "VAE ELBO",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the evidence lower bound for one example: expected log-likelihood minus the KL term. Here the log-likelihood is the negative sum of squared reconstruction errors and the KL uses log_var, so ELBO = -sum((x - x_hat)^2) - KL.\n\nThe signature is vae_elbo(x, x_hat, mu, log_var). Return a scalar.",
    starterCode: `import math
def vae_elbo(x, x_hat, mu, log_var):
    # Your code here
    pass`,
    solution: `import math
def vae_elbo(x, x_hat, mu, log_var):
    log_likelihood = -sum((x[i] - x_hat[i]) ** 2 for i in range(len(x)))
    kl = -0.5 * sum(1.0 + log_var[i] - mu[i] * mu[i] - math.exp(log_var[i]) for i in range(len(mu)))
    return log_likelihood - kl`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 2.0], [0.0], [0.0]], expected: 0.0 },
      { input: [[1.0, 2.0], [0.0, 0.0], [0.0], [0.0]], expected: -5.0 },
      { input: [[0.0], [0.0], [1.0], [0.0]], expected: -0.5 },
      { input: [[1.0], [0.0], [0.0], [1.0]], expected: -1.3591409142 },
    ],
    hint: "Maximizing the ELBO is equivalent to minimizing reconstruction error plus KL.",
  },
  {
    id: "dl-180",
    title: "DPO Loss",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the direct preference optimization loss for one pair: -log sigmoid(beta * ((logp_chosen - ref_logp_chosen) - (logp_rejected - ref_logp_rejected))), evaluated stably with softplus. The signature takes log-probabilities, not probabilities.\n\nThe signature is dpo_loss(logp_chosen, logp_rejected, ref_logp_chosen, ref_logp_rejected, beta).",
    starterCode: `import math
def dpo_loss(logp_chosen, logp_rejected, ref_logp_chosen, ref_logp_rejected, beta):
    # Your code here
    pass`,
    solution: `import math
def dpo_loss(logp_chosen, logp_rejected, ref_logp_chosen, ref_logp_rejected, beta):
    margin = beta * ((logp_chosen - ref_logp_chosen) - (logp_rejected - ref_logp_rejected))
    if margin >= 0:
        return math.log1p(math.exp(-margin))
    return -margin + math.log1p(math.exp(margin))`,
    testCases: [
      { input: [0.0, 0.0, 0.0, 0.0, 0.1], expected: 0.6931471806 },
      { input: [1.0, 0.0, 0.0, 0.0, 1.0], expected: 0.3132616875 },
      { input: [0.0, 1.0, 0.0, 0.0, 1.0], expected: 1.3132616875 },
      { input: [2.0, 1.0, 1.0, 0.0, 0.5], expected: 0.6931471806 },
    ],
    hint: "DPO turns the RLHF objective into a simple classification loss on preference pairs.",
  },
  {
    id: "dl-181",
    title: "GRPO Advantage",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute group-relative policy optimization advantages: normalize a group of rewards to (r - mean) / std with the population standard deviation. If std is 0, return zeros.\n\nThe signature is grpo_advantage(rewards).",
    starterCode: `import math
def grpo_advantage(rewards):
    # Your code here
    pass`,
    solution: `import math
def grpo_advantage(rewards):
    n = len(rewards)
    mean = sum(rewards) / n
    std = math.sqrt(sum((r - mean) ** 2 for r in rewards) / n)
    if std == 0.0:
        return [0.0 for _ in rewards]
    return [(r - mean) / std for r in rewards]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0]], expected: [-1.3416407865, -0.4472135955, 0.4472135955, 1.3416407865] },
      { input: [[5.0, 5.0, 5.0]], expected: [0.0, 0.0, 0.0] },
      { input: [[0.0, 1.0]], expected: [-1.0, 1.0] },
      { input: [[2.0, 4.0, 4.0, 6.0]], expected: [-1.4142135624, 0.0, 0.0, 1.4142135624] },
    ],
    hint: "Using a group baseline instead of a learned value network is what makes GRPO lightweight.",
  },
  {
    id: "dl-182",
    title: "PPO Clipped Objective",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the PPO clipped surrogate objective: mean of min(ratio * advantage, clip(ratio, 1 - clip_eps, 1 + clip_eps) * advantage), where ratio = exp(logp_new - logp_old).\n\nThe signature is ppo_clipped_objective(logp_new, logp_old, advantages, clip_eps). Return a scalar.",
    starterCode: `import math
def ppo_clipped_objective(logp_new, logp_old, advantages, clip_eps):
    # Your code here
    pass`,
    solution: `import math
def ppo_clipped_objective(logp_new, logp_old, advantages, clip_eps):
    total = 0.0
    for i in range(len(logp_new)):
        ratio = math.exp(logp_new[i] - logp_old[i])
        clipped = ratio
        if clipped < 1.0 - clip_eps:
            clipped = 1.0 - clip_eps
        if clipped > 1.0 + clip_eps:
            clipped = 1.0 + clip_eps
        total += min(ratio * advantages[i], clipped * advantages[i])
    return total / len(logp_new)`,
    testCases: [
      { input: [[0.0, 0.0], [0.0, 0.0], [1.0, -1.0], 0.2], expected: 0.0 },
      { input: [[0.5], [0.0], [1.0], 0.2], expected: 1.2 },
      { input: [[0.5], [0.0], [-1.0], 0.2], expected: -1.6487212707 },
      { input: [[-0.5], [0.0], [1.0], 0.2], expected: 0.6065306597 },
      { input: [[-0.5], [0.0], [-1.0], 0.2], expected: -0.8 },
    ],
    hint: "The min prevents updates that move the policy too far in either direction.",
  },
  {
    id: "dl-183",
    title: "DDIM Step",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Perform one deterministic DDIM reverse step: first estimate pred_x0 = (x_t - sqrt(1 - alpha_bar_t) * eps_pred) / sqrt(alpha_bar_t), then return x_prev = sqrt(alpha_bar_prev) * pred_x0 + sqrt(1 - alpha_bar_prev) * eps_pred.\n\nThe signature is ddim_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev). All values are scalars.",
    starterCode: `import math
def ddim_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev):
    # Your code here
    pass`,
    solution: `import math
def ddim_step(x_t, eps_pred, alpha_bar_t, alpha_bar_prev):
    pred_x0 = (x_t - math.sqrt(1.0 - alpha_bar_t) * eps_pred) / math.sqrt(alpha_bar_t)
    return math.sqrt(alpha_bar_prev) * pred_x0 + math.sqrt(1.0 - alpha_bar_prev) * eps_pred`,
    testCases: [
      { input: [1.0, 0.0, 0.5, 0.25], expected: 0.7071067812 },
      { input: [0.0, 1.0, 0.25, 0.0], expected: 1.0 },
      { input: [2.0, 0.5, 0.25, 0.25], expected: 2.0 },
      { input: [1.0, 1.0, 1.0, 1.0], expected: 1.0 },
    ],
    hint: "DDIM removes the random noise term, giving deterministic sampling with fewer steps.",
  },
  {
    id: "dl-184",
    title: "Contrastive Divergence Step",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "One Gibbs step of contrastive divergence for a restricted Boltzmann machine. Compute hidden probabilities sigmoid(W v + b_h), sample binary hidden units after random.seed(seed) using one random.random() per unit, then return the visible reconstruction probabilities sigmoid(W^T h + b_v).\n\nThe signature is contrastive_divergence_step(visible, weights, bias_v, bias_h, seed). W has shape (num_hidden, num_visible).",
    starterCode: `import math
import random
def contrastive_divergence_step(visible, weights, bias_v, bias_h, seed):
    # Your code here
    pass`,
    solution: `import math
import random
def contrastive_divergence_step(visible, weights, bias_v, bias_h, seed):
    random.seed(seed)
    nh = len(bias_h)
    nv = len(visible)
    hidden_p = []
    for h in range(nh):
        s = bias_h[h]
        for v in range(nv):
            s += weights[h][v] * visible[v]
        hidden_p.append(1.0 / (1.0 + math.exp(-s)))
    hidden = [1.0 if random.random() < hidden_p[h] else 0.0 for h in range(nh)]
    recon = []
    for v in range(nv):
        s = bias_v[v]
        for h in range(nh):
            s += weights[h][v] * hidden[h]
        recon.append(1.0 / (1.0 + math.exp(-s)))
    return recon`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0], [0.0, 0.0], 0], expected: [0.5, 0.5] },
      { input: [[1.0, 1.0], [[1.0, 1.0]], [0.0, 0.0], [0.0], 5], expected: [0.7310585786, 0.7310585786] },
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0], [0.0, 0.0], 1], expected: [0.7310585786, 0.5] },
      { input: [[2.0, -1.0], [[1.0, 0.0], [0.0, 1.0]], [0.1, -0.1], [0.2, 0.2], 42], expected: [0.7502601056, 0.7109495026] },
    ],
    hint: "CD approximates the model distribution gradient with one round trip through the hidden layer.",
  },
  {
    id: "dl-185",
    title: "Superposition Interference",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Measure interference in a feature dictionary. Given a (num_features, num_neurons) weight matrix W, compute the Gram matrix G = W W^T and return [max_abs_off_diagonal, mean_abs_off_diagonal] over the off-diagonal entries.\n\nThe signature is superposition_interference(W).",
    starterCode: `def superposition_interference(W):
    # Your code here
    pass`,
    solution: `def superposition_interference(W):
    nf = len(W)
    G = [[sum(W[i][k] * W[j][k] for k in range(len(W[0]))) for j in range(nf)] for i in range(nf)]
    offs = []
    for i in range(nf):
        for j in range(nf):
            if i != j:
                offs.append(abs(G[i][j]))
    return [max(offs), sum(offs) / len(offs)]`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]]], expected: [0.0, 0.0] },
      { input: [[[1.0, 1.0], [1.0, 0.0]]], expected: [1.0, 1.0] },
      { input: [[[1.0, 0.0, 0.0], [0.5, 0.5, 0.0], [0.0, 0.0, 1.0]]], expected: [0.5, 0.1666666667] },
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], expected: [39.0, 22.3333333333] },
    ],
    hint: "Features stored at an angle to each other interfere; orthogonal features do not.",
  },
];
