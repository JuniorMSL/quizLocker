"use client"

import { SessionProvider } from "next-auth/react"
import { Sidebar } from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <main className="pl-64 min-h-screen">
                    <div className="p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </SessionProvider>
    )
}
