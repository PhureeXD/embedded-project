"use server"
import {
  Client,
  GatewayIntentBits,
  TextChannel,
  EmbedBuilder,
  Events,
} from "discord.js"

let discordClient: Client | null = null

export async function startDiscordBot(ledStatus: boolean) {
  if (!discordClient) {
    discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    })

    await discordClient.login(process.env.DISCORD_BOT_TOKEN)
  }

  discordClient.once(Events.ClientReady, async () => {
    const channel = discordClient!.channels.cache.get(
      process.env.NEXT_PUBLIC_DISCORD_CHANNEL_ID!,
    )

    if (channel instanceof TextChannel) {
      const embed = new EmbedBuilder()
        .setColor(ledStatus ? 0x00ff00 : 0xff0000)
        .setTitle("LED Status Update")
        .setDescription(`The LED status has been updated.`)
        .addFields({
          name: "New Status",
          value: ledStatus ? "✅ On" : "❌ Off",
        })
        .setTimestamp()

      await channel.send({ embeds: [embed] })
    }
  })
}
