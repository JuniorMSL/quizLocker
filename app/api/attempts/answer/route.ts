import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { attemptId, questionId, selectedOptionId } = await req.json()

        const attempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
        })

        if (!attempt || attempt.userId !== session.user.id) {
            return NextResponse.json({ message: "Invalid attempt" }, { status: 403 })
        }

        if (attempt.status === "COMPLETED") {
            return NextResponse.json({ message: "Attempt already completed" }, { status: 400 })
        }

        // Check if the selected option is correct
        const option = await prisma.option.findUnique({
            where: { id: selectedOptionId },
        })

        const isCorrect = option?.isCorrect || false

        console.log(`[ANSWER] Question: ${questionId}, Option: ${selectedOptionId}, isCorrect: ${isCorrect}`)

        // Find existing response for this question in this attempt
        const existingResponse = await prisma.response.findFirst({
            where: {
                attemptId,
                questionId,
            },
        })

        // Update existing response or create new one
        if (existingResponse) {
            await prisma.response.update({
                where: { id: existingResponse.id },
                data: {
                    selectedOptionId,
                    isCorrect
                },
            })
            console.log(`[ANSWER] Updated existing response: ${existingResponse.id}`)
        } else {
            const newResponse = await prisma.response.create({
                data: {
                    attemptId,
                    questionId,
                    selectedOptionId,
                    isCorrect,
                },
            })
            console.log(`[ANSWER] Created new response: ${newResponse.id}`)
        }

        return NextResponse.json({ message: "Saved" })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
