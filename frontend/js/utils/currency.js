export function toDisplayCost(costInMinimalValue) {
    return `\$${(costInMinimalValue / 100.0).toFixed(2)}`;
}