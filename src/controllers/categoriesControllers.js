import {connection} from "../database/database.js";
import {categorieSchema} from "../schemas/validations.js"

export async function getAllCategories(req, res){
    try{
        const categories = await connection.query('SELECT * FROM categories;');
        return res.send(categories.rows);
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function postCategories(req, res){
    const bodyCategorie = req.body;

    const { error } = categorieSchema.validate(bodyCategorie, { abortEarly: false });

    if(error){
       const errors = error.details.map((detail)=> detail.message);
       return res.status(400).send(errors);
    }
    
    try{
        const categoryExist = await connection.query(`SELECT * FROM categories WHERE name = $1`, [bodyCategorie.name]);
        if(categoryExist.rows.length>0){
            return res.sendStatus(409);
        }
        await connection.query('INSERT INTO categories (name) VALUES ($1)', [bodyCategorie.name]);
        res.sendStatus(201);
    }catch (error){
        console.log(error);
        return res.sendStatus(500);
    }
}