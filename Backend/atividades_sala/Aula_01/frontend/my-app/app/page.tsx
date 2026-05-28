import CriarUsuario from "./components/CriarUsuario"
import Header from "./components/Header"
import ListarUsuario from "./components/ListarUsuario"

export default function Home(){
  return(
    <div>
      <Header name="Gerenciar Usuários"/>
      <div className="flex gap-4 p-4">
        <CriarUsuario/>
        <ListarUsuario/>
      </div>
    </div>
  )
}