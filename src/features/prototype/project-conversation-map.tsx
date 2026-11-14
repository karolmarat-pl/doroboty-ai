import { useState, type Ref } from "react";
import { CornerDownRight, Quote } from "lucide-react";
import { RecordSheet } from "@/components/record-sheet";
import { Button } from "@/components/ui/button";
import { emptyConsMessage, preparedAssessments } from "./project-conversation-assessment";
import {
  areas,
  contextQuestion,
  preparedAnswers,
  type Conversation,
  type QuestionId,
} from "./project-conversation-model";

export const projectSteps: Record<QuestionId, { label: string; title: string }> = {
  context: { label: "Problem", title: "Co warto było zmienić?" },
  contribution: { label: "Mój wkład", title: "Co kandydat zrobił osobiście?" },
  decisions: { label: "Decyzja", title: "Dlaczego właśnie ten zakres?" },
  evaluation: { label: "Sprawdzenie", title: "Co zmieniło się po pilocie?" },
  limitations: { label: "Ograniczenia", title: "Gdzie kończyła się pewność?" },
};

function AnswerProsCons({ question }: { question: QuestionId }) {
  const assessment = preparedAssessments[question];
  return (
    <div className="project-map-assessment" aria-label="Plusy i minusy odpowiedzi">
      {(["pros", "cons"] as const).map((kind) => (
        <section key={kind} aria-label={kind === "pros" ? "Plusy odpowiedzi" : "Minusy odpowiedzi"}>
          <h3>
            <span aria-hidden="true">{kind === "pros" ? "+" : "−"}</span>{" "}
            {kind === "pros" ? "Plusy odpowiedzi" : "Minusy odpowiedzi"}
          </h3>
          {assessment[kind].length ? (
            <ul>
              {assessment[kind].map((point) => (
                <li key={point.quote}>
                  <p>{point.text}</p>
                  <blockquote>
                    <span className="sr-only">Cytat z odpowiedzi kandydata: </span>„{point.quote}”
                  </blockquote>
                </li>
              ))}
            </ul>
          ) : (
            <p className="project-map-empty-cons">{emptyConsMessage}</p>
          )}
        </section>
      ))}
    </div>
  );
}

export function ProjectMapNavigation({
  steps,
  active,
  onSelect,
}: {
  steps: QuestionId[];
  active: QuestionId;
  onSelect: (id: QuestionId) => void;
}) {
  return (
    <nav className="project-map-route" aria-label="Mapa projektu">
      {steps.map((id, index) => (
        <Button
          key={id}
          variant={active === id ? "default" : "outline"}
          className="project-map-stop"
          aria-label={`Przejdź do obszaru: ${projectSteps[id].label}`}
          aria-pressed={active === id}
          onClick={() => onSelect(id)}
        >
          <span className="project-map-number" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>{projectSteps[id].label}</span>
        </Button>
      ))}
    </nav>
  );
}

export function ProjectConversationReport({
  conversation,
  employer,
  reportAvailable,
  headingRef,
  onShowAnswer,
  onReturn,
}: {
  conversation: Conversation;
  employer: boolean;
  reportAvailable: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onShowAnswer: (id: QuestionId) => void;
  onReturn: () => void;
}) {
  const steps: QuestionId[] = ["context", ...conversation.selected];
  const [active, setActive] = useState<QuestionId>(
    conversation.selected.includes("evaluation") ? "evaluation" : conversation.selected[0],
  );
  const [section, setSection] = useState("explanation");
  const selected = steps.includes(active) ? active : conversation.selected[0];
  const area = selected === "context" ? null : areas[selected];
  const position = steps.indexOf(selected) + 1;
  return (
    <div className="project-map-report">
      {employer && reportAvailable && (
        <ProjectMapNavigation
          steps={steps}
          active={selected}
          onSelect={(id) => {
            setActive(id);
            setSection("explanation");
          }}
        />
      )}
      <RecordSheet
        label={employer ? "Wynik rozmowy" : "Twoja rozmowa"}
        activeSection={section}
        onSectionChange={setSection}
        sections={[
          {
            value: "explanation",
            label: employer ? "Objaśnienie" : "Podsumowanie",
            content: (
              <>
                {!employer ? (
                  <>
                    <h2 ref={headingRef} tabIndex={-1}>
                      Rozmowa została zakończona
                    </h2>
                    <p>
                      Rekruter może teraz przeczytać Twoje odpowiedzi. Możesz je edytować; każda
                      zmiana wycofa zakończenie rozmowy i ukryje wcześniejsze objaśnienie.
                    </p>
                  </>
                ) : reportAvailable ? (
                  <>
                    <div className="project-map-result-caption">
                      <span className="conversation-demo">Przykładowy wynik · bez analizy AI</span>
                      <p className="record-caption">
                        Deklaracje kandydata, bez niezależnej weryfikacji. To materiał do dalszej
                        rozmowy o roli {conversation.roleTitle}.
                      </p>
                    </div>
                    <div className="project-map-detail" aria-live="polite" aria-atomic="true">
                      <section className="project-map-source" aria-label="Wypowiedź kandydata">
                        <p className="conversation-eyebrow">
                          {String(position).padStart(2, "0")} / {projectSteps[selected].label}
                        </p>
                        <h2 ref={headingRef} tabIndex={-1}>
                          {projectSteps[selected].title}
                        </h2>
                        <blockquote className="conversation-quote">
                          <p className="conversation-eyebrow">
                            <Quote size={17} aria-hidden="true" /> Głos kandydata
                          </p>
                          <p className="project-map-source-text">
                            „{area ? area.quote : preparedAnswers.context}”
                          </p>
                          <cite>
                            Marek Nowak · odpowiedź: {area ? area.label : "Kontekst projektu"}
                          </cite>
                          <Button variant="link" onClick={() => onShowAnswer(selected)}>
                            Przejdź do odpowiedzi: {area ? area.label : "Kontekst projektu"}
                          </Button>
                        </blockquote>
                      </section>
                      <section
                        className="project-map-meaning"
                        aria-label="Objaśnienie względem roli"
                      >
                        {area ? (
                          <>
                            <h3>Znaczenie dla roli</h3>
                            <p>{area.meaning}</p>
                            <details className="project-map-requirement">
                              <summary>Wymaganie z opisu stanowiska</summary>
                              <blockquote className="conversation-requirement">
                                {area.requirement}
                              </blockquote>
                            </details>
                            <AnswerProsCons question={selected} />
                            <h3>Jeszcze niewiadome</h3>
                            <p>{area.unknown}</p>
                            <section className="project-map-followup">
                              <h3>Zabierz na dalszą rozmowę</h3>
                              <p>{area.followUp}</p>
                            </section>
                          </>
                        ) : (
                          <>
                            <h3>Punkt wyjścia rozmowy</h3>
                            <p>
                              To kontekst wskazany przez kandydata: problem, cel i skład zespołu.
                              Kolejne obszary pokazują jego własny wkład, decyzje i sposób
                              sprawdzania rezultatów — w zakresie wybranym przez rekrutera.
                            </p>
                            <AnswerProsCons question={selected} />
                            <h3>Do doprecyzowania</h3>
                            <p>
                              Wypowiedź nie pokazuje, jak porównano ten problem z innymi potrzebami
                              zespołu.
                            </p>
                            <section className="project-map-followup">
                              <h3>Zabierz na dalszą rozmowę</h3>
                              <p>Co sprawiło, że właśnie ten problem dostał pierwszeństwo?</p>
                            </section>
                          </>
                        )}
                      </section>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 ref={headingRef} tabIndex={-1}>
                      Objaśnienie jest niedostępne
                    </h2>
                    <p>
                      {conversation.status === "draft"
                        ? "Rozmowa jest szkicem lub odpowiedzi albo obszary zostały zmienione. Wcześniejsza interpretacja, mapa wyniku i cytaty są ukryte."
                        : "Dla tych odpowiedzi lub tej roli nie ma przygotowanej interpretacji. Prototyp nie analizuje edytowanego tekstu."}
                    </p>
                    <p>
                      Przeczytaj aktualne odpowiedzi w zakładce obok. Przykładowy wynik jest
                      dostępny wyłącznie po zakończeniu niezmienionej rozmowy Marka dla
                      przygotowanej roli AI Product Manager w BrightLabs.
                    </p>
                  </>
                )}
              </>
            ),
          },
          {
            value: "sources",
            label: "Odpowiedzi źródłowe",
            content: (
              <>
                <h2>Aktualne odpowiedzi kandydata</h2>
                {steps.map((id, index) => (
                  <section className="conversation-finding" key={id}>
                    <p className="conversation-eyebrow">
                      {String(index + 1).padStart(2, "0")} / {projectSteps[id].label}
                    </p>
                    <h3>{id === "context" ? contextQuestion : areas[id].question}</h3>
                    <p>{conversation.answers[id] || "Brak odpowiedzi."}</p>
                    <Button variant="outline" onClick={() => onShowAnswer(id)}>
                      Edytuj odpowiedź: {id === "context" ? "Kontekst projektu" : areas[id].label}
                    </Button>
                  </section>
                ))}
              </>
            ),
          },
        ]}
        footer={
          <div className="record-actions">
            <Button variant="outline" onClick={onReturn}>
              Wróć do rozmowy
            </Button>
          </div>
        }
      />
      {employer && reportAvailable && (
        <p className="project-map-signoff">
          <CornerDownRight size={24} aria-hidden="true" />
          Każdy wniosek prowadzi do konkretnej wypowiedzi.
        </p>
      )}
      <p className="record-caption project-map-limits">
        Bez oceny punktowej i automatycznej decyzji. Zmiana odpowiedzi ukrywa objaśnienie.
      </p>
    </div>
  );
}
