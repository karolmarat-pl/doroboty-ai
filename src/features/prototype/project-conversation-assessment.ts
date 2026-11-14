import type { QuestionId } from "./project-conversation-model";

type EvidencePoint = { text: string; quote: string };
type AnswerAssessment = { pros: EvidencePoint[]; cons: EvidencePoint[] };

// Prepared interpretations only; the report owner enforces exact-answer eligibility.
export const preparedAssessments: Record<QuestionId, AnswerAssessment> = {
  context: {
    pros: [
      {
        text: "Łączy cel operacyjny z utrzymaniem jakości — to przydatne przy definiowaniu pilota w tej roli.",
        quote: "Chcieliśmy skrócić czas pierwszej odpowiedzi bez pogorszenia jakości.",
      },
      {
        text: "Zaczyna od problemu w codziennej pracy konsultantów, co odpowiada potrzebie rozpoznania procesu przed wyborem rozwiązania.",
        quote:
          "W platformie B2B konsultanci ręcznie odpowiadali na powtarzalne zgłoszenia klientów.",
      },
    ],
    cons: [],
  },
  contribution: {
    pros: [
      {
        text: "Samodzielnie bada problem i ustala zakres pilota — opisuje konkretny wkład w pracę produktową wymaganą na tym stanowisku.",
        quote:
          "Sam przeprowadziłem 8 rozmów z konsultantami, opisałem problem i ustaliłem zakres pilota.",
      },
      {
        text: "Rozdziela własną odpowiedzialność od pracy inżynierów i designerki, co pomaga zrozumieć jego rolę we współpracy z zespołem.",
        quote:
          "Inżynierowie wybrali model i wdrożyli integrację, a designerka zaprojektowała interfejs.",
      },
    ],
    cons: [],
  },
  decisions: {
    pros: [
      {
        text: "Zostawia człowiekowi zatwierdzanie odpowiedzi, ograniczając ryzyko błędnej informacji trafiającej do klienta.",
        quote:
          "Wybrałem podpowiedzi odpowiedzi zatwierdzane przez konsultanta zamiast automatycznej wysyłki.",
      },
      {
        text: "Ogranicza pilot do dwóch rodzajów zgłoszeń — to przykład zawężenia zakresu potrzebnego przy pierwszym wdrożeniu.",
        quote:
          "Zaczęliśmy od dwóch rodzajów zgłoszeń, bo automatyczna wysyłka mogła przekazać klientowi błędną informację.",
      },
    ],
    cons: [
      {
        text: "Nie porównano jeszcze kosztów rozważanych rozwiązań, więc decyzja nie obejmuje pełnego kompromisu między kosztem a wynikiem.",
        quote: "Nie porównaliśmy jeszcze kosztów obu rozwiązań.",
      },
    ],
  },
  evaluation: {
    pros: [
      {
        text: "Porównuje wynik pilota z punktem wyjścia i podaje liczebność obu prób, zgodnie z potrzebą mierzenia efektów w tej roli.",
        quote:
          "Porównaliśmy 100 zgłoszeń z dwóch tygodni przed pilotem ze 100 z dwóch tygodni pilota.",
      },
      {
        text: "Rozpoznaje ograniczenia pomiaru i ostrożnie przypisuje efekt AI, zamiast traktować samą zmianę wyniku jako dowód skuteczności.",
        quote: "Obciążenie zespołu mogło się zmienić, więc nie przypisuję całej różnicy AI.",
      },
    ],
    cons: [
      {
        text: "Brak grupy kontrolnej ogranicza możliwość przypisania poprawy wdrożeniu AI — taki pomiar wymaga mocniejszego porównania w kolejnym pilocie.",
        quote: "To spadek o 25%, ale nie mieliśmy grupy kontrolnej.",
      },
    ],
  },
  limitations: {
    pros: [
      {
        text: "Opisuje zatwierdzanie i odrzucanie podpowiedzi oraz powrót do ręcznej odpowiedzi, czyli konkretną kontrolę człowieka nad rozwiązaniem.",
        quote:
          "Każda podpowiedź wymagała akceptacji konsultanta; można było ją odrzucić i odpowiedzieć ręcznie.",
      },
      {
        text: "Uwzględnia przegląd błędów wspólnie z liderką obsługi, co jest przydatne przy omawianiu jakości rozwiązania z zespołem.",
        quote: "Z liderką obsługi przeglądaliśmy błędy.",
      },
    ],
    cons: [
      {
        text: "Ustalenie właściciela aktualizacji i progu zatrzymania funkcji wskazuje dopiero jako krok na kolejny pilot; opisany nadzór wymaga więc dopracowania.",
        quote:
          "W kolejnym pilocie ustaliłbym właściciela aktualizacji materiałów i próg zatrzymania funkcji.",
      },
    ],
  },
};

export const emptyConsMessage =
  "Ta odpowiedź nie wskazuje konkretnego minusa; kwestie do sprawdzenia znajdziesz poniżej";
