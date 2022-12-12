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

export const customerSchema = joi.object({
    name: joi.string().min(3).required(),
    phone: joi.string().min(10).max(11).required(),
    cpf: joi.string().min(11).max(11).required(),
    birthday: joi.string().required()
})