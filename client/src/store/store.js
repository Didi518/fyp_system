import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import popupReducer from './slices/popupSlice';
import adminReducer from './slices/adminSlice';
import projectReducer from './slices/projectSlice';
import requestReducer from './slices/requestSlice';
import studentReducer from './slices/studentSlice';
import teacherReducer from './slices/teacherSlice';
import deadlineReducer from './slices/deadlineSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    popup: popupReducer,
    admin: adminReducer,
    project: projectReducer,
    request: requestReducer,
    student: studentReducer,
    teacher: teacherReducer,
    deadline: deadlineReducer,
    notification: notificationReducer,
  },
});
