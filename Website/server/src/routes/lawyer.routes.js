import express from 'express';
import { protect } from '../middleware/Auth.middleware.js';
import { createCase, getAllCasesForLawyer, getCaseConversation, getCaseData, processAudio, processConversation } from '../controllers/lawyer.controller.js';

const router = express.Router();

router.post('/createCase', protect, createCase);
router.get('/get_case_data/:caseId', protect, getCaseData);
router.post('/process_conversation/:caseId', protect, processConversation);
router.post('/process_audio/:caseId',protect,processAudio)
router.get('/getCases',protect,getAllCasesForLawyer)
router.get('/getConversation/:caseId',protect,getCaseConversation)

export default router;
