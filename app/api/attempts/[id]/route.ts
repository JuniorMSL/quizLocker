import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "TEACHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Verify attempt belongs to an exam created by this teacher
        const attempt = await prisma.attempt.findUnique({
            where: { id },
            include: { exam: true },
        })

        if (!attempt) {
            return NextResponse.json({ message: "Attempt not found" }, { status: 404 })
        }

        if (attempt.exam.createdById !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        // Prisma schema has onDelete: Cascade for Response -> Attempt, so this is safe
        await prisma.attempt.delete({ where: { id } })

        return NextResponse.json({ message: "Attempt deleted" })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ message: "Error deleting attempt" }, { status: 500 })
    }
}
