const bd=require('./Banco')

const Pesquisador=bd.sequelize.define('pesquisadores',{
    nome:{
        type:bd.Sequelize.STRING
    },
    email:{
        type:bd.Sequelize.STRING
    },
    senha:{
        type:bd.Sequelize.STRING
    },
    datanasc:{
        type:bd.Sequelize.DataTypes.DATE
    },
    data_inicio_cd:{
        type:bd.Sequelize.DataTypes.DATE
    },
    cidade:{
        type:bd.Sequelize.STRING
    },
    uf:{
        type:bd.Sequelize.STRING
    },
    instituicao_pesquisa:{    
        type:bd.Sequelize.STRING
    },
    nivel_formacao:{
        type:bd.Sequelize.STRING
    },
    instituicao_formacao:{
        type:bd.Sequelize.STRING
    },
    link_cv:{
        type:bd.Sequelize.STRING
    },
    topicos_interesse:{
        type:bd.Sequelize.STRING
    }  
})

Pesquisador.sync({force:true})   


module.exports=Pesquisador