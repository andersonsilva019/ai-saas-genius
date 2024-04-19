"use client"

import { MessageSquare } from "lucide-react";
import { Heading } from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { useChat } from 'ai/react'
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useProModal } from "@/hooks/use-pro-modal";
import { Console } from "console";


export default function ConversationPage() {

  const router = useRouter()
  const openProModal = useProModal(state => state.onOpen)

  const { 
    messages: messagesUseChat, 
    handleSubmit, 
    input, 
    handleInputChange,
    isLoading,
    error
  } = useChat({
    api: "/api/conversation",
    onError(error) {
      const errorMessage = JSON.parse(error.message)
      if (errorMessage.status === 403) {
        openProModal()
      }
    },
    onFinish() {
      router.refresh()
    },
  })

  return (
    <div>
      <Heading
        title="Conversation"
        description="Our most advanced conversation model."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
     
      <div className="px-4 lg:px-8">
        <form
          className="
            rounded-md
            border
            w-full
            p-4
            px-3
            md:px-6
            focus-within:shadow-sm
            grid
            grid-cols-12
            gap-2
          "
          onSubmit={handleSubmit}
        >

          <Input
            className="
              border-0 
              outline-none 
              focus-visible:ring-0 
              focus-visible:ring-transparent
              w-full
              col-span-10
            "
            disabled={isLoading}
            placeholder="Ask a question"
            value={input}
            onChange={handleInputChange}
          />

          <Button
            className="
              col-span-12 
              lg:col-span-2
              w-full
              "
            disabled={isLoading}
          >
            Generate
          </Button>
        </form>
      </div>
      <div className="px-4 lg:px-8 space-y-4 mt-4">
        {messagesUseChat.length === 0 && !isLoading && (
          <Empty label="No Conversation Started." />
        )}
        <div className="flex flex-col-reverse gap-y-4">
          {messagesUseChat.map((message, index) => (
            <div
              key={message.content as string}
              className={cn(
                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
              )}
            >
              {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
              <p className="text-sm">
                {message.content as string}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}