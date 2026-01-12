"use client";

import { useState, useRef, useEffect } from "react";
import { scanMember } from "../actions";
import { Scan, User, XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

export default function QRScannerPage() {
    const [scanResult, setScanResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep focus on input for hardware scanners
    useEffect(() => {
        const focusInput = () => inputRef.current?.focus();
        focusInput();
        window.addEventListener("click", focusInput);
        return () => window.removeEventListener("click", focusInput);
    }, []);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setScanResult(null);

        try {
            const result = await scanMember(input);
            setScanResult(result);
            setInput(""); // Clear for next scan
        } catch (error) {
            setScanResult({ success: false, message: "Server xatosi!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-100px)]">
                <div className="flex-1 flex flex-col items-center justify-center p-6">

                    {/* Scanner Input (Hidden but focused) */}
                    <form onSubmit={handleScan} className="w-full max-w-md mb-8">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="QR Kodni skanerlang..."
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-4 pl-12 focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow-2xl"
                                autoFocus
                            />
                            <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-6 h-6 animate-pulse" />
                        </div>
                        <p className="text-center text-zinc-500 text-sm mt-4">
                            Skaner qurilmangiz ulanganligiga ishonch hosil qiling.
                        </p>
                    </form>

                    {/* Result Display */}
                    {loading && (
                        <div className="text-white text-xl animate-bounce">Qidirilmoqda...</div>
                    )}

                    {scanResult && !loading && (
                        <div className={`w-full max-w-2xl bg-zinc-900 border-2 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all transform scale-100 ${scanResult.success
                                ? "border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)]"
                                : "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
                            }`}>
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                {/* Member Photo */}
                                <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center overflow-hidden shrink-0 ${scanResult.success ? "border-green-500" : "border-red-500"
                                    }`}>
                                    {scanResult.member?.imageUrl ? (
                                        <img src={scanResult.member.imageUrl} alt="Member" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-20 h-20 text-zinc-600" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl font-black text-white mb-2">
                                        {scanResult.member?.fullName || "Noma'lum"}
                                    </h2>

                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-4 ${scanResult.success
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-red-500/20 text-red-400"
                                        }`}>
                                        {scanResult.success ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                        {scanResult.message}
                                    </div>

                                    {scanResult.member && (
                                        <div className="grid grid-cols-2 gap-4 text-left bg-black/20 p-4 rounded-xl">
                                            <div>
                                                <p className="text-zinc-500 text-sm">Telefon</p>
                                                <p className="text-white font-mono">{scanResult.member.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-500 text-sm">Holati</p>
                                                <p className="text-white font-mono">{scanResult.member.status}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}
