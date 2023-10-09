/**
 * Create display (user-friendly) string cost for the cost in minimal currency unit.
 * For this app calculations are in USD.
 * Example: 1000 => $10.00
 * @param {*} costInMinimalUnit Cost in minimal unit (cents).
 * @returns Display cost string that may be used in the UI.
 */
export function toDisplayCost(costInMinimalUnit) {
    return `\$${(costInMinimalUnit / 100.0).toFixed(2)}`;
}