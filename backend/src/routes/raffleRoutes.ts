import express from "express";
import raffleController from "../controller/raffleController";

const raffleRouter = express.Router();

raffleRouter.get("/",(req,res)=>{
    res.send("Hello World from raffle")
});

raffleRouter.post("/create",raffleController.createRaffle);
raffleRouter.post("/confirm",raffleController.confirmRaffleCreation);

export default raffleRouter;