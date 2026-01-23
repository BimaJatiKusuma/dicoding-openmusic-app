import Joi from 'joi';

export const albumCreatePayloadSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().required()
})

export const albumUpdatePayloadSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().required()
})

export const songCreatePayloadSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number(),
    albumId: Joi.string()
})

export const songUpdatePayloadSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number(),
    albumId: Joi.string()
})