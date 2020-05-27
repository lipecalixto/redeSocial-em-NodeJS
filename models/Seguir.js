const bd=require('./Banco')

const Seguir=bd.sequelize.define('seguindo',{
    segue_id:{
        type:bd.Sequelize.INTEGER,
    },
    segue_tipo:{
        type:bd.Sequelize.STRING
    },
    seguido_id:{
        type:bd.Sequelize.INTEGER
    },
    seguido_tipo:{
        type:bd.Sequelize.DataTypes.STRING,
    }
})


//Seguir.sync({force:true})   



module.exports=Seguir