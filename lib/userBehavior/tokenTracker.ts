// File: lib/userBehavior/tokenTracker.ts

export type TokenStats = {
  selections: number;
  purchases: number;
  lastSelected: number;
  lastPurchased: number;
};

export type TokenOption = {
  symbol: string;
  label: string;
  icon: string;
};

// Scoring algorithm to pick best token for a user
export function getPersonalizedDefaultToken(
  userId: string | undefined,
  tokens: TokenOption[]
): string {
  if (!userId) return tokens[0].symbol;

  try {
    const userPrefs = localStorage.getItem(`token_prefs_${userId}`);
    if (!userPrefs) return tokens[0].symbol;

    const preferences = JSON.parse(userPrefs) as Record<string, TokenStats>;
    const now = Date.now();

    const RECENCY_WEIGHT = 0.5;
    const FREQUENCY_WEIGHT = 0.3;
    const SUCCESS_WEIGHT = 0.2;

    let maxScore = 0;
    let bestToken = tokens[0].symbol;

    tokens.forEach((token) => {
      const tokenData = preferences[token.symbol] || {
        selections: 0,
        purchases: 0,
        lastSelected: 0,
        lastPurchased: 0,
      };

      const daysSinceSelection = Math.max(
        1,
        (now - tokenData.lastSelected) / (24 * 60 * 60 * 1000)
      );
      const recencyScore = Math.exp(-daysSinceSelection / 14);

      const totalSelections = Object.values(preferences).reduce(
        (sum, d) => sum + (d.selections || 0),
        0
      );
      const frequencyScore =
        totalSelections > 0 ? tokenData.selections / totalSelections : 0;

      const successScore =
        tokenData.selections > 0
          ? tokenData.purchases / tokenData.selections
          : 0;

      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
      const recentBonus = tokenData.lastSelected > threeDaysAgo ? 0.2 : 0;

      const finalScore =
        recencyScore * RECENCY_WEIGHT +
        frequencyScore * FREQUENCY_WEIGHT +
        successScore * SUCCESS_WEIGHT +
        recentBonus;

      if (finalScore > maxScore && tokenData.selections > 0) {
        maxScore = finalScore;
        bestToken = token.symbol;
      }
    });

    return bestToken;
  } catch (err) {
    console.error("Error getting personalized token:", err);
    return tokens[0].symbol;
  }
}

// Track when user selects a token
export function trackTokenSelection(userId: string | undefined, token: string) {
  if (!userId) return;
  try {
    const prefsKey = `token_prefs_${userId}`;
    const existing = localStorage.getItem(prefsKey);
    const preferences = existing ? JSON.parse(existing) : {};

    if (!preferences[token]) {
      preferences[token] = {
        selections: 0,
        purchases: 0,
        lastSelected: 0,
        lastPurchased: 0,
      };
    }

    preferences[token].selections += 1;
    preferences[token].lastSelected = Date.now();

    localStorage.setItem(prefsKey, JSON.stringify(preferences));
  } catch (err) {
    console.error("Error tracking token selection:", err);
  }
}

// Track when user successfully purchases a token
export function trackTokenPurchase(userId: string | undefined, token: string) {
  if (!userId) return;
  try {
    const prefsKey = `token_prefs_${userId}`;
    const existing = localStorage.getItem(prefsKey);
    const preferences = existing ? JSON.parse(existing) : {};

    if (!preferences[token]) {
      preferences[token] = {
        selections: 0,
        purchases: 0,
        lastSelected: 0,
        lastPurchased: 0,
      };
    }

    preferences[token].purchases += 1;
    preferences[token].lastPurchased = Date.now();

    localStorage.setItem(prefsKey, JSON.stringify(preferences));
  } catch (err) {
    console.error("Error tracking token purchase:", err);
  }
}
