import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { checkApiLimit, increaseApiLimit } from '@/lib/api-limit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const instructionMessage: ChatCompletionMessageParam = {
  role: "system",
  content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations every response."
}

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
      return new NextResponse("Free trial has expired.", { status: 403 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [instructionMessage, ...messages],
    })

    await increaseApiLimit()

    return Response.json(response.choices[0].message, { status: 200 })
  } catch (error) {
    console.log("[CODE_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}