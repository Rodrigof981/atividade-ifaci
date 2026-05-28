const express = require("express")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())

const dados = []

app.get("/", (req, res)=>{
     res.send(dados)
})

app.post("/iot", (req, res)=>{
     let body = req.body
     dados.push(body)

     res.send("Dados criados com sucesso!")
})

//deletar todos
app.delete("/destroy", (req, res)=>{
     dados.splice(0, dados.length)
     res.send("Dados excluídos com sucesso!")
})

//deletar item
app.delete("/destroy/:id", (req, res)=>{
     let id = req.params.id

     dados.splice(id, 1);

     res.send(`item ${id} deletado com sucesso!`);

})


app.listen(8080, ()=>{
     console.log("server running on port 8080")
})