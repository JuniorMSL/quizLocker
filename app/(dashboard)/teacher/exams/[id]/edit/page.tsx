import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { ExamForm } from "@/components/dashboard/ExamForm"

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") redirect("/login")

    const { id } = await params

    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            questions: {
                include: {
                    options: true,
                },
            },
        },
    })

    if (!exam || exam.createdById !== session.user.id) notFound()

    return <ExamForm initialData={exam} />
}
