import { connection } from "../database/database.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {
    const { customerId } = req.query;
    const {gameId} = req.query;

    try {
        if (customerId) {
            const rentalsCustomerId = await connection.query(`
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
                            ON games."categoryId" = categories.id
                            WHERE customers.id = $1`, [customerId]);
            const arrayCustomerId = [];
            
            for (let i = 0; i < rentalsCustomerId.rows.length; i++) {
                arrayCustomerId.push({
                    id: rentalsCustomerId.rows[i].id,
                    customerId:rentalsCustomerId.rows[i].customerId,
                    gameId: rentalsCustomerId.rows[i].gameId,
                    rentDate: rentalsCustomerId.rows[i].rentDate,
                    daysRented:rentalsCustomerId.rows[i].daysRented,
                    returnDate: rentalsCustomerId.rows[i].returnDate,
                    originalPrice: rentalsCustomerId.rows[i].originalPrice,
                    delayFee: rentalsCustomerId.rows[i].delayFee,
                    customer: {
                        id: rentalsCustomerId.rows[i].idCustomer,
                        name: rentalsCustomerId.rows[i].nameCustomer
                    },
                    game: {
                        id: rentalsCustomerId.rows[i].idGame,
                        name: rentalsCustomerId.rows[i].nameGame,
                        categoryId: rentalsCustomerId.rows[i].categoryId,
                        categoryName: rentalsCustomerId.rows[i].nameCategory
                    }
                });
            }

            return res.status(200).send(arrayCustomerId);
        }
        
        if (gameId) {
            const rentalsGameId = await connection.query(`
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
                            ON games."categoryId" = categories.id
                            WHERE games.id = $1`, [gameId]);
            const arrayGameId = [];
            
            for (let i = 0; i < rentalsGameId.rows.length; i++) {
                arrayGameId.push({
                    id: rentalsGameId.rows[i].id,
                    customerId:rentalsGameId.rows[i].customerId,
                    gameId: rentalsGameId.rows[i].gameId,
                    rentDate: rentalsGameId.rows[i].rentDate,
                    daysRented:rentalsGameId.rows[i].daysRented,
                    returnDate: rentalsGameId.rows[i].returnDate,
                    originalPrice: rentalsGameId.rows[i].originalPrice,
                    delayFee: rentalsGameId.rows[i].delayFee,
                    customer: {
                        id: rentalsGameId.rows[i].idCustomer,
                        name: rentalsGameId.rows[i].nameCustomer
                    },
                    game: {
                        id: rentalsGameId.rows[i].idGame,
                        name: rentalsGameId.rows[i].nameGame,
                        categoryId: rentalsGameId.rows[i].categoryId,
                        categoryName: rentalsGameId.rows[i].nameCategory
                    }
                });
            }

            return res.status(200).send(arrayGameId);
        }

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

    if(body.daysRented<=0){
        return res.sendStatus(400);
    }

    try {
        const customerIdExist = await connection.query(`SELECT * FROM customers WHERE id = $1`, [body.customerId]);
        if(customerIdExist.rows.length===0){
            return res.sendStatus(400);
        }

        const gameId = await connection.query(`SELECT * FROM games WHERE id = $1`, [body.gameId]);
        if(gameId.rows.length===0){
            return res.sendStatus(400);
        }

        // console.log("Estoque do jogo:", gameId.rows[0].stockTotal);

        const alugueisDoGame = await connection.query(`SELECT * FROM rentals WHERE "gameId" = $1`, [gameId.rows[0].id]);

        const alugueisDoGameAberto = alugueisDoGame.rows.filter((a)=> a.returnDate == null);
        // console.log(alugueisDoGame.rows)
        // console.log(alugueisDoGameAberto)

        // console.log("Quanto resta no estoque:", gameId.rows[0].stockTotal - alugueisDoGame.rows.length);

        if(gameId.rows[0].stockTotal - alugueisDoGameAberto.length <=0){
            return res.status(400).send("O estoque desse jogo está 100% alugado por enquanto. Por favor, retorne outro dia!")
        }

        const originalPrice = gameId.rows[0].pricePerDay * body.daysRented;
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

        if (idExist.rows[0].returnDate !== null) {
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

export async function deleteRentals(req, res) {
    const { id } = req.params;

    try {
        const idExist = await connection.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
        if (idExist.rows.length === 0) {
            return res.sendStatus(404);
        }
        if (idExist.rows[0].returnDate == null) {
            return res.sendStatus(400);
        }

        await connection.query(`DELETE FROM rentals WHERE id = $1`, [id]);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}