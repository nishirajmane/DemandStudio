"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Editor } from "@/components/blocks/editor-x/editor"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"

interface FAQItem {
    question: string
    answer: string // serialized Lexical state
}

interface FAQEditorProps {
    value: string // JSON string of FAQItem[]
    onChange: (value: string) => void
}

export function FAQEditor({ value, onChange }: FAQEditorProps) {
    const [items, setItems] = useState<FAQItem[]>([])

    useEffect(() => {
        try {
            const parsed = JSON.parse(value || "[]")
            if (Array.isArray(parsed)) {
                setItems(parsed)
            }
        } catch (e) {
            setItems([])
        }
    }, []) // On mount typically, but value might change externally? 
    // If we dep on value, we might cause loops if we don't allow partial updates.
    // Better to manage local state and sync up.

    const updateItems = (newItems: FAQItem[]) => {
        setItems(newItems)
        onChange(JSON.stringify(newItems))
    }

    const addItem = () => {
        updateItems([...items, { question: "", answer: "" }])
    }

    const removeItem = (index: number) => {
        updateItems(items.filter((_, i) => i !== index))
    }

    const updateQuestion = (index: number, q: string) => {
        const newItems = [...items]
        newItems[index].question = q
        updateItems(newItems)
    }

    const updateAnswer = (index: number, a: string) => {
        const newItems = [...items]
        newItems[index].answer = a
        updateItems(newItems)
    }

    // Helper to parse content for Editor
    const parseContent = (content: string) => {
        try {
            if (content.trim().startsWith("{")) return JSON.parse(content)
            throw new Error("Not JSON")
        } catch (e) {
            return undefined
        }
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <Card key={index}>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <Label>Question {index + 1}</Label>
                                <Input
                                    value={item.question}
                                    onChange={(e) => updateQuestion(index, e.target.value)}
                                    placeholder="Enter question"
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="mt-6 text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label>Answer</Label>
                            <div className="min-h-[200px] border rounded-md">
                                <Editor
                                    editorSerializedState={parseContent(item.answer)}
                                    onSerializedChange={(state) => updateAnswer(index, JSON.stringify(state))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button type="button" onClick={addItem} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add FAQ
            </Button>
        </div>
    )
}
