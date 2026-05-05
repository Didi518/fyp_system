import { useDispatch, useSelector } from 'react-redux';

import {
  toggleStudentModal,
  toggleTeacherModal,
  toggleRequestModal,
  openStudentModal,
  closeStudentModal,
  openTeacherModal,
  closeTeacherModal,
  openRequestModal,
  closeRequestModal,
} from '../store/slices/popupSlice';

export const usePopup = () => {
  const dispatch = useDispatch();

  const {
    isCreateStudentModalOpen,
    isCreateTeacherModalOpen,
    isCreateRequestModalOpen,
  } = useSelector((state) => state.popup);

  return {
    isCreateStudentModalOpen,
    isCreateTeacherModalOpen,
    isCreateRequestModalOpen,

    toggleStudentModal: () => dispatch(toggleStudentModal()),
    toggleTeacherModal: () => dispatch(toggleTeacherModal()),
    toggleRequestModal: () => dispatch(toggleRequestModal()),
    openStudentModal: () => dispatch(openStudentModal()),
    closeStudentModal: () => dispatch(closeStudentModal()),
    openTeacherModal: () => dispatch(openTeacherModal()),
    closeTeacherModal: () => dispatch(closeTeacherModal()),
    openRequestModal: () => dispatch(openRequestModal()),
    closeRequestModal: () => dispatch(closeRequestModal()),
  };
};
