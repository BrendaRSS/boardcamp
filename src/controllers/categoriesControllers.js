import {connection} from "../database/database.js";

export async function getAllCategories(req, res){
    try{
        const categories = await connection.query('SELECT * FROM categories;');
        return res.send(categories.rows);
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}
