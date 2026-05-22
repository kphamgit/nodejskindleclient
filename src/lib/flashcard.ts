export interface SM2Result {
  easiness: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

export function computeNextReview(
  quality: number,        // SM2 quality: 0–5
  easiness: number,       // current easiness factor
  interval: number,       // current interval in days
  repetitions: number     // number of correct recalls in a row
): SM2Result {
  let newRepetitions = repetitions + 1;
  let newInterval: number;

  switch (newRepetitions) {
    case 1:
      newInterval = 1;
      break;
    case 2:
      newInterval = 6;
      break;
    default:
      newInterval = Math.round(interval * easiness);
  }

  let newEasiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEasiness < 1.3) newEasiness = 1.3;

  if (quality < 4) {
    // Recall failed — reset streak and review tomorrow
    newInterval = 1;
    newRepetitions = 1;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return { easiness: newEasiness, interval: newInterval, repetitions: newRepetitions, nextReviewAt };
}

// Maps the user's 1–4 difficulty rating (1=easiest, 4=hardest) to SM2's 0–5 quality scale
export function difficultyToQuality(difficulty: number): number {
  return 6 - difficulty; // 1→5, 2→4, 3→3, 4→2
}
