import { Client, GatewayIntentBits, Message, TextChannel } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const projectChannels: Record<string, Record<string, string>> = {
  figma: {
    likeawe: "1275456434813014026",
    autority: "1275456397823184948",
    iablog: "1275456549929881680",
    baterias: "1275456418362691676",
  },
  doc: {
    likeawe: "1275450554151206972",
    autority: "1275451600454025216",
    iablog: "1275456314151141398",
    baterias: "1275451417892487251",
  },
  sites: {
    likeawe: "1275450554151206972",
    autority: "1275451600454025216",
    iablog: "1275456314151141398",
    baterias: "1275451417892487251",
  },
};

const channelsIdsNotifications: Record<"figma" | "doc" | "sites", string> = {
  figma: "1275492378098139190",
  doc: "1275455298899021846",
  sites: "1275455272474902528",
};

client.once("ready", () => {
  console.log("Bot está online!");
});

// Função para enviar mensagens temporárias
const sendTemporaryMessage = (channel: TextChannel, content: string, duration: number = 3000) => {
  channel
    .send(content)
    .then((msg) => {
      setTimeout(() => msg.delete(), duration);
    })
    .catch(console.error);
};

client.on("messageCreate", (message: Message) => {
  const content = message.content.toLowerCase();

  if (content.startsWith("!figma") || content.startsWith("!doc") || content.startsWith("!sites")) {
    const command = content.split(" ")[0].substring(1) as "figma" | "doc" | "sites";
    const args = message.content.split(" ");
    const projectName = args[1];
    const link = args[2];
    const mensagem = args.slice(3).join(" ");

    const channelNotificationsId = channelsIdsNotifications[command];
    const channelNotifications = client.channels.cache.get(channelNotificationsId) as TextChannel;

    if (!channelNotifications) {
      console.error(`Canal de notificação para ${command} não encontrado.`);
      return;
    }

    if (!projectName || !link) {
      sendTemporaryMessage(
        channelNotifications,
        `Formato correto: \`!${command} <!projeto> <!link> <mensagem{optional}>\``,
      );
      return;
    }

    const targetChannelId = projectChannels[command]?.[projectName.toLowerCase()];

    if (!targetChannelId) {
      sendTemporaryMessage(message.channel as TextChannel, "Projeto não encontrado.");
      return;
    }

    const targetChannel = client.channels.cache.get(targetChannelId) as TextChannel;

    if (targetChannel) {
      targetChannel.send(`${mensagem || projectName}: ${link}`);

      if (message.channel.id !== channelNotificationsId) {
        message.delete().catch(console.error);

        const notificationMessage = `${mensagem || projectName}: **${projectName}**.`;
        channelNotifications.send(notificationMessage);
      }
    } else {
      sendTemporaryMessage(message.channel as TextChannel, "Canal não encontrado.");
    }
  }
});

client.login(process.env.BOT_TOKEN);
