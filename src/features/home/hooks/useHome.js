import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  getDashboard,
} from '../store/homeSlice';

import {
  selectDashboard,
  selectHomeLoading,
  selectHomeError,
} from '../store/homeSelectors';

export default function useHome() {
  const dispatch =
    useDispatch();

  return {
    dashboard:
      useSelector(
        selectDashboard,
      ),

    loading:
      useSelector(
        selectHomeLoading,
      ),

    error:
      useSelector(
        selectHomeError,
      ),

    fetchDashboard: () =>
      dispatch(
        getDashboard(),
      ),
  };
}