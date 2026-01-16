"use client";

import { createMember, updateMember, renewSubscription } from "../actions";
import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, X, RefreshCcw } from "lucide-react";

type MemberFormProps = {
    onClose: () => void;
    initialData?: any;
    mode?: 'create' | 'edit' | 'renew';
};

export default function MemberForm({ onClose, initialData, mode = 'create' }: MemberFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const [plan, setPlan] = useState(initialData?.subscriptions?.[0]?.plan || "KUN_ORA");

    // Image state
    const [image, setImage] = useState<string | null>(initialData?.imageUrl || null);
    const [isCameraMode, setIsCameraMode] = useState(true);
    const [cameraError, setCameraError] = useState(false);



    // Phone state
    const [phone, setPhone] = useState(initialData?.phone || "+998");

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        // Don't allow deleting +998
        if (!val.startsWith("+998")) {
            val = "+998" + val.replace(/^\+998/, "").replace(/\D/g, "");
        }

        // Allow only digits after prefix and limit to 9 digits (13 chars total)
        const digits = val.slice(4).replace(/\D/g, "");
        if (digits.length > 9) return;

        setPhone("+998" + digits);
    };
    const today = new Date();

    // Smart Date Logic for RENEW
    let defaultStartDate = today;
    if (mode === 'renew' && initialData?.subscriptions?.length > 0) {
        const latestSub = initialData.subscriptions[0];
        const latestEndDate = new Date(latestSub.endDate);

        // If not expired, start from old end date
        if (latestEndDate > today) {
            defaultStartDate = latestEndDate;
        }
    }

    const nextMonth = new Date(defaultStartDate);
    nextMonth.setMonth(defaultStartDate.getMonth() + 1);

    // Format dates for display (DD/MM/YYYY)
    const formatDate = (d: Date) => d.toLocaleDateString("en-GB");

    // Auto-price based on plan
    const price = plan === "KUN_ORA" ? 300000 : 550000;
    const formattedPrice = price.toLocaleString("ru-RU").replace(/,/g, " ");

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
        }
    }, [webcamRef]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        if (!image) {
            alert("Rasm yuklash majburiy! Iltimos, rasmga oling yoki yuklang.");
            return;
        }

        // Add image to formData
        formData.set("imageUrl", image);

        let result;

        if (mode === 'edit' && initialData) {
            formData.set("plan", plan);
            result = await updateMember(initialData.id, formData);
        } else if (mode === 'renew' && initialData) {
            formData.set("plan", plan);
            formData.set("price", price.toString());
            formData.set("startDate", defaultStartDate.toISOString());
            formData.set("endDate", nextMonth.toISOString());
            result = await renewSubscription(initialData.id, formData);
        } else {
            // Create
            formData.set("plan", plan);
            formData.set("price", price.toString());
            formData.set("startDate", today.toISOString());
            formData.set("endDate", nextMonth.toISOString());
            result = await createMember(formData);
        }

        if (result && !result.success) {
            alert(result.message);
            return;
        }

        formRef.current?.reset();
        onClose();
    };

    const getTitle = () => {
        if (mode === 'edit') return "A'zoni tahrirlash";
        if (mode === 'renew') return "Obunani yangilash (Qayta to'lov)";
        return "Yangi a'zo qo'shish";
    };

    const getButtonText = () => {
        if (mode === 'edit') return "Saqlash";
        if (mode === 'renew') return "To'lov qildi va Faollashtirish";
        return "To'lov qildi va Qo'shish";
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 flex gap-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">

                {/* Image Section */}
                <div className="w-1/3 flex flex-col gap-4">
                    <h3 className="font-bold text-sm text-gray-700">A'zo Rasmi <span className="text-red-500">*</span></h3>

                    <div className="flex gap-2 mb-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setIsCameraMode(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${isCameraMode ? 'bg-white shadow text-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <Camera className="w-3.5 h-3.5" /> Kamera
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCameraMode(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${!isCameraMode ? 'bg-white shadow text-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <Upload className="w-3.5 h-3.5" /> Yuklash
                        </button>
                    </div>

                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative border-2 border-dashed border-gray-300 flex items-center justify-center group">
                        {image ? (
                            <>
                                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCcw className="w-6 h-6" />
                                        <span className="text-xs font-medium">Qayta olish</span>
                                    </div>
                                </button>
                            </>
                        ) : isCameraMode ? (
                            cameraError ? (
                                <div className="p-4 text-center text-red-500 text-xs">
                                    Kamera topilmadi yoki ruxsat yo'q
                                </div>
                            ) : (
                                <div className="relative w-full h-full">
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                        onUserMediaError={() => setCameraError(true)}
                                    />
                                    <button
                                        type="button"
                                        onClick={capture}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full border-4 border-blue-500 shadow-lg hover:scale-110 transition-transform"
                                    ></button>
                                </div>
                            )
                        ) : (
                            <div className="text-center p-4">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <label className="block text-xs text-blue-600 hover:text-blue-500 cursor-pointer font-medium">
                                    Rasm tanlash
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </div>
                </div>
                {!image && <p className="text-[10px] text-red-500 text-center">* Rasm majburiy</p>}
            </div>

            {/* Form Section */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="fullName"
                        placeholder="To'liq Ism"
                        defaultValue={initialData?.fullName}
                        required
                        disabled={mode === 'renew'}
                        className="bg-gray-50 text-gray-900 border border-gray-200 p-3 rounded-lg w-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 disabled:opacity-50 font-medium transition-all"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Telefon Raqam"
                            value={phone}
                            onChange={handlePhoneChange}
                            required
                            disabled={mode === 'renew'}
                            maxLength={13}
                            className="bg-gray-50 text-gray-900 border border-gray-200 p-3 rounded-lg w-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 disabled:opacity-50 font-medium transition-all"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email (Ixtiyoriy)"
                            defaultValue={initialData?.email}
                            disabled={mode === 'renew'}
                            className="bg-gray-50 text-gray-900 border border-gray-200 p-3 rounded-lg w-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 disabled:opacity-50 font-medium transition-all"
                        />
                    </div>

                    {/* Subscription Plan Section (Visible in all modes) */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Obuna Rejasi</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setPlan("KUN_ORA")}
                                className={`p-3 rounded-lg border text-left transition-all ${plan === "KUN_ORA"
                                    ? "border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-500 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300 text-gray-500 bg-white"
                                    }`}
                            >
                                <div className="font-bold text-sm">Kun ora</div>
                                <div className="text-xs opacity-70">300 000 so'm</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlan("HAR_KUNLIK")}
                                className={`p-3 rounded-lg border text-left transition-all ${plan === "HAR_KUNLIK"
                                    ? "border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-500 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300 text-gray-500 bg-white"
                                    }`}
                            >
                                <div className="font-bold text-sm">Har kunlik</div>
                                <div className="text-xs opacity-70">550 000 so'm</div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Jami Summa</p>
                                <p className="text-lg font-black text-gray-900">{formattedPrice} so'm</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 mb-0.5">Muddati</p>
                                <p className="text-xs font-medium text-gray-700">
                                    {mode === 'renew' ? formatDate(defaultStartDate) : formatDate(today)} - {formatDate(nextMonth)}
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 site-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-bold tracking-wide transition-all shadow-lg shadow-gray-900/10"
                        >
                            {getButtonText()}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </div >
    );
}
