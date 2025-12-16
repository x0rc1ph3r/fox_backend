//TODO: Implement raffle controller

import { responseHandler } from "../utils/resHandler";
import { Request, Response } from "express";

//TODO: Create a function to create a new raffle
const createRaffle = async(req:Request,res:Response)=>{
    const body = req.body;
    //TODO create schema for create raffle
    const {success,data:parsedData} = createRaffleSchema.safeParse(body);
    //TODO: Validate the data
    responseHandler.success(res,"Hello World from createRaffle");
}

const confirmRaffleCreation = async(req:Request,res:Response)=>{
    responseHandler.success(res,"Hello World from confirmRaffleCreation");
}


//TODO: Create a function to get all raffles by pagination
//TODO: Create a function to get a single raffle
//TODO: Create a function to update a raffle by a user
//TODO: Create a function to delete a raffle by a user
//TODO: Create a function to get all raffles by a user
//TODO: Create a function to get all raffles by a user

export default {
    createRaffle,
    confirmRaffleCreation,
}