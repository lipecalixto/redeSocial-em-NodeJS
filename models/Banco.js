const Sequelize=require('sequelize')


const sequelize=new Sequelize('bdederone','root','root291623',{
    host:"database-aws.cidmehxsi5hh.us-east-1.rds.amazonaws.com",
    dialect:"mysql"
})

module.exports= {
    Sequelize: Sequelize,
    sequelize: sequelize
}
