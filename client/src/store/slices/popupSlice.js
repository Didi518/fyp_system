import { createSlice } from '@reduxjs/toolkit';

const popupSlice = createSlice({
  name: 'popup',
  initialState: {
    isCreateStudentModalOpen: false,
    isCreateTeacherModalOpen: false,
    isCreateRequestModalOpen: false,
  },
  reducers: {
    toggleStudentModal(state) {
      state.isCreateStudentModalOpen = !state.isCreateStudentModalOpen;
    },
    toggleTeacherModal(state) {
      state.isCreateTeacherModalOpen = !state.isCreateTeacherModalOpen;
    },
    toggleRequestModal(state) {
      state.isCreateRequestModalOpen = !state.isCreateRequestModalOpen;
    },
    openStudentModal(state) {
      state.isCreateStudentModalOpen = true;
    },
    closeStudentModal(state) {
      state.isCreateStudentModalOpen = false;
    },
    openTeacherModal(state) {
      state.isCreateTeacherModalOpen = true;
    },
    closeTeacherModal(state) {
      state.isCreateTeacherModalOpen = false;
    },
    openRequestModal(state) {
      state.isCreateRequestModalOpen = true;
    },
    closeRequestModal(state) {
      state.isCreateRequestModalOpen = false;
    },
  },
});

export const {
  toggleStudentModal,
  toggleTeacherModal,
  toggleRequestModal,
  openStudentModal,
  closeStudentModal,
  openTeacherModal,
  closeTeacherModal,
  openRequestModal,
  closeRequestModal,
} = popupSlice.actions;
export default popupSlice.reducer;
