import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.config.js';
import { User } from '../models/user.model.js';
import { generateToken } from '../utils/generateTokne.js';
import {AIQuery} from '../models/query.model.js'
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    logger.warn(`User with email ${email} already exists`);
    return res.error('User already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  if (user) {
    logger.info(`User registered successfully: ${user.email}`);
    const token = generateToken(user._id);
    return res.success({ token, user }, 'User registered successfully', 201);
  } else {
    logger.error('Error in user registration');
    return res.error('User registration failed', 500);
  }
});



export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(user)
  if (!user) {
    logger.warn(`User with email ${email} not found`);
    return res.error('Invalid credentials', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    logger.warn(`Invalid password attempt for email: ${email}`);
    return res.error('Invalid credentials', 401);
  }

  logger.info(`User logged in successfully: ${email}`);
  const token = generateToken(user._id);
  return res.success({ token, user }, 'User logged in successfully', 200);
});


export const getUserDetails = asyncHandler(async (req, res) => { 
  try {
    const userId = req.user.id; 

    const user = await User.findById(userId)
      .populate({
        path: 'QnA', 
        select: 'query response timestamp', 
      })
      .select('-password'); 

   
    if (!user) {
      logger.warn(`User not found with ID: ${userId}`);
      return res.error('User not found ', 404);
    }

    logger.info(`Fetched details for user: ${user.email}`);
    
    
    res.success({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        queriesAndResponses: user.QnA,
      }
    }, 'User details fetched successfully', 200);
    
  } catch (error) {
    logger.error(`Error fetching user details: ${error.message}`);
    res.error('Error fetching user details', 500);
  }
});

