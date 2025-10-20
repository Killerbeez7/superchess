import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-gray-900 text-white p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold hover:text-blue-400 transition-colors">
                    SuperChess
                </Link>

                <div className="flex space-x-6">
                    <Link href="/games" className="hover:text-blue-400 transition-colors">
                        Play
                    </Link>
                    <Link href="/#" className="hover:text-blue-400 transition-colors">
                        Tutorial
                    </Link>
                    <Link href="/#" className="hover:text-blue-400 transition-colors">
                        Battlegrounds
                    </Link>
                    <Link href="/#" className="hover:text-blue-400 transition-colors">
                        Rankings
                    </Link>
                </div>
            </div>
        </nav>
    );
}