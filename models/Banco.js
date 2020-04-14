const Sequelize=require('sequelize')

const sequelize=new Sequelize('sistemadecadastro','userrede','291623',{
    host:"localhost",
    dialect:"mysql"
})

module.exports= {
    Sequelize: Sequelize,
    sequelize: sequelize
}
