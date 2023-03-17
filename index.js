const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const https = require('https');
const dotenv = require('dotenv').config();


async function getInfo(pais) {
    return new Promise((resolve, reject) => {
        https.get('https://restcountries.com/v2/name/' + pais, (res) => {
            let result = '';
            res.on('data', (chunk) => {
                result += chunk;
            });
            res.on('end', () => {
                result = JSON.parse(result);
                try {
                    resolve({
                        'pais': result[0].name,
                        'capital': result[0].capital,
                        "idioma": result[0].languages[0].name,
                        "moeada": result[0].currencies[0].name,
                        "bandeira": result[0].flags.png,
                        "DDI": result[0].callingCodes[0],
                        "dominio": result[0].topLevelDomain[0]
                    });
                } catch (err) {
                    resolve("País não encontrado!");
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.on('ready', () => {
    console.log('GEO bot is online!');
});

client.on('messageCreate', (message) => {
    if (message.content === 'GEO help') {
        const embed = new EmbedBuilder()
            .setColor('#808080')
            .setTitle('GEO Help')
            .addFields(
                { name: 'Capital', value: 'GEO infos <pais em ingles>' }
            )
            .setFooter({ text: 'Aproveite!' });

        message.channel.send({ embeds: [embed] });
    }
})

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('GEO infos')) {
        const pais = message.content.slice(10);
        const infos = await getInfo(pais);
        const embed = new EmbedBuilder()

        if (infos != "País não encontrado!") {
            embed
                .setColor('#808080')
                .setTitle(infos.pais)
                .setImage(infos.bandeira)

            Object.keys(infos).forEach((item) => {
                embed.addFields({
                    name: item, value: infos[item]
                })
            });
        } else {
            embed
                .setColor('#808080')
                .setTitle("País não encontrado");
        }
        message.channel.send({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_BOT_KEY);