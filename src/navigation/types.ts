// Navigation-related type definitions
export type ViewState = "landing" | "draft" | "results" | "feud" | "guesswho" | "party";
export type GameHubMode = "hub" | "battle";

export type AppHistoryState = {
  animeBattleInternal: true;
  view: ViewState;
  selectedGameHubMode?: GameHubMode;
};

export interface NavigationState {
  view: ViewState;
  selectedGameHubMode: GameHubMode;
}

export interface GameSetupConfig {
  playerNames: string[];
  mode: "duel" | "team" | "party";
  selectedCategories: string[];
  rounds: number;
}