import { SYNTHETIC_DATASET } from '../server/dataset';
import { runRuleEngine } from '../server/rules';
import { runNaiveKeywordFilter } from '../server/naiveFilter';
import { RiskTier } from '../server/types';

interface Metrics {
  total: number;
  truePositives: number; // Threat expected, Threat detected (HIGH_RISK or SUSPICIOUS)
  trueNegatives: number; // SAFE expected, SAFE detected
  falsePositives: number; // SAFE expected, Threat detected
  falseNegatives: number; // Threat expected, SAFE detected
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

function calculateMetrics(
  evaluator: (text: string, sender?: string, claim?: string) => RiskTier
): Metrics {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (const sample of SYNTHETIC_DATASET) {
    const predictedTier = evaluator(sample.text, sample.sender, sample.claimed_identity);
    const expectedIsThreat = sample.expected_tier === 'HIGH_RISK' || sample.expected_tier === 'SUSPICIOUS';
    const predictedIsThreat = predictedTier === 'HIGH_RISK' || predictedTier === 'SUSPICIOUS';

    if (expectedIsThreat && predictedIsThreat) {
      tp++;
    } else if (!expectedIsThreat && !predictedIsThreat) {
      tn++;
    } else if (!expectedIsThreat && predictedIsThreat) {
      fp++;
    } else if (expectedIsThreat && !predictedIsThreat) {
      fn++;
    }
  }

  const total = SYNTHETIC_DATASET.length;
  const accuracy = (tp + tn) / total;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    total,
    truePositives: tp,
    trueNegatives: tn,
    falsePositives: fp,
    falseNegatives: fn,
    accuracy,
    precision,
    recall,
    f1,
  };
}

export function runEvaluation(): void {
  console.log('================================================================');
  console.log(' verifAI - AUTOMATED BENCHMARK EVALUATION ENGINE');
  console.log(` Dataset size: ${SYNTHETIC_DATASET.length} synthetic curated samples`);
  console.log(' Multi-lingual: English, Hindi (Devanagari/Romanized)');
  console.log('================================================================\n');

  // 1. Evaluate verifAI Rule Engine
  const verifAiMetrics = calculateMetrics((text, sender, claim) => {
    const res = runRuleEngine(text, 'auto', 'auto', sender, claim);
    return res.risk_tier;
  });

  // 2. Evaluate Naive Baseline
  const naiveMetrics = calculateMetrics((text) => {
    const res = runNaiveKeywordFilter(text);
    return res.tier;
  });

  console.log('--- [1] NAIVE KEYWORD FILTER BASELINE ---');
  console.log(`  Accuracy:        ${(naiveMetrics.accuracy * 100).toFixed(1)}%`);
  console.log(`  Precision:       ${(naiveMetrics.precision * 100).toFixed(1)}%`);
  console.log(`  Recall:          ${(naiveMetrics.recall * 100).toFixed(1)}%`);
  console.log(`  F1 Score:        ${(naiveMetrics.f1 * 100).toFixed(1)}%`);
  console.log(`  False Positives: ${naiveMetrics.falsePositives} (harmless messages blocked)`);
  console.log(`  False Negatives: ${naiveMetrics.falseNegatives} (phishing attacks missed)`);
  console.log('  Confusion Matrix:');
  console.log(`    [TP: ${naiveMetrics.truePositives}, FP: ${naiveMetrics.falsePositives}]`);
  console.log(`    [FN: ${naiveMetrics.falseNegatives}, TN: ${naiveMetrics.trueNegatives}]\n`);

  console.log('--- [2] verifAI DEFENSIVE HEURISTIC ENGINE ---');
  console.log(`  Accuracy:        ${(verifAiMetrics.accuracy * 100).toFixed(1)}%`);
  console.log(`  Precision:       ${(verifAiMetrics.precision * 100).toFixed(1)}%`);
  console.log(`  Recall:          ${(verifAiMetrics.recall * 100).toFixed(1)}%`);
  console.log(`  F1 Score:        ${(verifAiMetrics.f1 * 100).toFixed(1)}%`);
  console.log(`  False Positives: ${verifAiMetrics.falsePositives} (harmless messages blocked)`);
  console.log(`  False Negatives: ${verifAiMetrics.falseNegatives} (phishing attacks missed)`);
  console.log('  Confusion Matrix:');
  console.log(`    [TP: ${verifAiMetrics.truePositives}, FP: ${verifAiMetrics.falsePositives}]`);
  console.log(`    [FN: ${verifAiMetrics.falseNegatives}, TN: ${verifAiMetrics.trueNegatives}]\n`);

  console.log('--- PERFORMANCE COMPARISON SUMMARY ---');
  const accDiff = ((verifAiMetrics.accuracy - naiveMetrics.accuracy) * 100).toFixed(1);
  const fpDiff = naiveMetrics.falsePositives - verifAiMetrics.falsePositives;
  const fnDiff = naiveMetrics.falseNegatives - verifAiMetrics.falseNegatives;
  console.log(`  Accuracy Improvement: +${accDiff}%`);
  console.log(`  False Positives Reduced by: ${fpDiff} messages`);
  console.log(`  False Negatives (Attacks Missed) Reduced by: ${fnDiff} messages`);
  console.log('================================================================\n');
}

// Run if directly executed
runEvaluation();
