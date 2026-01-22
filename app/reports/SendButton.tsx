"use client";

import { useFormStatus } from 'react-dom';
import { Send } from 'lucide-react';

export default function SendButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>Loading...</>
            ) : (
                <>
                    <Send className="w-5 h-5" />
                    Hisobotni Yuborish
                </>
            )}
        </button>
    );
}
