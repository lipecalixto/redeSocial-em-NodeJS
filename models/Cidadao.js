const bd=require('./Banco')



const Cidadao=bd.sequelize.define('cidadaos',{
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
    tipo_doc:{
        type:bd.Sequelize.STRING 
    },
    numero_doc:{
        type:bd.Sequelize.STRING
    },
    escolaridade:{
        type:bd.Sequelize.STRING
    },
    temas_interesse:{
        type:bd.Sequelize.STRING
    }
})



//Cidadao.sync({force:true})   



module.exports=Cidadao