"use client"
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"

export interface ListarSensoresRef {
    refresh: () => void
}

type Sensor = {
    id: number
    temperatura: number
    pressao: number
    umidade: number
    sensor_presenca: boolean
    trava_seguranca: boolean
}

const ListarSensores = forwardRef<ListarSensoresRef>(function ListarSensores(_, ref) {
    const [sensores, setSensores] = useState<Sensor[]>([])
    const [modalEditar, setModalEditar] = useState(false)
    const sensorId = useRef(0)
    const [sensorEditado, setSensorEditado] = useState({
        temperatura: 0,
        pressao: 0,
        umidade: 0,
        sensor_presenca: false,
        trava_seguranca: false
    })

    const pegaSensores = async () => {
        try {
            const resposta = await fetch("http://localhost:8080/sensores")
            const json = await resposta.json()
            setSensores(json)
        } catch (erro) {
            console.log(erro)
        }
    }

    useImperativeHandle(ref, () => ({
        refresh: pegaSensores
    }))

    const deletaSensor = async (id: number) => {
        try {
            const resposta = await fetch(`http://localhost:8080/sensores/${id}`, { method: "DELETE" })
            const json = await resposta.json()
            alert(json.msg)
            pegaSensores()
        } catch (erro) {
            console.log(erro)
        }
    }

    const editaSensor = async (id: number) => {
        try {
            const resposta = await fetch(`http://localhost:8080/sensores/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sensorEditado)
            })
            const json = await resposta.json()
            alert(json.msg)
            setModalEditar(false)
            pegaSensores()
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
        <div className="w-[50vw] max-h-[88vh] overflow-y-auto bg-white text-black rounded-xl flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Lista de Sensores</h2>
                <button onClick={pegaSensores}
                    className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                >
                    🔄 Atualizar
                </button>
            </div>

            {sensores.length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum sensor cadastrado ainda.</p>
            )}

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
                            🔒 Trava:{" "}
                            <span className={sensor.trava_seguranca ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                                {sensor.trava_seguranca ? "Ativada" : "Desativada"}
                            </span>
                        </p>
                    </div>

                    <div className="flex w-full justify-end gap-4 mt-2">
                        <input type="button" value="Editar"
                            onClick={() => {
                                sensorId.current = sensor.id
                                setSensorEditado({
                                    temperatura: sensor.temperatura,
                                    pressao: sensor.pressao,
                                    umidade: sensor.umidade,
                                    sensor_presenca: sensor.sensor_presenca,
                                    trava_seguranca: sensor.trava_seguranca
                                })
                                setModalEditar(true)
                            }}
                            className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer text-sm"
                        />
                        <input type="button" value="Deletar"
                            onClick={() => deletaSensor(sensor.id)}
                            className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer text-sm"
                        />
                    </div>
                </div>
            ))}

            {/* === MODAL EDITAR SENSOR === */}
            {modalEditar &&
                <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
                    <div className="w-[50vw] h-fit rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-4">
                        <h2 className="text-xl font-semibold">Editar Sensor #{sensorId.current}</h2>

                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium">Temperatura (°C)</label>
                            <input type="number" value={sensorEditado.temperatura}
                                onChange={(e) => setSensorEditado({ ...sensorEditado, temperatura: Number(e.target.value) })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />

                            <label className="text-sm font-medium">Pressão (hPa)</label>
                            <input type="number" value={sensorEditado.pressao}
                                onChange={(e) => setSensorEditado({ ...sensorEditado, pressao: Number(e.target.value) })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />

                            <label className="text-sm font-medium">Umidade (%)</label>
                            <input type="number" value={sensorEditado.umidade}
                                onChange={(e) => setSensorEditado({ ...sensorEditado, umidade: Number(e.target.value) })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />

                            <div className="flex gap-8">
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input type="checkbox" checked={sensorEditado.sensor_presenca}
                                        onChange={(e) => setSensorEditado({ ...sensorEditado, sensor_presenca: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    Presença detectada
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input type="checkbox" checked={sensorEditado.trava_seguranca}
                                        onChange={(e) => setSensorEditado({ ...sensorEditado, trava_seguranca: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    Trava de segurança
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-8 justify-end w-full">
                            <input type="button" value="Confirmar"
                                onClick={() => editaSensor(sensorId.current)}
                                className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
                            />
                            <input type="button" value="Cancelar"
                                onClick={() => setModalEditar(false)}
                                className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
})

export default ListarSensores
