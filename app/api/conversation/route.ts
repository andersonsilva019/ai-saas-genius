import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { checkApiLimit, increaseApiLimit } from '@/lib/api-limit'

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

    const freeTrial = await checkApiLimit()

    if (!freeTrial) {
      return Response.json({
        message: "Free trial limit reached. Upgrade to premium.",
        status: 403
      }, {status: 403})
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      stream: true
    })

    await increaseApiLimit()

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)

  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}