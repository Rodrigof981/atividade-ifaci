export default function CriarDispositivo(){
    return(
        <div className="w-[50vw] h-fit bg-white rounded-xl text-black p-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Criar Novo Dispositivo</h2>
            <div className="flex flex-col gap-4">
                <input
                type="text"
                placeholder="Nome do dispositivo"
                className="p-4 rounded-lg outline-2 outline-red-500 placeholder:to-black"
                />
                <input
                type="text"
                placeholder="Tipo"
                className="p-4 rounded-lg outline-2 outline-red-500 placeholder:to-black"
                />

                <input
                type="submit"
                value="Criar"
                className="py-2 px-4 text-white rounded-lg hover:bg-red-500 bg-red-400"
                />
            </div>
            
        </div>
    )
}