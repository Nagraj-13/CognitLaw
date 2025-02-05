import asyncHandler from "express-async-handler";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import logger from "../config/logger.config.js";
import { User } from "../models/user.model.js";
import { Case } from "../models/case.model.js";

export const createCase = asyncHandler(async (req, res) => {
    try {
        const { issue, caseStatus } = req.body;

        const user = await User.findById(req.user.id);
        if (!user || user.role!=='lawyer') {
            logger.warn(`User not found with ID: ${req.user.id}`);
            return res.error("User not found", 404);
        }

        const newCase = new Case({
            lawyerId: req.user.id,
            issue,
            caseStatus
        });

        const savedCase = await newCase.save();
        return res.success({
            case: savedCase
        }, "Case created successfully", 201);
    } catch (error) {
        logger.error(`Error in creating case: ${error.message}`);
        return res.error("Error creating case", 500);
    }
});



export const getCaseData = asyncHandler(async (req, res) => {
    try {
        const { caseId } = req.params;

        const user = await User.findById(req.user.id);
        if (!user || user.role!=='lawyer') {
            logger.warn(`User not found with ID: ${req.user.id}`);
            return res.error("User not found", 404);
        }

        const response = await axios.get(`http://127.0.0.1:5000/get_data/${caseId}`);

        if (response.status === 200) {
            logger.info(`Successfully fetched case data for Case ID: ${caseId}`);

            return res.success(response.data, "Case data fetched successfully");
        } else {
            logger.error(`Failed to fetch case data for Case ID: ${caseId}, Status: ${response.status}`);
            return res.error("Failed to fetch case data", 500);
        }
    } catch (error) {
        logger.error(`Error in fetching case data for Case ID: ${req.params.caseId}, ${error.message}`);
        return res.error("Error fetching case data", 500);
    }
});

export const processConversation = asyncHandler(async (req, res) => {
    const { conversation } = req.body;
    const { caseId } = req.params;
    const userId = req.user?.id;

    const user = await User.findById(req.user.id);
        if (!user || user.role!=='lawyer') {
            logger.warn(`User not found with ID: ${req.user.id}`);
            return res.error("User not found", 404);
        }


    if (!conversation || !userId) {
        logger.error("Missing required conversation or userId");
        return res.error("Invalid request data", 400);
    }

    try {
        const payload = {
            conversation,
            file_id: caseId,
        };

        logger.info(`Sending conversation data to Flask server for fileId: ${caseId}`);
        const flaskResponse = await axios.post("http://127.0.0.1:5000/process_conversation", payload);

        if (flaskResponse.status === 200) {
            const { data } = flaskResponse;
            console.log(data)
            logger.info(`Conversation processed successfully for caseId: ${caseId}`);
            
            const response = await axios.get(`http://127.0.0.1:5000/get_data/${caseId}`);

            if (response.status === 200) {
                logger.info(`Successfully fetched case data for Case ID: ${caseId}`);
                return res.success(response.data, "Case data fetched successfully");
            } else {
                logger.error(`Failed to fetch case data for Case ID: ${caseId}, Status: ${response.status}`);
                return res.error("Failed to fetch case data", 500);
            }
        } else {
            logger.error(`Flask server returned status: ${flaskResponse.status}`);
            return res.error(`Flask server error: ${flaskResponse.statusText}`, flaskResponse.status);
        }
    } catch (error) {
        logger.error(`Error processing conversation for userId: ${userId} - ${error.message}`);
        return res.error("Internal server error", 500);
    }
});


export const processAudio = asyncHandler(async (req, res) => {
    const { caseId } = req.params;  
    const userId = req.user?.id;  

    const user = await User.findById(req.user.id);
        if (!user || user.role!=='lawyer') {
            logger.warn(`User not found with ID: ${req.user.id}`);
            return res.error("User not found", 404);
        }

    if (!caseId || !userId) {
        logger.error("Missing required caseId or userId");
        return res.error("Invalid request data", 400);
    }

    if (!req.files || !req.files.audio) {
        logger.error("No audio file uploaded");
        return res.error("Audio file is required", 400);
    }

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.files.audio.tempFilePath));  
        formData.append('file_id', caseId);

        logger.info(`Sending audio data for caseId: ${caseId}`);

        const flaskResponse = await axios.post("http://127.0.0.1:5000/process_audio", formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });

        if (flaskResponse.status === 200) {
            logger.info(`Audio processed successfully for caseId: ${caseId}`);
            return res.success(flaskResponse.data, "Audio processed successfully");
        } else {
            logger.error(`Flask server returned status: ${flaskResponse.status}`);
            return res.error(`Flask server error: ${flaskResponse.statusText}`, flaskResponse.status);
        }
    } catch (error) {
        logger.error(`Error processing audio for caseId: ${caseId} - ${error.message}`);
        return res.error("Error processing audio", 500);
    }
});


export const getAllCasesForLawyer = asyncHandler(async (req, res) => {
    try {

        const user = await User.findById(req.user.id);
        

        if (!user || user.role !== 'lawyer') {
            logger.warn(`User not found or not a lawyer with ID: ${req.user.id}`);
            return res.error("User not found or not a lawyer", 404);
        }


        const cases = await Case.find({ lawyerId: req.user.id });

        if (cases.length === 0) {
            logger.info(`No cases found for Lawyer with ID: ${req.user.id}`);
            return res.success([], "No cases found", 200);
        }

        logger.info(`Successfully fetched all cases for Lawyer with ID: ${req.user.id}`);
        return res.success(cases, "Cases fetched successfully", 200);
    } catch (error) {
        logger.error(`Error fetching cases for Lawyer with ID: ${req.user.id}, ${error.message}`);
        return res.error("Error fetching cases", 500);
    }
});

export const getCaseConversation = asyncHandler(async (req, res) => {
    try {
        const { caseId } = req.params;

        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'lawyer') {
            logger.warn(`User not found with ID: ${req.user.id}`);
            return res.error("User not found", 404);
        }

        const response = await axios.get(`http://127.0.0.1:5000/get_conversation/${caseId}`);

        if (response.status === 200) {
            logger.info(`Successfully fetched conversation data for Case ID: ${caseId}`);
            return res.success(response.data, "Conversation data fetched successfully");
        } else {
            logger.error(`Failed to fetch conversation data for Case ID: ${caseId}, Status: ${response.status}`);
            return res.error("Failed to fetch conversation data", 500);
        }
    } catch (error) {
        logger.error(`Error in fetching conversation data for Case ID: ${req.params.caseId}, ${error.message}`);
        return res.error("Error fetching conversation data", 500);
    }
});
