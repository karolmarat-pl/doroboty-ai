import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import posthog from "posthog-js";
import { currentPerson, initialState, transition, type Action, type State } from "./model";
import {
  parseState,
  readState,
  saveState,
  serializeState,
  STORAGE_KEY,
  type StoragePort,
} from "./storage";
function browserStorage(): StoragePort | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
const posthogConfigured = Boolean(
  import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN && import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
);

function useStore() {
  const [loaded] = useState(() => readState(browserStorage()));
  const [state, setState] = useState(loaded.state);
  const [issue, setIssue] = useState(loaded.issue);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(loaded.blocked);
  const latest = useRef(state);
  const snapshot = useRef(loaded.snapshot);
  const writer = useRef(false);
  const conflicted = useRef(false);
  const identifiedPersonId = useRef<string | null>(null);
  const [writeIssue, setWriteIssue] = useState("");
  function conflict() {
    conflicted.current = true;
    setWriteIssue(
      "Inna karta może zapisywać ten scenariusz lub zmieniła zapis. Zmiany w tej karcie pozostają tylko tutaj. Wyeksportuj je, zamknij pozostałe karty prototypu, a następnie odśwież tę kartę, aby wczytać zapisany scenariusz.",
    );
  }
  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | undefined;
    if (!navigator.locks) {
      setWriteIssue(
        "Ta przeglądarka nie pozwala zabezpieczyć zapisu między kartami. Zmiany pozostają tylko w tej karcie. Wyeksportuj je przed zamknięciem strony.",
      );
      return;
    }
    void navigator.locks
      .request(`${STORAGE_KEY}.writer`, { ifAvailable: true }, async (lock) => {
        if (cancelled) return;
        if (!lock) {
          conflict();
          return;
        }
        writer.current = true;
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      })
      .catch(() => {
        if (!cancelled) conflict();
      });
    const changed = (event: StorageEvent) => {
      if (
        event.storageArea === browserStorage() &&
        (event.key === STORAGE_KEY || event.key === null)
      )
        conflict();
    };
    window.addEventListener("storage", changed);
    return () => {
      cancelled = true;
      writer.current = false;
      release?.();
      window.removeEventListener("storage", changed);
    };
  }, []);
  function commit(next: State, replace = false) {
    const storage = browserStorage();
    let canWrite = writer.current && !conflicted.current;
    try {
      if (storage && storage.getItem(STORAGE_KEY) !== snapshot.current) {
        conflict();
        canWrite = false;
      }
    } catch {
      canWrite = false;
      setWriteIssue(
        "Nie udało się sprawdzić zapisu w przeglądarce. Zmiany pozostają tylko w tej karcie. Wyeksportuj je przed zamknięciem strony.",
      );
    }
    // Import/reset must not discard local work while a different tab owns persistence.
    if (replace && !canWrite) return false;
    latest.current = next;
    setState(next);
    setError("");
    if (!canWrite) {
      if (!writeIssue) conflict();
      return false;
    }
    if (blocked && !replace) return true;
    try {
      saveState(storage, next);
      snapshot.current = serializeState(next);
      setIssue("");
      if (replace) setBlocked(false);
    } catch (e) {
      setIssue((e as Error).message);
    }
    return true;
  }
  function run(action: Action) {
    try {
      return commit(transition(latest.current, action));
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "ZodError"
          ? e.message
          : "Sprawdź poprawność i długość wprowadzonych danych.",
      );
      return false;
    }
  }
  function importState(raw: string) {
    try {
      const next = parseState(raw);
      return commit(next, true);
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }
  useEffect(() => {
    if (!posthogConfigured) return;

    const person = currentPerson(state);
    if (!person) {
      if (identifiedPersonId.current !== null) posthog.reset();
      identifiedPersonId.current = null;
      return;
    }
    if (identifiedPersonId.current === person.id) return;

    if (identifiedPersonId.current !== null) posthog.reset();
    posthog.identify(person.id, { name: person.name, role: person.role });
    identifiedPersonId.current = person.id;
  }, [state]);
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  return {
    state,
    issue,
    writeIssue,
    error,
    blocked,
    original: loaded.original,
    run,
    importState,
    clearError: () => setError(""),
    reset: () => commit(initialState(), true),
  };
}
type Store = ReturnType<typeof useStore>;
const Context = createContext<Store | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function usePrototype() {
  const store = useContext(Context);
  if (!store) throw new Error("PrototypeProvider is required");
  return store;
}
