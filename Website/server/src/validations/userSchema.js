import Joi from 'joi';

const registerUserSchema = Joi.object({
  name: Joi.string().required().min(3).max(100).label('Name'),
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().min(4).required().label('Password'),
  role: Joi.string().valid('user', 'lawyer').required().label('Role'),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().min(4).required().label('Password'),
});

export { registerUserSchema, loginUserSchema };
