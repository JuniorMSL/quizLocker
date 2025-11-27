"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash, Play, BarChart2, Loader2, Copy } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal"

export function ExamCardActions({ exam }: { exam: any }) {
    const router = useRouter()
    const [deleting, setDeleting] = useState(false)
    const [duplicating, setDuplicating] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/exams/${exam.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Exam deleted successfully")
            setShowDeleteModal(false)
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete exam")
        } finally {
            setDeleting(false)
        }
    }

    const handleDuplicate = async () => {
        setDuplicating(true)
        try {
            const res = await fetch(`/api/exams/${exam.id}/duplicate`, { method: "POST" })
            if (!res.ok) throw new Error("Failed to duplicate")
            const data = await res.json()
            toast.success("Exam duplicated successfully")
            router.refresh()
            // Optionally redirect to edit the new exam
            // router.push(`/teacher/exams/${data.examId}/edit`)
        } catch (error) {
            toast.error("Failed to duplicate exam")
        } finally {
            setDuplicating(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-1">
                <Link
                    href={`/student/exam/${exam.id}/lobby`}
                    target="_blank"
                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                    title="Preview as Student"
                >
                    <Play className="h-4 w-4" />
                </Link>

                <Link
                    href={`/teacher/exams/${exam.id}/monitor`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                    title="Monitor / Stats"
                >
                    <BarChart2 className="h-4 w-4" />
                </Link>

                <Link
                    href={`/teacher/exams/${exam.id}/edit`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                    title="Edit"
                >
                    <Edit className="h-4 w-4" />
                </Link>

                <button
                    onClick={handleDuplicate}
                    disabled={duplicating}
                    className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 transition-colors"
                    title="Duplicate"
                >
                    {duplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                </button>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                    title="Delete"
                >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                </button>
            </div>

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Exam"
                message="Are you sure you want to delete this exam? This action cannot be undone and will delete all student attempts."
                isLoading={deleting}
            />
        </>
    )
}
