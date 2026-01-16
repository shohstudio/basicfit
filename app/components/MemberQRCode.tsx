"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function MemberQRCode({ memberId, name, onClose }: { memberId: string, name: string, onClose: () => void }) {

    const downloadQR = () => {
        const canvas = document.getElementById(`qr-${memberId}`) as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `basicfit-member-${memberId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <QRCodeCanvas
                    id={`qr-${memberId}`}
                    value={memberId.substring(0, 8)} // Display only first 8 chars for easier scanning
                    size={200}
                    level={"H"}
                    includeMargin={true}
                />
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-zinc-300 bg-zinc-800 px-3 py-1 rounded mb-2 font-mono tracking-wider">
                    {memberId.substring(0, 8)}
                </p>
                <p className="text-sm text-zinc-500 max-w-[200px]">
                    <strong>{name}</strong>ni aniqlash uchun skaner qiling
                </p>
            </div>
            <div className="flex gap-2 w-full max-w-[200px]">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    Yopish
                </button>
                <button
                    onClick={downloadQR}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                    Yuklab olish
                </button>
            </div>
        </div>
    );
}
