"use client"
import {useState, useEffect, useRef, RefObject} from "react"


export default function ListarUsuario(){ 
    //Criar a lógica aqui.

    const [modalAberto, setModalAberto] = useState(false)

    return(
        <div className="w-[50vw] max-h-[88vh] overflow-y-auto bg-white text-black rounded-xl flex flex-col gap-4 p-4">
            <h2 className="text-xl font-semibold">Lista de Usuários</h2>
                <div className="bg-gray-300 border-2 border-gray-500 rounded-lg p-4">
                    <h2 className="text-lg font-semibold">Usuário </h2>
                    <div>
                        <p>Nome do Usuario</p>
                    </div>
                    <div className="flex gap-4">
                        <p>Email:</p>
                        <p className="font-black"></p>
                    </div>
                    <div className="flex gap-4">
                        <p>Senha:</p>
                        <p className="font-black"></p>
                    </div>
                    <div className="flex w-full justify-end gap-4">
                        <input
                        type="button"
                        value="Editar"
                        onClick={()=>{setModalAberto(true)}}
                        className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
                        />
                        <input
                        type="button"
                        value="Deletar"
                        onClick={()=>{}}
                        className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                        />
                    </div>
                </div>
                {modalAberto && 
                    <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
                        <div className="w-[50vw] h-fit rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-8">
                            <h2 className="text-xl font-semibold">Editar Usuário</h2>
                            <div className="flex flex-col gap-4">
                                <input
                                type="text"
                                placeholder="Novo Nome"
                                className="p-4 rounded-lg outline-2 outline-red-500 "
                                />
                                <input
                                type="email"
                                placeholder="Novo email"
                                className="p-4 rounded-lg outline-2 outline-red-500 "
                                />
                                <input
                                type="password"
                                placeholder="Nova Senha"
                                className="p-4 rounded-lg outline-2 outline-red-500 "
                                />

                                <div className="flex gap-8 justify-end w-full">
                                    <input
                                    type="button"
                                    value="Confirmar"
                                    onClick={()=>{setModalAberto(false)}}
                                    className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
                                    />
                                    <input
                                    type="button"
                                    value="Cancelar"
                                    onClick={()=>{setModalAberto(false)}}
                                    className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
        </div>
    )
}