import { z } from "zod";
import type { State } from "./model";
import marketplace from "./data/marketplace.json" with { type: "json" };

export const areaIds = ["contribution", "decisions", "evaluation", "limitations"] as const;
export type AreaId = (typeof areaIds)[number];
export const areas: Record<
  AreaId,
  {
    label: string;
    hint: string;
    question: string;
    requirement: string;
    meaning: string;
    quote: string;
    unknown: string;
    followUp: string;
  }
> = {
  contribution: {
    label: "Własny wkład",
    hint: "Co kandydat zrobił sam, a co należało do zespołu?",
    question: "Za co odpowiadałeś osobiście? Co zrobili inni członkowie zespołu?",
    requirement:
      "Będziesz współpracować z designerem, inżynierami i osobami prowadzącymi wdrożenia u klientów.",
    meaning:
      "Kandydat opisuje pracę produktową: poznanie problemu, ustalenie zakresu i odbiór rozwiązania. W tej roli to istotna część współpracy z zespołem. Nie deklaruje samodzielnego budowania modelu AI; oferta tego nie wymaga.",
    quote:
      "Sam przeprowadziłem 8 rozmów z konsultantami, opisałem problem i ustaliłem zakres pilota.",
    unknown: "Nie wiemy, jak kandydat rozstrzygał spór o priorytety ani kto zatwierdził zakres.",
    followUp:
      "Opowiedz o sytuacji, w której zespół nie zgadzał się z Twoim priorytetem. Co zrobiłeś?",
  },
  decisions: {
    label: "Decyzje i kompromisy",
    hint: "Dlaczego wybrał to rozwiązanie i z czego zrezygnował?",
    question:
      "Jaką ważną decyzję podjąłeś? Jakie opcje rozważałeś i dlaczego odrzuciłeś pozostałe?",
    requirement: "Nie każdy problem wymaga modelu językowego.",
    meaning:
      "Zamiast od razu automatyzować cały proces, kandydat ograniczył zakres i zostawił człowiekowi zatwierdzanie. To przykład wyboru rozwiązania do problemu i zarządzania ryzykiem, potrzebnych przy pilocie procesu finansowego. Sama wypowiedź nie potwierdza jakości tej decyzji.",
    quote:
      "Wybrałem podpowiedzi odpowiedzi zatwierdzane przez konsultanta zamiast automatycznej wysyłki.",
    unknown:
      "Brakuje porównania kosztów oraz informacji, czy prostsze reguły dawały podobny wynik.",
    followUp:
      "Kiedy wybrałbyś proste reguły zamiast AI? Jak porównałbyś koszt i jakość tych opcji?",
  },
  evaluation: {
    label: "Sprawdzanie rezultatów",
    hint: "Skąd wiadomo, czy rozwiązanie pomogło?",
    question:
      "Jak sprawdziliście wynik? Z czym go porównaliście i czego pomiar nie pozwala stwierdzić?",
    requirement:
      "Przygotujecie prototyp, sprawdzicie go z użytkownikami i porównacie wynik z punktem wyjścia.",
    meaning:
      "Kandydat potrafi opisać punkt wyjścia i pomiar po pilocie. To odpowiada potrzebie sprawdzania efektów w tej roli. Porównanie przed i po nie dowodzi jednak, że zmianę spowodowało AI. Deklarowane 25% wymaga sprawdzenia danych i jakości odpowiedzi.",
    quote: "Mediana czasu pierwszej odpowiedzi spadła z 20 do 15 minut.",
    unknown:
      "Nie znamy doboru zgłoszeń, liczby błędnych odpowiedzi ani wpływu zmian w obciążeniu zespołu.",
    followUp:
      "Jak sprawdziłbyś, czy szybsze odpowiedzi nie były mniej trafne? Co porównasz w kolejnym pilocie?",
  },
  limitations: {
    label: "Ograniczenia i błędy",
    hint: "Co mogło pójść źle i jak zachować kontrolę?",
    question: "Kiedy rozwiązanie się myliło? Jak chroniliście użytkowników i co zrobiłbyś inaczej?",
    requirement: "Rozmawiasz z inżynierami o jakości, koszcie i ograniczeniach rozwiązania.",
    meaning:
      "Kandydat wskazuje konkretny błąd: korzystanie z nieaktualnych informacji. Opisuje też kontrolę człowieka i możliwość wyłączenia podpowiedzi. To istotne dla rozmów o ograniczeniach AI; nie potwierdza samodzielnej wiedzy o zabezpieczeniach technicznych.",
    quote:
      "Każda podpowiedź wymagała akceptacji konsultanta; można było ją odrzucić i odpowiedzieć ręcznie.",
    unknown:
      "Nie wiemy, kto odpowiadał za aktualność materiałów i jak wykrywano nowe rodzaje błędów po pilocie.",
    followUp:
      "Kto i na jakiej podstawie zatrzymywał podpowiedzi? Jak monitorowalibyście je po wdrożeniu?",
  },
};

export const contextQuestion =
  "Jaki problem rozwiązywał projekt, dla kogo i w jakim zespole pracowałeś?";
export const preparedAnswers = {
  context:
    "W platformie B2B konsultanci ręcznie odpowiadali na powtarzalne zgłoszenia klientów. Chcieliśmy skrócić czas pierwszej odpowiedzi bez pogorszenia jakości. Pracowałem jako Product Owner z dwojgiem inżynierów, designerką i liderką obsługi.",
  contribution:
    "Sam przeprowadziłem 8 rozmów z konsultantami, opisałem problem i ustaliłem zakres pilota. Przygotowałem kryteria odbioru i prowadziłem cotygodniowy przegląd zgłoszeń. Inżynierowie wybrali model i wdrożyli integrację, a designerka zaprojektowała interfejs.",
  decisions:
    "Wybrałem podpowiedzi odpowiedzi zatwierdzane przez konsultanta zamiast automatycznej wysyłki. Rozważyliśmy też szablony bez AI. Zaczęliśmy od dwóch rodzajów zgłoszeń, bo automatyczna wysyłka mogła przekazać klientowi błędną informację. Nie porównaliśmy jeszcze kosztów obu rozwiązań.",
  evaluation:
    "Porównaliśmy 100 zgłoszeń z dwóch tygodni przed pilotem ze 100 z dwóch tygodni pilota. Mediana czasu pierwszej odpowiedzi spadła z 20 do 15 minut. To spadek o 25%, ale nie mieliśmy grupy kontrolnej. Obciążenie zespołu mogło się zmienić, więc nie przypisuję całej różnicy AI.",
  limitations:
    "Model czasem proponował odpowiedź na podstawie nieaktualnego cennika. Każda podpowiedź wymagała akceptacji konsultanta; można było ją odrzucić i odpowiedzieć ręcznie. Z liderką obsługi przeglądaliśmy błędy. W kolejnym pilocie ustaliłbym właściciela aktualizacji materiałów i próg zatrzymania funkcji.",
};
export type QuestionId = keyof typeof preparedAnswers;
const answer = z.string().max(3000);
export const answersSchema = z.object({
  context: answer,
  contribution: answer,
  decisions: answer,
  evaluation: answer,
  limitations: answer,
});
export const selectionSchema = z
  .array(z.enum(areaIds))
  .min(1)
  .max(4)
  .refine((ids) => new Set(ids).size === ids.length);
export const conversationSchema = z
  .object({
    applicationId: z.string().min(1).max(100),
    selected: selectionSchema,
    roleTitle: z.string().min(1).max(200),
    roleDescription: z.string().max(12000),
    answers: answersSchema,
    status: z.enum(["draft", "submitted"]),
  })
  .refine(
    (value) =>
      value.status !== "submitted" ||
      ["context", ...value.selected].every(
        (key) => value.answers[key as QuestionId].trim().length >= 20,
      ),
  );
export type Conversation = z.infer<typeof conversationSchema>;
export const emptyAnswers = {
  context: "",
  contribution: "",
  decisions: "",
  evaluation: "",
  limitations: "",
};
const sampleRole = marketplace.jobs.find((job) => job.slug === "ai-product-manager")!;

export function supportsPreparedConversation(
  application: State["applications"][number],
  role: { title: string; description: string },
) {
  return (
    application.id === "application-example" &&
    application.candidateId === "candidate-marek" &&
    application.jobId === sampleRole.id &&
    application.jobTitle === sampleRole.title &&
    application.candidateName === "Marek Nowak" &&
    role.title === sampleRole.title &&
    role.description === sampleRole.description
  );
}
export function hasPreparedReport(conversation: Conversation) {
  return (
    conversation.status === "submitted" &&
    conversation.roleTitle === sampleRole.title &&
    conversation.roleDescription === sampleRole.description &&
    ["context", ...conversation.selected].every(
      (key) => conversation.answers[key as QuestionId] === preparedAnswers[key as QuestionId],
    )
  );
}
export type ConversationAction =
  | { type: "conversation_configure"; applicationId: string; selected: AreaId[] }
  | { type: "conversation_answer"; applicationId: string; question: QuestionId; answer: string }
  | { type: "conversation_prepare"; applicationId: string }
  | { type: "conversation_submit"; applicationId: string };

export function updateConversation(state: State, action: ConversationAction) {
  const person = state.people.find((p) => p.id === state.activePersonId);
  const application = state.applications.find((item) => item.id === action.applicationId);
  const employer = person?.role === "employer" && application?.companyId === person.companyId;
  const candidate = person?.role === "candidate" && application?.candidateId === person.id;
  if (!application || (!employer && !candidate))
    throw new Error("Ta rozmowa nie jest dostępna dla wybranej osoby.");
  const existing = state.conversations.find((item) => item.applicationId === action.applicationId);
  if (action.type === "conversation_configure") {
    if (!employer) throw new Error("Obszary rozmowy wybiera rekruter.");
    const job = state.jobs.find((item) => item.id === application.jobId)!;
    const next = conversationSchema.parse({
      applicationId: application.id,
      selected: selectionSchema.parse(action.selected),
      roleTitle: job.title,
      roleDescription: job.description,
      answers: existing?.answers ?? emptyAnswers,
      status: "draft",
    });
    state.conversations = [
      ...state.conversations.filter((item) => item.applicationId !== application.id),
      next,
    ];
    return;
  }
  if (!existing) throw new Error("Rekruter musi najpierw wybrać obszary rozmowy.");
  if (action.type === "conversation_answer") {
    const question = z.enum(["context", ...areaIds]).parse(action.question);
    if (question !== "context" && !existing.selected.includes(question))
      throw new Error("Ten obszar nie został wybrany.");
    existing.answers[question] = answer.parse(action.answer);
    existing.status = "draft";
  } else if (action.type === "conversation_prepare") {
    if (
      !supportsPreparedConversation(application, {
        title: existing.roleTitle,
        description: existing.roleDescription,
      })
    )
      throw new Error(
        "Przygotowany przykład dotyczy Marka Nowaka i roli AI Product Manager w BrightLabs.",
      );
    existing.answers = { ...preparedAnswers };
    existing.status = "draft";
  } else {
    if (
      !["context", ...existing.selected].every(
        (key) => existing.answers[key as QuestionId].trim().length >= 20,
      )
    )
      throw new Error("Uzupełnij każdą odpowiedź (minimum 20 znaków) przed zakończeniem rozmowy.");
    existing.status = "submitted";
  }
}
