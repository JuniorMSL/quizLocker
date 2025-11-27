import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const examSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    duration: z.coerce.number().min(1),
    closeMode: z.enum(["STRICT", "PERMISSIVE"]),
    questions: z.array(
        z.object({
            text: z.string().min(1),
            imageUrl: z.string().optional().or(z.literal("")),
            points: z.coerce.number().min(1),
            options: z.array(
                z.object({
                    text: z.string().min(1),
                    isCorrect: z.boolean(),
                })
            ),
        })
    ),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const data = examSchema.parse(body)

        // Check ownership
        const existingExam = await prisma.exam.findUnique({ where: { id } })
        if (!existingExam || existingExam.createdById !== session.user.id) {
            return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 })
        }

        // Check for existing attempts
        const attemptsCount = await prisma.attempt.count({ where: { examId: id } })

        if (attemptsCount > 0) {
            // Partial update (no questions)
            const updatedExam = await prisma.exam.update({
                where: { id },
                data: {
                    title: data.title,
                    description: data.description,
                    startTime: new Date(data.startTime),
                    endTime: new Date(data.endTime),
                    duration: data.duration,
                    closeMode: data.closeMode,
                },
            })
            return NextResponse.json({
                message: "Exam updated. Questions were not modified because students have already taken this exam.",
                exam: updatedExam,
                warning: true
            })
        }

        // Full update
        const updatedExam = await prisma.exam.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                duration: data.duration,
                closeMode: data.closeMode,
                questions: {
                    deleteMany: {},
                    create: data.questions.map((q) => ({
                        text: q.text,
                        imageUrl: q.imageUrl || null,
                        points: q.points,
                        options: {
                            create: q.options.map((o) => ({
                                text: o.text,
                                isCorrect: o.isCorrect,
                            })),
                        },
                    })),
                },
            },
        })

        return NextResponse.json({ message: "Exam updated successfully", exam: updatedExam })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Check ownership
        const existingExam = await prisma.exam.findUnique({ where: { id } })
        if (!existingExam || existingExam.createdById !== session.user.id) {
            return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 })
        }

        // Manual cascade delete because Prisma MongoDB relations are emulated
        // 1. Delete Responses (via Attempts) - wait, responses are linked to attempts.
        // We need to find all attempts first.
        const attempts = await prisma.attempt.findMany({ where: { examId: id }, select: { id: true } })
        const attemptIds = attempts.map(a => a.id)

        if (attemptIds.length > 0) {
            await prisma.response.deleteMany({ where: { attemptId: { in: attemptIds } } })
            await prisma.attempt.deleteMany({ where: { examId: id } })
        }

        // 2. Delete Options (via Questions)
        // Questions have onDelete: Cascade from Exam? No, Question has `exam Exam @relation(..., onDelete: Cascade)`
        // So deleting Exam should delete Questions.
        // And Option has `question Question @relation(..., onDelete: Cascade)`
        // So deleting Question should delete Options.
        // Prisma Client handles this for us if configured correctly in schema.
        // Let's rely on Prisma's cascade for Questions/Options/LateCodes if they are configured.
        // LateCode has onDelete: Cascade.

        // But Attempt does NOT have cascade. We deleted it above.

        await prisma.exam.delete({ where: { id } })

        return NextResponse.json({ message: "Exam deleted successfully" })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
