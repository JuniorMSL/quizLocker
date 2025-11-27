import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { ExamLobby } from "@/components/student/ExamLobby"

export default async function ExamLobbyPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    const { id } = await params

    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            _count: { select: { questions: true } },
            attempts: {
                where: { userId: session.user.id },
            },
        },
    })

    if (!exam) notFound()

    // If already attempted and not finished, redirect to take
    // If finished, redirect to result (not implemented yet)
    const attempt = exam.attempts[0]
    if (attempt) {
        if (attempt.status === "STARTED") {
            redirect(`/student/exam/${exam.id}/take`)
        } else {
            // redirect(`/student/exam/${exam.id}/result`)
            // For now stay here or show result summary
        }
    }

    return <ExamLobby exam={exam} user={session.user} />
}
