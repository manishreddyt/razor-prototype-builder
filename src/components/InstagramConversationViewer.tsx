import { useState } from "react";
import { InstagramConversation, InstagramMessage } from "@/types/instagram-agent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IndianRupee, ExternalLink, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstagramConversationViewerProps {
  conversations: InstagramConversation[];
}

export function InstagramConversationViewer({ conversations }: InstagramConversationViewerProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    conversations[0]?.id || ""
  );

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Conversation List Sidebar */}
      <div className="w-80 border-r bg-secondary/20 flex flex-col">
        <div className="p-4 border-b bg-background">
          <h3 className="font-semibold">Conversations</h3>
          <p className="text-sm text-muted-foreground">
            {conversations.length} active chats
          </p>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversationId(conversation.id)}
              className={cn(
                "w-full p-4 border-b text-left hover:bg-secondary/50 transition-colors",
                selectedConversationId === conversation.id && "bg-secondary"
              )}
            >
              <div className="flex items-start gap-3">
                <img
                  src={conversation.customerAvatar}
                  alt={conversation.customerName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {conversation.customerName}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {conversation.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.customerHandle}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.lastMessagePreview}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        conversation.status === "completed"
                          ? "default"
                          : conversation.status === "active"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {conversation.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {conversation.leadSource === "dm"
                        ? "DM"
                        : conversation.leadSource === "comment"
                        ? "Comment"
                        : "Story"}
                    </Badge>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background flex items-center gap-3">
              <img
                src={selectedConversation.customerAvatar}
                alt={selectedConversation.customerName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-semibold">{selectedConversation.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.customerHandle}
                </p>
              </div>
              <Badge
                variant={
                  selectedConversation.status === "completed"
                    ? "default"
                    : selectedConversation.status === "active"
                    ? "secondary"
                    : "outline"
                }
              >
                {selectedConversation.status}
              </Badge>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-secondary/5">
              <div className="space-y-3 max-w-3xl mx-auto">
                {selectedConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t bg-secondary/20">
              <p className="text-xs text-center text-muted-foreground">
                💡 This is a demo conversation. Instagram integration coming soon.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: InstagramMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isCustomer = message.sender === "customer";

  return (
    <div className={cn("flex mb-3", isCustomer ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2",
          isCustomer
            ? "bg-secondary rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>

        {/* Payment Link Attachment */}
        {message.attachment?.type === "payment_link" && (
          <Button
            className="mt-2 w-full bg-white text-primary hover:bg-white/90"
            onClick={() =>
              window.open(message.attachment?.url, "_blank", "noopener,noreferrer")
            }
          >
            <IndianRupee className="h-3 w-3 mr-1" />
            Pay ₹{message.attachment.amount?.toLocaleString()}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}

        {/* Product Attachment */}
        {message.attachment?.type === "product" && message.attachment.product && (
          <div className="mt-2 bg-white rounded-lg p-2 text-foreground">
            <img
              src={message.attachment.product.image}
              alt={message.attachment.product.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="font-medium text-sm">{message.attachment.product.name}</p>
            <p className="text-xs text-muted-foreground mb-1">
              {message.attachment.product.description}
            </p>
            <p className="font-semibold text-sm">
              ₹{message.attachment.product.price.toLocaleString()}
            </p>
          </div>
        )}

        {/* Tracking Link Attachment */}
        {message.attachment?.type === "tracking" && (
          <Button
            variant="outline"
            className="mt-2 w-full bg-white text-primary"
            onClick={() =>
              window.open(message.attachment?.url, "_blank", "noopener,noreferrer")
            }
          >
            <Package className="h-3 w-3 mr-1" />
            Track Order
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}

        <p
          className={cn(
            "text-[10px] mt-1",
            isCustomer ? "text-muted-foreground" : "text-primary-foreground/70"
          )}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
