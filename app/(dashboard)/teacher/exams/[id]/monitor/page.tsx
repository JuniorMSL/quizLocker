import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { MonitorView } from "@/components/dashboard/MonitorView"

export default async function MonitorPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") redirect("/login")

    const { id } = await params

    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            questions: true,
            attempts: {
                include: { user: true },
                orderBy: { startedAt: "desc" },
            },
            lateCodes: true,
        },
    })

    if (!exam || exam.createdById !== session.user.id) notFound()

    return <MonitorView exam={exam} />
}
