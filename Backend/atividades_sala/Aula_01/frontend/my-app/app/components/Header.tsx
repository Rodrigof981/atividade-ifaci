interface Iprops{
    name: string
}

export default function Header({name}:Iprops){
    return(
        <div className="w-screen p-4 border-b-2 border-b-gray-300 flex items-center justify-around">
            <h1 className="text-2xl font-bold">{name}</h1>
            <span className="flex gap-[2vw]">
                <a href="/">Usuários</a>
                <a href="/devices">Dispositivos</a>
            </span>
        </div>
    )
}