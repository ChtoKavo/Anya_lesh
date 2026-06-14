import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { isTeacher } from '../middleware/admin.js';
import {
  getAssignedStudents,
  assignStudentToTeacher,
  getStudentDetails,
  addTeacherNote,
} from '../controllers/teacher.controller.js';

const router = Router();

router.use(auth);
router.use(isTeacher);

router.get('/students', getAssignedStudents);
router.post('/students/:id/assign', assignStudentToTeacher);
router.get('/students/:id', getStudentDetails);
router.post('/students/:id/note', addTeacherNote);

export default router;
