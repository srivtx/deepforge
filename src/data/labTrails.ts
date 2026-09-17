export interface LabTrail {
  id: string;
  title: string;
  blurb: string;
  why: string;
  labIds: string[];
}

/**
 * Short ordered arcs through the eight hands-on labs. Within a trail the labs
 * run easier to harder; between them the four arcs cover every lab at least
 * once. Kept as plain data so tests can assert coverage without a browser.
 */
export const LAB_TRAILS: LabTrail[] = [
  {
    id: "regression-fundamentals",
    title: "Regression fundamentals",
    blurb:
      "Fit a straight line, bend it into a curve, then keep the fit steady when corrupt rows try to drag it off course.",
    why: "Closed-form least squares on clean data is the gentlest start, feature engineering for the quadratic comes next, and outlier-robust refitting is the hardest of the three.",
    labIds: ["lab-03", "lab-04", "lab-07"],
  },
  {
    id: "classification-from-scratch",
    title: "Classification from scratch",
    blurb:
      "Learn the logistic core on easy data, then carry it through keyword counts and a lopsided default rate.",
    why: "A balanced two-feature classifier teaches the boundary first; F1 on spam and credit data only lands once the logistic core is second nature.",
    labIds: ["lab-01", "lab-02", "lab-06"],
  },
  {
    id: "structure-and-representations",
    title: "Structure and representations",
    blurb:
      "Find structure without labels, then engineer the features a linear model cannot invent on its own.",
    why: "Clustering shows what unlabeled structure buys you, and XOR closes the arc by showing why the right representation beats a fancier model.",
    labIds: ["lab-05", "lab-08"],
  },
  {
    id: "failure-modes",
    title: "Failure modes and evaluation traps",
    blurb:
      "Four labs where the obvious baseline looks reasonable and still misses the metric.",
    why: "Ordered from the loudest failure to the quietest: majority-class guesses score zero F1, then thresholds, then outliers, then a boundary no straight line can draw.",
    labIds: ["lab-02", "lab-06", "lab-07", "lab-08"],
  },
];
