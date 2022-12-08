
import  express from "express";
import {pool} from "./src/mysqlFetch.js"
const app = express();

let sql= `SELECT * FROM comida.Grasas`

app.get("/all",(req,res)=>{
  res.send("all food")
    
})

app.get("/vegetables/:id", async (req,res)=>{
    
   const value = await pool.query(`SELECT * FROM comida.Vegetales`)
   if(req.params.id=="all"){
    res.json(value[0])
   } 
   res.json(value[0][req.params.id])
})

app.get("/carnes/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Carnes`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    res.json(value[0][req.params.id])
 })
 

 app.get("/grasas/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Grasas`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    res.json(value[0][req.params.id])
 })
 

 app.get("/frutas/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Frutas`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    res.json(value[0][req.params.id])
 })
 
 app.get("/lacteos/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Lacteos`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    res.json(value[0][req.params.id])
 })

 app.get("/cereales/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Cereales`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    res.json(value[0][req.params.id])
 })
 
 app.get("/pescados/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Pescados`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    res.json(value[0][req.params.id])
 })
 

app.listen(3000);
console.log("hosted on port 3000")