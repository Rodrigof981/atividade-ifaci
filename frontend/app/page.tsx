"use client"
import { useRef } from "react"
import CriarUsuario from "./components/CriarUsuario"
import Header from "./components/Header"
import ListarUsuario, { ListarUsuarioRef } from "./components/ListarUsuario"

export default function Home() {
    const listarRef = useRef<ListarUsuarioRef>(null)

    return (
        <div>
            <Header />
            <div className="flex gap-4 p-4">
                <CriarUsuario onCriado={() => listarRef.current?.refresh()} />
                <ListarUsuario ref={listarRef} />
            </div>
        </div>
    )
}
