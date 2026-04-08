export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  label: string;
  description: string;
  eloDisplay: string;
  elo: number | null; // null = full strength
  movetime: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy:   { label: 'Easy',   description: 'Great for beginners', eloDisplay: '~400 Elo',  elo: 400,  movetime: 50   },
  medium: { label: 'Medium', description: 'A solid challenge',   eloDisplay: '~1500 Elo', elo: 1500, movetime: 500  },
  hard:   { label: 'Hard',   description: 'Near-perfect play',   eloDisplay: '~2800 Elo', elo: null, movetime: 1500 },
};
