import { useLayoutEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { trackBusinessEvent } from "./analytics";
import { ArrowRight, MessageCircle, Users } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { JobDescription } from "@/features/jobs/job-description";
import { currentPerson, type Application } from "./model";
import { NotFound } from "./shell";
import { usePrototype } from "./store";
import {
  ProjectConversationReport,
  ProjectMapNavigation,
  projectSteps,
} from "./project-conversation-map";
import {
  areaIds,
  areas,
  contextQuestion,
  hasPreparedReport,
  supportsPreparedConversation,
  type AreaId,
  type QuestionId,
} from "./project-conversation-model";

export function ConversationEntry({
  application,
  employer = false,
}: {
  application: Application;
  employer?: boolean;
}) {
  const { state } = usePrototype();
  const conversation = state.conversations.find((item) => item.applicationId === application.id);
  if (!employer && !conversation) return null;
  return (
    <section className="conversation-entry" aria-label="Rozmowa o projekcie">
      <MessageCircle aria-hidden="true" size={24} />
      <div>
        <h3>Rozmowa o projekcie</h3>
        <p className="record-caption">
          {employer
            ? "Zrozum wkład, decyzje i sposób sprawdzania rezultatów kandydata. Przygotowany scenariusz, bez działającego AI."
            : "Opowiedz o swoim wkładzie w jeden projekt. To symulacja na fikcyjnych danych."}
        </p>
        <Link
          to={`/app/${employer ? "kandydaci" : "aplikacje"}/${application.id}/rozmowa`}
          className="conversation-entry-link"
        >
          {conversation ? "Otwórz rozmowę" : "Przygotuj rozmowę"}{" "}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function ProjectConversationPage({ employer = false }: { employer?: boolean }) {
  const { id } = useParams();
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const application = state.applications.find(
    (item) =>
      item.id === id &&
      (employer ? item.companyId === person.companyId : item.candidateId === person.id),
  );
  if (!application) return <NotFound />;
  return (
    <ConversationWorkspace key={application.id} application={application} employer={employer} />
  );
}

function ConversationWorkspace({
  application,
  employer,
}: {
  application: Application;
  employer: boolean;
}) {
  const { state, run } = usePrototype();
  const conversation = state.conversations.find((item) => item.applicationId === application.id);
  const job = state.jobs.find((item) => item.id === application.jobId)!;
  const [selected, setSelected] = useState<AreaId[]>(conversation?.selected ?? [...areaIds]);
  const [view, setView] = useState<"setup" | "conversation" | "result">(
    !conversation
      ? "setup"
      : conversation.status === "submitted" && employer
        ? "result"
        : "conversation",
  );
  const [step, setStep] = useState(0);
  const [confirmPrepared, setConfirmPrepared] = useState(false);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const pendingFocus = useRef<"heading" | "answer" | null>(null);
  const questionIds: QuestionId[] = ["context", ...(conversation?.selected ?? [])];
  const questionId = questionIds[Math.min(step, questionIds.length - 1)];
  const question = questionId === "context" ? contextQuestion : areas[questionId].question;
  const validAnswers =
    conversation && questionIds.every((key) => conversation.answers[key].trim().length >= 20);
  const preparedAvailable =
    conversation &&
    supportsPreparedConversation(application, {
      title: conversation.roleTitle,
      description: conversation.roleDescription,
    });
  const reportAvailable = conversation && preparedAvailable && hasPreparedReport(conversation);
  useLayoutEffect(() => {
    if (pendingFocus.current === "answer") textarea.current?.focus();
    if (pendingFocus.current === "heading") heading.current?.focus();
    pendingFocus.current = null;
  }, [step, view]);
  function changeView(next: typeof view) {
    pendingFocus.current = "heading";
    setView(next);
  }
  function showAnswer(key: QuestionId) {
    setStep(questionIds.indexOf(key));
    pendingFocus.current = "answer";
    setView("conversation");
  }
  const labels = employer
    ? ["Obszary do sprawdzenia", "Rozmowa kandydata", "Objaśnienie dla rekrutera"]
    : ["Rozmowa o projekcie"];
  return (
    <article className="project-conversation">
      <BackLink to={`/app/${employer ? "kandydaci" : "aplikacje"}/${application.id}`}>
        Wróć do aplikacji
      </BackLink>
      <header className="conversation-header">
        <div className="conversation-header-copy">
          <div className="conversation-header-labels">
            <span className="conversation-demo">Symulacja · przygotowany scenariusz</span>
            <span className="conversation-eyebrow">Rozmowa o projekcie</span>
          </div>
          <h1>
            Od problemu
            <br />
            do sprawdzenia.
          </h1>
          <p>
            {application.candidateName} <span aria-hidden="true">→</span> {application.jobTitle}
          </p>
          <p className="record-caption">
            Fikcyjne dane. Pytania i objaśnienie są przygotowane z góry. Prototyp nie prowadzi
            rozmowy z AI ani nie wysyła zaproszeń.
          </p>
        </div>
        <div className="project-map-stamp" aria-hidden="true">
          <Users size={27} />
          <span>
            Projekt zespołu.
            <br />
            Wkład człowieka.
          </span>
        </div>
      </header>
      {employer && (
        <nav aria-label="Etapy rozmowy" className="conversation-steps">
          {labels.map((label, index) => {
            const value = (["setup", "conversation", "result"] as const)[index];
            return (
              <Button
                key={label}
                variant={view === value ? "default" : "outline"}
                className="conversation-phase"
                aria-current={view === value ? "step" : undefined}
                disabled={value !== "setup" && !conversation}
                onClick={() => {
                  if (value === "setup") setSelected(conversation?.selected ?? [...areaIds]);
                  changeView(value);
                }}
              >
                {label}
              </Button>
            );
          })}
        </nav>
      )}
      <div
        className={`conversation-layout${view === "result" ? " conversation-layout--report" : ""}`}
      >
        <div className="conversation-main">
          {view === "setup" ? (
            <section className="record-sheet">
              <h2 ref={heading} tabIndex={-1}>
                {employer ? "Co chcesz lepiej zrozumieć?" : "Rozmowa nie jest jeszcze gotowa"}
              </h2>
              {employer ? (
                <>
                  <p>
                    Wybierz obszary ważne dla stanowiska. Kandydat omówi jeden projekt, swój wkład i
                    jego ograniczenia.
                  </p>
                  <div className="project-map-context-intro">
                    <span className="project-map-number" aria-hidden="true">
                      01
                    </span>
                    <div>
                      <h3>Problem</h3>
                      <p className="record-caption">
                        Kontekst projektu jest zawsze częścią rozmowy. Kolejne obszary wybierasz
                        poniżej.
                      </p>
                    </div>
                  </div>
                  <fieldset className="conversation-choices">
                    <legend>Obszary do sprawdzenia (wybierz co najmniej jeden)</legend>
                    {areaIds.map((key, index) => (
                      <label key={key} className="conversation-choice">
                        <span className="project-map-choice-number" aria-hidden="true">
                          {String(index + 2).padStart(2, "0")}
                        </span>
                        <Checkbox
                          checked={selected.includes(key)}
                          onCheckedChange={(checked) =>
                            setSelected(
                              areaIds.filter((value) =>
                                value === key ? checked : selected.includes(value),
                              ),
                            )
                          }
                        />
                        <span>
                          <strong>{areas[key].label}</strong>
                          <small>{areas[key].hint}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <p className="record-caption">
                    Zmiana zakresu zachowa odpowiedzi, ale ukryje wcześniejsze objaśnienie do
                    ponownego zakończenia rozmowy.
                  </p>
                  <div className="record-actions">
                    <Button
                      disabled={selected.length === 0}
                      onClick={() => {
                        if (
                          run({
                            type: "conversation_configure",
                            applicationId: application.id,
                            selected,
                          })
                        ) {
                          void trackBusinessEvent("project_conversation_started", {
                            application_id: application.id,
                            selected_area_count: selected.length,
                          });
                          setStep(0);
                          setMessage(
                            "Zapisano obszary rozmowy. To lokalna symulacja, zaproszenie nie zostało wysłane.",
                          );
                          changeView("conversation");
                        }
                      }}
                    >
                      Zapisz obszary i przejdź do rozmowy <ArrowRight aria-hidden="true" />
                    </Button>
                  </div>
                </>
              ) : (
                <p>Rekruter musi najpierw wybrać obszary w panelu firmy.</p>
              )}
            </section>
          ) : view === "conversation" && conversation ? (
            <section className="record-sheet">
              <h2 ref={heading} tabIndex={-1}>
                {employer ? "Podgląd perspektywy kandydata" : "Opowiedz o jednym projekcie"}
              </h2>
              <p className="record-caption">
                {employer ? "Symulujesz odpowiedzi kandydata w panelu rekrutera. " : ""}Odpowiedzi
                zapisują się lokalnie podczas pisania. Możesz wrócić do poprzedniego pytania.
              </p>
              <ProjectMapNavigation
                steps={questionIds}
                active={questionId}
                onSelect={(id) => {
                  pendingFocus.current = "answer";
                  setStep(questionIds.indexOf(id));
                }}
              />
              {preparedAvailable && (
                <div className="conversation-example">
                  <p>
                    Możesz przejść przygotowaną rozmowę Marka o automatyzacji obsługi zgłoszeń albo
                    wpisać własne fikcyjne odpowiedzi.
                  </p>
                  <Button variant="outline" onClick={() => setConfirmPrepared(true)}>
                    Wczytaj przygotowane odpowiedzi
                  </Button>
                </div>
              )}
              <div className="conversation-question">
                <p className="conversation-eyebrow">
                  Pytanie {step + 1} z {questionIds.length} · {projectSteps[questionId].label}
                </p>
                <h3>
                  <label htmlFor="project-answer">{question}</label>
                </h3>
                <p id="answer-hint" className="record-caption">
                  Opisz konkretną sytuację. Możesz wskazać, czego nie wiesz. Minimum 20, maksimum
                  3000 znaków. Używaj tylko fikcyjnych danych.
                </p>
                <Textarea
                  ref={textarea}
                  id="project-answer"
                  aria-describedby="answer-hint answer-count"
                  rows={7}
                  maxLength={3000}
                  value={conversation.answers[questionId]}
                  onChange={(event) => {
                    if (
                      run({
                        type: "conversation_answer",
                        applicationId: application.id,
                        question: questionId,
                        answer: event.target.value,
                      })
                    )
                      setMessage("Odpowiedź zmieniona. Wcześniejsze objaśnienie jest ukryte.");
                  }}
                />
                <p id="answer-count" className="record-caption">
                  {conversation.answers[questionId].trim().length} / 3000 znaków ·{" "}
                  {conversation.status === "submitted"
                    ? "Rozmowa zakończona"
                    : "Szkic — objaśnienie ukryte"}
                </p>
              </div>
              <div className="record-actions">
                <Button
                  variant="outline"
                  disabled={step === 0}
                  onClick={() => {
                    pendingFocus.current = "answer";
                    setStep(step - 1);
                  }}
                >
                  Poprzednie pytanie
                </Button>
                {step < questionIds.length - 1 ? (
                  <Button
                    onClick={() => {
                      pendingFocus.current = "answer";
                      setStep(step + 1);
                    }}
                  >
                    Następne pytanie <ArrowRight aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    disabled={!validAnswers}
                    onClick={() => {
                      if (run({ type: "conversation_submit", applicationId: application.id })) {
                        void trackBusinessEvent("project_conversation_submitted", {
                          application_id: application.id,
                          question_count: questionIds.length,
                        });
                        setMessage(
                          "Zakończono symulowaną rozmowę. Odpowiedzi są dostępne rekruterowi w tym scenariuszu.",
                        );
                        changeView("result");
                      }
                    }}
                  >
                    Zakończ symulowaną rozmowę
                  </Button>
                )}
              </div>
              {step === questionIds.length - 1 && !validAnswers && (
                <p className="record-caption">
                  Uzupełnij wszystkie {questionIds.length} odpowiedzi, po co najmniej 20 znaków, aby
                  zakończyć rozmowę.
                </p>
              )}
            </section>
          ) : conversation ? (
            <ProjectConversationReport
              conversation={conversation}
              employer={employer}
              reportAvailable={Boolean(reportAvailable)}
              headingRef={heading}
              onShowAnswer={showAnswer}
              onReturn={() => {
                setStep(0);
                changeView("conversation");
              }}
            />
          ) : null}
          <p role="status" className="conversation-status">
            {message}
          </p>
        </div>
        <aside className="conversation-context" aria-label="Kontekst rozmowy">
          {view !== "result" ? (
            <>
              <h2>Jedna rola, jeden projekt</h2>
              <p className="conversation-eyebrow">Stanowisko</p>
              <p>{conversation?.roleTitle ?? job.title}</p>
              <p className="conversation-eyebrow">Kandydat</p>
              <p>{application.candidateName}</p>
              <p className="conversation-eyebrow">Przebieg</p>
              <ol>
                <li>Rekruter wybiera obszary.</li>
                <li>Kandydat opisuje jeden projekt.</li>
                <li>Rekruter czyta objaśnienie i dopytuje.</li>
              </ol>
              {conversation && (
                <>
                  <h3>Wybrane obszary</h3>
                  <ul>
                    {conversation.selected.map((key) => (
                      <li key={key}>{areas[key].label}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <p>
              <strong>{application.candidateName}</strong> · {conversation?.roleTitle ?? job.title}
            </p>
          )}
          <details>
            <summary>
              Opis stanowiska {conversation ? "z chwili wyboru obszarów" : "z oferty"}
            </summary>
            <JobDescription description={conversation?.roleDescription ?? job.description} />
          </details>
          <p className="record-caption">
            Brak oceny punktowej i automatycznej decyzji. Rekruter sam ocenia, o co dopytać.
          </p>
        </aside>
      </div>
      <ConfirmDialog
        open={confirmPrepared}
        onOpenChange={setConfirmPrepared}
        title="Wczytać przygotowaną rozmowę?"
        description="To zastąpi wszystkie obecne odpowiedzi fikcyjnymi wypowiedziami Marka i ukryje poprzednie objaśnienie. Obszary pozostaną bez zmian."
        pending={false}
        label="Zastąp odpowiedzi przykładem"
        onConfirm={() => {
          if (run({ type: "conversation_prepare", applicationId: application.id })) {
            setStep(0);
            setMessage(
              "Wczytano fikcyjne odpowiedzi. Przejdź przez pytania i zakończ rozmowę, aby zobaczyć przykład wyniku.",
            );
            setConfirmPrepared(false);
          }
        }}
      />
    </article>
  );
}
