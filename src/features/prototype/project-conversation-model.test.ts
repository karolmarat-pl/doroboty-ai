import { describe, expect, it } from "vitest";
import { initialState, transition } from "./model";
import { parseState, serializeState } from "./storage";
import { areaIds, areas, hasPreparedReport, preparedAnswers } from "./project-conversation-model";
import { preparedAssessments } from "./project-conversation-assessment";

function configured() {
  const state = transition(initialState(), { type: "select_person", id: "employer-brightlabs" });
  return transition(state, {
    type: "conversation_configure",
    applicationId: "application-example",
    selected: [...areaIds],
  });
}
function completed() {
  return transition(
    transition(configured(), {
      type: "conversation_prepare",
      applicationId: "application-example",
    }),
    { type: "conversation_submit", applicationId: "application-example" },
  );
}
describe("project conversation boundaries and report freshness", () => {
  it("grounds every prepared pro/con in its own answer without forcing negative points", () => {
    for (const key of ["context", ...areaIds] as const) {
      const assessment = preparedAssessments[key];
      expect(assessment.pros.length).toBeGreaterThanOrEqual(1);
      expect(assessment.pros.length).toBeLessThanOrEqual(2);
      expect(assessment.cons.length).toBeLessThanOrEqual(2);
      for (const point of [...assessment.pros, ...assessment.cons]) {
        expect(point.text.trim().length).toBeGreaterThan(0);
        expect(point.quote.trim().length).toBeGreaterThan(0);
        expect(preparedAnswers[key]).toContain(point.quote);
      }
    }
    expect(preparedAssessments.context.cons).toEqual([]);
    expect(preparedAssessments.contribution.cons).toEqual([]);
  });
  it("invalidates on every answer edit and never interprets custom answers, including round trips", () => {
    const original = completed();
    expect(hasPreparedReport(original.conversations[0])).toBe(true);
    for (const question of ["context", ...areaIds] as const) {
      let changed = transition(original, {
        type: "conversation_answer",
        applicationId: "application-example",
        question,
        answer: "A different synthetic answer that needs a new interpretation.",
      });
      expect(changed.conversations[0].status).toBe("draft");
      expect(hasPreparedReport(changed.conversations[0])).toBe(false);
      changed = transition(parseState(serializeState(changed)), {
        type: "conversation_submit",
        applicationId: "application-example",
      });
      expect(hasPreparedReport(changed.conversations[0])).toBe(false);
      expect(changed.applications).toEqual(original.applications);
    }
  });
  it("invalidates configuration edits and keeps unselected areas out of the result", () => {
    const state = transition(completed(), {
      type: "conversation_configure",
      applicationId: "application-example",
      selected: ["evaluation"],
    });
    expect(hasPreparedReport(state.conversations[0])).toBe(false);
    expect(state.conversations[0].selected).toEqual(["evaluation"]);
    expect(() =>
      transition(state, {
        type: "conversation_answer",
        applicationId: "application-example",
        question: "decisions",
        answer: "Changed",
      }),
    ).toThrow("nie został wybrany");
    expect(() =>
      transition(state, {
        type: "conversation_configure",
        applicationId: "application-example",
        selected: [],
      }),
    ).toThrow();
  });
  it("gates employer company, candidate ownership and configuration", () => {
    for (const id of ["employer-northstar", "candidate-anna", "operator"]) {
      const state = transition(configured(), { type: "select_person", id });
      expect(() =>
        transition(state, { type: "conversation_prepare", applicationId: "application-example" }),
      ).toThrow("nie jest dostępna");
    }
    const candidate = transition(configured(), { type: "select_person", id: "candidate-marek" });
    expect(() =>
      transition(candidate, {
        type: "conversation_configure",
        applicationId: "application-example",
        selected: ["evaluation"],
      }),
    ).toThrow("wybiera rekruter");
    expect(
      transition(candidate, { type: "conversation_prepare", applicationId: "application-example" })
        .conversations[0].answers,
    ).toEqual(preparedAnswers);
    expect(() =>
      transition(configured(), {
        type: "conversation_submit",
        applicationId: "application-example",
      }),
    ).toThrow("Uzupełnij");
  });
  it("preserves old v1 imports, validates conversation references, and resets with the scenario", () => {
    const legacy = JSON.parse(serializeState(initialState()));
    delete legacy.conversations;
    expect(parseState(JSON.stringify(legacy)).conversations).toEqual([]);
    const state = completed();
    state.conversations[0].applicationId = "missing";
    expect(() => parseState(serializeState(state))).toThrow("Nieprawidłowy");
    const duplicate = completed();
    duplicate.conversations.push(duplicate.conversations[0]);
    expect(() => parseState(serializeState(duplicate))).toThrow("Nieprawidłowy");
    expect(initialState().conversations).toEqual([]);
  });
  it("ties prepared interpretation to exact source quotes and the saved role requirements", () => {
    const state = completed();
    for (const key of areaIds) {
      expect(preparedAnswers[key]).toContain(areas[key].quote);
      expect(state.conversations[0].roleDescription).toContain(areas[key].requirement);
    }
    state.jobs[0].description = "Changed role description with different requirements.";
    const updated = transition(state, {
      type: "conversation_configure",
      applicationId: "application-example",
      selected: ["evaluation"],
    });
    expect(() =>
      transition(updated, { type: "conversation_prepare", applicationId: "application-example" }),
    ).toThrow("Przygotowany przykład");
    expect(
      hasPreparedReport(
        transition(updated, { type: "conversation_submit", applicationId: "application-example" })
          .conversations[0],
      ),
    ).toBe(false);
  });
});
