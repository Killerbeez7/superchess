export default function Footer() {
    return (
        <footer className="border-t bg-white">
            <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
                <div>
                    <span className="font-semibold text-gray-800">SuperChess</span> · © {new Date().getFullYear()}
                </div>
                <div className="flex items-center gap-4">
                    <a className="hover:underline" href="#">Privacy</a>
                    <a className="hover:underline" href="#">Terms</a>
                    <a className="hover:underline" href="#">Contact</a>
                </div>
            </div>
        </footer>
    );
}


