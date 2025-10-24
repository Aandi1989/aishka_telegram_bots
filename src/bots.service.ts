import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotsService.name);
  private bots: TelegramBot[] = [];

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const raw = this.config.get<string>('BOT_TOKENS') || '';
    const TOKENS = raw.split(',')
      .map(s => s.trim())
      .filter(Boolean);
    

    if (TOKENS.length === 0) {
      this.logger.warn('BOT_TOKENS пуст. Укажи токены в .env в одну строку через запятую.');
      return;
    }

    this.logger.log(`Запустилось ${TOKENS.length} бот(ов)…`);
    for (const token of TOKENS) {
      const bot = new TelegramBot(token, { polling: true });
      this.wire(bot);
      this.bots.push(bot);
      this.logger.log(`Запустился бот: ${token.slice(0, 6)}…`);
    }
  }

  onModuleDestroy(): void {
    for (const bot of this.bots) {
      bot.stopPolling().catch((e: unknown) => {
        this.logger.warn(`stopPolling error: ${e instanceof Error ? e.message : String(e)}`);
      });
    }
  }

  private wire(bot: TelegramBot): void {
    bot.on('message', async (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;
      const text = msg.text ?? '';
      try {
        await bot.sendMessage(chatId, `Я простой бот и я только что получил твое сообщение: "${text}"`);
      } catch (e: unknown) {
        this.logger.error(`sendMessage failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    });
  }
}
