"use client"
import {useState, useEffect} from "react"

export default function CriarUsuario(){

    return(
        <div className="w-[50vw] flex flex-col gap-4 rounded-xl max-h-fit bg-white text-black p-4">
            <h2 className="text-lg font-semibold">Criar Novo Usuário</h2>

            <input
            type="text"
            placeholder="Nome Completo"
            className="p-4 rounded-lg outline-2 outline-red-500 "
            />
            <input
            type="email"
            placeholder="email@email.com"
            className="p-4 rounded-lg outline-2 outline-red-500 "
            />
            <input
            type="password"
            placeholder="Crie uma senha"
            className="p-4 rounded-lg outline-2 outline-red-500 "
            />

            <input
            type="submit"
            value="Enviar"
            className="py-2 px-4 text-white rounded-lg hover:bg-red-500 bg-red-400"
            />

        </div>
    )
}