const {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKey,
} = require('discord-interactions');

const API_ENDPOINT = process.env.API_ENDPOINT || 'https://discord.com/api/v8';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CLIENT_PUBLIC_KEY = process.env.CLIENT_PUBLIC_KEY;

async function handleCommand(data, res) {
  switch (data.name) {
    case 'dino':
      const opts = {};
      if (data.options) {
        data.options.forEach((option) => {
          opts[option.name] = option.value;
        });
      }

      const { getDino } = require('./dinos');
      const dino = await getDino(opts);
      if (!dino) {
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE,
          data: {
            content: "Sorry, I couldn't find anything for you :(",
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
        break;
      }

      const { name, pageUrl, period, eats, regions, globeUrl, imageUrl } = dino;
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: name,
              description: `[${name}](${pageUrl}) lived in the ${period} and was a ${eats}. It resided in ${regions}. [View on ancient globe](${globeUrl})`,
              color: Math.floor(Math.random() * 0xffffff),
              image: {
                url: imageUrl,
              },
            },
          ],
        },
      });
      break;
    default:
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE,
        data: {
          content: "Sorry, I don't understand this command :(",
        },
        flags: InteractionResponseFlags.EPHEMERAL,
      });
      break;
  }
}

module.exports.dinoInteraction = async (req, res) => {
  // Verify the request
  const signature = req.get('X-Signature-Ed25519');
  const timestamp = req.get('X-Signature-Timestamp');
  const isValidRequest = await verifyKey(req.rawBody, signature, timestamp, CLIENT_PUBLIC_KEY);
  if (!isValidRequest) {
    return res.status(403).end('Bad request signature');
  }

  // Handle the payload
  const interaction = req.body;
  if (interaction && interaction.type === InteractionType.COMMAND) {
    handleCommand(interaction.data, res);
  } else {
    res.send({
      type: InteractionResponseType.PONG,
    });
  }
};
