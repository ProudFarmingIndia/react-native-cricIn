import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  createInnings,
  getInningsById,
  endInnings,
  addBall,
  setNextBatsman,
  setNextBowler,
  undoLastBall,
  getInningsScorecard,
  clearScoringError,
  resetScoringState,
} from "../store/scoringSlice";

export default function useScoring() {
  const dispatch = useDispatch();

  const { currentInnings, balls, loading, error, success } = useSelector(
    (state) => state.scoring,
  );

  const startInnings = useCallback(
    async (payload) => {
      const result = await dispatch(createInnings(payload));
      if (createInnings.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const fetchInningsById = useCallback(
    async (inningsId) => {
      const result = await dispatch(getInningsById(inningsId));
      if (getInningsById.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const finishInnings = useCallback(
    async (inningsId) => {
      const result = await dispatch(endInnings(inningsId));
      if (endInnings.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const recordBall = useCallback(
    async (payload) => {
      const result = await dispatch(addBall(payload));
      if (addBall.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const chooseNextBatsman = useCallback(
    async (inningsId, playerId) => {
      const result = await dispatch(setNextBatsman({ inningsId, playerId }));
      if (setNextBatsman.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const chooseNextBowler = useCallback(
    async (inningsId, playerId) => {
      const result = await dispatch(setNextBowler({ inningsId, playerId }));
      if (setNextBowler.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const undoBall = useCallback(
    async (inningsId) => {
      const result = await dispatch(undoLastBall(inningsId));
      if (undoLastBall.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const fetchInningsScorecard = useCallback(
    async (inningsId) => {
      const result = await dispatch(getInningsScorecard(inningsId));
      if (getInningsScorecard.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  return {
    currentInnings,
    balls,
    loading,
    error,
    success,

    createInnings: startInnings,
    getInningsById: fetchInningsById,
    endInnings: finishInnings,
    addBall: recordBall,
    setNextBatsman: chooseNextBatsman,
    setNextBowler: chooseNextBowler,
    undoLastBall: undoBall,
    getInningsScorecard: fetchInningsScorecard,

    clearScoringError: useCallback(
      () => dispatch(clearScoringError()),
      [dispatch],
    ),
    resetScoringState: useCallback(
      () => dispatch(resetScoringState()),
      [dispatch],
    ),
  };
}