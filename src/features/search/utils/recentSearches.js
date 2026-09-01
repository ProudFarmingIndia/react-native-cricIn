import AsyncStorage from "@react-native-async-storage/async-storage";

/*
|--------------------------------------------------------------------------
| Recent Searches
|--------------------------------------------------------------------------
|
| A search screen that opens to a blank slate makes the user retype the
| same names over and over - the header search is mostly used to jump back
| to a handful of teammates and rival teams, not to discover new ones.
|
| Stored locally rather than on the server: it is a per-device convenience,
| it must render instantly with no round trip, and it should never be
| something another user could read.
|
| Entry shape: { term, scope, at }
|   term  - exactly what was typed
|   scope - which tab it was run in, so tapping it restores that tab
|   at    - epoch ms, for ordering
|
*/

const STORAGE_KEY = "@cricin/recent_searches";

const MAX_ENTRIES = 8;

/*
| Every function here swallows its own errors and falls back to an empty
| list. Recent searches are a nicety - a corrupt or unavailable store must
| never stop the user from actually searching.
*/

export const loadRecentSearches = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry) => entry && typeof entry.term === "string" && entry.term.trim())
      .slice(0, MAX_ENTRIES);
  } catch (error) {
    return [];
  }
};

export const saveRecentSearch = async (term, scope = "all") => {
  const trimmed = (term || "").trim();

  if (!trimmed) {
    return [];
  }

  try {
    const existing = await loadRecentSearches();

    /*
    | Case-insensitive de-dupe, so "mumbai" typed after "Mumbai" moves the
    | existing entry to the top instead of creating a near-duplicate row.
    */

    const withoutDuplicate = existing.filter(
      (entry) => entry.term.toLowerCase() !== trimmed.toLowerCase(),
    );

    const next = [
      {
        term: trimmed,
        scope,
        at: Date.now(),
      },
      ...withoutDuplicate,
    ].slice(0, MAX_ENTRIES);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    return next;
  } catch (error) {
    return [];
  }
};

export const removeRecentSearch = async (term) => {
  try {
    const existing = await loadRecentSearches();

    const next = existing.filter(
      (entry) => entry.term.toLowerCase() !== (term || "").toLowerCase(),
    );

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    return next;
  } catch (error) {
    return [];
  }
};

export const clearRecentSearches = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Nothing useful to do - the list simply stays as it was.
  }

  return [];
};
