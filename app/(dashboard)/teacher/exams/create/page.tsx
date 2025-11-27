import { ExamForm } from "@/components/dashboard/ExamForm"

export default function CreateExamPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create New Exam</h1>
            <ExamForm />
        </div>
    )
}
