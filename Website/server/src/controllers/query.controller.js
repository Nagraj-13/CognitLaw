import axios from 'axios';
import { AIQuery } from '../models/query.model.js';
import { User } from '../models/user.model.js';
import asyncHandler from 'express-async-handler';
import logger from '../config/logger.config.js';

export const QueryController = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const userId = req.user.id;

  if (!query) {
    return res.error('Query is required', 400);
  }

  try {
    const response = await axios.post(process.env.FLASK_SERVER+'api/query', {
      query
    });

    if (!response.data) {
      return res.error('No response from AI', 500);
    }

    const { data: responseData } = response;
    const { response: aiResponse } = responseData;

    const newAIQuery = new AIQuery({
      query,
      response: aiResponse,
    });

    await newAIQuery.save();

    const user = await User.findById(userId);
    user.QnA.push(newAIQuery);
    await user.save();

    logger.info(`Query saved for user ${userId}: ${query}`);

    return res.success({ query, aiResponse }, 'Query and response saved successfully', 200);
  } catch (error) {
    logger.error(`Error in QueryController: ${error.message}`);
    return res.error('Error processing the query', 500);
  }
});




export const ContentController = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.error('Query is required', 400);
  }

  try {
    const response = await axios.post(process.env.FLASK_SERVER+'api/content', {
      query
    });

    if (!response.data) {
      return res.error('No response from AI', 500);
    }

    const { data: responseData } = response;
    const { response: aiResponse } = responseData;

    logger.info(`Content query processed: ${query}`);

    return res.success({ query, aiResponse }, 'Query processed successfully', 200);
  } catch (error) {
    logger.error(`Error in ContentController: ${error.message}`);
    return res.error('Error processing the query', 500);
  }
});
