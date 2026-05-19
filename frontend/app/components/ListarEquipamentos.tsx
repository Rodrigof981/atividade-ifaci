"use client"
import { useState, useEffect, useRef, ChangeEvent, useImperativeHandle, forwardRef } from "react"

export interface ListarEquipamentosRef {
    refresh: () => void
}

type SensorIoT = {
    id: number
    temperatura: number
    pressao: number
    umidade: number
    sensor_presenca: boolean
    trava_seguranca: boolean
}

const ListarEquipamentos = forwardRef<ListarEquipamentosRef>(function ListarEquipamentos(_, ref) {

    // === EQUIPAMENTOS ===
    const [equipamentos, setEquipamentos] = useState([{ id: 0, nome: "" }])
    const [novoEquipamento, setNovoEquipamento] = useState({ nome: "" })
    const [modalEditarEquip, setModalEditarEquip] = useState(false)
    const equipamentoId = useRef(0)

    const pegaEquipamentosBackend = async () => {
        try {
            const resposta = await fetch("http://localhost:8080/equipamentos")
            const json = await resposta.json()
            setEquipamentos(json)
        } catch (erro) {
            console.log(erro)
        }
    }

    useImperativeHandle(ref, () => ({
        refresh: pegaEquipamentosBackend
    }))

    const deletaEquipamento = async (id: number) => {
        try {
            const resposta = await fetch(`http://localhost:8080/equipamentos/${id}`, { method: "DELETE" })
            const json = await resposta.json()
            alert(json.msg)
            pegaEquipamentosBackend()
        } catch (erro) {
            console.log(erro)
        }
    }

    const editaEquipamento = async (id: number) => {
        try {
            const resposta = await fetch(`http://localhost:8080/equipamentos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoEquipamento)
            })
            const json = await resposta.json()
            alert(json.msg)
            setNovoEquipamento({ nome: "" })
            pegaEquipamentosBackend()
        } catch (erro) {
            console.log(erro)
        }
    }

    // === SENSORES IoT (Node-RED) ===
    const [sensoresIoT, setSensoresIoT] = useState<SensorIoT[]>([])

    const pegaSensoresIoT = async () => {
        try {
            const resposta = await fetch("http://localhost:8080/iot")
            const json = await resposta.json()
            setSensoresIoT(json)
        } catch (erro) {
            console.log(erro)
        }
    }

    useEffect(() => {
        pegaEquipamentosBackend()
        pegaSensoresIoT()
        const intervalo = setInterval(pegaSensoresIoT, 5000)
        return () => clearInterval(intervalo)
    }, [])

    return (
        <div className="w-[50vw] max-h-[88vh] overflow-y-auto bg-white text-black rounded-xl flex flex-col gap-4 p-4">
            <h2 className="text-xl font-semibold">Lista de Equipamentos</h2>

            {equipamentos.map((equip, idx) => (
                <div key={idx} className="bg-gray-300 border-2 border-gray-500 rounded-lg p-4 flex flex-col gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">Equipamento {equip.id}</h2>
                        <p>{equip.nome}</p>
                    </div>

                    {/* Dados do sensor IoT vinculado pelo id */}
                    {(() => {
                        const sensor = sensoresIoT.find(s => s.id === equip.id)
                        if (!sensor) return (
                            <p className="text-xs text-gray-400">📡 Aguardando dados do sensor IoT...</p>
                        )
                        return (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex flex-col gap-1 text-sm">
                                <p className="font-medium text-yellow-700 text-xs uppercase tracking-wide">📡 Sensor IoT (Node-RED)</p>
                                <p>🌡️ Temperatura: <span className="font-medium">{sensor.temperatura?.toFixed(2)} °C</span></p>
                                <p>📊 Pressão: <span className="font-medium">{sensor.pressao?.toFixed(4)} hPa</span></p>
                                <p>💧 Umidade: <span className="font-medium">{sensor.umidade?.toFixed(4)} %</span></p>
                                <p>👁️ Presença: <span className={sensor.sensor_presenca ? "text-green-600 font-semibold" : "text-gray-500"}>{sensor.sensor_presenca ? "Detectada" : "Não detectada"}</span></p>
                                <p>🔒 Trava: <span className={sensor.trava_seguranca ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>{sensor.trava_seguranca ? "Ativada" : "Desativada"}</span></p>
                            </div>
                        )
                    })()}

                    <div className="flex w-full justify-end gap-4">
                        <input type="button" value="Editar"
                            onClick={() => { equipamentoId.current = equip.id; setModalEditarEquip(true) }}
                            className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
                        />
                        <input type="button" value="Deletar"
                            onClick={() => deletaEquipamento(equip.id)}
                            className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                        />
                    </div>
                </div>
            ))}

            {/* === MODAL EDITAR EQUIPAMENTO === */}
            {modalEditarEquip &&
                <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
                    <div className="w-[50vw] h-fit rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-8">
                        <h2 className="text-xl font-semibold">Editar Equipamento {equipamentoId.current}</h2>
                        <div className="flex flex-col gap-4">
                            <input type="text" placeholder="Novo Nome" value={novoEquipamento.nome}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNovoEquipamento({ nome: e.target.value })}
                                className="p-4 rounded-lg outline-2 outline-blue-500"
                            />
                            <div className="flex gap-8 justify-end w-full">
                                <input type="button" value="Confirmar"
                                    onClick={() => { editaEquipamento(equipamentoId.current); setModalEditarEquip(false) }}
                                    className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
                                />
                                <input type="button" value="Cancelar"
                                    onClick={() => setModalEditarEquip(false)}
                                    className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
})

export default ListarEquipamentos
