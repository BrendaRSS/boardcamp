import joi from "joi";

export const categorieSchema= joi.object({
    name: joi.string().min(3).required()
})

export const gameSechema = joi.object({
    name: joi.string().min(3).required(),
    image: joi.string().uri().required(),
    stockTotal: joi.string().min(1).required(),
    categoryId: joi.number().positive().required(),
    pricePerDay: joi.string().min(1).required()
})