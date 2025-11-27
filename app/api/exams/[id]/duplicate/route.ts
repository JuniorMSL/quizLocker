import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Fetch the original exam with all its questions and options
        const originalExam = await prisma.exam.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        })

        if (!originalExam) {
            return NextResponse.json({ message: "Exam not found" }, { status: 404 })
        }

        // Verify ownership
        if (originalExam.createdById !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        // Create the duplicate exam
        const duplicatedExam = await prisma.exam.create({
            data: {
                title: `${originalExam.title} (Copy)`,
                description: originalExam.description,
                startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
                duration: originalExam.duration,
                closeMode: originalExam.closeMode,
                createdById: session.user.id,
                questions: {
                    create: originalExam.questions.map((question) => ({
                        text: question.text,
                        imageUrl: question.imageUrl ?? null,
                        points: question.points,
                        options: {
                            create: question.options.map((option) => ({
                                text: option.text,
                                isCorrect: option.isCorrect,
                            })),
                        },
                    })),
                },
            },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        })

        return NextResponse.json({
            message: "Exam duplicated successfully",
            examId: duplicatedExam.id
        }, { status: 201 })
    } catch (error: any) {
        console.error("Error duplicating exam:", error)
        return NextResponse.json(
            { message: error.message || "Failed to duplicate exam" },
            { status: 500 }
        )
    }
}
