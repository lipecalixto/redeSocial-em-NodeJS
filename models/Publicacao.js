const bd=require('./Banco')

const Publicacao=bd.sequelize.define('publicacoes',{
    id_pesquisador:{
        type:bd.Sequelize.INTEGER
    },
    titulo_publicacao:{
        type:bd.Sequelize.STRING
    },
    local_publicacao:{
        type:bd.Sequelize.STRING
    },
    ano_publicacao:{
        type:bd.Sequelize.INTEGER
    },
    url_publicacao:{
        type:bd.Sequelize.STRING 
    },  
    tags_publicacao:{
        type:bd.Sequelize.STRING 
    },
    resumo_publicacao:{
        type:bd.Sequelize.STRING 
    },
    curtidas:{
        type:bd.Sequelize.INTEGER,
        defaultValue: 0
    }
})

//Publicacao.sync({force:true})   


module.exports=Publicacao