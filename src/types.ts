export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  skillLevel: number;
  movetime: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { skillLevel: 2, movetime: 100 },
  medium: { skillLevel: 10, movetime: 500 },
  hard: { skillLevel: 20, movetime: 1500 },
};
