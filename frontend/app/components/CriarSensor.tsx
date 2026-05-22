"use client"
import { useState } from "react"

interface Props {
    onCriado?: () => void
}

export default function CriarSensor({ onCriado }: Props) {
    const [novoSensor, setNovoSensor] = useState({
        temperatura: 0,
        pressao: 0,
        umidade: 0,
        sensor_presenca: false,
        trava_seguranca: false
    })

    const criarSensor = async () => {
        const url = "http://localhost:8080/sensores"
        try {
            const resposta = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoSensor)
            })
            const json = await resposta.json()
            alert(json.msg)
            setNovoSensor({ temperatura: 0, pressao: 0, umidade: 0, sensor_presenca: false, trava_seguranca: false })
            if (onCriado) onCriado()
        } catch (erro) {
            console.log(erro)
        }
    }

    return (
        <div className="w-[50vw] flex flex-col gap-4 rounded-xl max-h-fit bg-white text-black p-4">
            <h2 className="text-lg font-semibold">Criar Novo Sensor</h2>

            <label className="text-sm font-medium">Temperatura (°C)</label>
            <input type="number" value={novoSensor.temperatura}
                onChange={(e) => setNovoSensor({ ...novoSensor, temperatura: Number(e.target.value) })}
                className="p-3 rounded-lg outline-2 outline-green-500 border border-gray-300"
            />

            <label className="text-sm font-medium">Pressão (hPa)</label>
            <input type="number" value={novoSensor.pressao}
                onChange={(e) => setNovoSensor({ ...novoSensor, pressao: Number(e.target.value) })}
                className="p-3 rounded-lg outline-2 outline-green-500 border border-gray-300"
            />

            <label className="text-sm font-medium">Umidade (%)</label>
            <input type="number" value={novoSensor.umidade}
                onChange={(e) => setNovoSensor({ ...novoSensor, umidade: Number(e.target.value) })}
                className="p-3 rounded-lg outline-2 outline-green-500 border border-gray-300"
            />

            <div className="flex gap-8">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={novoSensor.sensor_presenca}
                        onChange={(e) => setNovoSensor({ ...novoSensor, sensor_presenca: e.target.checked })}
                        className="w-4 h-4"
                    />
                    Presença detectada
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={novoSensor.trava_seguranca}
                        onChange={(e) => setNovoSensor({ ...novoSensor, trava_seguranca: e.target.checked })}
                        className="w-4 h-4"
                    />
                    Trava de segurança
                </label>
            </div>

            <input type="submit" value="Criar Sensor"
                onClick={criarSensor}
                className="py-2 px-4 text-white rounded-lg hover:bg-green-600 bg-green-500 cursor-pointer"
            />
        </div>
    )
}
