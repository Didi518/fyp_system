import { SupervisorRequest } from '../models/supervisorRequest.js';

export const findPendingByStudent = async (studentId) => {
  return await SupervisorRequest.findOne({
    student: studentId,
    status: 'pending',
  });
};

export const createRequest = async (requestData) => {
  const request = await SupervisorRequest.create(requestData);
  return request;
};
