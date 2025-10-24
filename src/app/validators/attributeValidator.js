import Joi from 'joi';

export const attributeCreateValidator = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  values: Joi.array().items(Joi.string()).required(),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

export const attributeUpdateValidator = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(''),
  values: Joi.array().items(Joi.string()),
  status: Joi.string().valid('active', 'inactive'),
});


