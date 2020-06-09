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
const Postagem=require("./models/Postagem")
const Publicacao=require("./models/Publicacao")
const Curtida=require("./models/Curtida")
const Curtida_pub=require("./models/Curtida_pub")
const Seguir=require("./models/Seguir")
const banco=require('./models/Banco')
const path=require("path")
const Op =banco.Sequelize.Op;
const moment = require('moment')



var id_usuario=-1
var tipo_usuario='####'
var editar_postagem={}
var editar_publicacao={}
var eh_pesquisador=null

var dados_comuns={
  nome: null,
  email: null,
  senha: null,
  datanasc: null
}

//app.use(express.static(__dirname))




app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: {
      formatDate: (date,time) => {
          return moment(date,time).format('DD/MM/YYYY - HH:mm')
      },
      formataAno:(data)=>{
        return moment(data).format('DD/MM/YYYY')
      }
  }
}))



app.set('view engine','handlebars')

app.use(express.static(path.join(__dirname,"public")))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())



app.get('/',function(req,res){
    res.render('inicio')
})

app.get('/cadastro',function(req,res){
  res.render('cadastro')
})

app.get('/cad_pesq',function(req,res){
  res.render('cadastro_pesq')
})

app.get('/cad_cid',function(req,res){
  res.render('cadastro_cid')
})


app.get('/:pagina/:tipo/:id/', async function(req,res){ 

  if(req.params.pagina=='pessoal'){

    if(req.params.tipo=='cidadao'){
      Cidadao.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
        var eh_pesquisador=false
        Postagem.findAll({order:[['curtidas','DESC']], where:{[Op.and]:[{id_membro:req.params.id},{tipo_membro:req.params.tipo}]}}).then(function(postagens){
          Seguir.findAll({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_tipo:'pesquisador'}]}}).then(function(seguindo_pesquisadores){
            Seguir.findAll({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_tipo:'cidadao'}]}}).then(function(seguindo_cidadaos){
              var array_cid=[]
              seguindo_cidadaos.forEach(function(c){
                array_cid.push(c.dataValues.seguido_id)
              })

              var array_pesq=[]
              seguindo_pesquisadores.forEach(function(p){
                array_pesq.push(p.dataValues.seguido_id)
              })
              
              Pesquisador.findAll({where:{id:{[Op.or]:array_pesq}}}).then(function(lista_pesquisadores){
                if(array_pesq.length<lista_pesquisadores.length){
                  lista_pesquisadores=null
                }
                Cidadao.findAll({where:{id:{[Op.or]:array_cid}}}).then(function(lista_cidadaos){
                  if(array_cid.length<lista_cidadaos.length){
                    lista_cidadaos=null
                  }
                
                  Pesquisador.findAll({where:{[Op.and]:[{topicos_interesse:dados_perfil.temas_interesse},{id:{[Op.not]:array_pesq}},{id:{[Op.not]:id_usuario}}]}}).then(function(sugestoes_pesquisadores){
                    Cidadao.findAll({where:{[Op.and]:[{temas_interesse:dados_perfil.temas_interesse},{id:{[Op.not]:array_cid}},{id:{[Op.not]:id_usuario}}]}}).then(function(sugestoes_cidadaos){
                      
                      res.render('pagina_inicial',{dados_perfil,lista_cidadaos,lista_pesquisadores,
                        eh_pesquisador,postagens,sugestoes_cidadaos,sugestoes_pesquisadores})
                    })
                  })

            
                })
              })       
            })  

          })
        })
      
    })


    }else if(req.params.tipo=='pesquisador'){
      Pesquisador.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
        var eh_pesquisador=true
        Postagem.findAll({order:[['curtidas','DESC']], where:{[Op.and]:[{id_membro:req.params.id},{tipo_membro:req.params.tipo}]}}).then(function(postagens){
          Seguir.findAll({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_tipo:'pesquisador'}]}}).then(function(seguindo_pesquisadores){
            Seguir.findAll({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_tipo:'cidadao'}]}}).then(function(seguindo_cidadaos){
              var array_cid=[]
              seguindo_cidadaos.forEach(function(c){
                array_cid.push(c.dataValues.seguido_id)
              })
              
              var array_pesq=[]
              seguindo_pesquisadores.forEach(function(p){
                array_pesq.push(p.dataValues.seguido_id)
              })
              
              Pesquisador.findAll({where:{id:{[Op.or]:array_pesq}}}).then(function(lista_pesquisadores){
                if(array_pesq.length<lista_pesquisadores.length){
                  lista_pesquisadores=null
                }
                Cidadao.findAll({where:{id:{[Op.or]:array_cid}}}).then(function(lista_cidadaos){
                  if(array_cid.length<lista_cidadaos.length){
                    lista_cidadaos=null
                  }

                  Publicacao.findAll({order:[['curtidas','DESC']],where:{id_pesquisador:req.params.id}}).then(function(publicacoes){
                      Pesquisador.findAll({where:{[Op.and]:[{topicos_interesse:dados_perfil.topicos_interesse},{id:{[Op.not]:array_pesq}},{id:{[Op.not]:id_usuario}}]}}).then(function(sugestoes_pesquisadores){
                        Cidadao.findAll({where:{[Op.and]:[{temas_interesse:dados_perfil.topicos_interesse},{id:{[Op.not]:array_cid}},{id:{[Op.not]:id_usuario}}]}}).then(function(sugestoes_cidadaos){
                         
                          res.render('pagina_inicial',{dados_perfil,lista_cidadaos,lista_pesquisadores,eh_pesquisador,
                            postagens,publicacoes,sugestoes_pesquisadores,sugestoes_cidadaos})
                            console.log(dados_perfil) 
                        })      
                      }) 

                    

                    
                  })
                })
              })       
            })  

          })
        })

        
    })
  
    }  
  }else if(req.params.pagina=='visita'){
    if(req.params.tipo=='cidadao'){
      Cidadao.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
        var eh_pesquisador=false
        Seguir.findAll({where:{[Op.and]:[{seguido_id:req.params.id},{seguido_tipo:req.params.tipo},{segue_tipo:'cidadao'}]}}).then(function(seguidores_cidadaos){
          Seguir.findAll({where:{[Op.and]:[{seguido_id:req.params.id},{seguido_tipo:req.params.tipo},{segue_tipo:'pesquisador'}]}}).then(function(seguidores_pesquisadores){
            var array_cid=[]
            seguidores_cidadaos.forEach(function(c){
              array_cid.push(c.dataValues.segue_id)
            })

            var array_pesq=[]
            seguidores_pesquisadores.forEach(function(p){
              array_pesq.push(p.dataValues.segue_id)
            })
            Postagem.findAll({order:[['curtidas','DESC']], where:{[Op.and]:[{id_membro:req.params.id},{tipo_membro:req.params.tipo}]}}).then(function(postagens){
              Pesquisador.findAll({where:{id:{[Op.or]:array_pesq}}}).then(function(lista_pesquisadores){
                if(array_pesq.length<lista_pesquisadores.length){
                  lista_pesquisadores=null
                }

                Cidadao.findAll({where:{id:{[Op.or]:array_cid}}}).then(function(lista_cidadaos){
                  if(array_cid.length<lista_cidadaos.length){
                    lista_cidadaos=null
                  }
                  var total_seguidores=array_pesq.length+array_cid.length

                  res.render('pagina_visita',{lista_cidadaos,lista_pesquisadores,total_seguidores,
                    dados_perfil,eh_pesquisador,id_usuario,tipo_usuario,postagens})
                })
              })
            })            
          })
        }) 
    })


    }else if(req.params.tipo=='pesquisador'){
      Pesquisador.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
        var eh_pesquisador=true
        Seguir.findAll({where:{[Op.and]:[{seguido_id:req.params.id},{seguido_tipo:req.params.tipo},{segue_tipo:'cidadao'}]}}).then(function(seguidores_cidadaos){
          Seguir.findAll({where:{[Op.and]:[{seguido_id:req.params.id},{seguido_tipo:req.params.tipo},{segue_tipo:'pesquisador'}]}}).then(function(seguidores_pesquisadores){
            var array_cid=[]
            seguidores_cidadaos.forEach(function(c){
              array_cid.push(c.dataValues.segue_id)
            })

            var array_pesq=[]
            seguidores_pesquisadores.forEach(function(p){
              array_pesq.push(p.dataValues.segue_id)
            })

            Postagem.findAll({order:[['curtidas','DESC']], where:{[Op.and]:[{id_membro:req.params.id},{tipo_membro:req.params.tipo}]}}).then(function(postagens){
              Pesquisador.findAll({where:{id:{[Op.or]:array_pesq}}}).then(function(lista_pesquisadores){
                if(array_pesq.length<lista_pesquisadores.length){
                  lista_pesquisadores=null
                }
  
                Cidadao.findAll({where:{id:{[Op.or]:array_cid}}}).then(function(lista_cidadaos){
                  if(array_cid.length<lista_cidadaos.length){
                    lista_cidadaos=null
                  }
  
                  Publicacao.findAll({order:[['curtidas','DESC']],where:{id_pesquisador:req.params.id}}).then(function(publicacoes){
                    var total_seguidores=array_pesq.length+array_cid.length
                    res.render('pagina_visita',{lista_cidadaos,lista_pesquisadores,total_seguidores,
                      dados_perfil,eh_pesquisador,id_usuario,tipo_usuario,postagens,publicacoes})
                  })
                })
              })
            })  

          })  



        })

        
    })
  
    }     
  }
})



app.get('/visita/:tipo/:id/seguir', async function(req,res){
  Seguir.findOne({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_id:req.params.id},{seguido_tipo:req.params.tipo}]}}).then(function(segue){
    if(segue==null){
      Seguir.create({
        segue_id:id_usuario,
        segue_tipo:tipo_usuario,
        seguido_id:req.params.id,
        seguido_tipo:req.params.tipo
      }).then(function(){
        res.redirect(`/visita/${req.params.tipo}/${req.params.id}/`)
      })
    }else{
      Seguir.destroy({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_id:req.params.id},{seguido_tipo:req.params.tipo}]}}).then(function(){
        res.redirect(`/visita/${req.params.tipo}/${req.params.id}/`)     
      })
  
    }
  })
})

app.get('/atualiza_cid/:id',async function(req,res){
  Cidadao.findOne({ where: { id:req.params.id } }).then(function(cidadao){
    res.render('atualiza_cid',{cidadao,id_usuario,tipo_usuario})
  })

})

app.get('/atualiza_pesq/:id', async function(req,res){
  Pesquisador.findOne({ where: { id:req.params.id } }).then(function(pesquisador){
    res.render('atualiza_pesq',{pesquisador,id_usuario,tipo_usuario})  
  })
  
})


app.post('/cadastro_geral',async (req,res) =>{
    var erros=[]

    var dataNascimento=req.body.data_nasc
    dataNascimento=dataNascimento.split("-")
    var idade=verificaIdade(Number(dataNascimento[0]))
    console.log(dataNascimento)
    
    
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
      console.log(dados_comuns.datanasc)
     
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

  Cidadao.findOne({where: { email:req.body.login }}).then(function(cidadao){
    Pesquisador.findOne({where: { email:req.body.login }}).then(function(pesquisador){

      if(req.body.login==null || req.body.login=="" || req.body.login==" "){
        erros_login.push({texto:'Digite um e-mail já cadastrado na EderOne.'})
      }
      if(cidadao==null && pesquisador==null){
        erros_login.push({texto:'E-mail não está cadastrado na EderOne.'})
      }
     
      if(cidadao!=null && req.body.senha!=cidadao.senha){
        erros_login.push({texto:'Senha incorreta'})
      }
      if(pesquisador!=null && req.body.senha!=pesquisador.senha){
        erros_login.push({texto:'Senha incorreta'})
      }
      if(erros_login.length>0){
        res.render('inicio',({erros_login:erros_login}))
      
      }else{
        
        if(cidadao!=null){ 
          eh_pesquisador=false
          id_usuario=cidadao.id
          tipo_usuario='cidadao'
          res.redirect(`/pessoal/cidadao/${cidadao.id}/`)
        }else{             
          eh_pesquisador=true
          id_usuario=pesquisador.id
          tipo_usuario='pesquisador'
          res.redirect(`/pessoal/pesquisador/${pesquisador.id}/`)
        }
        
      }
    })
  })
  
})


app.post('/pessoal/:tipo/:id/add_postagem',function(req,res){
  var erros_postagem=[]
  if(req.body.texto_postagem==null || req.body.texto_postagem==" " || req.body.texto_postagem==""){
    erros_postagem.push({texto:'Postagem vazia. Digite algum texto.'})
  }
  if(erros_postagem.length>0){
    if(req.params.tipo=='pesquisador'){
      Cidadao.findAll().then(function(lista_cidadaos){
        Pesquisador.findAll().then(function(lista_pesquisadores){
          Pesquisador.findOne({ where: { id:req.params.id }}).then(function(dados_perfil){
            eh_pesquisador=true
            res.render('pagina_inicial',{erros_postagem,dados_perfil,lista_cidadaos,lista_pesquisadores,eh_pesquisador})
          })

        })
      })

    }
  }else{
    Postagem.create({
      id_membro: id_usuario,
      tipo_membro: tipo_usuario,
      conteudo:req.body.texto_postagem
  }).then(function(){
    res.redirect("./")
  })
  }
})

app.post('/pessoal/:tipo/:id/add_publicacao',function(req,res){

  var dt=new Date()
  var ano_atual= dt.getFullYear()
  var erros_publicacao=[]

  if(req.body.titulo_pub==null || req.body.titulo_pub==" " || req.body.titulo_pub==""){
    erros_publicacao.push({texto:'Insira o título do artigo.'})
  }

  if(req.body.local_pub==null || req.body.local_pub==" " || req.body.local_pub==""){
    erros_publicacao.push({texto:'Insira o local de publicação.'})
  }

  if(req.body.ano_pub>ano_atual || req.body.ano_pub<(ano_atual-100)){
    erros_publicacao.push({texto:'Informe o ano de publicação correto.'})
  }

  if(req.body.resumo_pub==null || req.body.resumo_pub==" " || req.body.resumo_pub==""){
    erros_publicacao.push({texto:'Preencha um breve resumo de sua publicação.'})
  }

  
  
  if(erros_publicacao.length>0){
    if(req.params.tipo=='pesquisador'){
      eh_pesquisador=true
      Cidadao.findAll().then(function(lista_cidadaos){
        Pesquisador.findAll().then(function(lista_pesquisadores){
          Pesquisador.findOne({ where: { id:req.params.id }}).then(function(dados_perfil){
            res.render('pagina_inicial',{erros_publicacao,dados_perfil,lista_cidadaos,lista_pesquisadores,eh_pesquisador})
          })

        })
      })

    }
  }else{
  
    Publicacao.create({
      id_pesquisador:id_usuario,
      titulo_publicacao: req.body.titulo_pub,
      local_publicacao: req.body.local_pub,
      ano_publicacao:req.body.ano_pub,
      url_publicacao:req.body.url_pub,
      tags_publicacao:req.body.tags_pub,
      resumo_publicacao:req.body.resumo_pub
  }).then(function(){
    res.redirect("./")
  })
  }
})



app.get('/deletar_postagem/:id', function(req,res){
  Postagem.destroy({where:{id:req.params.id}}).then(function(){
    res.redirect(`/pessoal/${tipo_usuario}/${id_usuario}/`)
  })
})

app.get('/deletar_publicacao/:id', function(req,res){
  Publicacao.destroy({where:{id:req.params.id}}).then(function(){
    res.redirect(`/pessoal/${tipo_usuario}/${id_usuario}/`)
  })
})


app.get('/atualiza_postagem/:id', function(req,res){
  Postagem.findOne({where:{id:req.params.id}}).then(function(postagem){
    res.render('edita_postagem',{postagem,tipo_usuario,id_usuario})  
  })
})

app.get('/atualiza_publicacao/:id', function(req,res){
  Publicacao.findOne({where:{id:req.params.id}}).then(function(publicacao){
    res.render('edita_publicacao',{publicacao,tipo_usuario,id_usuario})  
  })
})

app.post('/att_postagem/:id', function (req,res){
  var erros_postagem=[]

  if(req.body.novo_texto==null || req.body.novo_texto=="" || req.body.novo_texto==" "){
    erros_postagem.push({texto:'Atenção. Digite algum texto para editar a postagem'})
  }

  if(erros_postagem.length>0){
    Postagem.findOne({where:{id:req.params.id}}).then(function(postagem){
      res.render('edita_postagem',{postagem,erros_postagem,tipo_usuario,id_usuario})
    })
  }else{
    Postagem.update({
      conteudo:req.body.novo_texto
    }, {
      where: {
        id: {
          [Op.eq]:req.params.id
        }
      }
    }).then(function(){
      res.redirect(`/pessoal/${tipo_usuario}/${id_usuario}/`)
    })
  }
})

app.post('/att_publicacao/:id', function (req,res){
  var dt=new Date()
  var ano_atual= dt.getFullYear()
  var erros_publicacao=[]

  if(req.body.titulo_pub==null || req.body.titulo_pub==" " || req.body.titulo_pub==""){
    erros_publicacao.push({texto:'Insira o título do artigo.'})
  }

  if(req.body.local_pub==null || req.body.local_pub==" " || req.body.local_pub==""){
    erros_publicacao.push({texto:'Insira o local de publicação.'})
  }

  if(req.body.ano_pub>ano_atual || req.body.ano_pub<(ano_atual-100)){
    erros_publicacao.push({texto:'Informe o ano de publicação correto.'})
  }

  if(req.body.resumo_pub==null || req.body.resumo_pub==" " || req.body.resumo_pub==""){
    erros_publicacao.push({texto:'Preencha um breve resumo de sua publicação.'})
  }
  if(erros_publicacao.length>0){
    Publicacao.findOne({where:{id:req.params.id}}).then(function(publicacao){
      res.render('edita_publicacao',{publicacao,erros_publicacao,tipo_usuario,id_usuario})
    })
  }else{
    Publicacao.update({
      titulo_publicacao: req.body.titulo_pub,
      local_publicacao: req.body.local_pub,
      ano_publicacao:req.body.ano_pub,
      url_publicacao:req.body.url_pub,
      tags_publicacao:req.body.tags_pub,
      resumo_publicacao:req.body.resumo_pub
    }, {
      where: {
        id_pesquisador: {
          [Op.eq]:id_usuario
        }
      }
    }).then(function(){
      res.redirect(`/pessoal/${tipo_usuario}/${id_usuario}/`)
    })
  }
})


app.get('/curtir/:id',function (req,res){
  if(tipo_usuario=='cidadao'){
    Curtida.findOne({where:{[Op.and]:[{Postagemid:req.params.id},{cidadaoId:id_usuario}]}}).then(function(curtida){
      if(curtida==null){
        Curtida.create({
          PostagemId: req.params.id,
          cidadaoId: id_usuario,
          tipoMembro: tipo_usuario
      }).then(function(){
        Postagem.increment('curtidas',{where:{id:req.params.id}}).then(function(){
          Postagem.findOne({where:{id:req.params.id}}).then(function(postagem){
            res.redirect(`/visita/${postagem.tipo_membro}/${postagem.id_membro}`)
          })
          
        })
      })
      }else{
        Curtida.destroy({where:{[Op.and]:[{Postagemid:req.params.id},{cidadaoId:id_usuario}]}}).then(function(){
          Postagem.decrement('curtidas',{where:{id:req.params.id}}).then(function(){
            Postagem.findOne({where:{id:req.params.id}}).then(function(postagem){
              res.redirect(`/visita/${postagem.tipo_membro}/${postagem.id_membro}`)
            })
            
          })
        })
      }
    })
  }else if(tipo_usuario=='pesquisador'){
    Curtida.findOne({where:{[Op.and]:[{Postagemid:req.params.id},{pesquisadorId:id_usuario}]}}).then(function(curtida){
      if(curtida==null){
        Curtida.create({
          PostagemId: req.params.id,
          pesquisadorId: id_usuario,
          tipoMembro: tipo_usuario
      }).then(function(){
        Postagem.increment('curtidas',{where:{id:req.params.id}}).then(function(){
          Postagem.findOne({where:{id:req.params.id}}).then(function(postagem){
            res.redirect(`/visita/${postagem.tipo_membro}/${postagem.id_membro}`)
          })
          
        })
      })
      }else{
        Curtida.destroy({where:{[Op.and]:[{Postagemid:req.params.id},{pesquisadorId:id_usuario}]}}).then(function(){
          Postagem.decrement('curtidas',{where:{id:req.params.id}}).then(function(){
            Postagem.findOne({where:{id:req.params.id}}).then(function(postagem){
              res.redirect(`/visita/${postagem.tipo_membro}/${postagem.id_membro}`)
            })
            
          })
        })
      }
    })
  }


})

app.get('/curtir_pub/:id',function (req,res){
  if(tipo_usuario=='cidadao'){
    Curtida_pub.findOne({where:{[Op.and]:[{publicacao_id:req.params.id},{cidadaoId:id_usuario}]}}).then(function(curtida){
      if(curtida==null){
        Curtida_pub.create({
          publicacao_id: req.params.id,
          cidadaoId: id_usuario,
          tipoMembro: tipo_usuario
        }).then(function(){
          Publicacao.increment('curtidas',{where:{id:req.params.id}}).then(function(){
            Publicacao.findOne({where:{id:req.params.id}}).then(function(publicacao){
              res.redirect(`/visita/pesquisador/${publicacao.id_pesquisador}`)
            })
            
          })
        })
      }else{
        Curtida_pub.destroy({where:{[Op.and]:[{publicacao_id:req.params.id},{cidadaoId:id_usuario}]}}).then(function(){
          Publicacao.decrement('curtidas',{where:{id:req.params.id}}).then(function(){
            Publicacao.findOne({where:{id:req.params.id}}).then(function(publicacao){
              res.redirect(`/visita/pesquisador/${publicacao.id_pesquisador}`)
            })
            
          })
        })
      }
    })
  }else if(tipo_usuario=='pesquisador'){
    Curtida_pub.findOne({where:{[Op.and]:[{publicacao_id:req.params.id},{pesquisadorId:id_usuario}]}}).then(function(curtida){
      if(curtida==null){
        Curtida_pub.create({
          publicacao_id: req.params.id,
          pesquisadorId: id_usuario,
          tipoMembro: tipo_usuario
      }).then(function(){
        Publicacao.increment('curtidas',{where:{id:req.params.id}}).then(function(){
          Publicacao.findOne({where:{id:req.params.id}}).then(function(publicacao){
            res.redirect(`/visita/pesquisador/${publicacao.id_pesquisador}`)
          })
          
        })
      })
      }else{
        Curtida_pub.destroy({where:{[Op.and]:[{publicacao_id:req.params.id},{pesquisadorId:id_usuario}]}}).then(function(){
          Publicacao.decrement('curtidas',{where:{id:req.params.id}}).then(function(){
            Publicacao.findOne({where:{id:req.params.id}}).then(function(publicacao){
              res.redirect(`/visita/pesquisador/${publicacao.id_pesquisador}`)
            })
            
          })
        })
      }
    })
  }

})

app.post('/pessoal/:tipo/:id/busca_membro',async (req,res) => {

        Cidadao.findAll({where:{nome:{[Op.like]:`%${req.body.nome_pesquisado}%`}}}).then(function(cidadaos){
          Pesquisador.findAll({where:{nome:{[Op.like]:`%${req.body.nome_pesquisado}%`}}}).then(function(pesquisadores){
            if(req.params.tipo=='pesquisador'){
              Pesquisador.findOne({ where: { id:req.params.id }}).then(function(dados_perfil){
                var tipo='pesquisador'
                var encontrou_membro=false
                var eh_pesquisador=true
                if(cidadaos!=null || pesquisadores!=null){
                  encontrou_membro=true
                }

                Pesquisador.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
                  var eh_pesquisador=true
                  Postagem.findAll({order:[['id','DESC']], where:{[Op.and]:[{id_membro:req.params.id},{tipo_membro:req.params.tipo}]}}).then(function(postagens){
                    Seguir.findAll({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_tipo:'pesquisador'}]}}).then(function(seguindo_pesquisadores){
                      Seguir.findAll({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_tipo:'cidadao'}]}}).then(function(seguindo_cidadaos){
                        var array_cid=[]
                        seguindo_cidadaos.forEach(function(c){
                          array_cid.push(c.dataValues.seguido_id)
                        })

                        var array_pesq=[]
                        seguindo_pesquisadores.forEach(function(p){
                          array_pesq.push(p.dataValues.seguido_id)
                        })
                        
                        Pesquisador.findAll({where:{id:{[Op.or]:array_pesq}}}).then(function(lista_pesquisadores){
                          if(array_pesq.length<lista_pesquisadores.length){
                            lista_pesquisadores=null
                          }
                          Cidadao.findAll({where:{id:{[Op.or]:array_cid}}}).then(function(lista_cidadaos){
                            if(array_cid.length<lista_cidadaos.length){
                              lista_cidadaos=null
                            }
                            Publicacao.findAll({order:[['curtidas','DESC']],where:{id_pesquisador:req.params.id}}).then(function(publicacoes){
                              res.render('pagina_inicial',({dados_perfil,encontrou_membro,pesquisadores,cidadaos,
                                tipo_usuario,id_usuario,lista_cidadaos,lista_pesquisadores,eh_pesquisador,postagens}))
                              
                            })
                          })
                        })       
                      })  

                    })
                  })

                  
              })
      
              })
            }else{
              Cidadao.findOne({ where: { id:req.params.id } }).then(function(dados_perfil){
                var tipo='cidadao'
                var encontrou_membro=false
                var eh_pesquisador=false

                if(cidadaos!=null || pesquisadores!=null){
                  encontrou_membro=true
                }

                Cidadao.findOne({where:{'id':req.params.id}}).then(function(dados_perfil){
                  var eh_pesquisador=false
                  Postagem.findAll({order:[['id','DESC']], where:{[Op.and]:[{id_membro:req.params.id},{tipo_membro:req.params.tipo}]}}).then(function(postagens){
                    Seguir.findAll({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_tipo:'pesquisador'}]}}).then(function(seguindo_pesquisadores){
                      Seguir.findAll({where:{[Op.and]:[{segue_id:id_usuario},{segue_tipo:tipo_usuario},{seguido_tipo:'cidadao'}]}}).then(function(seguindo_cidadaos){
                        var array_cid=[]
                        seguindo_cidadaos.forEach(function(c){
                          array_cid.push(c.dataValues.seguido_id)
                        })
          
                        var array_pesq=[]
                        seguindo_pesquisadores.forEach(function(p){
                          array_pesq.push(p.dataValues.seguido_id)
                        })
                        
                        Pesquisador.findAll({where:{id:{[Op.or]:array_pesq}}}).then(function(lista_pesquisadores){
                          if(array_pesq.length<lista_pesquisadores.length){
                            lista_pesquisadores=null
                          }
                          Cidadao.findAll({where:{id:{[Op.or]:array_cid}}}).then(function(lista_cidadaos){
                            if(array_cid.length<lista_cidadaos.length){
                              lista_cidadaos=null
                            }
                            res.render('pagina_inicial',({dados_perfil,encontrou_membro,pesquisadores,cidadaos,
                              tipo_usuario,id_usuario,lista_cidadaos,lista_pesquisadores,eh_pesquisador,postagens}))
                      
                          })
                        })       
                      })  
          
                    })
                  })
                
              })

      
              })
            }
      
          })
        })
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
      
  }).then(function(novo_cidadao){
    var novaConta=true
    res.render('cadastro_cid',({novaConta,novo_cidadao}))
    console.log(novo_cidadao.datanasc)
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
        
    }).then(function(novo_pesquisador){
        var novaConta=true
        res.render('cadastro_pesq',({novaConta,novo_pesquisador}))
        console.log(novo_pesquisador.datanasc)
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
  var atualizou=false

  const cidadao= await Cidadao.findOne({ where: { id:req.params.id } })

  
  if(req.body.senha_verificacao!=cidadao.senha){
    erros_cid.push({texto:'Senha de verificação incorreta.'})
    res.render('atualiza_cid',({erros_cid,cidadao,id_usuario,tipo_usuario}))
  }else{
  if(req.body.nome!=cidadao.nome && req.body.nome.length<3){
    erros_cid.push({texto:'Nome muito pequeno. Digite um nome válido.'})
  }else{
    Cidadao.update({
      nome:req.body.nome
    }, {
      where: {
        id: {
          [Op.eq]:cidadao.id
        }
      }
    })
  }

  if(req.body.data_nasc!=null && idade<18){
    erros_cid.push({texto:'Data de nascimento inválida. Membro deve ter idade igual ou superior a 18 anos.'})
  }else if(req.body.data_nasc!=cidadao.datanasc && idade>=18 && req.body.data_nasc!=null){
    Cidadao.update({
      datanasc:req.body.data_nasc
    }, {
      where: {
        id: {
          [Op.eq]:cidadao.id
        }
      }
    })
  }

  if(req.body.email!=cidadao.email){
    Cidadao.update({
      email:req.body.email
    }, {
      where: {
        id: {
          [Op.eq]:cidadao.id
        }
      }
    })
  }

  if(req.body.numdoc!=cidadao.numero_doc && req.body.numdoc.length>=6){
    Cidadao.update({
      numero_doc:req.body.numdoc
    }, {
      where: {
        id: {
          [Op.eq]:cidadao.id
        }
      }
    })
  }

  if(req.body.numdoc.length<6){
    erros_cid.push({texto:`Número do ${req.body.tipodoc} é inválido.`})
  }


  if(req.body.tipodoc!=cidadao.tipo_doc){
    Cidadao.update({
      tipo_doc:req.body.tipodoc
    }, {
      where: {
        id: {
          [Op.eq]:cidadao.id
        }
      }
    })
  }

  if(req.body.escolaridade!=cidadao.escolaridade){
    Cidadao.update({
      escolaridade:req.body.escolaridade
    }, {
      where: {
        id: {
          [Op.eq]:cidadao.id
        }
      }
    })
  }

  if(req.body.cid_topicos!=cidadao.temas_interesse && req.body.cid_topicos.length<3){
    erros_cid.push({texto:'Informe um tópico correto.'})
  }else{
    Cidadao.update({
      temas_interesse:req.body.cid_topicos
    }, {
      where: {
        id: {
          [Op.eq]:cidadao.id
        }
      }
    })
  }

  if(erros_cid.length>0){
    Cidadao.findOne({ where: { id:req.params.id } }).then(function(cidadao1){
      res.render('atualiza_cid',({erros_cid,cidadao:cidadao1,id_usuario,tipo_usuario
      }))
    })

  }else{
    var cidadao2= await Cidadao.findOne({ where: { id:req.params.id } }).then(function(cidadao2){
      atualizou=true
      res.render('atualiza_cid',({atualizou,
        cidadao:cidadao2,id_usuario,tipo_usuario
      }))
    })
  }
}
})

app.post('/att_pesq/:id', async (req,res) =>{
  var erros_pes= []
  var dataNascimento=req.body.data_nasc
  dataNascimento=dataNascimento.split("-")
  var idade=verificaIdade(Number(dataNascimento[0]))
  var atualizou=false
  var pesquisador=await Pesquisador.findOne({where:{id:req.params.id}})
  

  if(req.body.senha_verificacao!=pesquisador.senha){
    erros_pes.push({texto:'Senha de verificação incorreta.'})
    res.render('atualiza_pesq',({erros_pes,pesquisador,id_usuario,tipo_usuario
    }))

  }else{

  if(req.body.nome!=pesquisador.nome && req.body.nome.length<3){
    erros_pes.push({texto:'Nome muito pequeno. Digite um nome válido.'})
 
  }else{
    Pesquisador.update({
      nome:req.body.nome
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })    
  }

  if(req.body.data_nasc!=null && idade<18){
    erros_pes.push({texto:'Data de nascimento inválida. Membro deve ter idade igual ou superior a 18 anos.'})
  }else if(req.body.data_nasc!=pesquisador.data_nasc && idade>=18 && req.body.data_nasc!=null){
    Pesquisador.update({
      datanasc:req.body.data_nasc
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })
    
  }

  if(req.body.data_inicio!=null){
    Pesquisador.update({
      data_inicio_cd:req.body.data_inicio
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })

  }

  if(req.body.email!=pesquisador.email){
    Pesquisador.update({
      email:req.body.email
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id        }
      }
    })

  }

  if(req.body.estado!=pesquisador.uf){
    Pesquisador.update({
      uf:req.body.estado
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })
    
  }

  if(req.body.cidade!=pesquisador.uf && req.body.cidade.length<3){
    erros_pes.push({texto:'Nome da cidade muito pequeno. Digite uma cidade válida.'})
  }else{
    Pesquisador.update({
      cidade:req.body.cidade
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })
  }

  if(req.body.instituicao!=pesquisador.instituicao_pesquisa && req.body.instituicao.length<3){
    erros_pes.push({texto:'Nome da instituição de pesquisa muito pequeno. Digite um nome válido.'})
  }else{
    Pesquisador.update({
      instituicao_pesquisa:req.body.instituicao
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })
    
  }

  if(req.body.local_form!=pesquisador.instituicao_formacao && req.body.local_form.length<3){
    erros_pes.push({texto:'Nome da instituição de formação muito pequeno. Digite um nome válido.'})
  }else{
    Pesquisador.update({
      instituicao_formacao:req.body.local_form
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })
   
  }

  if(req.body.linkcv!=pesquisador.link_cv && req.body.linkcv.length<3){
    erros_pes.push({texto:'Link do Currículos Latters incorreto.'})
  }else{
    Pesquisador.update({
      link_cv:req.body.linkcv
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })
   
  }

  if(req.body.pes_topicos!=pesquisador.topicos_interesse && req.body.pes_topicos.length<3){
    erros_pes.push({texto:'Informe um tópico correto.'})
  }else{
    Pesquisador.update({
      topicos_interesse:req.body.pes_topicos
    }, {
      where: {
        id: {
          [Op.eq]:pesquisador.id
        }
      }
    })
  
  }

  if(erros_pes.length>0 ){
    Pesquisador.findOne({where:{id:req.params.id}}).then(function(pesquisador1){
      res.render('atualiza_pesq',({erros_pes,pesquisador:pesquisador1,id_usuario,tipo_usuario}))
    })
  
  }else{
    Pesquisador.findOne({where:{id:req.params.id}}).then(function(pesquisador1){
      var atualizou=true
      res.render('atualiza_pesq',({atualizou,
        pesquisador:pesquisador1,id_usuario,tipo_usuario
      }))  
    })
  } 
}
})






//Servidor localhost
app.listen(8081,function(){
  console.log('Servidor rodando...')
})



/*
//Servidor localhost
app.listen(8081,function(){
  console.log('Servidor rodando...')
})

//Servidor online
app.listen(3000,function(){
  console.log('Servidor rodando...')
})

*/





