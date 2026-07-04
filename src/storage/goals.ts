import db from "./database";

export type Goal = {
    id: number;
    scope: string;
    name: string;
    target_amount: number;
    target_currency: string;
    priority: number;
    created_at: string;
    updated_at: string;
};

const DEFAULT_SCOPE = "global";

function normalizeGoalPriorities(scope = DEFAULT_SCOPE) {
    const goals = getGoals(scope);

    for (const [index, goal] of goals.entries()) {
        db.prepare("UPDATE goals SET priority = ?, updated_at = ? WHERE id = ?").run(
            index + 1,
            new Date().toISOString(),
            goal.id
        );
    }
}

export function getGoals(scope = DEFAULT_SCOPE): Goal[] {
    return db
        .prepare(
            `
      SELECT id, scope, name, target_amount, target_currency, priority, created_at, updated_at
      FROM goals
      WHERE scope = ?
      ORDER BY priority ASC, created_at ASC, id ASC
      `
        )
        .all(scope) as Goal[];
}

function getGoalByPriority(priority: number, scope = DEFAULT_SCOPE): Goal | null {
    const goal = db
        .prepare(
            `
      SELECT id, scope, name, target_amount, target_currency, priority, created_at, updated_at
      FROM goals
      WHERE scope = ? AND priority = ?
      LIMIT 1
      `
        )
        .get(scope, Math.max(1, Math.floor(priority))) as Goal | undefined;

    return goal ?? null;
}

export function addGoal(name: string, targetAmount: number, targetCurrency: string, priority?: number, scope = DEFAULT_SCOPE) {
    const now = new Date().toISOString();
    const nextPriority = getGoals(scope).length + 1;
    const requestedPriority = priority ? Math.max(1, Math.floor(priority)) : nextPriority;

    db.prepare(
        `
      UPDATE goals
      SET priority = priority + 1, updated_at = ?
      WHERE scope = ? AND priority >= ?
      `
    ).run(now, scope, requestedPriority);

    db.prepare(
        `
      INSERT INTO goals (scope, name, target_amount, target_currency, priority, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    ).run(scope, name.trim(), targetAmount, targetCurrency, requestedPriority, now, now);

    normalizeGoalPriorities(scope);
}

export function removeGoal(priority: number, scope = DEFAULT_SCOPE) {
    const goal = getGoalByPriority(priority, scope);

    if (!goal) return false;

    db.prepare("DELETE FROM goals WHERE id = ?").run(goal.id);
    normalizeGoalPriorities(scope);
    return true;
}

export function completeGoal(priority: number, scope = DEFAULT_SCOPE) {
    const goal = getGoalByPriority(priority, scope);

    if (!goal) return null;

    db.prepare(
        `
      INSERT INTO completed_goals (scope, name, target_amount, target_currency, completed_at)
      VALUES (?, ?, ?, ?, ?)
      `
    ).run(scope, goal.name, goal.target_amount, goal.target_currency, new Date().toISOString());

    db.prepare("DELETE FROM goals WHERE id = ?").run(goal.id);
    normalizeGoalPriorities(scope);
    return goal;
}

export function reorderGoal(priority: number, newPriority: number, scope = DEFAULT_SCOPE) {
    const goal = getGoalByPriority(priority, scope);

    if (!goal) return false;

    const goals = getGoals(scope).filter((currentGoal) => currentGoal.id !== goal.id);
    const insertIndex = Math.min(Math.max(0, Math.floor(newPriority) - 1), goals.length);
    const reorderedGoals = [...goals.slice(0, insertIndex), goal, ...goals.slice(insertIndex)];
    const now = new Date().toISOString();

    for (const [index, currentGoal] of reorderedGoals.entries()) {
        db.prepare("UPDATE goals SET priority = ?, updated_at = ? WHERE id = ?").run(index + 1, now, currentGoal.id);
    }

    return true;
}

export function clearGoals(scope = DEFAULT_SCOPE) {
    db.prepare("DELETE FROM goals WHERE scope = ?").run(scope);
}
