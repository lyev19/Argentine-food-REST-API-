import { createPool } from "mysql2/promise";

export const pool = createPool({
    host:"localhost",
    user:"root",
    password:"Awresxcrvb1234567",
    database:"food"
})
