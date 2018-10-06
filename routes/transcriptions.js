const express = require('express');
const router = express.Router();
const token = require('../controllers/accessTokens');
const transcriptions = require('../controllers/transcriptions');


/* GET home page. */
router.post('/upload/:userId', token.validateParamToken, transcriptions.uploadFile);
router.post('/uploadInterview/:user', [token.validateToken, token.audioUpload()], transcriptions.uploadAudio);
router.post('/saveSynthesisDoc/:user', token.validateToken, transcriptions.saveSynthesisDoc);
router.get('/getInterview/:interview', transcriptions.fetchAudio);
// router.post('//:userId', token.validateParamToken, transcriptions.uploadFile);
router.post('/fetchLiveRecordingData/:transcriptionsId/:userId', token.validateParamToken, transcriptions.fetchLiveRecordingData);
router.post('/fetchLiveRecordingData/:transcriptionsId/:userId/:type', token.validateParamToken, transcriptions.fetchLiveRecordingData);
router.get('/startLiveRec/:patientId/:userId', token.validateParamToken, transcriptions.startLiveRec);
router.get('/saveDuration/:transcript/:duration', transcriptions.saveDuration);
router.get('/getTranscript/:transcript', transcriptions.getTranscript);
router.put('/interview_update/:InterviewId', token.validateToken, transcriptions.interviewUpdate);
router.put('/interview_status/:InterviewId', token.validateToken, transcriptions.updateStatus);
router.get('/fetchAllInterview/:userId', transcriptions.fetchAllInterview);
router.get('/fetchDocumentHistory/:documentId', transcriptions.fetchDocumentHistory);

module.exports = router;
