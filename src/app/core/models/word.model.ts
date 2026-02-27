export type WordDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface WordEntry {
  word: string;
  category: string;
  difficulty: WordDifficulty;
}
