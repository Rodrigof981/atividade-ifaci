"use client"
import { useRef } from "react"
import Header from "../components/Header"
import CriarSensor from "../components/CriarSensor"
import ListarSensores, { ListarSensoresRef } from "../components/ListarSensores"

export default function Sensores() {
    const listarRef = useRef<ListarSensoresRef>(null)

    return (
        <div>
            <Header />
            <div className="flex gap-4 p-4">
                <CriarSensor onCriado={() => listarRef.current?.refresh()} />
                <ListarSensores ref={listarRef} />
            </div>
        </div>
    )
}
