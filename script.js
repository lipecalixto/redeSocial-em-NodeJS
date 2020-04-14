function exibirCadastro(campo){
    document.getElementById(campo).style.display='inline';
}

function verificaIdade(ano_nasc){
  var dt=new Date()
  var idade= (dt.getFullYear())-ano_nasc
  return idade
}

const express=require('express')
const app=express()
const handlebars = require("express-handlebars")
const bodyParser = require('body-parser')
const Cidadao=require("./models/Cidadao")
const Pesquisador=require("./models/Pesquisador")
const banco=require('./models/Banco')
const path=require("path")
const Op =banco.Sequelize.Op;

var user_pesquisador={
    id:null,
    nome: null,
    email: null,
    senha: null,
    datanasc: null,
    data_inicio_cd:null,
    cidade: null,
    uf:null,
    instituicao_pesquisa:null,
    nivel_formacao:null,
    instituicao_formacao:null,
    link_cv:null,
    topicos_interesse:null
}

var user_cidadao={
    id:null,
    nome: null,
    email: null,
    senha: null,
    datanasc: null,
    tipo_doc:null,
    numero_doc:null,
    escolaridade:null,
    temas_interesse:null
}
var eh_pesquisador=null

var dados_comuns={
  nome: null,
  email: null,
  senha: null,
  datanasc: null
}

//app.use(express.static(__dirname))

app.engine('handlebars',handlebars({defaultLayout:'main'}))
app.set('view engine','handlebars')

app.use(express.static(path.join(__dirname,"public")))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())



app.get('/',function(req,res){
    res.render('cadastro')
})

app.get('/cad_pesq',function(req,res){
  res.render('cadastro_pesq')
})

app.get('/cad_cid',function(req,res){
  res.render('cadastro_cid')
})


app.get('/feed/:tipo/:id', async function(req,res){ 

  if(req.params.tipo=='cidadao'){
    Cidadao.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
      Pesquisador.findAll().then(function(lista_pesquisadores){
        Cidadao.findAll({where:{id:{[Op.not]:req.params.id}}}).then(function(lista_cidadaos){
          res.render('pagina_inicial',{lista_cidadaos:lista_cidadaos,lista_pesquisadores:lista_pesquisadores,
            dados_perfil:dados_perfil,eh_pesquisador:eh_pesquisador})
        })
      })
      
  })
  }else if(req.params.tipo=='pesquisador'){
    Pesquisador.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
      Pesquisador.findAll({where:{id:{[Op.not]:req.params.id}}}).then(function(lista_pesquisadores){
        Cidadao.findAll().then(function(lista_cidadaos){
          res.render('pagina_inicial',{lista_cidadaos:lista_cidadaos,lista_pesquisadores:lista_pesquisadores,
            dados_perfil:dados_perfil,eh_pesquisador:eh_pesquisador})
        })
      })
      
  })
 
  }  
})

app.get('amigo/:id', function(req,res){
  Pesquisador.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
    
  })
})

app.get('/atualiza_cid',async function(req,res){
  Cidadao.findOne({ where: { id:user_cidadao.id } }).then(function(cidadao){
    res.render('atualiza_cid',{cidadao:cidadao})

  })
})

app.get('/atualiza_pesq', async function(req,res){
  Pesquisador.findOne({ where: { id:user_pesquisador.id } }).then(function(pesquisador){
    res.render('atualiza_pesq',{pesquisador:pesquisador})  
  })
    
})


app.post('/cadastro_geral',async (req,res) =>{
    var erros=[]

    var dataNascimento=req.body.data_nasc
    dataNascimento=dataNascimento.split("-")
    var idade=verificaIdade(Number(dataNascimento[0]))
    
    
    var ehmembro1= await Cidadao.findOne({ where: { email:req.body.email } })
    var ehmembro2= await Pesquisador.findOne({ where: { email:req.body.email } })
    
    if(req.body.nome.length<3){
      erros.push({texto:"* Nome digitado inválido, possui menos do que 3 caracteres."})

    }
    if(idade<18){
      erros.push({texto:"* É permitido o cadastro apenas de membros maiores de 18 anos."})
    }

    if(req.body.senha.length<8 || req.body.csenha.length<8){
      erros.push({texto:"* A senha deve conter no mínimo 8 caracteres"})
    }

    if(req.body.senha!=req.body.csenha){
      erros.push({texto:"* Os campos Senha e Confirmar Senha deve ser iguais "})
    }


    if(req.body.data_nasc==null){
      erros.push({texto:" * Informe sua data de nascimento "})
    }

    if(req.body.email==null || req.body.email=="" || req.body.email==" "){
      erros.push({texto:"* Informe um e-mail válido."})
    }
    
    if(ehmembro1!=null){
      erros.push({texto:`* O e-mail ${req.body.email} já consta cadastrado em nossa base de dados como cidadão.`})
      
    }
    if(ehmembro2!=null){
      erros.push({texto:`* O e-mail ${req.body.email} já consta cadastrado em nossa base de dados como pesquisador.`})
      
    }
    
    if(erros.length>0){
      res.render('cadastro',({erros:erros}))
      console.log('erros encontrado!')
    }else{
      
      dados_comuns={
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        datanasc:req.body.data_nasc
      }
     
        if(req.body.tipouser=='pesquisador'){
          res.redirect("/cad_pesq")
    
        }else{
          res.redirect("/cad_cid")
        }

      }
    }
    

)



app.post('/autenticacao', async (req,res)=>{
  var erros_login=[]
  const usuario1= await Cidadao.findOne({ where: { email:req.body.login } })
  const usuario2= await Pesquisador.findOne({ where: { email:req.body.login } })
  
  if(req.body.login==null || req.body.login=="" || req.body.login==" "){
    erros_login.push({texto:'Digite um e-mail já cadastrado na EderOne.'})
  }
  if(usuario1==null && usuario2==null){
    erros_login.push({texto:'E-mail não está cadastrado na EderOne.'})
  }
 
  if(usuario1!=null && req.body.senha!=usuario1.senha){
    erros_login.push({texto:'Senha incorreta'})
  }
  if(usuario2!=null && req.body.senha!=usuario2.senha){
    erros_login.push({texto:'Senha incorreta'})
  }
  if(erros_login.length>0){
    res.render('cadastro',({erros_login:erros_login}))
    console.log('Erro logiin!')
  }else{
    
    if(usuario1!=null){  //usuario1 == Cidadao
      eh_pesquisador=false
      user_cidadao=usuario1
      res.redirect(`/feed/cidadao/${user_cidadao.id}`)
    }else{              //usuario2 == Pesquisador
      eh_pesquisador=true
      user_pesquisador=usuario2
      res.redirect(`/feed/pesquisador/${user_pesquisador.id}`)
    }
    
  }
})

app.post('/add_cid', async (req,res) =>{
  var erros_cid= []
  
  if(req.body.numdoc==null || req.body.numdoc=="" || req.body.numdoc==" "){
    erros_cid.push({texto:`Informe o número do seu ${req.body.tipodoc}.`})
  }

  if(req.body.numdoc.length<6){
    erros_cid.push({texto:`Número do ${req.body.tipodoc} muito pequeno, digite a numeração correta.`})
  }

  if(req.body.cid_topicos==null || req.body.cid_topicos=="" || req.body.cid_topicos==" "){
    erros_cid.push({texto:'Informe ao menos um tópico de interesse.'})
  }
  if(erros_cid.length>0){
    res.render('cadastro_cid',({erros_cid:erros_cid}))
  }else{


    Cidadao.create({
      nome: dados_comuns.nome,
      email: dados_comuns.email,
      senha: dados_comuns.senha,
      datanasc: dados_comuns.datanasc,
      tipo_doc:req.body.tipodoc,
      numero_doc:req.body.numdoc,
      escolaridade:req.body.escolaridade,
      temas_interesse:req.body.cid_topicos
      
  }).then(function(){
    res.redirect("/")
      
  }).catch(function(erro){
      res.redirect("/")
  })
  }

})

app.post('/add_pesq', async (req,res) =>{
  var erros_pes= []

  var dataNascimento=dados_comuns.datanasc
  dataNascimento=dataNascimento.split("-")
  var ano_nasc=Number(dataNascimento[0])

  var valida_inicioCD=req.body.data_inicio
  valida_inicioCD=valida_inicioCD.split("-")
  var ano_inicioCD=Number(valida_inicioCD[0])
    
    
    if(ano_inicioCD<=(ano_nasc+15)){
      erros_pes.push({texto:`Atenção. Verifique a data em que você começou a trabalhar com ciência de dados.`})
      console.log(ano_inicioCD)
      console.log(ano_nasc)
    }

    if(req.body.cidade==null || req.body.cidade=="" || req.body.cidade==" "){
      erros_pes.push({texto:`Informe a cidade em que você trabalha no Estado ${req.body.estado}.`})
    }
    
    if(req.body.cidade.length<3){
      erros_pes.push({texto:`Nome da cidade em que você trabalha muito pequeno. Digite o nome correto.`})
    }

    if(req.body.instituicao==null || req.body.instituicao=="" || req.body.instituicao==" "){
      erros_pes.push({texto:'Informe o nome da instituição onde você realiza a sua pesquisa.'})
    }

    if(req.body.instituicao.length<3){
      erros_pes.push({texto:'Nome da instituição onde você realiza pesquisas muito pequeno. Digite o nome correto'})
    }

    if(req.body.local_form==null || req.body.local_form=="" || req.body.local_form==" "){
      erros_pes.push({texto:'Informe o nome da instituição onde você formou-se.'})
    }

    if(req.body.local_form.length<3){
      erros_pes.push({texto:'Nome da instituição de formação muito pequeno, verifique e digite o nome correto.'})
    }

    if(req.body.pes_topicos==null || req.body.pes_topicos=="" || req.body.pes_topicos==" "){
      erros_pes.push({texto:'Informe ao menos um tópico de interesse.'})
    }
    
    if(erros_pes.length>0){
      res.render('cadastro_pesq',({erros_pes:erros_pes}))
    }else{

      Pesquisador.create({
        nome: dados_comuns.nome,
        email: dados_comuns.email,
        senha: dados_comuns.senha,
        datanasc: dados_comuns.datanasc,
        data_inicio_cd:req.body.data_inicio,
        cidade: req.body.cidade,
        uf:req.body.estado,
        instituicao_pesquisa:req.body.instituicao,
        nivel_formacao:req.body.nivel_form,
        instituicao_formacao:req.body.local_form,
        link_cv:req.body.linkcv,
        topicos_interesse:req.body.pes_topicos
        
    }).then(function(){
        res.redirect("/")
        
    }).catch(function(erro){
        res.redirect("/")
    })
    
  }

})

app.post('/att_cid/:id',async (req,res) =>{
  var erros_cid=[]
  var dataNascimento=req.body.data_nasc
  dataNascimento=dataNascimento.split("-")
  var idade=verificaIdade(Number(dataNascimento[0]))

  const usuario1= await Cidadao.findOne({ where: { id:user_cidadao.id } })
  user_cidadao=usuario1
  
  if(req.body.senha_verificacao!=user_cidadao.senha){
    erros_cid.push({texto:'Senha de verificação incorreta.'})
    res.render('atualiza_cid',({erros_cid:erros_cid,
      nome:user_cidadao.nome,
      email:user_cidadao.email,
      senha:user_cidadao.senha,
      data_nasc:user_cidadao.datanasc,
      tipodoc:user_cidadao.tipo_doc,
      numdoc:user_cidadao.numero_doc,
      escolaridade:user_cidadao.escolaridade,
      temas_interesse:user_cidadao.temas_interesse
    }))
  }else{
  if(req.body.nome!=user_cidadao.nome && req.body.nome.length<3){
    erros_cid.push({texto:'Nome muito pequeno. Digite um nome válido.'})
  }else{
    Cidadao.update({
      nome:req.body.nome
    }, {
      where: {
        id: {
          [Op.eq]:user_cidadao.id
        }
      }
    })
  }

  if(req.body.data_nasc!=null && idade<18){
    erros_cid.push({texto:'Data de nascimento inválida. Membro deve ter idade igual ou superior a 18 anos.'})
  }else if(req.body.data_nasc!=user_cidadao.datanasc && idade>=18 && req.body.data_nasc!=null){
    Cidadao.update({
      datanasc:req.body.data_nasc
    }, {
      where: {
        id: {
          [Op.eq]:user_cidadao.id
        }
      }
    })
  }

  if(req.body.email!=user_cidadao.email){
    Cidadao.update({
      email:req.body.email
    }, {
      where: {
        id: {
          [Op.eq]:user_cidadao.id
        }
      }
    })
  }

  if(req.body.numdoc!=user_cidadao.numero_doc){
    Cidadao.update({
      numero_doc:req.body.numdoc
    }, {
      where: {
        id: {
          [Op.eq]:user_cidadao.id
        }
      }
    })
  }

  if(req.body.tipodoc!=user_cidadao.tipo_doc){
    Cidadao.update({
      tipo_doc:req.body.tipodoc
    }, {
      where: {
        id: {
          [Op.eq]:user_cidadao.id
        }
      }
    })
  }

  if(req.body.escolaridade!=user_cidadao.escolaridade){
    Cidadao.update({
      escolaridade:req.body.escolaridade
    }, {
      where: {
        id: {
          [Op.eq]:user_cidadao.id
        }
      }
    })
  }

  if(req.body.cid_topicos!=user_cidadao.temas_interesse){
    Cidadao.update({
      temas_interesse:req.body.cid_topicos
    }, {
      where: {
        id: {
          [Op.eq]:user_cidadao.id
        }
      }
    })
  }

  if(erros_cid.length>0){
 
    res.render('atualiza_cid',({erros_cid:erros_cid,
      nome:user_cidadao.nome,
      email:user_cidadao.email,
      senha:user_cidadao.senha,
      data_nasc:user_cidadao.datanasc,
      tipodoc:user_cidadao.tipo_doc,
      numdoc:user_cidadao.numero_doc,
      escolaridade:user_cidadao.escolaridade,
      temas_interesse:user_cidadao.temas_interesse
    }))
  }else{
    const usuario1= await Cidadao.findOne({ where: { id:2 } })
    user_cidadao=usuario1
    
    msg='Dados atualizados com sucesso!'
    res.render('atualiza_cid',({msg,
      nome:user_cidadao.nome,
      email:user_cidadao.email,
      senha:user_cidadao.senha,
      data_nasc:user_cidadao.datanasc,
      tipodoc:user_cidadao.tipo_doc,
      numdoc:user_cidadao.numero_doc,
      escolaridade:user_cidadao.escolaridade,
      temas_interesse:user_cidadao.temas_interesse
    }))
  }
}
})

app.post('/att_pesq', async (req,res) =>{
  var erros_pes= []
  var dataNascimento=req.body.data_nasc
  dataNascimento=dataNascimento.split("-")
  var idade=verificaIdade(Number(dataNascimento[0]))
  
  

  if(req.body.senha_verificacao!=user_pesquisador.senha){
    erros_pes.push({texto:'Senha de verificação incorreta.'})
    
    res.render('atualiza_pesq',({erros_pes:erros_pes,
      nome:user_pesquisador.nome,
      email:user_pesquisador.email,
      senha:user_pesquisador.senha,
      data_nasc:user_pesquisador.datanasc,
      data_inicio_cd:user_pesquisador.data_inicio_cd,
      cidade:user_pesquisador.cidade,
      uf:user_pesquisador.uf,
      instituicao_pesquisa:user_pesquisador.instituicao_pesquisa,
      nivel_formacao:user_pesquisador.nivel_formacao,
      instituicao_formacao:user_pesquisador.instituicao_formacao,
      link_cv:user_pesquisador.link_cv,
      topicos_interesse:user_pesquisador.topicos_interesse}))
  }
  else{
  if(req.body.nome!=user_pesquisador.nome && req.body.nome.length<3){

    erros_pes.push({texto:'Nome muito pequeno. Digite um nome válido.'})
  }else{
    Pesquisador.update({
      nome:req.body.nome
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })    
  }

  if(req.body.data_nasc!=null && idade<18){
    erros_pes.push({texto:'Data de nascimento inválida. Membro deve ter idade igual ou superior a 18 anos.'})
  }else if(req.body.data_nasc!=user_pesquisador.data_nasc && idade>=18 && req.body.data_nasc!=null){
    Pesquisador.update({
      datanasc:req.body.data_nasc
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })
    
  }

  if(req.body.data_inicio!=null){
    Pesquisador.update({
      data_inicio_cd:req.body.data_inicio
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })

  }

  if(req.body.email!=user_pesquisador.email){
    Pesquisador.update({
      email:req.body.email
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })

  }

  if(req.body.estado!=user_pesquisador.uf){
    Pesquisador.update({
      uf:req.body.estado
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })
    
  }

  if(req.body.cidade!=user_pesquisador.uf && req.body.cidade.length<3){
    erros_pes.push({texto:'Nome da cidade muito pequeno. Digite uma cidade válida.'})
  }else{
    Pesquisador.update({
      cidade:req.body.cidade
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })
  }

  if(req.body.instituicao!=user_pesquisador.instituicao_pesquisa && req.body.instituicao.length<3){
    erros_pes.push({texto:'Nome da instituição de pesquisa muito pequeno. Digite um nome válido.'})
  }else{
    Pesquisador.update({
      instituicao_pesquisa:req.body.instituicao
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })
    
  }

  if(req.body.local_form!=user_pesquisador.instituicao_formacao && req.body.local_form.length<3){
    erros_pes.push({texto:'Nome da instituição de formação muito pequeno. Digite um nome válido.'})
  }else{
    Pesquisador.update({
      instituicao_formacao:req.body.local_form
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })
   
  }

  if(req.body.linkcv!=user_pesquisador.link_cv && req.body.linkcv.length<3){
    erros_pes.push({texto:'Link do Currículos Latters incorreto.'})
  }else{
    Pesquisador.update({
      instituicao_pesquisa:req.body.instituicao
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })
   
  }

  if(req.body.pes_topicos!=user_pesquisador.topicos_interesse && req.body.pes_topicos.length<3){
    erros_pes.push({texto:'Informe um tópico correto.'})
  }else{
    Pesquisador.update({
      topicos_interesse:req.body.pes_topicos
    }, {
      where: {
        email: {
          [Op.eq]:user_pesquisador.email
        }
      }
    })
  
  }

  if(erros_pes.length>0 ){

    res.render('atualiza_pesq',({erros_pes:erros_pes,
      nome:user_pesquisador.nome,
      email:user_pesquisador.email,
      senha:user_pesquisador.senha,
      data_nasc:user_pesquisador.datanasc,
      data_inicio_cd:user_pesquisador.data_inicio_cd,
      cidade:user_pesquisador.cidade,
      uf:user_pesquisador.uf,
      instituicao_pesquisa:user_pesquisador.instituicao_pesquisa,
      nivel_formacao:user_pesquisador.nivel_formacao,
      instituicao_formacao:user_pesquisador.instituicao_formacao,
      link_cv:user_pesquisador.link_cv,
      topicos_interesse:user_pesquisador.topicos_interesse}))
  
  }else{
    
    msg_sucess='Dados salvos com sucesso!'

    res.render('atualiza_pesq',({msg_sucess,
      nome:user_pesquisador.nome,
      email:user_pesquisador.email,
      senha:user_pesquisador.senha,
      data_nasc:user_pesquisador.datanasc,
      data_inicio_cd:user_pesquisador.data_inicio_cd,
      cidade:user_pesquisador.cidade,
      uf:user_pesquisador.uf,
      instituicao_pesquisa:user_pesquisador.instituicao_pesquisa,
      nivel_formacao:user_pesquisador.nivel_formacao,
      instituicao_formacao:user_pesquisador.instituicao_formacao,
      link_cv:user_pesquisador.link_cv,
      topicos_interesse:user_pesquisador.topicos_interesse
    }))
      
   
  } 

}


})



/*
app.listen(8081,function(){
    console.log('Servidor rodando...')
})

*/
const PORTA=process.env.PORT || 8089
app.listen(8081,function(){
  console.log('Servidor rodando...')
})




