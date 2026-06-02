import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { downloadProjectFile as downloadProjectFileThunk } from '../store/slices/projectSlice';

export const useProject = () => {
  const dispatch = useDispatch();

  const downloadProjectFile = useCallback(
    (payload) => {
      return dispatch(downloadProjectFileThunk(payload));
    },
    [dispatch],
  );

  return {
    downloadProjectFile,
  };
};
