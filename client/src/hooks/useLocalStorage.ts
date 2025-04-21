import { useState, useEffect, useMemo } from "react";

const useLocalStorage = (key: string, defaultValue: unknown) => {
  const [state, setState] = useState(() => {
    const persistedState = localStorage.getItem(key);
    return persistedState ? JSON.parse(persistedState) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  const memoizedState = useMemo(() => state, [state]);

  return [memoizedState, setState];
};

export default useLocalStorage;
