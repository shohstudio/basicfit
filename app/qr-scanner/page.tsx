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

    const handleScan = async (e: React.FormEvent, directValue?: string) => {
        e.preventDefault();
        const valueToScan = directValue || input;
        if (!valueToScan.trim()) return;

        setLoading(true);
        setScanResult(null);

        try {
            const result = await scanMember(valueToScan);
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
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setInput(val);
                                    // Auto submit if length is 8 (Short ID)
                                    if (val.length === 8) {
                                        // Use a small timeout to let state update
                                        setTimeout(() => {
                                            const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                                            handleScan(fakeEvent, val);
                                        }, 100);
                                    }
                                }}
                                placeholder="QR Kodni skanerlang..."
                                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-4 pl-12 focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow-xl shadow-blue-500/5 placeholder:text-gray-400"
                                autoFocus
                            />
                            <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-6 h-6 animate-pulse" />
                        </div>
                        <p className="text-center text-gray-500 text-sm mt-4">
                            Skaner qurilmangiz ulanganligiga ishonch hosil qiling.
                        </p>
                    </form>

                    {/* Result Display */}
                    {loading && (
                        <div className="text-blue-600 text-xl animate-bounce font-medium">Qidirilmoqda...</div>
                    )}

                    {scanResult && !loading && (
                        <div className={`w-full max-w-2xl bg-white border rounded-3xl p-8 shadow-2xl transition-all transform scale-100 ${scanResult.success
                            ? "border-green-200 shadow-green-500/10"
                            : "border-red-200 shadow-red-500/10"
                            }`}>
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                {/* Member Photo */}
                                <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center overflow-hidden shrink-0 ${scanResult.success ? "border-green-500" : "border-red-500"
                                    }`}>
                                    {scanResult.member?.imageUrl ? (
                                        <img src={scanResult.member.imageUrl} alt="Member" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-20 h-20 text-gray-300" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                                        {scanResult.member?.fullName || "Noma'lum"}
                                    </h2>

                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-4 ${scanResult.success
                                        ? "bg-green-50 text-green-600 border border-green-100"
                                        : "bg-red-50 text-red-600 border border-red-100"
                                        }`}>
                                        {scanResult.success ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                        {scanResult.message}
                                    </div>

                                    {scanResult.member && (
                                        <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div>
                                                <p className="text-gray-500 text-sm">Telefon</p>
                                                <p className="text-gray-900 font-mono font-bold">{scanResult.member.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Holati</p>
                                                <p className="text-gray-900 font-mono font-bold">{scanResult.member.status}</p>
                                            </div>
                                            {(scanResult.member.subscriptions && scanResult.member.subscriptions.length > 0) && (
                                                <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                                                    <p className="text-gray-500 text-sm">Ta'rif</p>
                                                    <p className="text-lg font-black text-gray-900 uppercase">
                                                        {scanResult.member.subscriptions[0].plan === "KUN_ORA" ? "Kun ora" :
                                                            scanResult.member.subscriptions[0].plan === "HAR_KUNLIK" ? "Har kunlik" :
                                                                scanResult.member.subscriptions[0].plan}
                                                    </p>
                                                </div>
                                            )}
                                            {scanResult.checkIn && (
                                                <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                                                    <p className="text-gray-500 text-sm">Kelgan Vaqti</p>
                                                    <p className="text-2xl font-black text-blue-600 font-mono">
                                                        {new Date(scanResult.checkIn).toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            )}
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
