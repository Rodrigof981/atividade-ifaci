"use client"
import { useState, useEffect, useRef, ChangeEvent, useImperativeHandle, forwardRef } from "react"

export interface ListarEquipamentosRef {
    refresh: () => void
}

type Dispositivo = {
    id: number
    equipamentoId: number
    statusDispositivo: string
    sensores: {
        temperatura: number
        pressao: number
        umidade: number
        presenca: boolean
        rele: boolean
    }
    comandoLiberarConexao: boolean
    comandoLiberarRele: boolean
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

    const pegaInfoEquipamento = (e: ChangeEvent<HTMLInputElement>) => {
        setNovoEquipamento({ nome: e.target.value })
    }

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

    // === DISPOSITIVOS ===
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [modalDispositivos, setModalDispositivos] = useState(false)
    const [modalCriarDisp, setModalCriarDisp] = useState(false)
    const [modalEditarDisp, setModalEditarDisp] = useState(false)
    const dispositivoId = useRef(0)

    const [novoDispositivo, setNovoDispositivo] = useState({
        statusDispositivo: "offline",
        sensores: { temperatura: 0, pressao: 0, umidade: 0, presenca: false, rele: false },
        comandoLiberarConexao: false,
        comandoLiberarRele: false
    })

    const pegaDispositivosBackend = async (equipId: number) => {
        try {
            const resposta = await fetch(`http://localhost:8080/equipamentos/${equipId}/dispositivos`)
            const json = await resposta.json()
            setDispositivos(json)
        } catch (erro) {
            console.log(erro)
        }
    }

    const criaDispositivo = async (equipId: number) => {
        try {
            const resposta = await fetch(`http://localhost:8080/equipamentos/${equipId}/dispositivos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoDispositivo)
            })
            const json = await resposta.json()
            alert(json.msg)
            pegaDispositivosBackend(equipId)
            setModalCriarDisp(false)
        } catch (erro) {
            console.log(erro)
        }
    }

    const deletaDispositivo = async (id: number) => {
        try {
            const resposta = await fetch(`http://localhost:8080/dispositivos/${id}`, { method: "DELETE" })
            const json = await resposta.json()
            alert(json.msg)
            pegaDispositivosBackend(equipamentoId.current)
        } catch (erro) {
            console.log(erro)
        }
    }

    const editaDispositivo = async (id: number) => {
        try {
            const resposta = await fetch(`http://localhost:8080/dispositivos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoDispositivo)
            })
            const json = await resposta.json()
            alert(json.msg)
            pegaDispositivosBackend(equipamentoId.current)
            setModalEditarDisp(false)
        } catch (erro) {
            console.log(erro)
        }
    }

    const toggleComando = async (id: number, campo: "comandoLiberarConexao" | "comandoLiberarRele", valorAtual: boolean) => {
        try {
            const resposta = await fetch(`http://localhost:8080/dispositivos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [campo]: !valorAtual })
            })
            const json = await resposta.json()
            alert(json.msg)
            pegaDispositivosBackend(equipamentoId.current)
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

    // Atualiza sensores IoT a cada 5s quando o modal de dispositivos está aberto
    useEffect(() => {
        if (modalDispositivos) {
            pegaSensoresIoT()
            const intervalo = setInterval(pegaSensoresIoT, 5000)
            return () => clearInterval(intervalo)
        }
    }, [modalDispositivos])

    useEffect(() => {
        pegaEquipamentosBackend()
    }, [])

    return (
        <div className="w-[50vw] max-h-[88vh] overflow-y-auto bg-white text-black rounded-xl flex flex-col gap-4 p-4">
            <h2 className="text-xl font-semibold">Lista de Equipamentos</h2>

            {equipamentos.map((equip, idx) => (
                <div key={idx} className="bg-gray-300 border-2 border-gray-500 rounded-lg p-4">
                    <h2 className="text-lg font-semibold">Equipamento {equip.id}</h2>
                    <p>{equip.nome}</p>
                    <div className="flex w-full justify-end gap-4 mt-2">
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
                                onChange={(e) => pegaInfoEquipamento(e)}
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

            {/* === MODAL DISPOSITIVOS === */}
            {modalDispositivos &&
                <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
                    <div className="w-[70vw] max-h-[85vh] overflow-y-auto rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Dispositivos do Equipamento {equipamentoId.current}</h2>
                            <input type="button" value="+ Novo Dispositivo"
                                onClick={() => setModalCriarDisp(true)}
                                className="rounded-lg px-4 py-2 bg-green-400 hover:bg-green-500 text-white cursor-pointer text-sm"
                            />
                        </div>

                        {dispositivos.length === 0 && (
                            <p className="text-gray-500 text-sm">Nenhum dispositivo cadastrado.</p>
                        )}

                        {dispositivos.map((disp, idx) => (
                            <div key={idx} className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 flex flex-col gap-3">
                                <h3 className="font-semibold">Dispositivo {disp.id}</h3>
                                <p>Status: <span className={disp.statusDispositivo === "online" ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>{disp.statusDispositivo}</span></p>

                                {/* Dados do dispositivo (cadastrados manualmente) */}
                                <div className="flex flex-col gap-1 text-sm">
                                    <p className="font-medium text-gray-600 text-xs uppercase tracking-wide">Dados do dispositivo</p>
                                    <p>🌡️ Temperatura: {disp.sensores.temperatura} °C</p>
                                    <p>📊 Pressão: {disp.sensores.pressao} hPa</p>
                                    <p>💧 Umidade: {disp.sensores.umidade} %</p>
                                    <p>👁️ Presença: {disp.sensores.presenca ? "Detectada" : "Não detectada"}</p>
                                    <p>🔒 Relé: {disp.sensores.rele ? "Ativado" : "Desativado"}</p>
                                </div>

                                {/* Dados dos sensores IoT (Node-RED) vinculados pelo índice */}
                                {sensoresIoT.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex flex-col gap-1 text-sm">
                                        <p className="font-medium text-yellow-700 text-xs uppercase tracking-wide">📡 Sensor IoT (Node-RED) — ID {disp.id}</p>
                                        {(() => {
                                            const sensor = sensoresIoT.find(s => s.id === disp.id)
                                            if (!sensor) return <p className="text-gray-400 text-xs">Nenhum dado IoT para este dispositivo.</p>
                                            return (
                                                <>
                                                    <p>🌡️ Temperatura: <span className="font-medium">{sensor.temperatura?.toFixed(2)} °C</span></p>
                                                    <p>📊 Pressão: <span className="font-medium">{sensor.pressao?.toFixed(4)} hPa</span></p>
                                                    <p>💧 Umidade: <span className="font-medium">{sensor.umidade?.toFixed(4)} %</span></p>
                                                    <p>👁️ Presença: <span className={sensor.sensor_presenca ? "text-green-600 font-semibold" : "text-gray-500"}>{sensor.sensor_presenca ? "Detectada" : "Não detectada"}</span></p>
                                                    <p>🔒 Trava: <span className={sensor.trava_seguranca ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>{sensor.trava_seguranca ? "Ativada" : "Desativada"}</span></p>
                                                </>
                                            )
                                        })()}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <input type="button"
                                        value={disp.comandoLiberarConexao ? "⛔ Travar Conexão" : "🔌 Liberar Conexão"}
                                        onClick={() => toggleComando(disp.id, "comandoLiberarConexao", disp.comandoLiberarConexao)}
                                        className={`rounded-lg px-3 py-2 text-white cursor-pointer text-sm ${disp.comandoLiberarConexao ? "bg-red-400 hover:bg-red-500" : "bg-blue-400 hover:bg-blue-500"}`}
                                    />
                                    <input type="button"
                                        value={disp.comandoLiberarRele ? "🔒 Travar Relé" : "🔓 Liberar Relé"}
                                        onClick={() => toggleComando(disp.id, "comandoLiberarRele", disp.comandoLiberarRele)}
                                        className={`rounded-lg px-3 py-2 text-white cursor-pointer text-sm ${disp.comandoLiberarRele ? "bg-orange-400 hover:bg-orange-500" : "bg-green-400 hover:bg-green-500"}`}
                                    />
                                </div>

                                <div className="flex w-full justify-end gap-4">
                                    <input type="button" value="Editar"
                                        onClick={() => {
                                            dispositivoId.current = disp.id
                                            setNovoDispositivo({
                                                statusDispositivo: disp.statusDispositivo,
                                                sensores: { ...disp.sensores },
                                                comandoLiberarConexao: disp.comandoLiberarConexao,
                                                comandoLiberarRele: disp.comandoLiberarRele
                                            })
                                            setModalEditarDisp(true)
                                        }}
                                        className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer text-sm"
                                    />
                                    <input type="button" value="Deletar"
                                        onClick={() => deletaDispositivo(disp.id)}
                                        className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end mt-2">
                            <input type="button" value="Fechar"
                                onClick={() => setModalDispositivos(false)}
                                className="rounded-lg px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            }

            {/* === MODAL CRIAR DISPOSITIVO === */}
            {modalCriarDisp &&
                <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
                    <div className="w-[50vw] h-fit rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-4">
                        <h2 className="text-xl font-semibold">Novo Dispositivo</h2>
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium">Status do Dispositivo</label>
                            <select value={novoDispositivo.statusDispositivo}
                                onChange={(e) => setNovoDispositivo({ ...novoDispositivo, statusDispositivo: e.target.value })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            >
                                <option value="offline">Offline</option>
                                <option value="online">Online</option>
                            </select>
                            <label className="text-sm font-medium">Temperatura (°C)</label>
                            <input type="number" value={novoDispositivo.sensores.temperatura}
                                onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, temperatura: Number(e.target.value) } })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />
                            <label className="text-sm font-medium">Pressão (hPa)</label>
                            <input type="number" value={novoDispositivo.sensores.pressao}
                                onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, pressao: Number(e.target.value) } })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />
                            <label className="text-sm font-medium">Umidade (%)</label>
                            <input type="number" value={novoDispositivo.sensores.umidade}
                                onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, umidade: Number(e.target.value) } })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />
                            <div className="flex gap-8">
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input type="checkbox" checked={novoDispositivo.sensores.presenca}
                                        onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, presenca: e.target.checked } })}
                                        className="w-4 h-4"
                                    />
                                    Presença detectada
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input type="checkbox" checked={novoDispositivo.sensores.rele}
                                        onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, rele: e.target.checked } })}
                                        className="w-4 h-4"
                                    />
                                    Relé ativado
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-8 justify-end w-full">
                            <input type="button" value="Confirmar"
                                onClick={() => criaDispositivo(equipamentoId.current)}
                                className="rounded-lg px-4 py-2 bg-green-400 hover:bg-green-500 text-white cursor-pointer"
                            />
                            <input type="button" value="Cancelar"
                                onClick={() => setModalCriarDisp(false)}
                                className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            }

            {/* === MODAL EDITAR DISPOSITIVO === */}
            {modalEditarDisp &&
                <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
                    <div className="w-[50vw] h-fit rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-4">
                        <h2 className="text-xl font-semibold">Editar Dispositivo {dispositivoId.current}</h2>
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium">Status do Dispositivo</label>
                            <select value={novoDispositivo.statusDispositivo}
                                onChange={(e) => setNovoDispositivo({ ...novoDispositivo, statusDispositivo: e.target.value })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            >
                                <option value="offline">Offline</option>
                                <option value="online">Online</option>
                            </select>
                            <label className="text-sm font-medium">Temperatura (°C)</label>
                            <input type="number" value={novoDispositivo.sensores.temperatura}
                                onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, temperatura: Number(e.target.value) } })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />
                            <label className="text-sm font-medium">Pressão (hPa)</label>
                            <input type="number" value={novoDispositivo.sensores.pressao}
                                onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, pressao: Number(e.target.value) } })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />
                            <label className="text-sm font-medium">Umidade (%)</label>
                            <input type="number" value={novoDispositivo.sensores.umidade}
                                onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, umidade: Number(e.target.value) } })}
                                className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
                            />
                            <div className="flex gap-8">
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input type="checkbox" checked={novoDispositivo.sensores.presenca}
                                        onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, presenca: e.target.checked } })}
                                        className="w-4 h-4"
                                    />
                                    Presença detectada
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input type="checkbox" checked={novoDispositivo.sensores.rele}
                                        onChange={(e) => setNovoDispositivo({ ...novoDispositivo, sensores: { ...novoDispositivo.sensores, rele: e.target.checked } })}
                                        className="w-4 h-4"
                                    />
                                    Relé ativado
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-8 justify-end w-full">
                            <input type="button" value="Confirmar"
                                onClick={() => editaDispositivo(dispositivoId.current)}
                                className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
                            />
                            <input type="button" value="Cancelar"
                                onClick={() => setModalEditarDisp(false)}
                                className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
})

export default ListarEquipamentos
