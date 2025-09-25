"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 0)
    }
  }, [isOpen, messages.length])

  const placeholder = useMemo(
    () =>
      "Ask about foods, doshas, or meal ideas…",
    []
  )

  async function sendMessage() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { id: `${Date.now()}-u`, role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.error || "Chat failed")
      }

      const data = await res.json()
      const assistantText: string = data?.content || "Sorry, I couldn't generate a reply."
      setMessages(prev => [...prev, { id: `${Date.now()}-a`, role: "assistant", content: assistantText }])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setMessages(prev => [
        ...prev,
        { id: `${Date.now()}-e`, role: "assistant", content: `Error: ${msg}` }
      ])
    } finally {
      setIsLoading(false)
      setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 50)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-3 w-[320px] max-h-[480px] rounded-2xl shadow-lg border border-border bg-background overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border bg-surface text-sm font-medium">
            NutriVeda Assistant
          </div>
          <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                Hi! I can help with Ayurvedic diet questions.
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={
                    "inline-block rounded-2xl px-3 py-2 text-sm " +
                    (m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")
                  }>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-muted-foreground text-xs">Thinking…</div>
            )}
          </div>
          <div className="p-2 border-t border-border bg-surface flex items-center gap-2">
            <input
              className="flex-1 rounded-full border border-border px-3 py-2 text-sm bg-background focus:outline-none"
              placeholder={placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              className="rounded-full bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-50"
              onClick={sendMessage}
              disabled={isLoading || input.trim().length === 0}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        aria-label="Open chat"
        onClick={() => setIsOpen(v => !v)}
        className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center"
      >
        {isOpen ? (
          <span className="text-xl">×</span>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>
    </div>
  )
}


