"use client"
import { useEffect } from "react"

interface CheckoutModalProps {
    url: string
    onClose: () => void
}

export function CheckoutModal({ url, onClose }: CheckoutModalProps) {
    // Close with ESC key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose()
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="relative w-[95%] h-[95%] bg-[#C2C0EB] rounded-2xl overflow-hidden shadow-xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 hover:bg-gray-700 transition"
                >
                    ✕
                </button>

                {/* Embedded page */}
                <iframe
                    src={url}
                    // Hide scrollbars & fill container
                    className="w-fit lg:w-1/2 h-full border-0 rounded-2xl overflow-hidden"
                    scrolling="no"
                    allow="payment; clipboard-write; autoplay"
                    style={{ scrollbarWidth: "none" }} // Firefox
                />
            </div>
        </div>
    )
}
