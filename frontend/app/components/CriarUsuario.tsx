"use client"
import { useState, ChangeEvent } from "react"

interface Props {
    onCriado?: () => void
}

export default function CriarUsuario({ onCriado }: Props) {
    const [novoUsuario, setNovoUsuario] = useState({
        nome_completo: "",
        email: "",
        senha: ""
    })

    const pegaInfo = (e: ChangeEvent<HTMLInputElement>, where: string) => {
        const value = e.target.value

        if (where === "nome") {
            setNovoUsuario({ ...novoUsuario, nome_completo: value })
        } else if (where === "email") {
            setNovoUsuario({ ...novoUsuario, email: value })
        } else {
            setNovoUsuario({ ...novoUsuario, senha: value })
        }
    }

    const criarUsuario = async () => {
        const url = 'http://localhost:8080/novoUsuario'
        try {
            const resposta = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoUsuario)
            })
            const resposta_json = await resposta.json()
            console.log(resposta_json)
            alert("Usuário Criado com Sucesso!")
            setNovoUsuario({ nome_completo: "", email: "", senha: "" })
            if (onCriado) onCriado()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="w-[50vw] flex flex-col gap-4 rounded-xl max-h-fit bg-white text-black p-4">
            <h2 className="text-lg font-semibold">Criar Novo Usuário</h2>

            <input
                type="text"
                placeholder="Nome Completo"
                value={novoUsuario.nome_completo}
                onChange={(e) => { pegaInfo(e, "nome") }}
                className="p-4 rounded-lg outline-2 outline-red-500"
            />
            <input
                type="email"
                placeholder="email@email.com"
                value={novoUsuario.email}
                onChange={(e) => { pegaInfo(e, "email") }}
                className="p-4 rounded-lg outline-2 outline-red-500"
            />
            <input
                type="password"
                placeholder="Crie uma senha"
                value={novoUsuario.senha}
                onChange={(e) => { pegaInfo(e, "senha") }}
                className="p-4 rounded-lg outline-2 outline-red-500"
            />

            <input
                type="submit"
                value="Enviar"
                onClick={criarUsuario}
                className="py-2 px-4 text-white rounded-lg hover:bg-red-500 bg-red-400 cursor-pointer"
            />
        </div>
    )
}
