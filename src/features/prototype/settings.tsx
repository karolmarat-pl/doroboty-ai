import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { usePrototype } from "./store";
import { serializeState, MAX_IMPORT_BYTES } from "./storage";
import { PageTitle } from "./shell";

import { downloadText } from "./download";
import { isAnalyticsEnabled, trackAnalyticsTest } from "./analytics";
export function SettingsPage() {
  const { state, reset, importState, original } = usePrototype();
  const [pending, setPending] = useState<"reset" | "import" | null>(null);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function readFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setError("");
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setError("Plik jest za duży (maksymalnie 2 MB).");
      return;
    }
    try {
      setRaw(await file.text());
      setPending("import");
    } catch {
      setError("Nie udało się odczytać pliku.");
    }
  }
  function confirm() {
    if (pending === "reset") {
      if (reset()) setMessage("Przywrócono scenariusz początkowy.");
    } else if (importState(raw)) {
      setMessage("Dane zostały zaimportowane.");
    }
    setPending(null);
  }
  return (
    <>
      <PageTitle>Ustawienia prototypu</PageTitle>
      <section className="prototype-panel prototype-form">
        <h2>Dane scenariusza</h2>
        <p>
          Zmiany są zapisane tylko w tej przeglądarce. Wysłanie linku innej osobie nie przenosi
          Twoich danych. Eksport pozwala przekazać scenariusz lub zachować kopię przed resetem.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => downloadText("doroboty-scenariusz.json", serializeState(state))}
          >
            Eksportuj dane
          </Button>
          <Button variant="outline" render={<label />}>
            Importuj dane
            <input
              className="sr-only"
              type="file"
              accept="application/json,.json"
              aria-label="Importuj plik scenariusza"
              onChange={readFile}
            />
          </Button>
          {original !== null && (
            <Button
              variant="outline"
              onClick={() =>
                downloadText("doroboty-zapis-do-odzyskania.txt", original, "text/plain")
              }
            >
              Pobierz poprzedni zapis
            </Button>
          )}
        </div>
        <Button variant="destructive" onClick={() => setPending("reset")}>
          Resetuj scenariusz
        </Button>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
      </section>
      <section className="prototype-panel prototype-form mt-6">
        <h2>O prototypie</h2>
        <p>
          Wybór osoby zastępuje logowanie. Propozycje AI, Match Score i podsumowania odtwarzają
          przygotowany scenariusz; nie oceniają kompetencji. Używaj przykładowych danych i CV.
        </p>
      </section>
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(v) => {
          if (!v) setPending(null);
        }}
        title={pending === "reset" ? "Zresetować scenariusz?" : "Zastąpić dane scenariusza?"}
        description="Ta operacja zastąpi lokalne zmiany. Możesz najpierw wyeksportować dane."
        label={pending === "reset" ? "Resetuj" : "Importuj"}
        pending={false}
        onConfirm={confirm}
      />
    </>
  );
}
export function PrivacyPage() {
  const [testMessage, setTestMessage] = useState("");
  const [testing, setTesting] = useState(false);
  async function testAnalytics() {
    setTesting(true);
    const queued = await trackAnalyticsTest();
    setTestMessage(
      queued
        ? "Zdarzenie testowe przygotowane do wysłania. Sprawdź analytics_test_clicked w PostHog; blokada w przeglądarce może zatrzymać wysyłkę."
        : "Pomiar jest niedostępny. Test działa na opublikowanej stronie z włączonym PostHogiem.",
    );
    setTesting(false);
  }
  return (
    <section className="prototype-section max-w-4xl">
      <h1>Prywatność prototypu</h1>
      <div className="mt-6 space-y-5">
        <p>
          Ta wersja służy do ćwiczeń i testów interfejsu. Nie wpisuj prawdziwych danych osobowych
          ani poufnych informacji.
        </p>
        <p>
          Profile, aplikacje i ustawienia zapisują się w tej przeglądarce. Aplikacja nie wysyła ich
          do bazy aplikacji ani dostawcy AI. Plik eksportu zawiera cały lokalny scenariusz, w tym
          notatki.
        </p>
        {isAnalyticsEnabled() && (
          <p>
            PostHog w UE mierzy wyświetlenia widoków, działania w prototypie i automatyczne
            interakcje w publicznych częściach strony oraz nagrywa sesje bez maskowania tekstów,
            atrybutów i pól formularzy. Nagrania mogą zawierać wpisane treści oraz widoczne dane
            profili, aplikacji, wybór osoby i okna dialogowe. Używaj wyłącznie fikcyjnych danych.
            Automatyczny pomiar interakcji pomija pola formularzy i treści ekranów konta. Te
            ograniczenia nie dotyczą nagrań. Pomiar nie korzysta z cookies ani trwałego
            identyfikatora. Nagranie odtwarza interfejs; nie zawiera dźwięku ani obrazu z kamery.
          </p>
        )}
        <p>
          Możesz usunąć zmiany przyciskiem „Resetuj scenariusz” w ustawieniach lub wyczyścić dane
          witryny w przeglądarce. Hosting może prowadzić własne logi dostępu.
        </p>
        <section className="prototype-panel prototype-form" aria-labelledby="analytics-test-title">
          <h2 id="analytics-test-title">Test pomiaru</h2>
          <p>Kliknij przycisk, a potem sprawdź zdarzenie analytics_test_clicked w PostHog.</p>
          <Button onClick={() => void testAnalytics()} disabled={testing}>
            Test PostHog
          </Button>
          {testMessage && <p role="status">{testMessage}</p>}
        </section>
      </div>
    </section>
  );
}
