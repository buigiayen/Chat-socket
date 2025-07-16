"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

type State = {
  UserInfo?: InitialStates.User;
};

type Action = { type: "SET_INIT"; payload: InitialStates.User };

const initialState: State = {};

const GlobalContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

function globalReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_INIT":
      return { ...state, UserInfo: action.payload };
    default:
      return state;
  }
}
const loadState = (): State => {
  if (typeof window === "undefined") return initialState;

  try {
    const savedState = localStorage.getItem("globalState");
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (err) {
    console.error("Error loading state:", err);
  }
  return initialState;
};

const saveState = (state: State) => {
  try {
    localStorage.setItem("globalState", JSON.stringify(state));
  } catch (err) {
    console.error("Error saving state:", err);
  }
};
export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  useEffect(() => {
    const persistedState = loadState();
    dispatch({ type: "SET_INIT", payload: persistedState.UserInfo! });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => useContext(GlobalContext);
