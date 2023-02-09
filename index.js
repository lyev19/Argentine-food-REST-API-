import {} from 'dotenv/config'
import  express from "express"
import {pool} from "./src/mysqlFetch.js"
import bcrypt from "bcryptjs"
import cors from "cors"
import jwt from "jsonwebtoken"
import * as fs from "fs"
import * as os from "os"


//Headers from fetch must contain jwt


const app = express();
app.use(express.json())


app.use(cors( {origin: '*'}));

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
   res.header("Access-Control-Allow-Headers", "Origin", "X-Requested-With", "Content-Type", "Accept");
   next(); 
 });



 //Login+signin auth



 app.post("/login/",async (req,res)=>{
   
   
   const password = req.body.passwords
   var comparing = await pool.query (`SELECT passwords FROM food.users WHERE  username = "${req.body.username}" OR email = "${req.body.username}" `)
    
   if(comparing[0].length===0){
      console.log("incorrect email or username")
      res.json({"login":"failure"})
      res.end()
   }
   else{
      comparing=comparing[0][0].passwords
      const result= await validate(password, comparing)
   
      if(result){
         console.log("succesfull signin")
         const token = generateAWT(req.body.username)
         setEnvValue("USER",req.body.username)
         res.json({"login":"success","token": token})
      }
      else{
        console.log("incorrect password")
        res.json({"login":"failure"})
      }
   }

 })

  
app.post("/login-request",async(req,res)=>{
   
   const username = req.body.username;
   const email = req.body.email;
   

   if(valid_input(username)||valid_input(email) ||valid_input(req.body.passwords)){
       res.json([{"result":"null"}])
       console.log("no empty passwords,usernames or emails")
   }
   else{
       
      const password = await bcrypt.hash(req.body.passwords,8);
      console.log(req.body)
      const ask = await pool.query (`SELECT username,email FROM food.users WHERE (username = "${req.body.username}" OR email = "${req.body.email}")`);
      if(JSON.stringify(ask[0]) === "[]"){
         const result = await pool.query( ` insert into food.users (username,email,passwords,join_date)
         values ("${req.body.username}","${req.body.email}","${password}","${date()}")`)
         
         res.json([{"result":"success"}])
      }
      else{
         res.json([{"result":"failure"}])
      }
   }
  
})








app.post("/confirm",async(req,res)=>{
   
   const auth = req.body.authorization;

  jwt.verify( auth, process.env.TOKEN_SECRET, (err,user)=>{
   if(err) {console.log("invalid token") 
   res.json({"validate":false})
  
    }
    res.json({"validate": true})
  })

   
  
})



 app.use((req,res,next)=>{
    console.log(req.headers)
  const auth = req.headers.authorization
  if (auth === null){
     res.sendStatus(401)
  }
  jwt.verify( auth,process.env.TOKEN_SECRET,(err,user)=>{
     if(err) {console.log("invalid token")  
     return res.sendStatus(404)}
   
     next()
  })

 })


app.post("/menu",async(req,res)=>{
   const user= await pool.query(`SELECT id  from food.users WHERE (username = "${req.body.user}" OR email= "${req.body.user}")`)
  console.log(user)
   try{
      const menu = await pool.query(`SELECT  menu.Id, menu.Date_input FROM 
   food.user_has_menu  
   JOIN menu ON user_has_menu.menu_id = menu.Id
   WHERE user_has_menu.user_id= ${user[0][0].id}`)

   res.json(menu[0])

   }
   catch{
      console.log(error)
      res.status(404)
   }
   

})

app.post("/menu-items", async(req,res)=>{
    const menu = req.body.menu 
    try{
      const request = await pool.query(`SELECT menu_has_items.weight, menu.Id, menu.Date_input, food1.*
      FROM user_has_menu
      JOIN menu ON user_has_menu.menu_id = menu.Id
      JOIN menu_has_items ON menu.Id = menu_has_items.menu_id
      JOIN food1 ON menu_has_items.item_id = food1.id
      WHERE user_has_menu.menu_id = ${menu}`)
      console.log(request[0][0])
      res.json(request)
    }
    catch{
      console.log(error)
       res.status(404)
    }
    

})

app.post("/menu-add",async(req,res)=>{
   console.log(req.body)
   const user = req.body.user
   const date = req.body.date
   try{
      const user_id= await pool.query(`SELECT id FROM food.users WHERE (username = "${user}" || email = "${user}")` ) 
      const result = await pool.query(`INSERT into menu (Date_input) VALUES ("${date}")`)
      const adding = await pool.query(`INSERT into user_has_menu(user_id,menu_id) VALUES (${user_id[0][0].id},${result[0].insertId})`)
   //const menu_id = await pool.query(`SELECT Id from menu WHERE (Date_input=${date()})`)
      res.json(result)
   }
   catch(error){
      console.log(error)
      res.status(404)
   }
   
})


app.post("/menu-all",async(req,res)=>{
   try {
      const user = req.body.user
       console.log(user)
       const user_id= await pool.query(`SELECT id FROM food.users WHERE (username = "${user}" OR email = "${user}")` )   
       const result = await pool.query(`SELECT menu.*,menu_has_items.weight, food1.*
   FROM user_has_menu
    JOIN menu ON user_has_menu.menu_id = menu.Id
   JOIN menu_has_items ON menu.Id = menu_has_items.menu_id
   JOIN food1 ON menu_has_items.item_id = food1.id
   WHERE user_has_menu.user_id = ${user_id[0][0].id}`)
   console.log(result[0])
   res.json(result[0])
   } catch (error) {
      console.log(error)
      res.status(404)
   }
   
  
})

app.post("/item-add",async(req,res)=>{
   try {
      console.log(req.body)
      const item = JSON.stringify(req.body.item) 
      const menu = req.body.menu
      const weight = req.body.weight
      console.log(typeof item)
      console.log(typeof menu)
      console.log(typeof weight)
      const q = pool.query(`INSERT into menu_has_items(menu_id,item_id,weight) VALUES (${menu},${item},${weight})`)
      res.json(q)
   } catch (error) {
      console.log(error)
      res.status(404)
   }
 
})

app.delete("/menu:id",async (req,res)=>{
   try {
      const menu = req.params.id
      console.log(menu)
      const request = await pool.query(`DELETE FROM user_has_menu WHERE (menu_id = ${menu}) `)
      const request1 = await pool.query(`DELETE FROM menu WHERE (Id = ${menu}) `)
      const last = await pool.query(`DELETE FROM menu_has_items where (menu_id= ${menu})`)
  
      res.json(request)
   } catch (error) {
      console.log(error)
      res.status(404)
   }
  
})


//https://mydomain.dm/fruit/{"name":"My fruit name", "color":"The color of the fruit"}
app.delete("/item/:object",async (req,res)=>{
   try {
      const input = JSON.parse(req.params.object)
      console.log(input)
      const menu = input.menu
      const item = input.item
      const last = await pool.query(`DELETE FROM menu_has_items where (menu_id= ${menu} AND item_id = ${item})`)
   res.json({"res":item})
   } catch (error) {
      console.log(error)
      res.status(404)
   }
   
})










//All DB info
const tables = ["Vegetales","Carnes","Grasas","Frutas","Cereales","Lacteos","Pescados"]





// app.get("/all",async (req,res)=>{
   
//    try {
//       let result=[]
//       for(let i=0;i<tables.length;i++){
//         let val = await pool.query(`SELECT * FROM food.${tables[i]}`)
//         result.push(...val[0])
//       }
     
//      res.json(result)
     
//    } catch (error) {
//       console.log(error)
//       res.status(404)
//    }
  
// })

app.get("/all",async (req,res)=>{
   
   try {
      let result=[]
      
        let val = await pool.query(`SELECT * FROM food.food1`)
        result.push(...val[0])
      
     
     res.json(result)
     
   } catch (error) {
      console.log(error)
      res.status(404)
   }
  
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







app.listen(3001);
console.log("hosted on port 3001")

//functions

async function validate (password,hash){

   const result = await bcrypt.compare(password,hash)
   
   return result
   
}


function valid_input(param){

   if(param===undefined||param===""){
      return true
   }
   else {
      return false
   }
}

function date (){

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
return year + "-" + month +"-"+ day ;

}

function generateAWT (username){
   return jwt.sign({"username":username}, process.env.TOKEN_SECRET,{expiresIn:600*60})
}


function setEnvValue(key, value) {

   // read file from hdd & split if from a linebreak to a array
   const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

   // find the env we want based on the key
   const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
       return line.match(new RegExp(key));
   }));

   // replace the key/value with the new value
   ENV_VARS.splice(target, 1, `${key}=${value}`);

   // write everything back to the file system
   fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));

}