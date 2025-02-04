const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()
const bodyParser = require('body-parser');
const pgp = require('pg-promise')()
const db = pgp(process.env.DATABASE_URL_LOCAL)

console.log(db)
app.use(express.json()); 

app.get("/", (req, res) => {
    res.send("yo")
})

// Add a new question to the database

app.post("/question", async (req, res) => {
    console.log(req.body)
    const { id, content, difficulty, name } = req.body
    try {
        const question = db.one(
            'INSERT INTO questions (id, content, difficulty, name) VALUES (${id}, ${content}, ${difficulty}, ${name}) RETURNING *', 
            {id, content, difficulty, name}
            // TODO: Insert tags 
        )
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Database error" })
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})