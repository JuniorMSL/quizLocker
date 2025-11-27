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

        const { attemptId } = await req.json()

        const attempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
            include: { responses: { include: { question: true } } },
        })

        if (!attempt || attempt.userId !== session.user.id) {
            return NextResponse.json({ message: "Invalid attempt" }, { status: 403 })
        }

        if (attempt.status === "COMPLETED") {
            return NextResponse.json({ message: "Already completed" })
        }

        // Calculate score
        let score = 0
        console.log(`[SUBMIT] Calculating score for attempt ${attemptId}`)
        console.log(`[SUBMIT] Total responses: ${attempt.responses.length}`)

        attempt.responses.forEach((r) => {
            console.log(`[SUBMIT] Response ${r.id}: isCorrect=${r.isCorrect}, points=${r.question.points}`)
            if (r.isCorrect) {
                score += r.question.points
            }
        })

        console.log(`[SUBMIT] Final score: ${score}`)

        await prisma.attempt.update({
            where: { id: attemptId },
            data: {
                status: "COMPLETED",
                submittedAt: new Date(),
                score,
            },
        })

        return NextResponse.json({ message: "Submitted", score })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
