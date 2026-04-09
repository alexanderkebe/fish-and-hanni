import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const DESTINATION_CHANNEL = process.env.TELEGRAM_DESTINATION_CHANNEL; 

  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is missing");
    return NextResponse.json({ error: "Missing bot token" }, { status: 500 });
  }

  try {
    const update = await req.json();
    
    // Only process standard messages
    if (update.message && update.message.chat) {
      const chatId = update.message.chat.id;
      const messageId = update.message.message_id;
      const text = update.message.text || '';

      // 1. Handle commands like /start
      if (text.startsWith('/')) {
        let replyText = "Send me your photos, videos, and wishes for Fish and Hanni!";
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: replyText })
        });
        
        // Stop here so we don't forward commands to the public channel
        return NextResponse.json({ ok: true });
      }

      // 2. Auto-reply to whatever they sent
      const autoReplyText = "thankyou for sharing this beautifull memory with us❤️";
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: autoReplyText,
          reply_to_message_id: messageId // polite reply to their specific photo!
        })
      });

      // 3. Forward the message/photo/video to the public Destination Channel
      if (DESTINATION_CHANNEL) {
          const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/forwardMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: DESTINATION_CHANNEL,    
              from_chat_id: chatId,
              message_id: messageId
            })
          });
          if (!res.ok) {
            console.error("Failed to forward:", await res.json());
          }
      } else {
          console.warn("No destination channel configured to forward to.");
      }
    }
    
    // Always acknowledge Telegram so it doesn't repeatedly resend the event
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Telegram webhook internal error:", error);
    // Returning 200 OK anyway so Telegram doesn't retry indefinitely on broken payloads
    return NextResponse.json({ ok: true });
  }
}
