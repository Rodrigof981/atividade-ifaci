import Link from "next/link"

export default function Header() {
    return (
        <div className="w-screen p-4 border-b-2 border-b-gray-300 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Painel de Controle</h1>
            <nav className="flex gap-4">
                <Link href="/" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                    Usuários
                </Link>
                <Link href="/equipamentos" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                    Equipamentos
                </Link>
            </nav>
        </div>
    )
}