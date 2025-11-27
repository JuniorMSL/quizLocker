"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QrCode, ArrowRight, Loader2 } from "lucide-react"

export default function ResumePage() {
    const router = useRouter()
    const [token, setToken] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleResume = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Invalid token")
            }

            const { redirectUrl } = await res.json()
            router.push(redirectUrl)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                    <QrCode className="h-8 w-8" />
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Resume Attempt</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                    Enter your resume token to continue your exam on this device.
                </p>

                <form onSubmit={handleResume} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter token..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center text-lg tracking-widest font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Resume <ArrowRight className="h-5 w-5" /></>}
                    </button>
                </form>
            </div>
        </div>
    )
}
