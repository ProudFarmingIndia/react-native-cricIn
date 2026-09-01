/*
|--------------------------------------------------------------------------
| Ball Handoff
|--------------------------------------------------------------------------
|
| A recorded delivery has to travel from the modal that submitted it back to
| LiveScoringScreen, which owns the checks that follow: over complete, all
| out, target reached, innings over.
|
| WHY NOT ROUTE PARAMS
|
| That is how it used to work - navigate("LiveScoringScreen", { __ballResult,
| matchId, inningsId }) - and it quietly destroyed the screen.
|
| React Navigation 6 REPLACES params on navigate() rather than merging them,
| so that call wiped battingSquad, bowlingSquad and target off
| LiveScoringScreen on the very first ball of the innings. For the rest of
| the match no wicket could be recorded (the dismissal modal had empty squads
| and its form could never validate), all-out was never detected, the chase
| panel vanished, and the innings break offered a second innings that had
| already been played.
|
| Passing merge: true would fix that one call. This module removes the whole
| class of bug instead: the modals navigate with NO params at all, so there
| is nothing to clobber, and the result travels here.
|
| It is a module variable rather than Redux on purpose. This is a one-shot
| baton between two screens - put it in the store and it becomes state that
| can be read twice, persisted, or left behind.
|
| Each result carries an id so a screen that remounts cannot re-consume a
| baton it has already taken.
|
*/

let pending = null;

let sequence = 0;

export const setPendingBallResult = (result) => {
  if (!result) return;

  sequence += 1;

  pending = { id: sequence, result };
};

/*
| Takes the result and clears it in the same step, so two callers can never
| both act on one delivery.
*/

export const consumePendingBallResult = () => {
  const held = pending;

  pending = null;

  return held ? held.result : null;
};

// Dropped without acting on it - used when a screen unmounts mid-flow.
export const clearPendingBallResult = () => {
  pending = null;
};
