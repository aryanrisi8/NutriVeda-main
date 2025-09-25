import { NextResponse } from "next/server"

export const runtime = "edge"

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
    const userText: string | undefined = body?.text

    const finalMessages: ChatMessage[] = []

    finalMessages.push({
      role: "system",
      content:
        "You are an expert Ayurvedic nutrition assistant. Be concise, practical, and supportive. When recommending foods, consider doshas (Vata, Pitta, Kapha) and standard nutrition."
    })

    if (messages.length > 0) {
      finalMessages.push(...messages)
    } else if (typeof userText === "string" && userText.trim().length > 0) {
      finalMessages.push({ role: "user", content: userText.trim() })
    } else {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://localhost",
        "X-Title": "NutriVeda Chat"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: finalMessages,
        max_tokens: 600,
        temperature: 0.6
      })
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => "")
      return NextResponse.json({ error: "Upstream error", detail: errText }, { status: 502 })
    }

    const data = await response.json()
    const content: string = data?.choices?.[0]?.message?.content ?? ""
    return NextResponse.json({ content })
  } catch (error: unknown) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}


