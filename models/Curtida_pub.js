const bd=require('./Banco')

const Curtida_pub=bd.sequelize.define('curtidas_pub',{
    publicacao_id:{
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



//Curtida_pub.sync({force:true})   



module.exports=Curtida_pub