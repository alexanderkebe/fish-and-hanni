import { NextResponse } from 'next/server';

type TelegramApiResult<T = unknown> = {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
};

/** Trim env values; strip accidental wrapping quotes; coerce numeric ids to number for the Bot API. */
function parseDestinationChatId(raw: string | undefined): string | number | null {
  if (raw == null) return null;
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (!s) return null;
  if (/^-?\d+$/.test(s)) {
    return Number(s);
  }
  return s.startsWith('@') ? s : s.includes(' ') ? s : `@${s}`;
}

function parseOptionalThreadId(raw: string | undefined): number | undefined {
  if (raw == null || !raw.trim()) return undefined;
  const n = Number(raw.trim());
  return Number.isFinite(n) ? n : undefined;
}

async function telegramCall<T = unknown>(
  botToken: string,
  method: string,
  body: Record<string, unknown>
): Promise<TelegramApiResult<T>> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as TelegramApiResult<T>;
  if (!data.ok) {
    console.error(
      `[telegram] ${method} failed:`,
      data.error_code,
      data.description || res.statusText
    );
  }
  return data;
}

export async function GET() {
  const hasToken = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const rawChannel = process.env.TELEGRAM_DESTINATION_CHANNEL;
  const parsed = parseDestinationChatId(rawChannel);
  return NextResponse.json({
    webhook: 'POST /api/telegram',
    env: {
      TELEGRAM_BOT_TOKEN_set: hasToken,
      TELEGRAM_DESTINATION_CHANNEL_set: Boolean(rawChannel?.trim()),
      TELEGRAM_DESTINATION_CHANNEL_parsed: parsed !== null,
    },
    checklist: [
      'Webhook must point to this URL: POST https://<your-domain>/api/telegram (setWebhook on the same bot as TELEGRAM_BOT_TOKEN).',
      'Add the bot as a channel administrator with "Post messages" (and media) permission.',
      'For private channels use numeric id like -1001234567890 (not the t.me/c/123/45 short form).',
      'If the channel uses Topics (forum), set TELEGRAM_DESTINATION_MESSAGE_THREAD_ID to the topic id.',
    ],
  });
}

export async function POST(req: Request) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const destinationRaw = process.env.TELEGRAM_DESTINATION_CHANNEL;
  const DESTINATION_CHANNEL = parseDestinationChatId(destinationRaw);
  const MESSAGE_THREAD_ID = parseOptionalThreadId(
    process.env.TELEGRAM_DESTINATION_MESSAGE_THREAD_ID
  );

  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing');
    return NextResponse.json({ error: 'Missing bot token' }, { status: 500 });
  }

  try {
    const update = await req.json();

    if (update.message && update.message.chat) {
      const chatId = update.message.chat.id;
      const messageId = update.message.message_id;
      const text = update.message.text ?? '';
      const caption = update.message.caption ?? '';
      const commandLike = typeof text === 'string' && text.startsWith('/');

      if (commandLike) {
        const welcome =
          'Send me your photos, videos, and wishes for Fish and Hanni!';
        const r = await telegramCall(BOT_TOKEN, 'sendMessage', {
          chat_id: chatId,
          text: welcome,
        });
        if (!r.ok) {
          console.error('[telegram] sendMessage (command reply) failed');
        }
        return NextResponse.json({ ok: true });
      }

      const autoReplyText =
        'thankyou for sharing this beautifull memory with us❤️';
      const reply = await telegramCall(BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        text: autoReplyText,
        reply_to_message_id: messageId,
      });
      if (!reply.ok) {
        console.error(
          '[telegram] sendMessage (auto-reply) failed — guest may not get confirmation; check bot token and that the user pressed Start.'
        );
      }

      if (DESTINATION_CHANNEL == null) {
        console.warn(
          '[telegram] TELEGRAM_DESTINATION_CHANNEL missing or empty after trim — nothing will be forwarded. Raw env present:',
          Boolean(destinationRaw?.length)
        );
      } else {
        const forwardPayload: Record<string, unknown> = {
          chat_id: DESTINATION_CHANNEL,
          from_chat_id: chatId,
          message_id: messageId,
        };
        if (MESSAGE_THREAD_ID !== undefined) {
          forwardPayload.message_thread_id = MESSAGE_THREAD_ID;
        }

        let forward = await telegramCall(BOT_TOKEN, 'forwardMessage', forwardPayload);

        if (!forward.ok) {
          const copyPayload: Record<string, unknown> = {
            chat_id: DESTINATION_CHANNEL,
            from_chat_id: chatId,
            message_id: messageId,
          };
          if (MESSAGE_THREAD_ID !== undefined) {
            copyPayload.message_thread_id = MESSAGE_THREAD_ID;
          }
          const copy = await telegramCall(BOT_TOKEN, 'copyMessage', copyPayload);
          if (!copy.ok) {
            console.error(
              '[telegram] Both forwardMessage and copyMessage failed. Typical fixes: bot admin on channel with post permission; correct numeric channel id; for forum channels set TELEGRAM_DESTINATION_MESSAGE_THREAD_ID.',
              'Message types: text=',
              Boolean(text),
              'caption=',
              Boolean(caption),
              'photo=',
              Boolean(update.message.photo?.length),
              'video=',
              Boolean(update.message.video),
              'document=',
              Boolean(update.message.document)
            );
          }
        }
      }
    } else {
      const keys = update && typeof update === 'object' ? Object.keys(update) : [];
      if (keys.length > 0) {
        console.log(
          '[telegram] update ignored (no update.message): keys=',
          keys.join(',')
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook internal error:', error);
    return NextResponse.json({ ok: true });
  }
}
