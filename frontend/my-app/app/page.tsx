"use client"

import Image from "next/image";
import {useState, useEffect} from "react"
import Card from "./components/Card";
import Botao from "./components/Botao";

export default function Home() {
  const [dadosBackend, setDadosBackend] = useState([{
    "Sensor": "",
    "Codigo": "",
    "Status": false
  }])

  const pegaDados = async () => {
    try {
      const resposta = await fetch('http://localhost:8080/')
      const resposta_JSON = await resposta.json()
      
      setDadosBackend(resposta_JSON)
      console.log("Dados recebidos:", dadosBackend)
      
    } catch (error) {
      console.error("Falha na requisição:", error)
    }
  }

  const deletaTudo = async ()=>{
    try{
      const resposta = await fetch('http://localhost:8080/destroy',{
        method: "DELETE"
      })

      setDadosBackend([])
      alert("Dados excluídos com sucesso!")
    }
    catch(error){
      console.error("Falha na requisição:", error)
    }
  }

  useEffect(()=>{
    pegaDados()
  })



  return (
    <div className="w-screen h-screen flex flex-col items-center justify-around">
      <h1 className="text-2xl font-black">Lista de Sensores</h1>
      
      <Botao
      estilo="deletar"
      onClick={deletaTudo}
      nome="Limpar Dados"
      />



      <div className="flex gap-4">
        {dadosBackend.map((item, posicao)=>{
          return(
            <div className="text-black" key={posicao}>
              <Card
              size="sm"
              style="white"
              title={item.Sensor || ""}>
                <div className="flex flex-col">
                  <div>
                    <p>Código:</p>
                    <p className="font-black text-green-500">{item.Codigo}</p>
                  </div>
                  <div>
                    <p>Sensor:</p>
                    <p className="font-black text-green-500">{item.Status === true ? "Ativo" : "Inativo"}</p>
                  </div>

                </div>
              </Card>
            </div>
          )
        })}

      </div>

    </div>
  );
}
