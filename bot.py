import asyncio
import os

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
SITE_URL = os.environ.get("SITE_URL", "https://arturklimcue-svg.github.io/Wishlist1/")

if not BOT_TOKEN:
    raise SystemExit(
        "Не задан BOT_TOKEN. На Bothost он подставляется автоматически из поля "
        "'Bot Token'. Локально: BOT_TOKEN=<токен> python bot.py"
    )

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="\U0001F381 Открыть вишлист",
                    web_app=WebAppInfo(url=SITE_URL),
                )
            ],
            [
                InlineKeyboardButton(
                    text="\U0001F517 Открыть в браузере",
                    url=SITE_URL,
                )
            ],
        ]
    )
    await message.answer(
        "Привет! \U0001F381\n\n"
        "Это общий вишлист Софьи и Артура.\n"
        "Экран поделён на две половины — каждый добавляет подарки "
        "в свою часть. Нажмите кнопку ниже, чтобы открыть вишлист.",
        reply_markup=keyboard,
    )


async def main() -> None:
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
