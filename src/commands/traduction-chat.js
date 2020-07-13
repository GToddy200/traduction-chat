const discord = require('discord.js')

const db = require('quick.db')//puxando a database

module.exports.run = async(client, message, args) => {
  
  //verificando se tem permissão!
  if(!message.guild.me.hasPermission('MANAGE_CHANNELS')) return message.reply('Não tenho permissão!')
  
  //pegando o usuário
  let other_user = message.mentions.members.first()
  
  //verificando se mencionou o usuário
  if(!other_user) return message.reply('Você não mencionou um usuário!')
  
  //agora vamos criar o canal/chat
  message.guild.channels.create(`t-${message.author.id}-${other_user.user.id}`, {
    //Aqui você pode configurar como quiser, menos as permissões.
    permissionOverwrites: [
      {
        id: message.guild.id, //everyone
        deny: ["VIEW_CHANNEL", "SEND_MESSAGES"] //permissões bloqueadas
      },
      {
        id: message.author.id, //Quem executou o comando
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] //permissões concedidas
      },
      {
        id: other_user.user.id, //Quem foi mencionado
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] //permissões concedidas
      }
    ]
  }).then(async c => {
    
    message.channel.send('Canal criado com sucesso!')//avisar que o canal foi criado
    
    let web1 = await c.createWebhook(message.author.username, { avatar: message.author.avatarURL()})//criar um webhook igual a quem executou
    let web2 = await c.createWebhook(other_user.user.username, { avatar: other_user.user.avatarURL()})//criar um webhook igual a quem foi mencionado
    
    db.set(`traduction_system_channels_${c.id}`, {user1: message.author.id, user2: other_user.user.id})//Salvar quem são os participantes do canal
    db.set(`traduction_system_channels_${c.id}_web${message.author.id}`, {id: web1.id, token: web1.token})//Salvar o 1º webhook criado!
    db.set(`traduction_system_channels_${c.id}_web${other_user.user.id}`, {id: web2.id, token: web2.token})//Salvar o 2º webhook criado!
    
    message.channel.send(`${message.author} Qual seu idioma?`).then(async m => {
      
      let coletor = await message.channel.createMessageCollector(m => m.author.id === message.author.id, {max:1})
      
      coletor.on('collect', async coletado => {
        
        if(coletado.content.toLowerCase() === "português") {
        
        db.set(`users_${message.author.id}`, {idioma: 'PT'})
          
        } else if(coletado.content.toLowerCase() === "inglês") {
          
          db.set(`users_${message.author.id}`, {idioma: 'EN'})
          
        } else if(coletado.content.toLowerCase() !== "inglês" || (coletado.content.toLowerCase() !== "português")) return;
        
      })
      
    })
    
    message.channel.send(`${other_user} Qual seu idioma?`).then(async m => {
      
      let coletor = await message.channel.createMessageCollector(m => m.author.id === other_user.user.id, {max:1})
      
      coletor.on('collect', async coletado => {
        
        if(coletado.content.toLowerCase() === "português") {
        
        db.set(`users_${other_user.user.id}`, {idioma: 'PT'})
          
        } else if(coletado.content.toLowerCase() === "inglês") {
          
          db.set(`users_${other_user.user.id}`, {idioma: 'EN'})
          
        } else if(coletado.content.toLowerCase() !== "inglês" || (coletado.content.toLowerCase() !== "português")) return;
        
      })
      
    })
    
    //agora sim! Lembrando que se você tiver algo que configure isso, não precisa colocar isso
    
  })
  
}