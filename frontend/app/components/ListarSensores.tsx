"use client"
import { useState, useEffect } from "react"

type Sensor = {
    id: number
    temperatura: number
    pressao: number
    umidade: number
    sensor_presenca: boolean
    trava_seguranca: boolean
}

export default function ListarSensores() {
    const [sensores, setSensores] = useState<Sensor[]>([])

    const pegaSensores = async () => {
        const url = "http://localhost:8080/iot"
        try {
            const resposta = await fetch(url)
            const resposta_json = await resposta.json()
            setSensores(resposta_json)
        } catch (erro) {
            console.log(erro)
        }
    }

    useEffect(() => {
        pegaSensores()
        const intervalo = setInterval(pegaSensores, 5000)
        return () => clearInterval(intervalo)
    }, [])

    return (
        <div className="w-full max-h-[88vh] overflow-y-auto bg-white text-black rounded-xl flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Sensores IoT (Node-RED)</h2>
                <button
                    onClick={pegaSensores}
                    className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                >
                    🔄 Atualizar
                </button>
            </div>

            {sensores.length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum dado recebido ainda. Aguardando Node-RED...</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sensores.map((sensor) => (
                    <div key={sensor.id} className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 flex flex-col gap-2">
                        <h3 className="font-semibold text-base">Sensor #{sensor.id}</h3>

                        <div className="flex flex-col gap-1 text-sm">
                            <p>🌡️ Temperatura: <span className="font-medium">{sensor.temperatura?.toFixed(2)} °C</span></p>
                            <p>📊 Pressão: <span className="font-medium">{sensor.pressao?.toFixed(4)} hPa</span></p>
                            <p>💧 Umidade: <span className="font-medium">{sensor.umidade?.toFixed(4)} %</span></p>
                            <p>
                                👁️ Presença:{" "}
                                <span className={sensor.sensor_presenca ? "text-green-600 font-semibold" : "text-gray-500"}>
                                    {sensor.sensor_presenca ? "Detectada" : "Não detectada"}
                                </span>
                            </p>
                            <p>
                                🔒 Trava de segurança:{" "}
                                <span className={sensor.trava_seguranca ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                                    {sensor.trava_seguranca ? "Ativada" : "Desativada"}
                                </span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
