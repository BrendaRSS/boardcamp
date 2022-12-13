import { connection } from "../database/database.js";
import {gameSechema} from "../schemas/validations.js";

export async function getGames(req, res){
    const {name} = req.query;
    console.log(name)
    // const nameCaseInsensitive = name[0].toUpperCase()+name.substring(1).toLowerCase();
    // console.log(nameCaseInsensitive);

    try{
        if(name){
            const gamesQuerys= await connection.query(`SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id WHERE UPPER(games.name) LIKE CONCAT (UPPER($1::text),'%');`, [name.toUpperCase()]);
            return res.status(201).send(gamesQuerys.rows);
        }
        const AllGames = await connection.query(`SELECT games.id, games.name, games.image, games."stockTotal", games."categoryId", games."pricePerDay", categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id`);
        res.status(201).send(AllGames.rows);
    } catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function postGame(req, res){
    const body = req.body;

    console.log(body);

    const { error } = gameSechema.validate(body, {abortEarly: false});

    if(error){
        const errors = error.details.map((detail)=> detail.message);
        return res.status(422).send(errors);
    }

    try{
        const nameGameExist = await connection.query('SELECT name FROM games WHERE "name" = $1', [body.name]);
        if(nameGameExist.rows.length>0){
            return res.sendStatus(409);
        }

        await connection.query(
            'INSERT INTO games ( name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);',[body.name, body.image, body.stockTotal, body.categoryId, body.pricePerDay]);

            return res.sendStatus(201);
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}