
import  express from "express";
import {pool} from "./src/mysqlFetch.js"
import bcrypt from "bcryptjs"
import cors from "cors"
const app = express();
app.use(express.json())

let sql= `SELECT * FROM food.Grasas`

 app.use(cors( {origin: '*'}));

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
   res.header("Access-Control-Allow-Headers", "Origin", "X-Requested-With", "Content-Type", "Accept");
   next();
 });

const tables = ["Vegetales","Carnes","Grasas","Frutas","Cereales","Lacteos","Pescados"]

app.get("/all",async (req,res)=>{
   
    let result=[]
    for(let i=0;i<tables.length;i++){
      let val = await pool.query(`SELECT * FROM food.${tables[i]}`)
      result.push(...val[0])
    }
   
   res.json(result)
   
})

app.get("/vegetables/:id", async (req,res)=>{
    
   const value = await pool.query(`SELECT * FROM food.Vegetales`)
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
    
    const value = await pool.query(`SELECT * FROM food.Carnes`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else{
      res.json(value[0][req.params.id])
    }
    
 })
 

 app.get("/grasas/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM food.Grasas`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })
 

 app.get("/frutas/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM food.Frutas`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })
 
 app.get("/lacteos/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM food.Lacteos`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })

 app.get("/cereales/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM food.Cereales`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })
 
 app.get("/pescados/:id", async (req,res)=>{
    
    const value = await pool.query(`SELECT * FROM food.Pescados`)
    if(req.params.id=="all"){
     res.json(value[0])
    } 
    else
    res.json(value[0][req.params.id])
 })
 
 
 app.post("/login/",async (req,res)=>{
   console.log( req.body.passwords )
   
   const password = req.body.passwords
   var comparing = await pool.query (`SELECT passwords FROM food.users WHERE ( username = "${req.body.username}" AND email = "${req.body.email}")`)
   
   console.log(comparing[0])
   
   if(comparing[0].length===0){
      console.log("incorrect email")
      res.json({"login":"failure"})
      res.end()
   }
   else{
      comparing=comparing[0][0].passwords
      const result= await validate(password, comparing)
   
      if(result){
         console.log("succesfull signin")
         res.json({"login":"success"})
      }
      else{
        console.log("incorrect password")
        res.json({"login":"failure"})
      }
   }



  
   

   // {
   //    "passwords": "1234",
   //    "email": "tumama420@gmail.com",
   //    "name": "Leonidas"
   //  }


 })
app.post("/login-request",async(req,res)=>{
   
   const password = await bcrypt.hash(req.body.passwords,8);
   console.log(req.body)
   const ask = await pool.query (`SELECT username,email FROM food.users WHERE (username = "${req.body.username}" OR email = "${req.body.email}")`);
   if(JSON.stringify(ask[0]) === "[]"){
      const result = await pool.query( ` insert into food.users (username,email,passwords,join_date)
      values ("${req.body.username}","${req.body.email}","${password}","${date()}")`)
      res.json([{"result":"user succesfully signed in"}])
   }
   else{
      res.json([{"result":"the username or email are already in existance"}])
   }
})



app.listen(3001);
console.log("hosted on port 3001")

async function validate (password,hash){

   const result = await bcrypt.compare(password,hash)
   console.log(result)
   return result
   
}


function date (){

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();

return year + "-" + month +"-"+ day ;

}