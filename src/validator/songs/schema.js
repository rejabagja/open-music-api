const Joi = require('joi');

const currentYear = new Date().getFullYear();

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().min(1).strict(),
  albumId: Joi.string().messages({
    'string.empty': 'albumId should not be empty string',
  }),
});

const SongQuerySchema = Joi.object({
  title: Joi.string().empty(''),
  performer: Joi.string().empty(''),
});

module.exports = { SongPayloadSchema, SongQuerySchema };
