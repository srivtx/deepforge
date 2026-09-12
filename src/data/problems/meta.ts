import type { CategoryMeta } from "@/types/problem";

export const CATEGORIES: CategoryMeta[] = [
  { name: "Linear Algebra", blurb: "Vectors, matrices, decompositions. The bedrock of every ML primitive.", icon: "matrix" },
  { name: "Calculus", blurb: "Derivatives, gradients, Jacobians, Hessians. How things change.", icon: "gradient" },
  { name: "Statistics", blurb: "Mean, variance, covariance, distributions. What the data tells you.", icon: "histogram" },
  { name: "Probability", blurb: "Bayes, expectation, counting. The language of uncertainty.", icon: "dice" },
  { name: "ML Fundamentals", blurb: "Regressions, trees, clustering, metrics. The classic toolkit, from scratch.", icon: "tree" },
  { name: "Deep Learning", blurb: "Activations, forward pass, backprop. The core of every neural net.", icon: "neuron" },
  { name: "NLP", blurb: "Tokenize, embed, compare. Text into numbers.", icon: "text" },
  { name: "Optimization", blurb: "GD, momentum, Adam, schedules. How models actually learn.", icon: "descent" },
  { name: "Algorithms", blurb: "Search, sort, graph traversal, DP. The timeless core of computer science.", icon: "tree" },
  { name: "Data Structures", blurb: "Stacks, queues, trees, heaps, tries. The containers that make algorithms fast.", icon: "matrix" },
  { name: "Computer Vision", blurb: "Convolutions, filters, pooling, edges. Images as numbers, from scratch.", icon: "image" },
  { name: "Reinforcement Learning", blurb: "MDPs, value iteration, Q-learning, policy gradients. Agents that learn by acting.", icon: "agent" },
  { name: "Time Series", blurb: "Autocorrelation, AR, MA, ARMA, forecasts. Data that moves through time.", icon: "pulse" },
  { name: "Graph Algorithms", blurb: "PageRank, shortest paths, centrality. Networks, traversed.", icon: "graph" },
  { name: "Information Theory", blurb: "Entropy, KL divergence, mutual information. How much does a message tell you?", icon: "entropy" },
];
