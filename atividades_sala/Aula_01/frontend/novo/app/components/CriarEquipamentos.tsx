"use client"
import { useState, ChangeEvent } from "react"

interface Props {
    onCriado?: () => void
}

export default function CriarEquipamento({ onCriado }: Props) {
    const [novoEquipamento, setNovoEquipamento] = useState({
        nome: ""
    })

    const pegaInfo = (e: ChangeEvent<HTMLInputElement>) => {
        setNovoEquipamento({ nome: e.target.value })
    }

    const criarEquipamento = async () => {
        const url = "http://localhost:8080/equipamentos"
        try {
            const resposta = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoEquipamento)
            })
            const resposta_json = await resposta.json()
            alert(resposta_json.msg)
            setNovoEquipamento({ nome: "" })
            if (onCriado) onCriado()
        }
        catch (erro) {
            console.log(erro)
        }
    }

    return (
        <div className="w-[50vw] flex flex-col gap-4 rounded-xl max-h-fit bg-white text-black p-4">
            <h2 className="text-lg font-semibold">Criar Novo Equipamento</h2>

            <input
                type="text"
                placeholder="Nome do Equipamento"
                value={novoEquipamento.nome}
                onChange={(e) => pegaInfo(e)}
                className="p-4 rounded-lg outline-2 outline-blue-500"
            />

            <input
                type="submit"
                value="Criar"
                onClick={criarEquipamento}
                className="py-2 px-4 text-white rounded-lg hover:bg-blue-600 bg-blue-500 cursor-pointer"
            />
        </div>
    )
}