"use server"
import {
  Client,
  GatewayIntentBits,
  TextChannel,
  EmbedBuilder,
  Events,
} from "discord.js"

let discordClient: Client | null = null

export async function startDiscordBot(
  field: string,
  value: number | string,
  date: Date,
) {
  return
  if (!discordClient) {
    discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    })

    await discordClient.login(process.env.DISCORD_BOT_TOKEN)
  }

  if (!discordClient.isReady()) {
    await new Promise<void>((resolve) => {
      discordClient!.once(Events.ClientReady, () => resolve())
    })
  }

  const channel = discordClient!.channels.cache.get(
    process.env.NEXT_PUBLIC_DISCORD_CHANNEL_ID!,
  )

  const embed = new EmbedBuilder()

  switch (field) {
    case "ledStatus":
      embed
        .setColor(value ? 0x00ff00 : 0xff0000)
        .setTitle("LED Status Update")
        .setDescription(`The LED status has been updated.`)
        .addFields({
          name: "New Status",
          value: value ? "✅ On" : "❌ Off",
        })
        .setTimestamp(date)
      break

    case "ldr":
      if (+value <= 1500 && +value > 400) return

      embed
        .setColor(+value <= 400 ? 0xff0000 : 0x00ff00)
        .setTitle("LDR Value Update")
        .setDescription(`The LDR value has been updated.`)
        .addFields({
          name: "New Value",
          value: value.toString(),
        })
        .setTimestamp(date)
      break

    case "dist":
      if (+value > 100) return

      embed
        .setColor(0x00ff00)
        .setTitle("Distance Value Update")
        .setDescription(`The distance value has been updated.`)
        .addFields({
          name: "New Value",
          value: value.toString(),
        })
        .setTimestamp(date)
      break

    case "smoke":
      if (+value < 500) return

      embed
        .setColor(0xff0000)
        .setTitle("Smoke Value Update")
        .setDescription(`The smoke value has been updated.`)
        .addFields({
          name: "New Value",
          value: value.toString(),
        })
        .setTimestamp(date)
      break

    case "payments":
      embed
        .setColor(0x00f000)
        .setTitle("Task Update")
        .setDescription(`The task value has been updated.`)
        .addFields({
          name: "New Value",
          value: value.toString(),
        })
        .setTimestamp(date)

    default:
      break
  }
  console.log(embed)
  await (channel as TextChannel).send({ embeds: [embed] })
}
