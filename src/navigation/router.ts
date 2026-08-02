import React, { useRef, useEffect } from 'react';
import { ViewState, GameHubMode, AppHistoryState } from './types';

export type { ViewState, GameHubMode, AppHistoryState };

const getRouteHash = (view: ViewState, selectedGameHubMode: GameHubMode = "hub") => {
  if (view === "landing" && selectedGameHubMode === "battle") return "#/battle";
  if (view === "landing") return "";
  return `#/${view}`;
};

const getPageStateFromHash = (): { view: ViewState; selectedGameHubMode: GameHubMode } => {
  const route = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  if (route === "battle") return { view: "landing", selectedGameHubMode: "battle" };
  if (["draft", "results", "feud", "guesswho", "party"].includes(route)) {
    return { view: route as ViewState, selectedGameHubMode: "hub" };
  }
  return { view: "landing", selectedGameHubMode: "hub" };
};

export const navigateTo = (view: ViewState, selectedGameHubMode: GameHubMode = "hub") => {
  const hash = getRouteHash(view, selectedGameHubMode);
  window.location.hash = hash;
};

export const useHistoryListener = (
  onNavigate: (view: ViewState, selectedGameHubMode: GameHubMode) => void
) => {
  const isInitialRender = useRef(true);
  const isPopstateNavigation = useRef(false);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as AppHistoryState | null;
      if (state?.animeBattleInternal) {
        isPopstateNavigation.current = true;
        onNavigate(state.view, state.selectedGameHubMode || "hub");
      } else {
        isPopstateNavigation.current = true;
        onNavigate("landing", "hub");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onNavigate]);

  return { isInitialRender, isPopstateNavigation };
};

export const updateHistory = (
  view: ViewState,
  selectedGameHubMode: GameHubMode,
  isInitialRender: React.RefObject<boolean>,
  isPopstateNavigation: React.RefObject<boolean>
) => {
  const state: AppHistoryState = { animeBattleInternal: true, view, selectedGameHubMode };
  const hash = getRouteHash(view, selectedGameHubMode);
  const url = window.location.pathname + (hash || "");

  if (isInitialRender.current) {
    window.history.replaceState(state, "", url);
    isInitialRender.current = false;
  } else if (isPopstateNavigation.current) {
    isPopstateNavigation.current = false;
  } else {
    window.history.pushState(state, "", url);
  }
};

export { getRouteHash, getPageStateFromHash };