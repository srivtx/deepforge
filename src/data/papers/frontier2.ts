import type { Paper } from "./types";

/** Frontier-era papers, part two (JanusFlow onward) - split so each file stays authorable. */
export const FRONTIER2_PAPERS: Paper[] = [
  {
    id: "janusflow",
    slug: "janusflow",
    title:
      "JanusFlow: Harmonizing Autoregression and Rectified Flow for Unified Multimodal Understanding and Generation",
    short: "JanusFlow",
    year: 2024,
    date: "2024-11-12",
    arxivId: "2411.07975",
    url: "https://arxiv.org/abs/2411.07975",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Keep Janus's two doors, swap the generation door from discrete tokens to rectified flow: the same transformer predicts text autoregressively and image velocity vectors for an ODE (ordinary differential equation) solver.",
    whatItIs:
      "JanusFlow is the sibling of Janus that asks what happens if image generation is a continuous flow instead of a sequence of codebook tokens. The architecture stays deliberately minimal: a 1.3B DeepSeek-LLM backbone, a SigLIP-Large-Patch/16 encoder for understanding, and a small ConvNeXt encoder-decoder pair, initialized from scratch, that adapts the language model for rectified flow in the latent space of a pretrained variational autoencoder (SDXL-VAE). The language model's output at the image positions is read as a velocity field, and an Euler solver integrates it from noise to image. Two ideas make it work: decoupled encoders for the two tasks, and a representation-alignment loss that pulls generation features toward the understanding encoder's semantics during unified training. It reaches GenEval 0.63, DPG-Bench 80.09, and MJHQ FID-30k 9.51 for generation, and MMBench 74.9, SEED-Bench 70.5, and GQA 60.3 for understanding, all from a 1.3B backbone. Published at CVPR 2025.",
    theoryMinutes: 14,
    lineage: {
      from: "janus",
      to: ["janus-pro"],
      context:
        "Janus decoupled the two visual paths but generated images as discrete tokens, which caps quality at what a VQ codebook can represent. JanusFlow keeps the decoupling and replaces the tokenizer with a flow model, testing whether the same transformer can drive both next-token prediction and a continuous generative process.",
      improved: [
        "Replaces autoregressive generation over a VQ codebook with rectified flow in a continuous latent space, using the language model itself as the velocity predictor.",
        "Keeps the architecture minimalist: only a lightweight ConvNeXt encoder and decoder plus a long skip connection are added to adapt the LLM for flow, with causal attention throughout.",
        "Retains decoupled encoders (SigLIP for understanding, ConvNeXt for generation) and adds representation alignment that pulls the generation encoder's features toward the understanding encoder's, improving generation quality.",
        "Reports generation scores that beat much larger specialists of its time: GenEval 0.63, DPG-Bench 80.09, and MJHQ FID-30k 9.51, above SDv1.5 and SDXL.",
        "Keeps understanding competitive at 1.3B: MMBench 74.9, SEED-Bench 70.5, GQA 60.3, ahead of LLaVA-v1.5 and Qwen-VL-Chat on the listed benchmarks.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Two generative families, one transformer",
        text: "Autoregressive models write a sequence one token at a time, which is exactly what a language model already does, so a unified model can simply add image tokens to the vocabulary. Diffusion and flow models instead start from noise and iteratively refine a whole continuous sample, which is a different computation but a much better fit for pixel-level detail. Janus chose the first route; JanusFlow chooses the second and asks a narrow question: can an ordinary decoder-only transformer predict the velocity field a flow model needs, without special architecture or attention masks? The paper's answer is yes, and the modifications required turn out to be surprisingly small.",
      },
      {
        kind: "prose",
        heading: "Rectified flow in one paragraph",
        text: "Rectified flow defines a path from noise to data and trains a network to predict its instantaneous direction, the velocity. At generation time you start with Gaussian noise and take small Euler steps along the predicted field until you reach a sample. The training signal is simple: pick a time, interpolate between noise and the real latent, and regress the network's output onto the difference between them. Because the network conditions on the text through the same attention stack, classifier-free guidance applies directly: run the model with and without the caption and extrapolate away from the unconditional direction to sharpen prompt alignment.",
      },
      {
        kind: "formula",
        label: "Flow matching and Euler sampling",
        expression:
          "z_t = (1 - t) * noise + t * latent,   target velocity = latent - noise\nv = v(z_t, t | caption) + w * ( v(z_t, t | caption) - v(z_t, t | empty) )\nz_{t+dt} = z_t + v * dt",
        why: "The first line defines the training target: the velocity that moves a point along the straight path from noise to data. The second is classifier-free guidance with scale w, which extrapolates between the conditional and unconditional predictions; the reported images use w = 2. The third is the Euler update the sampler iterates, and the number of steps is a cost dial that a token-by-token generator does not have.",
      },
      {
        kind: "code",
        title: "The sampling loop",
        language: "python",
        code: `def sample(llm, text_emb, latent_shape, steps=30, w=2.0):
    z = gaussian_noise(latent_shape)
    dt = 1.0 / steps
    for step in range(steps):
        t = step * dt
        # the LLM predicts a velocity for every latent position at once
        v_cond = llm.velocity(z, t, cond=text_emb)
        v_uncond = llm.velocity(z, t, cond=None)
        v = v_cond + w * (v_cond - v_uncond)
        z = z + v * dt
    return vae_decode(z)   # SDXL-VAE latent back to pixels

# Understanding uses the same weights with next-token prediction instead.`,
        notes: [
          "The reported FID uses w = 2 and 30 sampling steps; both are swept in the appendix, so quality and latency trade off explicitly.",
          "Unlike a discrete-token generator, the model emits a velocity for the whole latent grid per step, which is why the ConvNeXt decoder exists.",
          "The same transformer runs both modes; the task decides whether its output is read as logits or as a velocity field.",
        ],
      },
      {
        kind: "prose",
        heading: "What minimal actually means",
        text: "The integration is three pieces. A generation encoder turns the noisy latent into a sequence of embeddings; a time embedding is concatenated so the model knows where it is on the path; a generation decoder turns the transformer's output back into a latent-shaped velocity. The encoder and decoder are ConvNeXt blocks trained from scratch, with a long skip connection between them, and generation happens in an SDXL-VAE latent space so the resolution of the transformer's sequence stays manageable. The paper tested attention-masking schemes used by other unified models and found causal attention sufficient - no special mask, no second attention stack. That simplicity is the contribution: the language model does not need to be rebuilt to become a flow model.",
      },
      {
        kind: "visual",
        visual: "janus-decouple",
        caption:
          "Two doors again: SigLIP for understanding, a ConvNeXt encoder-decoder pair for flow generation, one transformer in the middle. The generation path is continuous, not a codebook sequence.",
      },
      {
        kind: "prose",
        heading: "Representation alignment",
        text: "Decoupling removes the conflict between tasks but leaves the generation path without semantic supervision: its ConvNeXt encoder sees latents, not concepts. JanusFlow adds a regularization term during unified training that aligns the generation encoder's intermediate features with the understanding encoder's features for the same image. The generation branch then learns representations that are not only reconstructable but semantically structured, which the paper credits for better prompt following. It is a small loss term with a large effect, and it only exists because the encoders are decoupled - a shared encoder would have nothing to align.",
      },
      {
        kind: "prose",
        heading: "Results, and what the paper leaves open",
        text: "The 1.3B model reports MJHQ FID-30k 9.51, GenEval 0.63, and DPG-Bench 80.09, ahead of SDv1.5 and SDXL on those generation benchmarks despite being a unified model, and MMBench 74.9, SEED-Bench 70.5, and GQA 60.3 for understanding, ahead of LLaVA-v1.5 and Qwen-VL-Chat on the listed tasks. The limits are structural: everything is validated at one 1.3B scale and 384 x 384 resolution; flow sampling is iterative, so generation costs many forward passes; the VAE latent space is inherited from SDXL rather than learned; and the evaluation suite is the authors' selection. Janus-Pro later scales the token-based line rather than this one, so JanusFlow is best read as the controlled experiment that shows a flow objective can live inside a language model.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Unified multimodal models usually generate images as discrete tokens because that is what a language model already predicts, but VQ tokenization loses fine detail. Can a decoder-only transformer instead drive a continuous flow model, keeping both tasks in one set of weights?",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Minimal adaptation plus alignment. Section 3 describes the flow formulation, the ConvNeXt encoder-decoder, and the causal-attention finding; the representation-alignment loss is the second contribution. Read the ablations for what each piece buys, and the sampling sweep for the step-count trade-off.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Generation: GenEval 0.63, DPG-Bench 80.09, MJHQ FID-30k 9.51 (w = 2, 30 steps), beating SDv1.5 and SDXL. Understanding: MMBench 74.9, SEED-Bench 70.5, GQA 60.3 at 1.3B parameters, ahead of LLaVA-v1.5 and Qwen-VL-Chat. Ablations cover the decoupled encoders, the alignment loss, and the attention-mask choice. Published at CVPR 2025.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "One model scale and one resolution; iterative sampling means generation costs multiple forward passes; the latent space comes from a pretrained SDXL VAE; and the benchmark comparisons are the authors' selection from the same release window. The paper positions itself as evidence that the approach works, not as a finished generation system.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "You do not need a diffusion-specific network to run a flow model: a language transformer with a small latent-space encoder and decoder is enough. If you decouple representations for two tasks, add a loss that reconnects them semantically, because the decoupled branch loses the supervision the shared one used to get for free. And treat sampling steps as a serving dial, not a constant.",
      },
    ],
    questions: [
      {
        id: "jf-q1",
        prompt:
          "What does the language model predict when JanusFlow generates an image?",
        options: [
          "A sequence of VQ codebook tokens",
          "A velocity field over the latent grid at each sampling step, which an Euler solver integrates",
          "A CLIP similarity score for each caption",
          "A segmentation mask that a diffusion model completes",
        ],
        answer: 1,
        explanation:
          "The generation decoder reshapes the transformer's output into a velocity for every latent position. Sampling starts from Gaussian noise and takes Euler steps along the predicted field until the latent can be decoded by the SDXL VAE.",
      },
      {
        id: "jf-q2",
        prompt:
          "Which components does JanusFlow add to the language model for generation?",
        options: [
          "A second transformer and a U-Net",
          "A ConvNeXt generation encoder and decoder plus a time embedding, with a long skip connection between them",
          "A VQ tokenizer and a codebook embedding table",
          "A diffusion loss head on every layer",
        ],
        answer: 1,
        explanation:
          "The minimalist claim is that only a lightweight encoder, a decoder, and a time embedding are needed to adapt the LLM for flow. The paper found causal attention sufficient and used no special attention masks.",
      },
      {
        id: "jf-q3",
        prompt: "What does the representation-alignment loss do?",
        options: [
          "It aligns the image and text tokenizers",
          "It pulls the generation encoder's intermediate features toward the understanding encoder's features, giving the generation path semantic structure",
          "It forces the two encoders to share weights",
          "It aligns the noise schedule across resolutions",
        ],
        answer: 1,
        explanation:
          "The decoupled generation encoder has no semantic supervision of its own. Aligning its features with SigLIP's for the same image makes them semantically organized, which the paper credits for better prompt following while keeping the encoders separate.",
      },
      {
        id: "jf-q4",
        prompt:
          "Why does classifier-free guidance appear in a rectified-flow model?",
        options: [
          "It replaces the ODE solver",
          "The model can predict a velocity with and without the caption, and extrapolating away from the unconditional prediction sharpens alignment with the prompt",
          "It removes the need for a VAE",
          "It converts velocity into probability",
        ],
        answer: 1,
        explanation:
          "Guidance is an inference-time trick: run the model conditionally and unconditionally, then combine the two velocities with scale w. JanusFlow reports w = 2 and 30 sampling steps for its FID numbers.",
      },
      {
        id: "jf-q5",
        prompt:
          "Which limitation does the JanusFlow paper's scope impose on its claims?",
        options: [
          "It only reports at a single 1.3B scale and 384 x 384 resolution",
          "It cannot generate images at all",
          "It requires a discrete codebook larger than Janus's",
          "It trains two separate language models",
        ],
        answer: 0,
        explanation:
          "Everything is validated at one scale and one resolution, with iterative sampling adding cost. The paper is a controlled experiment about the objective and the decoupled design, and Janus-Pro later scales the token-based line instead.",
      },
    ],
    practice: {
      concepts: ["calc-derivatives", "la-vectors"],
      articles: ["art-gradient-descent", "art-embeddings"],
      problems: ["cv-175", "cv-296", "cv-393"],
    },
    project: {
      title: "Rectified flow vs a DDPM baseline on a 1D Gaussian",
      pitch: "Train two small fields on the same standard normal target: a velocity field for the straight rectified-flow path and a noise predictor for a variance-preserving diffusion chain. Sample both with the same budget and measure which one recovers the target mean and standard deviation in fewer steps.",
      difficulty: "intermediate",
      timeEstimate: "3-5 hours",
      milestones: [
        "Fill fit(kind): draw noise e, data x, and t; for flow regress x - e on the features [z, t*z] with z = (1-t)*e + t*x; for ddpm regress e with z = sqrt(ab)*x + sqrt(1-ab)*e at a random schedule index.",
        "Use fit2, the closed-form 2x2 least-squares solver, to return two weights per kind, and confirm both fits finish in under a second.",
        "Implement flow sampling: start z ~ N(0,1), then take steps Euler updates z += (w0*z + w1*t*z)/steps with t = s/steps.",
        "Implement ddpm sampling: start z ~ N(0,1), map the step count onto the 200-entry schedule, and apply the ancestral posterior mean and variance around the predicted noise.",
        "Print mean and std for flow at 32 and 4 steps and ddpm at 200 and 16 steps; find the step count where the flow std error passes 0.2.",
        "Change the seed and confirm that the four printed rows keep the same ordering.",
      ],
      starterCode: `import math, random
random.seed(0)
# EXPECTED before TODOs: "target mean 0.0 std 1.0" then "unimplemented: TODO: fit".
# EXPECTED after TODOs, 1000 samples: flow 32 steps mean ~0.04 std ~0.97 and
# 4 steps std ~0.67; ddpm 200 steps mean ~0.04 std ~0.98 and 16 steps std ~0.93.
SIG, NS, NT, T = 1.0, 1000, 20000, 200
AB = [1.0]
for k in range(1, T + 1):
    AB.append(AB[-1] * (1 - (0.001 + 0.049 * (k - 1) / (T - 1))))
def fit2(X, y):
    s00 = sum(r[0] * r[0] for r in X); s11 = sum(r[1] * r[1] for r in X); s01 = sum(r[0] * r[1] for r in X)
    a = sum(r[0] * v for r, v in zip(X, y)); b = sum(r[1] * v for r, v in zip(X, y)); d = s00 * s11 - s01 * s01
    return [(a * s11 - b * s01) / d, (b * s00 - a * s01) / d]

def fit(kind):
    """TODO: regress velocity x-e on [z, t*z] with z=(1-t)*e+t*x (flow), or
    noise e on [z, t*z] with z=sqrt(ab)*x+sqrt(1-ab)*e (ddpm). Return weights."""
    raise NotImplementedError("TODO: fit")

def sample(kind, w, steps):
    """TODO: flow = Euler dz=v*dt; ddpm = ancestral posterior loop from
    z~N(0,1). Return (mean, std) over NS draws of the final z."""
    raise NotImplementedError("TODO: sample")

def main():
    print("target mean 0.0 std", SIG)
    flow, ddpm = fit("flow"), fit("ddpm")
    for kind, w, steps in (("flow", flow, 32), ("flow", flow, 4), ("ddpm", ddpm, T), ("ddpm", ddpm, 16)):
        mean, std = sample(kind, w, steps)
        print(kind, steps, "steps  mean", round(mean, 3), " std", round(std, 3))

try:
    main()
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "At the fixed seed with 1000 samples, flow at 32 steps has |mean| below 0.1 and |std - 1| below 0.1, while flow at 4 steps has |std - 1| above 0.25.",
        "The ddpm sampler runs the full 200-step schedule and reports mean and std within 0.1 of the target.",
        "One python3 run prints all four rows in under 5 seconds using only the standard library.",
      ],
      stretch: [
        "Add a third feature t*t*z to the flow model with a 3x3 solver and check whether the 4-step std error drops.",
        "Sweep step counts 4, 8, 16, and 32 and print the std error trend.",
        "Train a second flow field on a two-component Gaussian mixture and report where the straight path fails.",
      ],
      relatedProblemIds: ["cv-175", "cv-296", "cv-393"],
    },
  },
  {
    id: "deepseek-ocr",
    slug: "deepseek-ocr",
    title: "DeepSeek-OCR: Contexts Optical Compression",
    short: "DeepSeek-OCR",
    year: 2025,
    date: "2025-10-21",
    arxivId: "2510.18234",
    url: "https://arxiv.org/abs/2510.18234",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Render text as an image and let a 570M-active MoE read it back: ten text tokens per vision token is near-lossless, twenty is still 60%.",
    whatItIs:
      "DeepSeek-OCR is a two-part system built to test one hypothesis: that vision can serve as a compression medium for text. The encoder, DeepEncoder, pairs a SAM-base block that reads patches with window attention against a CLIP-large block that adds global context, bridged by a 16x convolutional compressor, so a 1024 x 1024 page becomes 4096 patch tokens and then 256 vision tokens while activations stay small. The decoder is a 3B mixture-of-experts model with only 570M parameters active. The experiments measure how much text can be recovered from how few vision tokens: near 97% OCR precision at compression ratios under 10x, about 60% at 20x. On OmniDocBench it beats GOT-OCR2.0's 256-token pages using 100 vision tokens, and MinerU2.0's 6000-plus-token pages using fewer than 800. In production it generates training data at 200k-plus pages per day on a single A100-40G.",
    theoryMinutes: 13,
    lineage: {
      from: "deepseek-vl2",
      to: ["deepseek-ocr-2"],
      context:
        "The multimodal line's most utilitarian branch. Where VL2 and Janus aim at general understanding or generation, DeepSeek-OCR uses the same ingredients - a window-attention perception encoder, a global-attention semantic encoder, a small MoE decoder - to attack the cost of long text, and it is the first DeepSeek release whose subject is context compression rather than a capability benchmark.",
      improved: [
        "Introduces DeepEncoder: SAM-base window attention for perception, a 16x convolutional compressor, and CLIP-large global attention for knowledge, keeping activation memory low at high resolution.",
        "Compresses a 1024 x 1024 page from 4096 patch tokens to 256 vision tokens before the language decoder ever runs.",
        "Quantifies the trade curve rather than a single point: 96%+ OCR precision at 9-10x text-to-vision compression, about 90% at 10-12x, and about 60% at 20x.",
        "Beats GOT-OCR2.0 on OmniDocBench with 100 vision tokens against its 256, and MinerU2.0 with fewer than 800 against its 6000-plus per page.",
        "Ships as a practical data engine: over 200k pages per day on one A100-40G, with code and weights open.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The context bill, paid in a different currency",
        text: "Long-context language models pay for text twice: once in attention compute, which grows with the square of the sequence, and once in memory traffic, because decoding streams the KV cache on every step. The paper asks whether text can be stored and read in a cheaper representation. An image of a page is two-dimensional and dense: a paragraph that costs a thousand tokens as text costs a few hundred patches as pixels, and the layout, fonts, and tables come along for free. The catch is that the reader must be able to recover the text, which is an OCR problem, and the quality of that recovery is what the whole paper measures.",
      },
      {
        kind: "prose",
        heading: "DeepEncoder: two attention patterns, one compressor",
        text: "The encoder is assembled from parts with complementary strengths. SAM-base processes 16 x 16 patches with window attention, so its cost stays local and its 80M parameters keep activations manageable at high resolution - it handles perception, the pixels. CLIP-large contributes the visual knowledge of a contrastively pretrained model and runs dense global attention, but it cannot afford to see 4096 tokens. Between them sits the compressor: two convolutional layers with kernel 3, stride 2, and padding 1, with channels rising from 256 to 1024, which downsamples the token grid by a factor of 16. A 1024 x 1024 page therefore reaches CLIP as 256 tokens instead of 4096. The design is a division of labor: window attention for seeing, a bottleneck for paying, global attention for understanding.",
      },
      {
        kind: "formula",
        label: "Compression ratio and what survives",
        expression:
          "compression = text_tokens / vision_tokens\n< 10x  ->  about 97% OCR precision\n~ 20x  ->  about 60% OCR precision",
        why: "The ratio is the design objective and the quality knob at once. Under 10x the reconstruction is effectively lossless for documents; at 20x the model is losing detail, and the paper attributes part of the drop to long texts blurring when rendered at 512 x 512 or 640 x 640, and part to complex layouts. The honest reading is that optical compression has a knee, and the paper's contribution is locating it rather than hiding it.",
      },
      {
        kind: "visual",
        visual: "vision-tower",
        caption:
          "DeepEncoder: SAM-base window attention reads patches, a 16x convolutional compressor cuts the token count, and CLIP-large adds global context; the 3B MoE decoder with 570M active parameters reconstructs the text.",
      },
      {
        kind: "code",
        title: "Counting the tokens a page costs",
        language: "python",
        code: `def page_tokens(pixels=1024, patch=16, compression=16):
    patches = (pixels // patch) ** 2          # 64 x 64 = 4096
    return patches // compression              # 256 vision tokens

def compression_ratio(text_tokens, vision_tokens):
    return text_tokens / vision_tokens

# A dense page of about 2560 text tokens rendered at 1024 x 1024
print(page_tokens())                                  # 256
print(compression_ratio(2560, 256))                   # 10.0x, near-lossless
print(compression_ratio(5120, 256))                   # 20.0x, about 60%

# Production mode (Gundam) tiles the page into crops and reaches ~1156 tokens,
# trading vision tokens for fidelity on dense or small-print documents.`,
        notes: [
          "The 16x figure is the compressor's downsampling factor, which is what turns 4096 patches into 256 tokens.",
          "Real deployments choose a mode: fewer tokens for bulk data generation, more crops for hard pages.",
          "The same arithmetic applies to any rendered text - chat history, logs, retrieved documents - which is why the paper frames OCR as a proof of concept for context compression in general.",
        ],
      },
      {
        kind: "prose",
        heading: "The decoder and the data",
        text: "The decoder is DeepSeek3B-MoE-A570M: a 3B-parameter mixture-of-experts model activating 570M parameters per token, chosen because the reconstruction task is narrow and does not need a large dense model. Training data is dominated by OCR tasks across document types, with about 20 percent general vision data - captions, detection, grounding - following the DeepSeek-VL2 recipe, included to keep the vision interface usable for future work rather than to make this a general VLM. The paper is explicit that it is not one: the point is the compression experiment, and the general data is insurance.",
      },
      {
        kind: "prose",
        heading: "Production numbers and the honest limits",
        text: "The system's practical claim is throughput: over 200k pages per day on a single A100-40G, which makes it a data engine for pretraining corpora rather than just a benchmark entry. The scientific claim is the compression curve. Both come with caveats the paper states. OCR is a proof of concept: decoding text from a rendered page is not the same as compressing arbitrary context, and the paper defers digital-optical interleaved pretraining and needle-in-a-haystack tests to future work. Beyond 10x compression quality falls, and long documents rendered at low resolution blur. The comparison models are from the same release window, and the 20 percent general-vision data means the model is deliberately not optimized as a general-purpose VLM. Read it as the opening argument for optical context compression, with the compression curve as the evidence.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Text context is expensive to store and read. The paper asks whether a page of text can be rendered as an image, compressed to a small number of vision tokens, and decoded back accurately enough to be useful - and where the accuracy knee lies.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "The encoder architecture and the compression curve. Section 2 covers DeepEncoder's three stages and the decoder; Section 4 is the quantitative study of ratios against precision, plus the OmniDocBench comparison and the production numbers. The framing to keep in mind is LLM-centric: the question is how few vision tokens can carry how much text.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Compression results: 96%+ OCR precision at 9-10x, about 90% at 10-12x, about 60% at 20x, measured on document benchmarks with diverse layouts. OmniDocBench: better than GOT-OCR2.0 with 100 vision tokens versus its 256 per page, and better than MinerU2.0 with under 800 versus its 6000-plus. Production: 200k-plus pages per day on one A100-40G. A 1024 x 1024 input becomes 4096 patch tokens and 256 vision tokens through a 16x compressor.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "OCR is explicitly a proof of concept for context compression, not the full claim; interleaved digital-optical pretraining and long-context retrieval tests are left for later. Quality degrades past 10x, and rendering long text at 512 or 640 pixels blurs it. The model is not a general VLM by design, and all comparisons are vendor-run on the authors' benchmark selection.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If you own a document pipeline, resolution policy is a cost decision you can measure: pick a compression ratio from the curve rather than a fixed resolution, and budget vision tokens the way you budget context. Optical storage wins when layout matters and the reader is good; it loses when text must be edited or exactly searched, so keep the text for those paths.",
      },
    ],
    questions: [
      {
        id: "ocr-q1",
        prompt:
          "What does the 16x compressor in DeepEncoder actually compress?",
        options: [
          "The pixel resolution of the input image",
          "The patch-token grid, from 4096 tokens to 256 before global attention runs",
          "The model's parameter count",
          "The output text length",
        ],
        answer: 1,
        explanation:
          "Two convolutional layers with stride 2 downsample the token grid by 4 x 4 = 16. A 1024 x 1024 page enters as 4096 patch tokens and reaches the CLIP-large global attention block as 256 tokens, which is what keeps activation memory manageable.",
      },
      {
        id: "ocr-q2",
        prompt:
          "Why does DeepEncoder use SAM-base for the first stage and CLIP-large for the second?",
        options: [
          "SAM is faster than CLIP on GPUs",
          "SAM's window attention keeps local perception cheap at high resolution, while CLIP contributes global semantic knowledge over the compressed token set",
          "CLIP cannot process patches",
          "SAM was pretrained for OCR and CLIP for detection",
        ],
        answer: 1,
        explanation:
          "The division of labor is the design: window attention handles many patches without exploding activation, the compressor cuts the count, and global attention over a small set adds the visual knowledge that a contrastively pretrained encoder provides.",
      },
      {
        id: "ocr-q3",
        prompt:
          "At what compression ratio does OCR precision fall to roughly 60%, and what does the paper say about why?",
        options: [
          "At 5x, because the decoder is too small",
          "At 20x, with long texts blurring at low render resolutions and complex layouts contributing",
          "At 2x, because text tokens outnumber vision tokens",
          "It never falls below 90%",
        ],
        answer: 1,
        explanation:
          "The curve stays near 97% below 10x and drops to about 60% at 20x. The paper points to blur from rendering long text at 512 or 640 pixels and to the complexity of long document layouts.",
      },
      {
        id: "ocr-q4",
        prompt:
          "What makes DeepSeek-OCR useful as a production component rather than just a benchmark model?",
        options: [
          "It generates training data at over 200k pages per day on a single A100-40G",
          "It replaces the language model entirely",
          "It supports every language without training",
          "It runs without a vision encoder",
        ],
        answer: 0,
        explanation:
          "The paper positions the model as a data engine for LLM pretraining: a single 40GB A100 can process more than 200k pages per day, which is what makes optical rendering practical at corpus scale.",
      },
      {
        id: "ocr-q5",
        prompt:
          "Which statement correctly describes the paper's own framing of its contribution?",
        options: [
          "It proves optical context compression is solved",
          "It is an initial investigation into optical compression with OCR as the proof of concept, leaving interleaved pretraining and long-context retrieval tests for future work",
          "It is a general-purpose VLM benchmark paper",
          "It replaces attention with vision tokens",
        ],
        answer: 1,
        explanation:
          "The abstract and conclusion call it an initial investigation. The compression curve is real evidence, but the paper defers digital-optical interleaved pretraining and needle-in-a-haystack evaluation, and it keeps general-vision data only to preserve the interface.",
      },
    ],
    practice: {
      concepts: ["info-entropy", "stats-correlation"],
      articles: ["art-attention", "art-embeddings"],
      problems: ["cv-188", "cv-249", "cv-296"],
    },
    project: {
      title: "Find the compression knee of a toy optical reader",
      pitch: "Model a page as a stream of symbols and every vision token as a fixed 30-bit budget. A bin of R words must share the budget, so each word keeps only min(5, 30/R) bits of its 5-bit code; decode each truncated code to the most frequent word that shares its prefix and score word accuracy at ratios 1 through 16.",
      difficulty: "intermediate",
      timeEstimate: "2-4 hours",
      milestones: [
        "Fill to_vision: set b = min(BITS, CAP // ratio) and turn each bin into (b, codes) with code = w >> (BITS - b).",
        "Fill recover: count the words in the document, expand each code to the 2^(BITS-b) words under it, and emit the most frequent one per position.",
        "Run the ratio sweep 1, 2, 4, 8, 16 and check that accuracy stays 1.0 while b remains 5.",
        "Print the vision-token count at every ratio and verify text tokens divided by vision tokens equals the ratio.",
        "Report the first ratio where accuracy falls below 0.9 and compare it with the paper's knee at 9-10x compression.",
        "Replace the frequency prior with the lowest symbol id and record how much accuracy changes at ratio 16.",
      ],
      starterCode: `import random
random.seed(0)
# EXPECTED before TODOs: document line, then "unimplemented: TODO: to_vision". After:
# accuracy 1.0 at ratios 1, 2, 4; ~0.38 at ratio 8; ~0.26 at ratio 16; first below 0.9: 8.
VOCAB, LENGTH, CAP, BITS = 32, 20000, 30, 5
def build_document():
    words, weights = [], [1 / (i + 1) for i in range(VOCAB)]
    while len(words) < LENGTH:
        words += random.choices(range(VOCAB), weights=weights, k=1) * random.choice([1, 2, 2, 4, 8])
    return words[:LENGTH]

def to_vision(doc, ratio):
    """TODO: b = min(BITS, CAP // ratio); bin -> (b, [w >> (BITS - b) ...])."""
    raise NotImplementedError("TODO: to_vision")

def recover(vision, doc):
    """TODO: emit the most frequent word under each (b, code) prefix."""
    raise NotImplementedError("TODO: recover")

def main():
    doc = build_document()
    print("synthetic document:", LENGTH, "words over", VOCAB, "symbols; vision token =", CAP, "bits")
    first = None
    for ratio in (1, 2, 4, 8, 16):
        vision = to_vision(doc, ratio)
        guess = recover(vision, doc)
        n = min(len(doc), len(guess))
        acc = sum(a == b for a, b in zip(doc, guess)) / n
        first = ratio if first is None and acc < 0.9 else first
        print("ratio", ratio, " vision tokens", len(vision), " accuracy", round(acc, 3))
    print("first ratio below 0.9:", first)
try:
    main()
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "The sweep prints accuracy and vision-token counts for all five ratios plus the first ratio below 0.9.",
        "Accuracy is 1.0 whenever the per-word bit budget is at least 5 and falls below 0.5 at the first ratio where it is not.",
        "The script runs in under 5 seconds with the standard library only.",
      ],
      stretch: [
        "Add rendering blur: mix one random extra word into every bin before decoding and re-measure the knee.",
        "Make CAP a parameter and report how the knee ratio moves with the vision-token budget.",
        "Give each code a shared prefix correction and compare a joint decoder against the independent one.",
      ],
      relatedProblemIds: ["cv-188", "cv-249", "cv-296"],
    },
  },
  {
    id: "deepseek-v3-2",
    slug: "deepseek-v3-2",
    title:
      "DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models",
    short: "DeepSeek-V3.2",
    year: 2025,
    date: "2025-12-01",
    arxivId: "2512.02556",
    url: "https://arxiv.org/abs/2512.02556",
    kind: "report",
    era: "frontier",
    tier: "core",
    tagline:
      "Spend more on post-training than anyone thought sensible, synthesize 1,827 tool environments, and let the model learn to think inside a tool loop: V3.2 matches GPT-5, and its Speciale variant takes gold at IMO and IOI.",
    whatItIs:
      "DeepSeek-V3.2 is the December 1, 2025 successor to the V3.2-Exp experiment and the flagship open release that closes the year. It keeps the DeepSeek Sparse Attention architecture from the Exp report - the lightning indexer and top-k selection that make long-context attention linear in the main path - and spends its effort on three things the Exp release did not: a reinforcement-learning protocol scaled past 10 percent of the pretraining compute, a large-scale synthesis pipeline that builds 1,827 verifiable tool environments and 85,000-plus prompts for agentic training, and a cold-start stage that teaches the model to interleave reasoning with tool calls in a single trajectory. The result is a model the report places level with GPT-5 on reasoning benchmarks, and a high-compute variant, V3.2-Speciale, that the report places with Gemini-3.0-Pro and that earns gold-medal results at IMO 2025, CMO 2025, IOI 2025, and the ICPC World Finals.",
    theoryMinutes: 15,
    lineage: {
      from: "deepseek-v3-2-exp",
      to: ["deepseek-v4"],
      context:
        "The Exp release proved that sparse attention could be attached to a trained backbone at parity; this report is the model that the experiment was for. It keeps the architecture and moves the frontier on the two axes the Exp report named as remaining bottlenecks: how much compute post-training deserves, and how open models generalize inside agent loops.",
      improved: [
        "Scales post-training RL past 10 percent of the pretraining compute budget, with the report attributing the reasoning gains directly to that expansion and to a stable RL protocol.",
        "Adds a cold-start stage that unifies reasoning and tool use within a single trajectory, so the model learns to think and call tools in one stream instead of switching modes.",
        "Synthesizes agentic training data at scale: 1,827 task-oriented environments and more than 85,000 complex prompts, built to be hard to solve and easy to verify.",
        "Matches GPT-5 on reasoning benchmarks in the report's comparisons and, with the length-constrained reward removed, produces V3.2-Speciale, which the report places on par with Gemini-3.0-Pro.",
        "Earns gold-medal-level results at IMO 2025, CMO 2025, IOI 2025, and the ICPC World Finals with the Speciale variant, without task-specific training for the competitions.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The three deficiencies the report names",
        text: "The report opens with a candid diagnosis of open models rather than a victory lap. First, most open models still use vanilla attention, which makes long sequences expensive and constrains both deployment and post-training. Second, their post-training compute is small relative to pretraining, which limits performance on hard tasks. Third, they lag on agentic generalization and instruction following inside tool loops, which is where real deployments happen. The architecture answer to the first deficiency already exists in the Exp report; this paper is about the other two, and its thesis is that the post-training budget is the lever that was left on the table.",
      },
      {
        kind: "prose",
        heading: "Sparse attention, briefly",
        text: "DSA is carried over unchanged: a small FP8 lightning indexer scores every preceding token for each query, a fine-grained selector keeps the top 2,048 key-value entries shared across query heads, and the main attention reads only those entries, turning its cost from quadratic into linear at a fixed k. The indexer remains quadratic but cheap, and the whole mechanism was trained into the model rather than applied at inference. What is new here is that the efficiency gain is no longer only a serving argument: it is what makes long-horizon RL rollouts affordable, because each rollout replays a long context through attention many times. The curriculum entry for V3.2-Exp covers the mechanism in detail; read this report for what the cheaper attention bought.",
      },
      {
        kind: "prose",
        heading: "Post-training compute as the main variable",
        text: "The report's central claim is empirical: reasoning performance kept improving as the RL budget grew, and the budget now exceeds 10 percent of the pretraining cost. That is a striking ratio, because post-training is usually a rounding error next to pretraining. Two engineering pieces make it stable. A robust RL protocol handles the usual failure modes of long-horizon training - reward noise, length drift, and collapse - and a length-constraint reward model keeps generations from inflating without improving. The constraint is also the experiment: when the authors remove it to build Speciale, performance rises further, which tells you the constrained model was trading tokens for trainability rather than hitting a capability wall.",
      },
      {
        kind: "prose",
        heading: "Learning to think inside a tool loop",
        text: "Agentic post-training has a cold-start problem: a model that has never called a tool cannot learn from tool feedback, and supervised tool-use data is expensive to write by hand. The pipeline solves it in two steps. First, cold start: reuse the V3 recipe to unify reasoning and tool use in single trajectories, so the model sees one stream that contains thinking, a call, the result, and more thinking. Second, synthesis at scale: an automatic environment-synthesis agent builds 1,827 task-oriented environments with their toolsets and verification, plus more than 85,000 prompts that are hard to solve but easy to check. RL then runs against those verifiable environments, which is why the gains generalize rather than memorizing a fixed tool set.",
      },
      {
        kind: "formula",
        label: "Where the compute goes",
        expression:
          "post_training_compute > 0.10 * pretraining_compute\nSpeciale: remove the length-constraint reward -> longer trajectories, higher scores",
        why: "The inequality is the report's headline resource statement: RL is not a finishing pass but a second training phase with a budget comparable in spirit to a tenth of pretraining. The second line is the controlled consequence: keeping the protocol and the data fixed and removing only the length penalty raises the ceiling. That isolates length regularization as a trainability tool, not a capability limit.",
      },
      {
        kind: "visual",
        visual: "rl-reward-curve",
        caption:
          "Reasoning performance tracks the RL budget: the report attributes V3.2's parity with GPT-5 to post-training compute exceeding 10 percent of pretraining, and Speciale's gains to removing the length-constraint reward on top of that.",
      },
      {
        kind: "code",
        title: "A unified think-and-call trajectory",
        language: "python",
        code: `def agent_rollout(policy, env, question):
    """One trajectory interleaves reasoning and tool calls; the reward is the
    environment's verifiable check on the final answer."""
    context, steps = question, 0
    while steps < MAX_STEPS:
        out = policy.generate(context)          # think + optionally call
        if "tool_call" in out:
            result = env.execute(out["tool_call"])   # verifiable environment
            context += out["text"] + format(result)
        else:
            break                                # final answer emitted
        steps += 1
    return context, env.verify(context)

# The synthesis pipeline builds 1,827 such environments and 85k+ prompts;
# RL then optimizes the policy on the verifier's verdict.`,
        notes: [
          "The cold-start data shows the model this interleaving before RL ever runs, which is what makes the first rollouts useful instead of random.",
          "Verifiability is the constraint on synthesis: an environment is only usable if success can be checked mechanically, which is why tasks are generated hard to solve but easy to verify.",
          "The context keeps growing with each tool result, which is exactly the workload DSA's linear main attention was built to make affordable.",
        ],
      },
      {
        kind: "visual",
        visual: "sparse-attention",
        caption:
          "The architecture carried over from V3.2-Exp: a cheap FP8 indexer scores all past tokens, top-k selection keeps 2,048 shared entries per query, and the main attention reads only those - the efficiency that makes long agent rollouts affordable.",
      },
      {
        kind: "prose",
        heading: "Results and the honest limits",
        text: "The report compares V3.2 to GPT-5-class reasoning models at rough parity, with a cost advantage it emphasizes, and reports agentic numbers: SWE-bench Verified in the 72 to 74 range across frameworks and modes, Terminal Bench 2.0 at 46.4 using the Claude Code framework and 39.3 in non-thinking mode with Terminus, and tool-use scores of 63.8 (Airline), 81.1 (Retail), and 96.2 (Telecom) on the 2-bench categories. Speciale's gold medals at IMO, CMO, IOI, and ICPC are the headline. The limits section is unusually specific: world knowledge breadth still trails the leading closed model because total training FLOPs are lower; token efficiency is worse, since V3.2 needs longer generation trajectories to match output quality; and complex tasks remain behind the frontier. The context window is 128K, and some search-agent test cases exceed it, which required context management to score. Read this report for the RL budget argument and the environment synthesis recipe; read the Exp entry for the attention mechanism.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the report sets out to solve",
        text: "Open models were falling behind on complex tasks for three reasons the report names: expensive vanilla attention, too little post-training compute, and weak generalization in tool-use loops. V3.2 keeps the sparse attention from the Exp release and attacks the other two.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Two budgets. The RL section is about spending more post-training compute than the field usually does, with a protocol stable enough to survive it. The agent section is about manufacturing verifiable environments at scale. Read the Speciale comparison carefully: it isolates the length-constraint reward by removing it and changing nothing else.",
      },
      {
        kind: "prose",
        heading: "Evidence the report musters",
        text: "Post-training compute above 10 percent of pretraining; 1,827 synthesized environments and over 85,000 prompts; parity with GPT-5 on reasoning benchmarks in the report's comparisons; Speciale on par with Gemini-3.0-Pro and gold-medal results at IMO 2025, CMO 2025, IOI 2025, and ICPC World Finals; SWE-bench Verified 72-74 across settings; Terminal Bench 2.0 46.4 and 39.3; tool-use scores 63.8 / 81.1 / 96.2 on the three 2-bench categories; 128K context.",
      },
      {
        kind: "prose",
        heading: "Limits the report admits",
        text: "World knowledge lags because of lower total training FLOPs; token efficiency is worse than the leading closed model, so equivalent quality costs more generated tokens; and complex tasks remain behind the frontier. The agent scores depend on context management because 128K is smaller than some test cases, and the framework used affects reported Terminal Bench numbers.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Treat post-training as a first-class compute budget, not a finishing touch: if reasoning keeps improving with RL compute, the constraint is protocol stability, not headroom. When you need agentic behavior, synthesize verifiable environments instead of collecting demonstrations, and let RL discover the loops. And keep a length penalty while training even if you remove it for your best model - it buys stability at a known price.",
      },
    ],
    questions: [
      {
        id: "v32f-q1",
        prompt:
          "Which three deficiencies does the V3.2 report name for open models?",
        options: [
          "Small vocabularies, slow tokenizers, and weak multilingual data",
          "Vanilla attention for long sequences, too little post-training compute, and weak agentic generalization and instruction following",
          "Missing MoE routing, no FP8 training, and no multimodal input",
          "Excessive parameter counts, poor quantization, and licensing limits",
        ],
        answer: 1,
        explanation:
          "The report's diagnosis is architectural efficiency, post-training resource allocation, and agentic capability. V3.2 answers the first with the DSA architecture it inherits from the Exp release, and the paper's new work targets the second and third.",
      },
      {
        id: "v32f-q2",
        prompt:
          "What is the report's headline resource claim about post-training?",
        options: [
          "Post-training costs less than one percent of pretraining",
          "Post-training compute exceeds 10 percent of the pretraining budget, and reasoning performance kept improving as it grew",
          "Post-training is entirely replaced by distillation",
          "Pretraining compute was doubled to avoid post-training",
        ],
        answer: 1,
        explanation:
          "The report states the RL budget exceeds 10 percent of pretraining cost and treats that expansion as the main driver of the reasoning gains. This is unusual in a field where post-training is typically a small fraction.",
      },
      {
        id: "v32f-q3",
        prompt:
          "How does the agentic synthesis pipeline make training data usable for RL?",
        options: [
          "By collecting human demonstrations for every tool",
          "By generating environments and prompts that are hard to solve but easy to verify, so RL can check outcomes mechanically",
          "By training a reward model on preferences",
          "By removing tools from the training loop",
        ],
        answer: 1,
        explanation:
          "The synthesis agent builds 1,827 environments and 85,000-plus prompts with verification built in. The hard-to-solve, easy-to-verify property is what makes the data a valid RL signal rather than a demonstration set.",
      },
      {
        id: "v32f-q4",
        prompt:
          "What distinguishes V3.2-Speciale from V3.2 in the report's account?",
        options: [
          "A larger parameter count",
          "The length-constraint reward is removed, allowing longer reasoning trajectories, which raises scores to Gemini-3.0-Pro level and gold-medal competition results",
          "It uses dense attention instead of DSA",
          "It is a distilled smaller model",
        ],
        answer: 1,
        explanation:
          "Speciale keeps the protocol and data but drops the length penalty, letting generations grow. That isolates length regularization as a trainability trade rather than a capability ceiling, and the variant goes on to gold-medal results at IMO, CMO, IOI, and ICPC.",
      },
      {
        id: "v32f-q5",
        prompt:
          "Which limitation does the report state about V3.2's knowledge and efficiency?",
        options: [
          "The model cannot use tools",
          "World knowledge lags the leading closed model because of fewer total training FLOPs, and token efficiency is worse, needing longer trajectories for comparable quality",
          "The context window is unlimited",
          "It has no benchmark regressions",
        ],
        answer: 1,
        explanation:
          "The limitations section names knowledge breadth, token efficiency, and complex-task performance. It is a specific, self-critical list, and it names the mechanism for the first: lower total training FLOPs than the frontier closed models.",
      },
    ],
    practice: {
      articles: ["art-post-training", "art-attention"],
      problems: ["rl-306", "dl-075", "dl-210", "ca-225"],
    },
    project: {
      title: "Scale the rollout budget on a verifiable bandit",
      pitch: "Three arms pass a check with hidden probabilities 0.5, 0.55, and 0.6; only sampling reveals the best one. Train a softmax policy with REINFORCE at budgets from 50 to 5000 episodes and measure how often the greedy arm is the true best, averaged over 40 seeds.",
      difficulty: "starter",
      timeEstimate: "2-3 hours",
      milestones: [
        "Fill train: seed the RNG, start the three logits at zero, and sample an arm from the softmax policy each episode.",
        "Take the arm's Bernoulli reward as the verifiable check, keep a running-mean baseline, and update the logits with the score-function gradient.",
        "Run budgets 50, 200, 1000, and 5000, and record the greedy arm for each seed.",
        "Average best-arm accuracy over 40 seeds and check the curve rises with the rollout budget.",
        "Compare the 5000-rollout accuracy with a uniform sampler that never trains and report the gap.",
        "Write down the budget ratio between the last and first runs and what the trend says about paying for more rollouts.",
      ],
      starterCode: `import math, random
random.seed(0)
# EXPECTED before TODOs: "arm means [0.5, 0.55, 0.6]" then "unimplemented: TODO: train".
# EXPECTED after TODOs (40 seeds per budget): best-arm accuracy rises with the
# rollout budget: 50 -> ~0.55, 200 -> ~0.7, 1000 -> ~0.85, 5000 -> ~0.95.
P, SEEDS, LR = [0.5, 0.55, 0.6], 40, 0.5

def policy(logits):
    ex = [math.exp(x) for x in logits]
    total = sum(ex)
    return [e / total for e in ex]

def train(seed, budget):
    """TODO: seed the RNG, start logits at 0, then run budget episodes of
    REINFORCE: sample an arm from the softmax policy, take the arm's verifiable
    Bernoulli reward, and update the logits with a running-mean baseline.
    Return the trained logits."""
    raise NotImplementedError("TODO: train")

def main():
    print("arm means", P)
    for budget in (50, 200, 1000, 5000):
        wins = 0
        for seed in range(SEEDS):
            logits = train(seed, budget)
            probs = policy(logits)
            if probs.index(max(probs)) == len(P) - 1:
                wins += 1
        print("rollouts", budget, " best-arm accuracy", round(wins / SEEDS, 2))

try:
    main()
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "Best-arm accuracy rises from about 0.55 at 50 rollouts to about 0.95 at 5000 in the printed 40-seed average.",
        "Every run keeps the logits finite and the full sweep finishes in under 5 seconds.",
        "The script prints all four budget rows in one run.",
      ],
      stretch: [
        "Replace the running-mean baseline with a per-arm baseline and compare the learning curve.",
        "Narrow the margins to 0.50, 0.51, and 0.52 and find the budget needed to reach 0.9 accuracy.",
        "Add a per-pull cost and re-run, checking whether the extra compute still pays for itself.",
      ],
      relatedProblemIds: ["rl-306", "dl-075", "dl-210", "ca-225"],
    },
  },
  {
    id: "mhc",
    slug: "mhc",
    title: "mHC: Manifold-Constrained Hyper-Connections",
    short: "mHC",
    year: 2025,
    date: "2025-12-31",
    arxivId: "2512.24880",
    url: "https://arxiv.org/abs/2512.24880",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Widen the residual stream for expressivity, but keep the identity property: project the mixing matrix onto the manifold of doubly stochastic matrices so the signal can mix but never amplify.",
    whatItIs:
      "Hyper-Connections (HC) generalize the residual connection by widening the residual stream into several parallel streams with learned read, write, and forward-mixing matrices. The expressivity gain is real, but the forward matrix is unconstrained, so when many of them multiply across layers the signal can explode or vanish, and training becomes unstable at scale. mHC fixes this by projecting the forward matrix onto the Birkhoff polytope - the set of doubly stochastic matrices - using the Sinkhorn-Knopp algorithm. Rows and columns sum to one, so the transform is a convex combination of streams: the mean is preserved and the spectral norm is bounded by one, and because the set is closed under multiplication the bound survives any depth. On MoE models up to 27B parameters the method removes HC's instabilities, improves on both the baseline and HC on downstream benchmarks, and costs only 6.7 percent extra training time after kernel fusion, mixed-precision kernels, selective recomputation, and pipeline overlap.",
    theoryMinutes: 14,
    lineage: {
      from: "deepseek-v3",
      context:
        "An architecture paper about the residual path rather than the attention or the experts. It trains MoE models built in the V3 style, uses the DualPipe schedule from the V3 infrastructure, and produces a component that the V4 generation then adopts - the frontier era reaching back into the trunk's oldest design decision.",
      improved: [
        "Identifies the failure mode of Hyper-Connections precisely: the unconstrained forward mixing matrix can amplify signals exponentially across layers, measured at up to about 3000x gain versus roughly 1.6x for mHC.",
        "Projects the residual mixing matrix onto the Birkhoff polytope with Sinkhorn-Knopp, restoring the identity-mapping property in generalized form: a convex combination of streams, with spectral norm bounded by one.",
        "Keeps expressivity while bounding it, because the doubly stochastic set is closed under matrix multiplication, so composite mappings across arbitrary depth stay non-expansive.",
        "Delivers the improvement at system cost: 6.7 percent additional training time at expansion rate n = 4 after TileLang kernel fusion, mixed precision, selective recomputation, and overlap inside DualPipe.",
        "Validates across 3B, 9B, and 27B MoE models plus a 1T-token token-scaling run, with a final loss reduction of 0.021 versus the baseline and gains such as +2.1 on BBH and +2.3 on DROP versus HC.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The residual connection is a stability contract",
        text: "Every deep transformer is trainable because of one line: x_{l+1} = x_l + F(x_l). The identity path means a gradient or a signal can travel from layer 1 to layer 60 without being multiplied by sixty learned matrices, so neither explodes nor vanishes. The cost is that the residual stream is one vector wide, and every layer reads and writes through the same channel. Hyper-Connections widen it: the stream becomes several parallel vectors, and learned matrices decide how to read from the streams into a layer, how to write the layer's output back, and how to mix the streams forward. More routes between layers means more expressive topology, and that is the whole appeal.",
      },
      {
        kind: "prose",
        heading: "Where HC breaks, in numbers",
        text: "The forward mixing matrix is learned and unconstrained. If its spectral norm is slightly above one, the product of many such matrices grows exponentially with depth; if slightly below, it decays. The paper measures this directly with the maximum gain magnitude of the residual mapping and reports values up to roughly 3000 in HC, against about 1.6 for its constrained version. A network with a 3000x gain somewhere in its depth is a network whose loss spikes, whose gradients diverge, and whose training requires rescues. This is the same problem the original identity mapping solved for free, reappearing because the architecture generalized away the guarantee.",
      },
      {
        kind: "prose",
        heading: "Constrain to doubly stochastic matrices",
        text: "The fix is geometric. Restrict the forward matrix B to the Birkhoff polytope: non-negative entries with every row and every column summing to one. Three properties follow. First, B is a convex combination operator: each stream's next value is an average of the current streams, so the mean is conserved and no stream can be amplified. Second, the spectral norm of a doubly stochastic matrix is at most one, so the mapping is non-expansive. Third, the set is closed under multiplication, so a product of such matrices is itself doubly stochastic and the bound holds at any depth. The read and write maps A and C are kept non-negative and bounded with a sigmoid instead, because they must be able to emphasize and suppress features; only the forward path needs the strict constraint.",
      },
      {
        kind: "formula",
        label: "The mHC residual update",
        expression:
          "X_{l+1} = B_l * X_l + C_l * F_l(A_l * X_l)\nB_l = SinkhornKnopp( exp(H_l) ),  B_l >= 0,  B_l * 1 = 1,  1^T * B_l = 1^T",
        why: "X_l is the stack of parallel residual streams, A_l reads one d-dimensional vector into layer F_l, C_l writes the output back into the streams, and B_l mixes the streams forward. The exponential makes the learned values positive and the Sinkhorn-Knopp iteration alternately normalizes rows and columns until both sum to one, producing a differentiable projection onto the manifold. The update keeps HC's structure and replaces its unconstrained forward map with a convex combination, which is what restores stability without collapsing the streams into one.",
      },
      {
        kind: "code",
        title: "Sinkhorn-Knopp projection",
        language: "python",
        code: `def sinkhorn(logits, iters=20):
    """Project a positive matrix onto the doubly stochastic manifold by
    alternately normalizing rows and columns."""
    m = [[pow(2.718281828, x) for x in row] for row in logits]
    n = len(m)
    for _ in range(iters):
        for i in range(n):                    # row normalization
            s = sum(m[i])
            m[i] = [x / s for x in m[i]]
        for j in range(n):                    # column normalization
            s = sum(m[i][j] for i in range(n))
            for i in range(n):
                m[i][j] /= s
    return m

B = sinkhorn([[0.1, 0.2, 0.3, 0.4]] * 4)
print([round(sum(row), 6) for row in B])            # rows sum to 1
print([round(sum(B[i][j] for i in range(4)), 6) for j in range(4)])`,
        notes: [
          "The paper uses 20 iterations, which makes the projection approximate rather than exact; the residual deviation in the backward gain stays bounded and small.",
          "Because the stream count is tiny (expansion rate 4 in the experiments), the iteration is cheap and fully differentiable inside the graph.",
          "In the fused kernel the whole projection runs as one operation, which is part of how the overhead stays at 6.7 percent.",
        ],
      },
      {
        kind: "prose",
        heading: "Making it fast enough to use",
        text: "A constraint that doubles training time is not a fix. The paper's systems half is what makes mHC practical: kernel fusion that merges the RMSNorm (the normalization layer), the mixing, and the complete Sinkhorn iteration into unified kernels; mixed-precision implementations written with TileLang; selective recomputation to cut the memory footprint of the intermediate activations; and communication overlapped inside the DualPipe schedule borrowed from the V3 stack. With all of it, expansion rate n = 4 costs 6.7 percent additional training time, and the paper reports the scaling behavior across 3B, 9B, and 27B models so the overhead is not a single measurement.",
      },
      {
        kind: "visual",
        visual: "timeline",
        caption:
          "Three steps in the residual path: the plain identity connection, HC's unconstrained multi-stream mixing, and mHC's projection onto the doubly stochastic manifold, which restores the boundedness the identity gave for free.",
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "The stability and the bill: composite gain magnitude drops from roughly 3000x in HC to about 1.6x in mHC, while the measured training-time overhead at expansion rate 4 is 6.7 percent.",
      },
      {
        kind: "prose",
        heading: "Results, limits, and why it matters here",
        text: "On the 27B MoE model, mHC eliminates the loss spikes and gradient-norm blowups seen in HC, achieves a final loss 0.021 lower than the baseline, beats the baseline on all eight reported benchmarks, and beats HC on most, with +2.1 on BBH and +2.3 on DROP. The limits are stated in the paper's own terms: the Sinkhorn projection is approximate at 20 iterations, so the backward gain deviates slightly from one; the overhead is real, if small; and validation stops at 27B, far below the frontier scale where the instability it fixes was most feared. The reason this paper sits in the curriculum is the last mile: V4 adopts mHC for its million-token stack, which makes this the rare methods paper whose component ships in the next flagship release.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Hyper-Connections buy expressivity by widening and mixing the residual stream, but the unconstrained mixing matrix destroys the identity-mapping guarantee and makes large-scale training unstable. The paper asks whether the expressivity can be kept while the stability guarantee is restored by construction.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "The manifold argument in Section 2: why doubly stochastic matrices give conservation, a spectral-norm bound, and closure under composition. Then read the systems section, because the 6.7 percent overhead is the difference between a theoretical fix and a usable one. The signal-propagation analysis with the gain measurements is the evidence for the diagnosis.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "MoE models at 3B, 9B, and 27B parameters, plus a 3B run on 1T tokens for token scaling. Composite gain magnitude about 1.6 for mHC versus up to about 3000 for HC. Final loss 0.021 below the baseline, stable gradient norms, wins on eight downstream benchmarks including +2.1 BBH and +2.3 DROP over HC. Training overhead 6.7 percent at expansion rate n = 4 with the full optimization stack, Sinkhorn at 20 iterations.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The projection is approximate, so the gain bound holds only up to the residual Sinkhorn error; the overhead, while small, is not zero; and the largest validated model is 27B, so extrapolation to frontier scale is an argument rather than a measurement. The doubly stochastic constraint deliberately narrows the architecture's expressive range, which the authors accept as the price of stability.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When you generalize a stabilizing mechanism, write down the property that made it stable and enforce it geometrically. Identity mapping is a special case of a convex combination; the Birkhoff polytope is the set where that property survives composition. Then budget for kernels, because a constraint that is mathematically clean but five times slower will not ship.",
      },
    ],
    questions: [
      {
        id: "mhc-q1",
        prompt: "What problem do Hyper-Connections introduce?",
        options: [
          "They shrink the residual stream to one vector",
          "The learned forward mixing matrix is unconstrained, so composed across layers it can amplify or attenuate signals exponentially, causing instability at scale",
          "They remove attention from the block",
          "They force all layers to share weights",
        ],
        answer: 1,
        explanation:
          "HC widens the stream and adds learned read, write, and forward matrices. The forward matrix has no bound on its spectral norm, so the product over many layers can grow without limit; the paper measures gain magnitudes up to about 3000.",
      },
      {
        id: "mhc-q2",
        prompt:
          "Why is the Birkhoff polytope the right manifold for the forward matrix?",
        options: [
          "It makes the matrix sparse for fast kernels",
          "Doubly stochastic matrices act as convex combinations, have spectral norm at most one, and the set is closed under multiplication, so the bound holds at any depth",
          "It guarantees the matrix is invertible",
          "It forces the streams to be identical",
        ],
        answer: 1,
        explanation:
          "The three properties are exactly what the identity connection used to provide for free: no amplification, bounded composition, and conservation of the stream average. Invertibility is irrelevant, and convex combination still allows genuine mixing among streams.",
      },
      {
        id: "mhc-q3",
        prompt: "What does the Sinkhorn-Knopp step do in mHC?",
        options: [
          "It sorts the experts by load",
          "It alternately normalizes rows and columns of the exponentiated learned matrix until both sum to one, projecting it onto the doubly stochastic manifold differentiably",
          "It compresses the KV cache",
          "It computes the loss scaling factor",
        ],
        answer: 1,
        explanation:
          "The learned values are exponentiated to be positive, then row and column normalization are alternated. Twenty iterations make the result approximately doubly stochastic, and the whole operation is differentiable and cheap because the stream count is small.",
      },
      {
        id: "mhc-q4",
        prompt:
          "What did the engineering work buy, and why does it matter?",
        options: [
          "It removed the constraint entirely",
          "Kernel fusion, mixed precision, selective recomputation, and DualPipe overlap cut the overhead to 6.7 percent at expansion rate 4, making the stability fix practical to train",
          "It doubled the expansion rate",
          "It eliminated the need for a residual path",
        ],
        answer: 1,
        explanation:
          "A constraint that is too slow will not be used. The fused kernels run the entire Sinkhorn iteration in one operation, and the memory and overlap optimizations keep the extra cost small enough to be a rounding error on a large run.",
      },
      {
        id: "mhc-q5",
        prompt:
          "Which limit does the paper itself acknowledge?",
        options: [
          "The method cannot train at 3B scale",
          "The projection is approximate at 20 Sinkhorn iterations and the largest validated model is 27B, so frontier-scale behavior is argued rather than measured",
          "The method only works with dense models",
          "Doubly stochastic matrices cannot be multiplied",
        ],
        answer: 1,
        explanation:
          "The paper is explicit about the approximation and about the validation range. The closure property it relies on is exactly about multiplication, so that last option is the opposite of the mathematics.",
      },
    ],
    practice: {
      concepts: ["la-matrix-ops", "la-eigen-inverse"],
      articles: ["art-eigenvectors", "art-gradient-descent"],
      problems: ["dl-370", "dl-384", "dl-401"],
    },
    project: {
      title: "Bound the residual mixing with a 2x2 Sinkhorn projection",
      pitch: "Build an 8-layer residual stream with two parallel channels per layer and compare three forward mixings on a sin(x) regression: identity, a learned unconstrained 2x2 matrix, and a matrix projected to the doubly stochastic manifold. Report the final loss and the spectral norm of the composite mixing matrix.",
      difficulty: "advanced",
      timeEstimate: "4-6 hours",
      milestones: [
        "Implement the forward pass in train: X' = B X + c*tanh(X) from X0 = [x, 0], loss = (sum(X_L) - y)^2, with B from build_B (identity, raw, or Sinkhorn).",
        "Backprop manually through all 8 layers, accumulating gradients for c and the mixing parameters over the 64 training points.",
        "Add the Sinkhorn chain rule for mhc: B = [[p, 1-p], [1-p, p]], so the diagonal gets p*(1-p)/2 and the off-diagonal its negative.",
        "Run full-batch SGD for 800 steps at learning rate 0.15 for all three variants.",
        "Implement gain: multiply the B matrices in order, then return the square root of the top eigenvalue of M-transpose times M.",
        "Print mse and gain per variant and check that mhc gain is 1.0 while hc gain drifts away from it.",
      ],
      starterCode: `import math, random
random.seed(0)
# EXPECTED before TODOs: "target sin(x) on [-3, 3], 8 layers, LR 0.15" then "unimplemented:
# TODO: gain". After 800 steps: plain mse ~0.31 gain 1.0; hc mse ~0.009 gain ~1.78; mhc ~0.002 gain 1.0.
L, N, STEPS, LR = 8, 64, 800, 0.15
DATA = [(x, math.sin(x)) for x in [-3 + 6 * i / (N - 1) for i in range(N)]]
def build_B(kind, raw, l):
    if kind == "plain":
        return [[1.0, 0.0], [0.0, 1.0]]
    if kind == "hc":
        return raw[l]
    e = [[math.exp(v) for v in row] for row in raw[l]]
    a = math.sqrt(e[0][0] * e[1][1]); b = math.sqrt(e[0][1] * e[1][0]); p = a / (a + b)
    return [[p, 1 - p], [1 - p, p]]
def init(kind):
    if kind == "plain":
        return None
    base = [[0.95, 0.05], [0.05, 0.95]] if kind == "hc" else [[2.0, -2.0], [-2.0, 2.0]]
    return [[row[:] for row in base] for _ in range(L)]
def gain(kind, raw):
    """TODO: multiply the L mixing matrices in order and return the largest
    singular value of the product (top eigenvalue of M^T M, square root)."""
    raise NotImplementedError("TODO: gain")
def train(kind, steps=STEPS):
    """TODO: c starts at 0.1 per stream; forward X' = B X + c*tanh(X); loss
    (sum(X_L) - y)^2; manual backprop (Sinkhorn chain rule for mhc);
    full-batch SGD with LR. Return (mean loss, gain(kind, raw))."""
    raise NotImplementedError("TODO: train")
print("target sin(x) on [-3, 3],", L, "layers, LR", LR)
try:
    for kind in ("plain", "hc", "mhc"):
        mse, g = train(kind)
        print(kind, "mse", round(mse, 4), " gain", round(g, 3))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "Plain residual ends near mse 0.31 with gain 1.0, and mhc ends below mse 0.01 with gain between 0.999 and 1.001.",
        "The hc composite gain is printed and is not 1.0 (amplified or decayed), and hc final mse is worse than mhc.",
        "Raising the learning rate to 0.2 makes hc non-finite while mhc still finishes with a finite loss.",
      ],
      stretch: [
        "Expand to three streams and implement the general Sinkhorn-Knopp iteration with 20 rounds; check rows and columns sum to one.",
        "Track gain every 100 steps and report whether hc's gain crosses 1 during training.",
        "Scale B toward identity and measure how much the stability bound costs in final loss.",
      ],
      relatedProblemIds: ["dl-370", "dl-384", "dl-401"],
    },
  },
  {
    id: "engram",
    slug: "engram",
    title:
      "Conditional Memory via Scalable Lookup: A New Axis of Sparsity for Large Language Models",
    short: "Engram",
    year: 2026,
    date: "2026-01-12",
    arxivId: "2601.07372",
    url: "https://arxiv.org/abs/2601.07372",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "MoE spends capacity on computation; Engram spends it on memory. Hash N-grams to a giant embedding table, look facts up in O(1), and split the sparse budget between the two.",
    whatItIs:
      "Engram is DeepSeek's proposal for a second axis of sparsity. Mixture-of-experts scales capacity by choosing which parameters compute a token, but the model still has to reconstruct static knowledge - names, formulas, idioms - through dynamic computation. Engram instead modernizes the classic N-gram embedding table into a conditional memory module: the token's recent N-grams are hashed to indices, the corresponding rows of a large embedding table are looked up in constant time, and a contextual gate fuses the retrieved memory into the hidden state. The paper frames the design question as a sparsity allocation problem - how much of a fixed sparse parameter budget should be computation and how much memory - and finds a U-shaped curve whose optimum is roughly 75 to 80 percent MoE and 20 to 25 percent memory. An Engram-27B model built by converting experts into a 5.7B-parameter memory table beats its strictly iso-parameter, iso-FLOPs MoE baseline across knowledge, reasoning, code, and math benchmarks, with the largest gains on reasoning rather than recall, and it lifts long-context retrieval from 84.2 to 97.0 on multi-query needle-in-a-haystack. The code is open.",
    theoryMinutes: 14,
    lineage: {
      from: "deepseek-v3",
      context:
        "A research satellite that grows out of the MoE line rather than the model line. It uses DeepSeekMoE models as the baseline it reallocates against, and its finding - that lookup is a complement to computation, not a replacement - is the kind of architectural claim the V-series kept testing at scale.",
      improved: [
        "Names a new sparsity axis: conditional memory, where static knowledge is retrieved by hash lookup instead of recomputed by experts.",
        "Modernizes N-gram embeddings with tokenizer compression, multi-head hashing, contextualized gating, and multi-branch integration so a huge table can be trained and served.",
        "Formulates the sparsity allocation problem and measures a U-shaped scaling law: reallocating about 20 to 25 percent of sparse parameters from experts to memory minimizes loss, and pure MoE is suboptimal.",
        "Scales to Engram-27B, which beats a strictly iso-parameter and iso-FLOPs MoE baseline on knowledge (MMLU about +3), reasoning (BBH +5.0, ARC-Challenge +3.7), and code and math (HumanEval +3.0, MATH +2.4).",
        "Improves long-context retrieval substantially (multi-query needle-in-a-haystack 84.2 to 97.0) and enables host-memory offload through deterministic addressing with negligible runtime overhead.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Two ways to spend capacity",
        text: "A transformer stores knowledge in its weights, and at inference it retrieves that knowledge by computing: attention routes information and the feed-forward network reconstructs facts from distributed parameters. That is powerful and flexible, but it is also wasteful for knowledge that is fixed and local - a frequent phrase, a named entity, a formula, a code idiom. A lookup table answers those in one step, and a lookup is exactly what the model does not have. The paper's argument is that computation and memory are different resources with different costs, and a sparse model should allocate capacity to both rather than putting everything into experts.",
      },
      {
        kind: "prose",
        heading: "What Engram is, mechanically",
        text: "The module takes the last few tokens and forms their N-grams, compresses them through the tokenizer's structure so semantically equivalent suffixes share keys, hashes each compressed N-gram with several independent hash heads, and gathers the corresponding rows from a very large embedding table. Because the keys are hash indices, the lookup is constant time and, crucially, deterministic: the indices are known as soon as the token sequence is, before the layer that consumes them runs. A learned gate conditioned on the current hidden state decides how much retrieved memory to mix into the stream, and multiple branches let different N-gram orders contribute in parallel. The retrieved vectors are static, but how much they matter is contextual, which is the difference between a memory module and a lookup bolted onto a language model.",
      },
      {
        kind: "formula",
        label: "The sparsity allocation problem",
        expression:
          "rho = memory_params / (memory_params + expert_params)\nloss(rho) is U-shaped: minimum near rho ~ 0.20-0.25\npure MoE (rho = 0) is suboptimal",
        why: "The total sparse budget is fixed, so every parameter given to memory is a parameter taken from experts. If memory were a substitute for computation, loss would fall monotonically as rho grows; if it were useless, loss would rise monotonically. The measured U shape says it is a complement: some memory frees experts from static reconstruction, and too much memory starves the computation that handles the dynamic parts. In the paper's 10B-scale experiments the optimum sits at roughly rho = 0.20 to 0.25, stable across compute regimes.",
      },
      {
        kind: "code",
        title: "A hashed N-gram lookup",
        language: "python",
        code: `def ngram_keys(tokens, n=3, heads=8, table_size=10**7):
    """Deterministic keys: same suffix -> same key, computable before the
    layer runs, which is what allows host-memory prefetch."""
    keys = []
    for start in range(max(0, len(tokens) - n), len(tokens)):
        suffix = tokens[start:]
        for h in range(heads):
            hsh = h + 1                      # seed each head differently
            for token in suffix:
                hsh = (hsh * 31 + token) % table_size
            keys.append((h, hsh))
    return keys

def engram_read(embedding_table, keys, gate):
    # each key gathers one row; the gate weights the fused result
    rows = [embedding_table[k] for k in keys]
    fused = [sum(r[i] for r in rows) / len(rows) for i in range(len(rows[0]))]
    return [gate * f for f in fused]

# table_size can be very large: the memory is the point, and static addressing
# means it can live off the GPU with prefetching.`,
        notes: [
          "The rolling hash is written out on purpose: Python's built-in hash() is randomized per process, so it would break the promise that the same suffix always maps to the same row.",
          "Multi-head hashing is a collision mitigation: several independent hashes make it unlikely that all heads collide for the same N-gram.",
          "Tokenizer compression groups suffixes that decode to the same text, so the table is not wasted on byte-level variants.",
          "The paper instantiates Engram at selected layers (2 and 15 in the 27B model) with N-gram order up to 3, 8 heads, and dimension 1280.",
        ],
      },
      {
        kind: "visual",
        visual: "moe-routing",
        caption:
          "Two sparse paths for one token: experts selected by the router for dynamic computation, and N-gram rows selected by hash for static memory. The allocation law decides how the parameter budget splits between them.",
      },
      {
        kind: "prose",
        heading: "The 27B experiment",
        text: "The main result is a controlled conversion. Start from an MoE-27B model with 72 routed experts per layer, remove 17 of them, and spend the freed parameters on a 5.7B-parameter Engram table, giving an allocation ratio of 74.3 percent computation and 25.7 percent memory at the same total size of 26.7 billion parameters. Train both with the same tokens and the same FLOP budget. Engram-27B improves on the baseline across every reported domain: MMLU about +3, CMMLU +4.0, MMLU-Pro +1.8, BBH +5.0, ARC-Challenge +3.7, DROP +3.3, HumanEval +3.0, MBPP +1.6, GSM8K +2.2, MATH +2.4. The pattern is the interesting part: gains on reasoning and code exceed the gains on knowledge tests, which is the opposite of what a pure lookup table should buy.",
      },
      {
        kind: "prose",
        heading: "Why reasoning improves",
        text: "The mechanistic analysis offers an explanation: with static patterns handled by lookup, the early layers no longer spend their capacity reconstructing them, which effectively deepens the network available for reasoning, and attention is freed from local bookkeeping to handle global context. The long-context numbers support the second half: multi-query needle-in-a-haystack rises from 84.2 to 97.0, and variable tracking from 77.0 to 89.0. The paper also trains an Engram-40B variant, which continues to reduce loss and improve most benchmarks, though the authors note it is under-trained at the current token budget.",
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "Gains over an iso-parameter, iso-FLOPs MoE baseline: about +3 MMLU, +5.0 BBH, +3.7 ARC-Challenge, +3.0 HumanEval, +2.4 MATH, plus a large long-context retrieval jump - from reallocating roughly a quarter of sparse parameters from experts to memory.",
      },
      {
        kind: "prose",
        heading: "Systems: deterministic addressing",
        text: "A giant embedding table is only practical if it does not have to sit in HBM next to the experts. Engram's keys are static functions of the token sequence, so the next lookup's indices can be computed before the corresponding layer executes, which makes prefetching from host memory possible and decouples storage from compute. The paper reports negligible overhead from the offload and treats this infrastructure-aware property as a first-class design goal rather than a side effect. It is the same instinct as the sparse-attention line: the arithmetic is only half the design; the memory hierarchy decides whether the arithmetic's advantage is real.",
      },
      {
        kind: "prose",
        heading: "Limits and how to read it",
        text: "The evidence comes from 27B and 40B models trained at research scale, not from a frontier release, so the allocation law is measured in a range where the U shape could still shift. The optimum is stable across the compute regimes tested, but those regimes are small by the standards of the V-series. The memory table is large, and while offload makes it affordable, it is still memory that must be stored and served. The U shape is empirical: the paper does not derive the optimum from theory, so treat it as a measured regularity rather than a constant. Read this alongside the V4.1-Flash entry, which ships a 196B-parameter Engram in a production model, as the first evidence that the idea scales beyond the paper.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Sparse models allocate all their conditional capacity to computation, forcing experts to reconstruct static knowledge that a lookup could return directly. The paper asks whether memory should be a second sparse axis, and how a fixed budget should be split between the two.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Three pieces: the Engram module's design (tokenizer compression, multi-head hashing, contextual gating, multi-branch integration), the sparsity allocation problem and its U-shaped curve, and the mechanistic analysis of why reasoning improves. Read the iso-parameter, iso-FLOPs comparison, because that is the control that makes the result meaningful.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "A U-shaped validation-loss curve with the optimum near 20 to 25 percent memory allocation, stable across the tested compute regimes; in the 10B regime, loss improves from 1.7248 at pure MoE to 1.7109 near the optimum. Engram-27B (5.7B memory, 55 routed experts, 26.7B total) improves MMLU about +3, CMMLU +4.0, MMLU-Pro +1.8, BBH +5.0, ARC-Challenge +3.7, DROP +3.3, HumanEval +3.0, MBPP +1.6, GSM8K +2.2, MATH +2.4, and lifts multi-query NIAH from 84.2 to 97.0 and variable tracking from 77.0 to 89.0. An Engram-40B variant continues improving but is under-trained.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The allocation law is empirical and measured at research scale; the largest model is 40B and under-trained. The memory table adds storage and serving complexity even when offloaded, and the gains are reported against one baseline architecture. The paper frames conditional memory as an indispensable primitive for future sparse models, which is a hypothesis its own experiments support but do not prove at frontier scale.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If a fixed fact is cheap to look up, do not make a network recompute it. When you have a sparse budget, try spending part of it on memory and measure the allocation curve rather than assuming more computation is always better. Prefer deterministic addressing, because it converts a memory-capacity problem into a prefetch scheduling problem, which is much easier to solve.",
      },
    ],
    questions: [
      {
        id: "eng-q1",
        prompt: "What does Engram add to a sparse model?",
        options: [
          "A second attention mechanism",
          "A conditional memory module: hashed N-gram lookups into a large embedding table, gated into the hidden state",
          "A larger tokenizer vocabulary",
          "A dense feed-forward layer",
        ],
        answer: 1,
        explanation:
          "Engram retrieves static N-gram memory by hash lookup in constant time and fuses it through a context-dependent gate. It complements MoE's conditional computation rather than replacing it, and the paper calls the pair two axes of sparsity.",
      },
      {
        id: "eng-q2",
        prompt:
          "The allocation curve is U-shaped with an optimum near 20 to 25 percent memory. What does the shape mean?",
        options: [
          "Memory and computation are substitutes, so more memory always helps",
          "Memory is useless for language modeling",
          "Memory and computation are complements: some memory frees experts from static reconstruction, but too much starves dynamic computation",
          "The optimum is a measurement artifact",
        ],
        answer: 2,
        explanation:
          "A monotone curve would mean one resource dominates. The U shape says the best model mixes them: memory handles static patterns cheaply, experts handle the dynamic reasoning, and the budget should be split rather than concentrated.",
      },
      {
        id: "eng-q3",
        prompt:
          "In the Engram-27B comparison, what exactly is held constant?",
        options: [
          "Only the parameter count",
          "Total parameters and per-token FLOPs: 17 routed experts are converted into a 5.7B-parameter memory table, and both models train on the same tokens",
          "Only the number of layers",
          "Nothing; the comparison is between different model families",
        ],
        answer: 1,
        explanation:
          "The Engram model is derived from the MoE baseline by removing 17 of 72 routed experts per layer and spending the parameters on memory, keeping the total at 26.7B and the FLOPs matched. That control is what makes the gains attributable to the allocation rather than to more capacity.",
      },
      {
        id: "eng-q4",
        prompt:
          "Which result is most surprising, given that Engram is a memory mechanism?",
        options: [
          "MMLU improves",
          "Reasoning benchmarks improve more than knowledge benchmarks (BBH +5.0, ARC-Challenge +3.7)",
          "The embedding table is large",
          "Training converges",
        ],
        answer: 1,
        explanation:
          "A lookup table should help recall, so the large reasoning gains are the puzzle. The paper's mechanistic analysis suggests memory relieves early layers of static reconstruction, effectively deepening the network, and frees attention capacity for global context - which shows up as better long-context retrieval too.",
      },
      {
        id: "eng-q5",
        prompt: "Why does deterministic addressing matter operationally?",
        options: [
          "It makes the hash function collision-free",
          "Because keys depend only on the token sequence, the next lookup's indices are known before the layer runs, so the table can be prefetched from host memory with negligible overhead",
          "It removes the need for a gate",
          "It reduces the table size",
        ],
        answer: 1,
        explanation:
          "Routing-based MoE activations depend on hidden states and cannot be prefetched with certainty; Engram's hash keys can. That decoupling of storage and compute is what makes a very large embedding table practical to serve.",
      },
    ],
    practice: {
      concepts: ["info-entropy", "ml-probabilistic"],
      articles: ["art-embeddings", "art-rag"],
      problems: ["nlp-026", "dl-017", "dl-003"],
    },
    project: {
      title: "Hash trigram memory and measure the collision cost",
      pitch: "Build a conditional memory for a synthetic 48-symbol stream: hash each trigram to a bucket of next-symbol counts, look it up through one or two hash heads, and compare the bucket hit rate and perplexity against a smoothed unigram baseline.",
      difficulty: "intermediate",
      timeEstimate: "3-4 hours",
      milestones: [
        "Fill lookup: gather the count vector from every hash head, sum them, and return all zeros when no bucket was seen.",
        "Fill evaluate: build the memory from the training tokens, smooth the unigram backoff with ALPHA, and walk the held-out tokens.",
        "Track the hit rate as the fraction of test positions whose summed counts are nonzero, and the perplexity.",
        "Run one head and two heads at 4096 buckets and check that two heads lowers perplexity and raises the hit rate.",
        "Sweep bucket counts 256, 1024, and 4096 and report the perplexity trend.",
        "Compare the best memory perplexity with the unigram baseline and state the improvement factor.",
      ],
      starterCode: `import math, random
random.seed(0)
# EXPECTED before TODOs: "synthetic corpus: 20000 train + 5000 test tokens, vocab 48" then
# "unimplemented: TODO: lookup". After: unigram ppl ~48; (1 head, 4096) hit ~0.94 ppl ~12.6; (2 heads, 4096) hit ~0.98 ppl ~9.5.
V, N, TEST, ALPHA = 48, 20000, 5000, 0.1
def build_corpus(n):
    toks = [random.randrange(V), random.randrange(V)]
    for i in range(2, n):
        toks.append((toks[-2] * 11 + toks[-1] * 7 + 5) % V if random.random() < 0.9 else random.randrange(V))
    return toks
def hashes(ctx, heads, M):
    a, b, c = ctx
    if heads == 1:
        return [(a * 961 + b * 31 + c) % M]
    return [(a * 961 + b * 31 + c) % M, (a * 289 + b * 17 + c * 7 + 11) % M]
def build_memory(train, heads, M):
    tables = [[[0] * V for _ in range(M)] for _ in range(heads)]
    for i in range(3, len(train)):
        for h, k in enumerate(hashes(train[i - 3:i], heads, M)):
            tables[h][k][train[i]] += 1
    return tables
def lookup(tables, ctx, M):
    """TODO: sum the count vectors gathered by every hash head (zeros if unseen)."""
    raise NotImplementedError("TODO: lookup")
def evaluate(train, test, heads, M):
    """TODO: build memory plus smoothed unigram backoff; return hit rate and ppl."""
    raise NotImplementedError("TODO: evaluate")
train, test = build_corpus(N), build_corpus(TEST)
print("synthetic corpus:", N, "train +", TEST, "test tokens, vocab", V)
try:
    for heads, M in ((1, 4096), (2, 4096)):
        hit, ppl = evaluate(train, test, heads, M)
        print("heads", heads, "buckets", M, " hit rate", round(hit, 3), " ppl", round(ppl, 3))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "Two heads at 4096 buckets reach hit rate at or above 0.97 and perplexity at or below 10, against a unigram baseline near 48.",
        "The one-head run at the same size reports a lower hit rate or a higher perplexity, showing the collision cost.",
        "The full evaluation runs in under 3 seconds with the standard library.",
      ],
      stretch: [
        "Add a bigram branch to the trigram memory, weight the branches, and report whether perplexity drops.",
        "Average the per-head distributions instead of summing counts and compare.",
        "Grow the vocabulary to 200 symbols and find the bucket count where collisions stop dominating.",
      ],
      relatedProblemIds: ["nlp-026", "dl-017", "dl-003"],
    },
  },
  {
    id: "deepseek-ocr-2",
    slug: "deepseek-ocr-2",
    title: "DeepSeek-OCR 2: Visual Causal Flow",
    short: "DeepSeek-OCR 2",
    year: 2026,
    date: "2026-01-27",
    arxivId: "2601.20552",
    url: "https://arxiv.org/abs/2601.20552",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Stop reading images in raster order. Let learnable queries attend over the whole page and hand the language model a semantically reordered sequence instead of a top-left-to-bottom-right scan.",
    whatItIs:
      "DeepSeek-OCR 2 keeps the optical compression idea of the first model and replaces its encoder's CLIP block with DeepEncoder V2, an LLM-style module that reorders visual tokens before the decoder sees them. Visual tokens keep bidirectional attention so global context is preserved, while a set of learnable causal flow queries, appended after them, attend to all visual tokens and to one another in causal order. Because the queries have the same cardinality as the visual tokens, only their outputs are passed to the language decoder, and the total sequence does not grow: 256 tokens for the global view plus 144 per local crop, capped at 1120. The paper describes the result as two cascaded one-dimensional causal reasoners - the encoder chooses a reading order, the decoder reasons over it - and reports 91.09 percent on OmniDocBench v1.5, a 3.73 point gain over DeepSeek-OCR, with reading-order edit distance falling from 0.085 to 0.057 and production repetition rates dropping from 6.25 to 4.17 percent on user-log images.",
    theoryMinutes: 13,
    lineage: {
      from: "deepseek-ocr",
      context:
        "The second step in the optical compression line. The first model asked how many vision tokens a page needs; this one asks in what order those tokens should arrive. It is a small, focused change with a clear claim: the rigid raster scan that every vision-language model inherits from image grids is the wrong interface for documents.",
      improved: [
        "Replaces DeepEncoder's CLIP component with DeepEncoder V2, an LLM-style encoder whose learnable causal flow queries reorder visual tokens by semantics before the decoder reads them.",
        "Keeps visual tokens under bidirectional attention for global modeling while queries run causal attention, combining both in one customized attention mask.",
        "Preserves the token budget: queries have the same cardinality as visual tokens, so only query outputs are forwarded and the sequence stays at 256 to 1120 tokens, at or below the previous model's 1156.",
        "Raises OmniDocBench v1.5 to 91.09 percent, a 3.73 point gain over DeepSeek-OCR, and cuts reading-order edit distance from 0.085 to 0.057.",
        "Improves production robustness: repetition rate falls from 6.25 to 4.17 percent on online user-log images and from 3.69 to 2.88 percent on PDF data production.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The raster scan is an assumption, not a law",
        text: "Vision-language models flatten an image grid in a fixed order, usually left to right, top to bottom, and encode position with a fixed positional scheme. Language models, meanwhile, read causal sequences. For a photograph the order hardly matters; for a page it matters a great deal, because a document has a logical reading order that a raster scan does not follow. Multi-column layouts, sidebars, figures with captions, and tables all break the assumption, and the model pays for it in the reading-order mistakes that show up downstream as garbled output. The paper's premise is that the order should be decided from the image's semantics rather than imposed by the grid.",
      },
      {
        kind: "prose",
        heading: "DeepEncoder V2: bidirectional seeing, causal ordering",
        text: "The encoder keeps DeepSeek-OCR's window-attention perception stage and the 16x compressor, and swaps the CLIP block for a small LLM-style stack with a custom mask. Visual tokens are processed bidirectionally, exactly as a vision encoder would, so each token sees the whole page and global modeling is not lost. Appended after them is a set of learnable query tokens - the causal flow queries - that run causal attention: each query attends to every visual token and to the queries before it. The queries therefore form a sequence that progressively summarizes the page in a chosen order, and because there are as many queries as visual tokens, the outputs can replace the visual sequence one for one. Only the query outputs are handed to the language decoder, which then reasons over an already-ordered sequence with its ordinary causal attention.",
      },
      {
        kind: "formula",
        label: "The dual-stream attention mask",
        expression:
          "M = [ [ 1, 0 ],\n      [ 1, LowerTri(Q) ] ]\nvisual tokens: bidirectional block (top-left all ones)\nqueries: causal block (bottom-right lower triangular)",
        why: "The mask is the mechanism. The top-left block lets every visual token attend to every other visual token, preserving the global view. The bottom-left block lets every query attend to all visual tokens, so ordering decisions see the whole page. The bottom-right block is causal, so query i only sees queries before it and the ordering process is itself autoregressive. The top-right zeros keep visual tokens from peeking at the queries, so the visual representation is not contaminated by the ordering that is being derived from it.",
      },
      {
        kind: "code",
        title: "Building the mask for one crop",
        language: "python",
        code: `def dual_mask(n_visual, n_query):
    """True means 'may attend'. Visual block bidirectional, query block causal."""
    size = n_visual + n_query
    mask = [[False] * size for _ in range(size)]
    for i in range(n_visual):                      # visual -> visual
        for j in range(n_visual):
            mask[i][j] = True
    for i in range(n_visual, size):                # query -> all visual
        for j in range(n_visual):
            mask[i][j] = True
        for j in range(n_visual, i + 1):           # query -> earlier queries
            mask[i][j] = True
    return mask

# 144 local queries per crop, 256 global queries; query outputs alone are fed
# to the LLM decoder, so the token count the decoder sees does not grow.`,
        notes: [
          "Equal cardinality is the trick that keeps the token budget flat: the queries do not add tokens, they replace the visual tokens in the decoder's input.",
          "The global view uses 256 queries and each local crop 144, so the sequence ranges from 256 to 1120 tokens - lower than the previous model's 1156 and matching Gemini-3-Pro's stated maximum visual token budget.",
          "Because only query outputs are forwarded, the decoder never sees the raw visual tokens; it sees a causally ordered summary of them.",
        ],
      },
      {
        kind: "visual",
        visual: "vision-tower",
        caption:
          "DeepEncoder V2: window-attention perception and the 16x compressor feed an LLM-style block where visual tokens attend bidirectionally and causal flow queries reorder them; only the ordered query outputs reach the decoder.",
      },
      {
        kind: "prose",
        heading: "Two cascaded one-dimensional reasoners",
        text: "The paper's conceptual framing is worth taking seriously: a two-dimensional image is being understood by two one-dimensional causal processes in series. The encoder's queries perform reading-logic reasoning, deciding an order; the decoder performs task reasoning over the sequence that order produced. Neither stage has to model two dimensions at once, which is precisely why the arrangement is efficient - each is a standard causal sequence model doing what it is good at. The paper calls the decomposition a possible route toward genuine 2D reasoning and is careful to say it is a long journey: multi-hop re-examination of a page would need longer causal flow sequences than the visual tokens they replace.",
      },
      {
        kind: "prose",
        heading: "Results, production behavior, and limits",
        text: "On OmniDocBench v1.5 the model reaches 91.09 percent, up 3.73 points from DeepSeek-OCR under similar training data, while reading-order edit distance falls from 0.085 to 0.057 - the metric that most directly reflects the reordering claim. In production, where ground truth is unavailable, the reported signal is repetition rate: 6.25 to 4.17 percent on online user-log images and 3.69 to 2.88 percent on PDF data generation, which matters because repetition is the failure mode that ruins batch document processing. The limits are the flip side of the design: the method is validated on OCR and document understanding rather than general visual reasoning; the query count is fixed equal to the visual token count, so the reordering is single-pass rather than iterative; and the paper states that genuine 2D reasoning needs longer causal flow sequences and remains future work. The token budget claim is comparative rather than absolute: it is at or below the previous model and matches one frontier system's stated maximum, not a new low.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Every vision-language model feeds image tokens to the language model in a fixed raster order with fixed positional encoding, which contradicts how documents are actually read. The paper asks whether the encoder can choose a semantic reading order before the decoder begins.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "The attention mask and the equal-cardinality query design. Section 2 describes DeepEncoder V2 and the mask; Section 4 reports OmniDocBench and the reading-order metric; Section 5 adds production measurements. Read the reading-order edit distance as the direct test of the central claim, since overall OCR accuracy can improve for unrelated reasons.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "OmniDocBench v1.5: 91.09 percent, +3.73 over DeepSeek-OCR under similar training data. Reading-order edit distance: 0.085 to 0.057. Production repetition rate: 6.25 to 4.17 percent on online user-log images and 3.69 to 2.88 percent on PDF production. Token budget: 256 to 1120 reordered tokens (256 global plus 144 per local crop), versus DeepSeek-OCR's 1156 maximum.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The scope is OCR and document understanding; general visual reasoning is not evaluated. The reordering is single-pass because queries equal visual tokens in count, and the paper says multi-hop reordering needs longer flow sequences. Comparisons are against the authors' previous model and a small set of systems, and the production numbers are repetition rates rather than accuracy because labels do not exist in production.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "The order in which you feed a model its input is part of the architecture, not a preprocessing detail. When a fixed scan order conflicts with the data's structure, a small learned module that chooses the order can pay off without changing the token budget - the trick is making the chooser produce exactly as many outputs as the tokens it replaces. And evaluate the property you changed: reading-order distance, not just aggregate OCR score.",
      },
    ],
    questions: [
      {
        id: "ocr2-q1",
        prompt: "What is the central change from DeepSeek-OCR to DeepSeek-OCR 2?",
        options: [
          "A larger language decoder",
          "DeepEncoder V2 replaces the CLIP block with an LLM-style module whose causal flow queries reorder visual tokens by semantics",
          "A new VQ tokenizer",
          "Higher input resolution",
        ],
        answer: 1,
        explanation:
          "The perception stage and the compressor stay; the CLIP component becomes a dual-stream encoder where visual tokens attend bidirectionally and learnable queries attend causally to produce a semantic reading order before the decoder runs.",
      },
      {
        id: "ocr2-q2",
        prompt: "Why can the reordering happen without increasing the token count?",
        options: [
          "The queries are compressed to a single token",
          "The number of causal flow queries equals the number of visual tokens, so the query outputs replace the visual sequence one for one",
          "The visual tokens are discarded before the decoder",
          "The decoder uses no attention",
        ],
        answer: 1,
        explanation:
          "Equal cardinality is the design constraint that keeps the budget flat: 256 global queries and 144 per local crop produce a sequence of 256 to 1120 tokens, at or below the previous model's 1156, and only the query outputs are forwarded.",
      },
      {
        id: "ocr2-q3",
        prompt: "In the dual-stream mask, what is the purpose of the bottom-left block?",
        options: [
          "It lets visual tokens see the queries",
          "It lets every causal flow query attend to all visual tokens, so the ordering decision sees the whole page",
          "It blocks the queries from attending to anything",
          "It makes the visual tokens causal",
        ],
        answer: 1,
        explanation:
          "The mask has three active blocks: visual-to-visual bidirectional, query-to-visual all-to-all, and query-to-earlier-query causal. The top-right block is zeros so visual tokens never see the queries, keeping the visual representation independent of the ordering being derived.",
      },
      {
        id: "ocr2-q4",
        prompt:
          "Which metric most directly supports the claim that the encoder learned a better reading order?",
        options: [
          "The overall OCR accuracy on OmniDocBench",
          "The reading-order edit distance, which falls from 0.085 to 0.057",
          "The repetition rate in production",
          "The parameter count of DeepEncoder V2",
        ],
        answer: 1,
        explanation:
          "Overall accuracy can improve for many reasons; reading-order edit distance measures whether the emitted sequence follows the document's logical order, which is the specific property the architecture changes. Repetition rate is a production robustness signal rather than an ordering metric.",
      },
      {
        id: "ocr2-q5",
        prompt: "How does the paper frame the architecture's significance?",
        options: [
          "As a complete solution to 2D reasoning",
          "As two cascaded one-dimensional causal reasoners - one choosing a reading order, one solving the task - with genuine 2D reasoning explicitly left as future work",
          "As a general-purpose vision model",
          "As a replacement for the language decoder",
        ],
        answer: 1,
        explanation:
          "The paper proposes the cascade as a promising route toward 2D reasoning and is explicit that the goal is far off: iterative re-examination would require more causal flow tokens than visual tokens, which the current equal-cardinality design does not provide.",
      },
    ],
    practice: {
      concepts: ["stats-correlation", "la-vectors"],
      articles: ["art-attention", "art-embeddings"],
      problems: ["cv-175", "cv-249", "cv-393"],
    },
    project: {
      title: "Reorder a two-column page and decode it causally",
      pitch: "A two-column page is stored as six blocks of two words each. Raster order reads across columns and breaks the bigram context; fit a positional scorer that sorts blocks into true reading order, decode both orderings with a causal bigram-greedy decoder, and compare word accuracy and Kendall order distance.",
      difficulty: "advanced",
      timeEstimate: "4-6 hours",
      milestones: [
        "Fill build_page: sample a 12-word bigram chain and place the words into blocks in column-major reading order.",
        "Fill decode: for each block in the given order, pick the candidate word with the best BETA-weighted bigram log-prob given the previously decoded word.",
        "Fill fit_order: run the perceptron over the ordered block pairs until sorting by w[0]*col + w[1]*row reproduces the reading order.",
        "Run raster and flow orderings over 200 pages and report word accuracy and Kendall distance for each.",
        "Confirm the flow order reaches distance 0.0 and beats raster word accuracy by at least 0.2.",
        "Compare BETA 1 and BETA 3 and report how much the causal context is worth.",
      ],
      starterCode: `import math, random
random.seed(0)
# EXPECTED before TODOs: "unimplemented: TODO: fit_order". After: raster word accuracy ~0.29 with
# order distance 0.2; flow accuracy ~0.74 with order distance 0.0.
V, COLS, ROWS, WPB, BETA, PAGES = 16, 2, 3, 2, 3.0, 200
TRUTH = [(c, r) for c in range(COLS) for r in range(ROWS)]; RASTER = [(c, r) for r in range(ROWS) for c in range(COLS)]
bigram = []
for a in range(V):
    row = [random.random() for _ in range(V)]; row[(a * 5 + 3) % V] += 4.0
    s = sum(row); bigram.append([math.log(x / s) for x in row])
def build_page():
    """TODO: 12-word bigram chain; block (c, r) holds the WPB words at index (c*ROWS+r)*WPB."""
    raise NotImplementedError("TODO: build_page")
def decode(order, blocks):
    """TODO: per block in the given order, pick the block candidate with the best BETA-weighted bigram log-prob."""
    raise NotImplementedError("TODO: decode")
def fit_order():
    """TODO: perceptron over ordered block pairs so sorting by w[0]*col + w[1]*row works."""
    raise NotImplementedError("TODO: fit_order")
def main():
    w = fit_order(); pos = {b: i for i, b in enumerate(TRUTH)}
    print("flow weights", [round(x, 3) for x in w])
    for label, order in (("raster", RASTER), ("flow", sorted(TRUTH, key=lambda b: w[0] * b[0] + w[1] * b[1]))):
        acc = dist = 0.0
        for _ in range(PAGES):
            blocks = build_page()
            ref = [x for b in TRUTH for x in blocks[b]]
            guess = decode(order, blocks)
            acc += sum(x == y for x, y in zip(guess, ref)) / len(ref)
            dist += sum(1 for i in range(6) for j in range(i + 1, 6) if pos[order[i]] > pos[order[j]]) / 15
        print(label, "word accuracy", round(acc / PAGES, 3), " order distance", round(dist / PAGES, 3))
try:
    main()
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "The flow ordering reaches normalized order distance 0.0 while raster stays at 0.2.",
        "Flow word accuracy is at least 0.7 while raster stays below 0.35 at the fixed seed.",
        "Both orderings run 200 pages in under 2 seconds with the standard library.",
      ],
      stretch: [
        "Add a third column and check whether the learned positional score still recovers the reading order.",
        "Replace the greedy decoder with a beam of size 3 and report the accuracy change.",
        "Add symbol noise to the vision tokens and find the level where the ordering advantage disappears.",
      ],
      relatedProblemIds: ["cv-175", "cv-249", "cv-393"],
    },
  },
];
