import express  from "express";
import { config } from "dotenv";
config();

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log(`Server is listening on port ${port}`)
})