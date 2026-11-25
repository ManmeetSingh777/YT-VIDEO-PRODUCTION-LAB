// Shared DIAGNOSTIC fixtures for tests/tbo. TEACHING_MODEL = Channel Bible §8.6 teaching example (HYPOTHETICAL_PARAMETER inputs):
// a mechanism proof, NOT Mia's approved economics and not a forecast.
export const TEACHING_MODEL = Object.freeze({
  id: "bible_8_6_teaching", version: "1.0.0", truth_mode: "M", outcome_classification: "DEMONSTRATED_IN_MODEL",
  objective: "daily net contribution of a capacity-limited restaurant (Channel Bible §8.6 teaching example, not a forecast)",
  variables: [
    { id: "price", label: "price per meal", value: 12, unit: "USD/meal", provenance: "HYPOTHETICAL_PARAMETER", range: [0, 100] },
    { id: "var_cost", label: "direct variable cost per meal", value: 9, unit: "USD/meal", provenance: "HYPOTHETICAL_PARAMETER", range: [0, 100] },
    { id: "meals", label: "meals served per day", value: 180, unit: "meal/day", provenance: "HYPOTHETICAL_PARAMETER", range: [0, 1000] },
    { id: "capacity", label: "kitchen capacity", value: 180, unit: "meal/day", provenance: "HYPOTHETICAL_PARAMETER" },
    { id: "other_cost", label: "other daily cost", value: 600, unit: "USD/day", provenance: "HYPOTHETICAL_PARAMETER" },
    { id: "drinks", label: "incremental drinks per day", value: 0, unit: "drink/day", provenance: "HYPOTHETICAL_PARAMETER", range: [0, 1000] },
    { id: "drink_margin", label: "contribution per drink", value: 3, unit: "USD/drink", provenance: "HYPOTHETICAL_PARAMETER" },
  ],
  formulas: [
    { id: "unit_contribution", label: "money left per meal", expr: "price - var_cost", unit: "USD/meal" },
    { id: "meal_contribution", label: "money left from meals", expr: "meals * unit_contribution", unit: "USD/day" },
    { id: "drink_contribution", label: "money left from drinks", expr: "drinks * drink_margin", unit: "USD/day" },
    { id: "net", label: "net per day", expr: "meal_contribution + drink_contribution - other_cost", unit: "USD/day" },
  ],
  constraints: [{ id: "kitchen_capacity", expr: "meals <= capacity", reason: "the kitchen cannot cook more meals per day than its capacity" }],
  scenarios: [
    { id: "baseline", label: "packed, losing money", overrides: {}, status: "DEMONSTRATED_IN_MODEL", claim: { output: "net", outcome: "LOSS" } },
    { id: "discount", label: "discount to $10, same full kitchen", overrides: { price: 10 }, status: "DEMONSTRATED_IN_MODEL", claim: { output: "net", outcome: "LOSS" } },
    { id: "better", label: "lower variable cost + drinks", overrides: { var_cost: 8.4, drinks: 40 }, status: "DEMONSTRATED_IN_MODEL", claim: { output: "net", outcome: "GAIN" } },
    { id: "discount_more_volume", label: "discount and 220 meals", overrides: { price: 10, meals: 220 }, status: "DEMONSTRATED_IN_MODEL", claim: { output: "net", outcome: "BREAKS_CONSTRAINT" } },
  ],
  assumptions: ["extra drinks need no scarce kitchen capacity or new overhead", "lower variable cost does not change quality or demand"],
  counterexamples: ["if drinks need bar staff or the cheaper ingredients cut demand, the better scenario can lose money"],
});
