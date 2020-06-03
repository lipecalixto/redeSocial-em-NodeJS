const Sequelize=require('sequelize')

/*
const sequelize=new Sequelize('sistemadecadastro','root','1234',{
    host:"localhost",
    dialect:"mysql"
})

const sequelize=new Sequelize('sistemadecadastro','userrede','291623',{
    host:"localhost",
    dialect:"mysql"
})
*/

const sequelize=new Sequelize('sistemadecadastro','userrede','291623Leo',{
    host:"mysql669.umbler.com",
    dialect:"mysql"
})

module.exports= {
    Sequelize: Sequelize,
    sequelize: sequelize
}
