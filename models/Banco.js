const Sequelize=require('sequelize')
//teste
const sequelize=new Sequelize('sistemadecadastro','root','1234',{
    host:"localhost",
    dialect:"mysql"
})

module.exports= {
    Sequelize: Sequelize,
    sequelize: sequelize
}
