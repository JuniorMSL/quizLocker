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

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const data = examSchema.parse(body)

        const exam = await prisma.exam.create({
            data: {
                title: data.title,
                description: data.description,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                duration: data.duration,
                closeMode: data.closeMode,
                createdById: session.user.id,
                questions: {
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

        return NextResponse.json({ message: "Exam created", exam }, { status: 201 })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
