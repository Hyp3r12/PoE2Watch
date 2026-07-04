import db from "../storage/database";
import { Goal } from "../storage/goals";
import { convertValue, formatCurrencyName, formatEstimateAmount, formatPrice, normalizeCurrency } from "./valueformatter";

type SaleValueRow = {
    price_amount: number;
    price_currency: string;
};

type GoalProgress = {
    goal: Goal;
    targetCurrency: string;
    targetDivine: number | null;
    allocatedDivine: number | null;
    allocatedTarget: number | null;
    remainingTarget: number | null;
    percent: number;
};

const BAR_WIDTH = 10;
const BASE_CURRENCY = "divine";

function getTrackedSales(): SaleValueRow[] {
    return db
        .prepare(
            `
      SELECT price_amount, price_currency
      FROM sales
      ORDER BY datetime(sold_at) DESC
      `
        )
        .all() as SaleValueRow[];
}

function getTrackedTotalDivine() {
    let total = 0;
    let convertedCount = 0;
    let missingCount = 0;

    for (const sale of getTrackedSales()) {
        const converted = convertValue(sale.price_amount, sale.price_currency, BASE_CURRENCY);

        if (converted === null) {
            missingCount += 1;
            continue;
        }

        total += converted;
        convertedCount += 1;
    }

    return { total, convertedCount, missingCount };
}

function formatProgressBar(percent: number) {
    const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * BAR_WIDTH);

    return `[${"#".repeat(filled)}${"-".repeat(BAR_WIDTH - filled)}]`;
}

function convertDivineToTarget(amount: number, targetCurrency: string) {
    return convertValue(amount, BASE_CURRENCY, targetCurrency);
}

function getGoalTargetDivine(goal: Goal) {
    return convertValue(goal.target_amount, goal.target_currency, BASE_CURRENCY);
}

function getGoalProgress(goals: Goal[]) {
    const tracked = getTrackedTotalDivine();
    let remainingDivine = tracked.total;
    const progress: GoalProgress[] = [];

    for (const goal of goals) {
        const targetCurrency = normalizeCurrency(goal.target_currency);
        const targetDivine = getGoalTargetDivine(goal);

        if (targetDivine === null) {
            progress.push({
                goal,
                targetCurrency,
                targetDivine: null,
                allocatedDivine: null,
                allocatedTarget: null,
                remainingTarget: null,
                percent: 0,
            });
            continue;
        }

        const allocatedDivine = Math.min(remainingDivine, targetDivine);
        remainingDivine = Math.max(0, remainingDivine - targetDivine);

        const allocatedTarget = convertDivineToTarget(allocatedDivine, targetCurrency);
        const remainingTarget = convertDivineToTarget(Math.max(0, targetDivine - allocatedDivine), targetCurrency);

        progress.push({
            goal,
            targetCurrency,
            targetDivine,
            allocatedDivine,
            allocatedTarget,
            remainingTarget,
            percent: targetDivine > 0 ? Math.min(100, (allocatedDivine / targetDivine) * 100) : 0,
        });
    }

    return { progress, tracked };
}

function formatGoalLine(entry: GoalProgress) {
    const { goal, targetCurrency, allocatedTarget, remainingTarget, percent } = entry;
    const target = formatPrice(goal.target_amount, targetCurrency);

    if (allocatedTarget === null || remainingTarget === null) {
        return [
            `**${goal.priority}. ${goal.name}**`,
            `Target: **${target}**`,
            "Progress unavailable with current cached rates.",
        ].join("\n");
    }

    const current = `${formatEstimateAmount(allocatedTarget)} / ${formatEstimateAmount(goal.target_amount)} ${formatCurrencyName(
        targetCurrency
    )}`;
    const remaining = `${formatEstimateAmount(remainingTarget)} ${formatCurrencyName(targetCurrency)} remaining`;
    const status = percent >= 100 ? "Complete" : remaining;

    return [
        `**${goal.priority}. ${goal.name}**`,
        `Target: **${target}**`,
        `${formatProgressBar(percent)} **${formatEstimateAmount(percent)}%**`,
        `${current}`,
        status,
    ].join("\n");
}

export function buildGoalsDescription(goals: Goal[]) {
    if (goals.length === 0) {
        return "No goals set yet. Add one with `/goal add`.";
    }

    const { progress, tracked } = getGoalProgress(goals);
    const missing =
        tracked.missingCount > 0
            ? `\n\n${tracked.missingCount} sale(s) could not be converted with current cached rates.`
            : "";

    return [
        `Tracked value: **approx. ${formatEstimateAmount(tracked.total)} Divine**`,
        `${tracked.convertedCount} converted sale(s) counted.`,
        "Sales fund priority 1 first, then spill into the next goal.",
        "",
        ...progress.map(formatGoalLine).join("\n\n").split("\n"),
        missing,
    ]
        .filter(Boolean)
        .join("\n");
}
