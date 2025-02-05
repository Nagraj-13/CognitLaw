
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false }); 

    if (error) {
      const errors = error.details.map((err) => err.message); 
      return res.error(errors.join(', '), 400);
    }
    next(); 
  };
};


