const bd=require('./Banco')



const Curtida=bd.sequelize.define('curtidas',{
    PostagemId:{
        type:bd.Sequelize.INTEGER,
        allowNull:false
    },
    cidadaoId:{
        type:bd.Sequelize.INTEGER
    },
    pesquisadorId:{
        type:bd.Sequelize.INTEGER
    },
    tipoMembro:{
        type:bd.Sequelize.DataTypes.STRING,
        allowNull:false
    }
})



//Curtida.sync({force:true})   



module.exports=Curtida