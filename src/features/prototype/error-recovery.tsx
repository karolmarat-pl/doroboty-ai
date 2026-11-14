import { Component, createRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { downloadText } from "./download";

type Incident = {
  code: "UI_RENDER_FAILURE" | "RUNTIME_FAILURE" | "UNHANDLED_REJECTION";
  occurredAt: string;
  reference: string;
};

export class ErrorRecovery extends Component<
  { children: ReactNode },
  { failed: boolean; incident: Incident | null; downloadFailed: boolean }
> {
  state = { failed: false, incident: null as Incident | null, downloadFailed: false };
  private heading = createRef<HTMLHeadingElement>();

  private record = (code: Incident["code"]) => {
    // Never inspect the exception or rejection reason, including for deduplication.
    this.setState((state) =>
      state.incident
        ? null
        : {
            failed: true,
            incident: {
              code,
              occurredAt: new Date().toISOString(),
              reference: crypto.randomUUID(),
            },
          },
    );
  };

  private onError = (event: ErrorEvent) => {
    // Resource failures are not runtime exceptions and do not bubble here.
    if (!(event instanceof ErrorEvent) || event.target !== window) return;
    event.preventDefault();
    this.record("RUNTIME_FAILURE");
  };

  private onRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    this.record("UNHANDLED_REJECTION");
  };

  componentDidMount() {
    window.addEventListener("error", this.onError);
    window.addEventListener("unhandledrejection", this.onRejection);
    if (this.state.failed) this.heading.current?.focus();
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.onError);
    window.removeEventListener("unhandledrejection", this.onRejection);
  }

  componentDidUpdate() {
    if (this.state.failed && document.activeElement === document.body)
      this.heading.current?.focus();
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Deliberately never retain the error, stack, route, props or scenario text.
    this.record("UI_RENDER_FAILURE");
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="prototype-section mx-auto max-w-3xl p-6">
        <section className="prototype-panel space-y-5" aria-labelledby="recovery-title">
          <h1 id="recovery-title" ref={this.heading} tabIndex={-1}>
            Wystąpił błąd aplikacji
          </h1>
          <p role="alert">
            Wystąpił nieoczekiwany błąd. Zapisany scenariusz pozostaje w tej przeglądarce. Tekst,
            którego nie zapisano, może wymagać ponownego wpisania.
          </p>
          <p>
            Pobierz raport błędu i przekaż go prowadzącemu zajęcia. Zawiera tylko kod błędu, czas i
            numer zgłoszenia. Nie zawiera Twoich odpowiedzi ani danych scenariusza.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={!this.state.incident}
              onClick={() => {
                try {
                  downloadText("doroboty-blad.json", JSON.stringify(this.state.incident, null, 2));
                  this.setState({ downloadFailed: false });
                } catch {
                  this.setState({ downloadFailed: true });
                }
              }}
            >
              Pobierz raport błędu
            </Button>
            <Button onClick={() => window.location.reload()}>Uruchom ponownie</Button>
          </div>
          {this.state.downloadFailed && (
            <p role="alert">
              Nie udało się pobrać raportu. Przekaż prowadzącemu kod {this.state.incident?.code} i
              numer {this.state.incident?.reference}.
            </p>
          )}
          <p>
            Wyślij raport na{" "}
            <a className="underline" href="mailto:karolmarat@gmail.com">
              karolmarat@gmail.com
            </a>
            . Dopisz, co robiłeś przed błędem, używając wyłącznie fikcyjnych danych. Załącz plik
            ręcznie — aplikacja nie wysyła zgłoszeń automatycznie. Jeżeli problem wraca, zachowaj
            dane przeglądarki.
          </p>
        </section>
      </main>
    );
  }
}
