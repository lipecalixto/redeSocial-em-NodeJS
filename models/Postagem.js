const bd=require('./Banco')

const Postagem=bd.sequelize.define('postagens',{
    id_membro:{
        type:bd.Sequelize.INTEGER
    },
    tipo_membro:{
        type:bd.Sequelize.STRING
    },
    conteudo:{
        type:bd.Sequelize.STRING
    },
    curtidas:{
        type:bd.Sequelize.INTEGER,
        defaultValue: 0
    }  
})

//Postagem.sync({force:true})   


module.exports=Postagem