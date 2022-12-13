import { connection } from "../database/database.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {
    try {
        const rentalsAll = await connection.query(`
        SELECT 
        rentals.*, 
        customers.id AS "idCustomer", customers.name AS "nameCustomer",
        games.id AS "idGame", games.name AS "nameGame", games."categoryId",
        categories.name AS "nameCategory"
            FROM rentals 
                JOIN customers
                    ON rentals."customerId" = customers.id 
                JOIN games 
                    ON rentals."gameId" = games.id
                JOIN categories
                    ON games."categoryId" = categories.id`);
        const array = [];

        for (let i = 0; i < rentalsAll.rows.length; i++) {
            array.push({
                id: rentalsAll.rows[i].id,
                customerId: rentalsAll.rows[i].customerId,
                gameId: rentalsAll.rows[i].gameId,
                rentDate: rentalsAll.rows[i].rentDate,
                daysRented: rentalsAll.rows[i].daysRented,
                returnDate: rentalsAll.rows[i].returnDate,
                originalPrice: rentalsAll.rows[i].originalPrice,
                delayFee: rentalsAll.rows[i].delayFee,
                customer: {
                    id: rentalsAll.rows[i].idCustomer,
                    name: rentalsAll.rows[i].nameCustomer
                },
                game: {
                    id: rentalsAll.rows[i].idGame,
                    name: rentalsAll.rows[i].nameGame,
                    categoryId: rentalsAll.rows[i].categoryId,
                    categoryName: rentalsAll.rows[i].nameCategory
                }
            });
        }
        return res.status(200).send(array);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function postRentals(req, res) {
    const body = req.body;
    // console.log(new Date());
    const date = dayjs().locale("pt").format("YYYY-MM-DD");
    const returnDate = null;
    const delayFee = null;

    try {
        const customerAndGame = await connection.query(`SELECT * FROM games WHERE id = $1`, [body.gameId]);
        const originalPrice = customerAndGame.rows[0].pricePerDay;
        await connection.query(`INSERT INTO 
        rentals 
            ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") 
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7)`, [body.customerId, body.gameId, date, body.daysRented, returnDate, originalPrice, delayFee]);

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function postRentalsReturn(req, res) {
    const { id } = req.params;
    const dataAtual = new Date().getTime();
    const returnDate = dayjs().locale("pt").format("YYYY-MM-DD");
    const multaZerada = "0000";

    try {
        const idExist = await connection.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
        if (idExist.rows.length === 0) {
            return res.sendStatus(404);
        }

        if(idExist.rows[0].returnDate !== null){
            return res.sendStatus(400);
        }

        const dataAlguel = Date.parse(idExist.rows[0].rentDate);
        const diasAtraso = Math.trunc((dataAtual - dataAlguel) / 86400000);
        const resultadoDiasAtrasados = idExist.rows[0].daysRented - diasAtraso;

        console.log(dataAlguel)
        console.log(dataAtual)
        console.log(diasAtraso)
        console.log(resultadoDiasAtrasados)

        if (resultadoDiasAtrasados < 0) {
            const valorMulta = (-idExist.rows[0].originalPrice) * (resultadoDiasAtrasados);
            await connection.query(`UPDATE rentals 
            SET "customerId"=$1, "gameId"=$2, "rentDate"=$3, "daysRented"=$4, "returnDate"=$5, "originalPrice"=$6, "delayFee"=$7
            WHERE id = $8`, [idExist.rows[0].customerId, idExist.rows[0].gameId, idExist.rows[0].rentDate, idExist.rows[0].daysRented, returnDate, idExist.rows[0].originalPrice, valorMulta]);
            return res.sendStatus(200);
        }
        
        await connection.query(`UPDATE rentals 
            SET "customerId"=$1, "gameId"=$2, "rentDate"=$3, "daysRented"=$4, "returnDate"=$5, "originalPrice"=$6, "delayFee"=$7
            WHERE id = $8`, [idExist.rows[0].customerId, idExist.rows[0].gameId, idExist.rows[0].rentDate, idExist.rows[0].daysRented, returnDate, idExist.rows[0].originalPrice, multaZerada, id]);

        return res.status(200).send(idExist.rows);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function deleteRentals(req, res){
    const {id} = req.params;

    try{
        const idExist = await connection.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
        if(idExist.rows.length===0){
            return res.sendStatus(404);
        }
        if(idExist.rows[0].returnDate == null){
            return res.sendStatus(400);
        }

        await connection.query(`DELETE FROM rentals WHERE id = $1`, [id]);
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}