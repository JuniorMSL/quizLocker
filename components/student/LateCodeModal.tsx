"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, X, Key } from "lucide-react"
import { cn } from "@/lib/utils"

interface LateCodeModalProps {
    examId: string
    examTitle: string
    isOpen: boolean
    onClose: () => void
}

export function LateCodeModal({ examId, examTitle, isOpen, onClose }: LateCodeModalProps) {
    const router = useRouter()
    const [lateCode, setLateCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!lateCode.trim()) {
            setError("Please enter a late code")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/attempts/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examId,
                    lateCode: lateCode.trim(),
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Invalid late code")
            }

            // Success - redirect to exam
            router.push(`/student/exam/${examId}/take`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                            <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enter Late Code</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{examTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                            ⏰ This exam has ended. You need a late access code from your teacher to continue.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                            Late Access Code
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Key className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={lateCode}
                                onChange={(e) => {
                                    setLateCode(e.target.value.toUpperCase())
                                    setError("")
                                }}
                                className={cn(
                                    "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-700 focus:ring-4 outline-none transition-all font-mono font-bold text-lg tracking-wider",
                                    error
                                        ? "border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20"
                                )}
                                placeholder="XXXX-XXXX-XXXX"
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                                <span className="text-lg">⚠️</span> {error}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !lateCode.trim()}
                            className={cn(
                                "flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                                loading || !lateCode.trim()
                                    ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 active:scale-95"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Start Exam"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
