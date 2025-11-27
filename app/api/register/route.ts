import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["STUDENT", "TEACHER"]),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password, role } = registerSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                studentCode: role === "STUDENT" ? Math.random().toString(36).substring(2, 10).toUpperCase() : null,
            },
        })

        return NextResponse.json(
            { message: "User created successfully", user: { id: user.id, email: user.email, role: user.role } },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        )
    }
}
