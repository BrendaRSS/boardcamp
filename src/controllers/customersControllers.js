import {connection} from "../database/database.js";
import {customerSchema} from "../schemas/validations.js";

export async function getCustomers(req, res){
    const {cpf} = req.query;

    try{
        if(cpf){
            const cpfQuery = await connection.query(`SELECT * FROM customers WHERE cpf LIKE CONCAT (CAST($1 as text), '%')`, [cpf]);
            return res.status(201).send(cpfQuery.rows);
        }
        const customersAll = await connection.query('SELECT * FROM customers;');
        return res.status(201).send(customersAll.rows);
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function getCustomerId(req, res){
    const {id} = req.params;

    try{
        const idExist = await connection.query(`SELECT * FROM customers WHERE id=$1`, [id]);
        if(idExist.rows.length===0){
            return res.sendStatus(404);
        }

        return res.status(200).send(idExist.rows[0]);
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function postCustomers(req, res){
    const bodyCustomers = req.body;

    const {error} = customerSchema.validate(bodyCustomers, {abortEarly: false});
    if(error){
        const errors = error.details.map((detail)=>detail.message);
        return res.status(400).send(errors);
    }
    try{
        const cpfExist = await connection.query(`SELECT cpf FROM customers WHERE cpf = $1`, [bodyCustomers.cpf]);
        if(cpfExist.rows.length>0){
            return res.status(409).send("CPF já cadastrado!");
        }
        await connection.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)`, [bodyCustomers.name, bodyCustomers.phone, bodyCustomers.cpf, bodyCustomers.birthday]);
        return res.sendStatus(201);
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function putCustomers(req, res){
    const {id}=req.params;
    const body= req.body;
    console.log(body)

    const {error} = customerSchema.validate(body, {abortEarly: false});
    if(error){
        const errors = error.details.map((detail)=>detail.message);
        return res.status(400).send(errors);
    }

    try{
        const cpfExist = await connection.query(`SELECT * FROM customers WHERE cpf = $1`, [body.cpf]);
        if(cpfExist.rows.length>0){
            return res.status(409).send("cpf já cadastrado!")
        }

        await connection.query(`UPDATE customers 
        SET name=$1, phone=$2, cpf=$3, birthday=$4 
        WHERE id =$5`, [body.name, body.phone, body.cpf, body.birthday, id]);
        return res.sendStatus(200);
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
}