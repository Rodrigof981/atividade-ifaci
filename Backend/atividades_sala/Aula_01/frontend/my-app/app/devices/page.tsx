import Header from "../components/Header"
import CriarDispositivo from "./CriarDispositivo"
import ListarDispositivos from "./ListarDispositivos"

export default function Devices(){
    return(
        <div>
            <Header name="Gerenciar Dispositivos"/>
            <div className="flex gap-4 p-4">
                <CriarDispositivo/>
                <ListarDispositivos/>
            </div>
        </div>
    )
}