import { Project } from '../models/project.js';
import ErrorHandler from '../middlewares/error.js';
import {
  ACTIVE_STATUSES,
  ARCHIVED_STATUS,
  FINAL_STATUSES,
} from '../constants/constants.js';

export const archiveTerminalProjects = async (studentId) => {
  await Project.updateMany(
    {
      student: studentId,
      status: { $in: FINAL_STATUSES },
      archivedAt: null,
    },
    {
      status: ARCHIVED_STATUS,
      archivedAt: new Date(),
    },
  );
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate('student', 'name email')
    .populate('supervisor', 'name email');

  if (!project) {
    throw new ErrorHandler('Projet non trouvé', 404);
  }

  return project;
};

export const getLatestProjectByStudent = async (studentId) => {
  return Project.findOne({
    student: studentId,
    status: { $ne: ARCHIVED_STATUS },
  }).sort({ createdAt: -1 });
};

export const getActiveProjectByStudent = async (studentId) => {
  return Project.findOne({
    student: studentId,
    status: { $in: ACTIVE_STATUSES },
  }).sort({ createdAt: -1 });
};

export const createProject = async (projectData) => {
  const project = new Project(projectData);
  await project.save();
  return project;
};

export const addFilesToProject = async (project, files) => {
  const fileMetaData = files.map((file) => ({
    fileType: file.mimetype,
    fileUrl: file.path,
    originalName: file.originalname,
    uploadedAt: new Date(),
  }));

  project.files.push(...fileMetaData);
  await project.save();
  return project;
};

export const getAllProjects = async (page = 1, limit = 10, status = null) => {
  const query = status ? { status } : {};

  const projects = await Project.find(query)
    .populate('student', 'name email')
    .populate('supervisor', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Project.countDocuments(query);

  return {
    projects,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    count: projects.length,
  };
};
