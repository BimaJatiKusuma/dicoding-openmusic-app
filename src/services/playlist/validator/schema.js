import Joi from 'joi';

export const playlistCreatePayloadSchema = Joi.object({
    name: Joi.string().required(),
})
export const playlistAddSongPayloadSchema = Joi.object({
    songId: Joi.string().required(),
})
export const playlistDeleteSongPayloadSchema = Joi.object({
    songId: Joi.string().required(),
})
