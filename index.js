
import  express from "express";
import {pool} from "./src/mysqlFetch.js"
import bcrypt from "bcryptjs"

const app = express();
app.use(express.json())

let sql= `SELECT * FROM comida.Grasas`



app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
 });

const tables = ["Vegetales","Carnes","Grasas","Frutas","Cereales","Lacteos","Pescados"]

app.get("/all",async (req,res)=>{
   
    let result=[]
    for(let i=0;i<tables.length;i++){
      let val = await pool.query(`SELECT * FROM comida.${tables[i]}`)
      result.push(...val[0])
    }
   
   res.json(result)
   
})

app.get("/vegetables/:id", async (req,res)=>{
    
   const value = await pool.query(`SELECT * FROM comida.Vegetales`)
   if(req.params.id=="all"){
   console.log(value[0][0])
    res.json(value[0])
   } 
   else{
      console.log(value[0][req.params.id])
      res.json(value[0][req.params.id])
   }
   
})

app.get("/carnes/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Carnes`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else{
      res.json(value[0][req.params.id])
    }
    
 })
 

 app.get("/grasas/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Grasas`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })
 

 app.get("/frutas/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Frutas`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })
 
 app.get("/lacteos/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Lacteos`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })

 app.get("/cereales/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Cereales`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })
 
 app.get("/pescados/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM comida.Pescados`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })
 
 
 app.get("/login-request/",async (req,res)=>{
   console.log( req.body[0].username )
   const result = await pool.query (`SELECT username,email FROM comida.users WHERE (username = "${req.body[0].username}" OR email = "${req.body[0].username}") AND  passwords = "${req.body[0].passwords}" `)
   res.json(result[0])

 })
app.post("/login-request",async(req,res)=>{
   
   const password = await bcrypt.hash(req.body[0].passwords,8);
   console.log(req.body)
   const ask = await pool.query (`SELECT username,email FROM comida.users WHERE (username = "${req.body[0].username}" OR email = "${req.body[0].email}")`);
   if(JSON.stringify(ask[0]) === "[]"){
      const result = await pool.query( ` insert into comida.users (username,email,passwords,join_date)
      values ("${req.body[0].username}","${req.body[0].email}","${password}","${date()}")`)
      res.json([{"result":"user succesfully signed in"}])
   }
   else{
      res.json([{"result":"the username or email are already in existance"}])
   }
})



app.listen(3001);
console.log("hosted on port 3001")


function date (){

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();

return year + "-" + month +"-"+ day ;

}