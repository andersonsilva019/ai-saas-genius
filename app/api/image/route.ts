import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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

    const { 
      prompt, 
      amount = 1, 
      resolution = "512x512" 
    } = await req.json()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API key not set", { status: 500 })
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 })
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 })
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 })
    }

    const freeTrial = await checkApiLimit()

    if (!freeTrial) {
      return new NextResponse("Free trial has expired.", { status: 403 })
    }

    const response = await openai.images.generate({
      prompt,
      n: parseInt(amount),
      size: resolution,
    })

    await increaseApiLimit()

    const srcImages = response.data.map(image => image.url)

    return NextResponse.json(srcImages)
  } catch (error) {
    console.log("[IMAGE_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}