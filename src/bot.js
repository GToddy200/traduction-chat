const Discord = require('discord.js')

const db = require('quick.db')//puxando a db!

const translator = require('@vitalets/google-translate-api')

//esta é uma handler simples, se quiser saber como fazer, vou deixar o link na descrição!

const client = new Discord.Client()
client.prefix = "!"

client.on('ready', () => {
  console.log('Bot iniciado com sucesso!')
  
  client.user.setActivity('v0', { type: "LISTENING" })
  
})

client.on('message', async message => {
  if (message.channel.type === "dm" || message.author.bot) return  
  
  //vamos fazer aqui!
  
  let traduction_channel = db.get(`traduction_system_channels_${message.channel.id}`)
  
  if(traduction_channel) {
    
    if(message.author.id === traduction_channel.user1) {
      
      let web1 = db.get(`traduction_system_channels_${message.channel.id}_web${message.author.id}`)
      
      const webhook = new Discord.WebhookClient(web1.id, web1.token)
      
      let user_language = db.get(`users_${traduction_channel.user2}`)
      
      let other_user_language;
      
      if(user_language.idioma === "PT") other_user_language = "Portuguese"
      if(user_language.idioma === "EN") other_user_language = "English"
      
      let user_languagee;
      
      let user = db.get(`users_${message.author.id}`)

      if(user.idioma === "PT") user_languagee = "Portuguese"
      if(user.idioma === "EN") user_languagee = "English"
      
      console.log('[user1]', user_languagee, other_user_language)
      
      let traducted_text = await translator(message.content, { from: user_languagee, to: other_user_language })
      
      if(!message.attachments.first() && !message.mentions.users.first()) {
      
      webhook.send(traducted_text.text)
      
      }  
        
      message.delete()
      
    }
    
    if(message.author.id === traduction_channel.user2) {
      
      let web2 = db.get(`traduction_system_channels_${message.channel.id}_web${message.author.id}`)
      
      const webhook = new Discord.WebhookClient(web2.id, web2.token)
      
      let user_language = db.get(`users_${traduction_channel.user1}`)
      
      let other_user_language;
      
      if(user_language.idioma === "PT") other_user_language = "Portuguese"
      if(user_language.idioma === "EN") other_user_language = "English"
      
      let user_languagee;

      let user = db.get(`users_${message.author.id}`)
      
      if(user.idioma === "PT") user_languagee = "Portuguese"
      if(user.idioma === "EN") user_languagee = "English"
      
      console.log('[user2]', user_languagee, other_user_language)
      
      let traducted_text = await translator(message.content, { from: user_languagee, to: other_user_language })
      
      if(!message.attachments.first() && !message.mentions.users.first()) {
      
      webhook.send(traducted_text.text)
      
      }
      
      message.delete()
      
    }
    
  }
  
  const msg = message.content.toLowerCase()
  
  if (msg.indexOf('!') !== 0) return

  //if (!staff.is(message.member) && message.channel.id !== ids.channels.commands) return message.reply('Use os comandos no canal <#' + ids.channels.commands + '>')

  
  
  const args = message.content.slice('!'.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  

  const commandFile = require('./commands/' + command + '.js')
  
  try {    
    commandFile.run(client, message, args)
  } catch (e) {
    
    if(!commandFile) {
    
    let err_no_comand_pt = new Discord.MessageEmbed()
    .setTitle('**Erro**')
    .setDescription(`Este comando não foi encontrado ou não existe`) 
    .setColor('RED')
    .setFooter('@Inspiron')
    
    let err_no_comand_us = new Discord.MessageEmbed()
    .setTitle('**Error**')
    .setDescription(`This command not found or not exists`)
    .setColor('RED')
    .setFooter('@Inspiron')
    
    message.reply(err_no_comand_us)
    
  }
    
  }
})

client.login(process.env.TOKEN)