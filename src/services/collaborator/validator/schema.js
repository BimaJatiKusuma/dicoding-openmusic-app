import Joi from 'joi';

export const collaborationCreatePayloadSchema = Joi.object({
    playlistId: Joi.string().required(),
    userId: Joi.string().required(),
});
export const collaborationDeletePayloadSchema = Joi.object({
    playlistId: Joi.string().required(),
    userId: Joi.string().required(),
});