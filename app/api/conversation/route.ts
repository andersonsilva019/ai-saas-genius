import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { userId } = auth()

    const { messages } = await req.json()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API key not set", { status: 500 })
    }

    if (!messages) {
      return new NextResponse("Message is required", { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)

  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}