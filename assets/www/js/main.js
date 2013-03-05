       var login=null;
       var leyenda=null;
       var storage = window.localStorage;   
       var periodo_propuesta_id; 

       $( document ).bind( 'mobileinit', function(){
        $.mobile.loader.prototype.options.text = "Cargando...";
        $.mobile.loader.prototype.options.textVisible = true;
        $.mobile.loader.prototype.options.theme = "a";
        $.mobile.loader.prototype.options.html = "";

      });
          

       /*var data = [
            { label: "Series1",  data: 10},
            { label: "Series2",  data: 30},
            { label: "Series3",  data: 90},
            { label: "Series4",  data: 70},
            { label: "Series5",  data: 80},
            { label: "Series6",  data: 110}
        ]; */ 

       function iniciar_session() {
           if ($("#host").val()!=''){
            host = $("#host").val();
           }    
           var url ="http://"+host+"/iniciar.json";
                $.ajax({
                      url: url,
                      timeout: 20000,
                      data : {login: $("#username").val(), password: $("#password").val() },
                      type:'post',
                      beforeSend: function( xhr ) {
                         $.mobile.showPageLoadingMsg("b", "Cargando...", true);
                      },
                      success: function( data ) {
                        login=data;
                        if (login.status!='ERROR'){
                            $(".nombre").html(login.ciudadano.apellido + ", "+ login.ciudadano.nombre);
                            $("#info_nombre").html(login.ciudadano.nombre);
                            $("#info_apellido").html(login.ciudadano.apellido);
                            $("#info_barrio").html(login.ciudadano.barrio);
                            $("#info_municipio").html(login.ciudadano.municipio);
                            storage.setItem("username",$("#username").val());
                            storage.setItem("password",$("#password").val());
                            storage.setItem("login",JSON.stringify(login));
                            //alert(storage.getItem("login"));
                            $.mobile.changePage( "#bienvenido", { transition: "slideup"} );
                        }else{
                            alert(login.message);
                        }

                      },
                      error: function(){
                         alert(
                            'Imposible conectar con el Servidor!',  // message
                            null,         // callback
                            'Error',            // title
                            'OK'                  // buttonName
                        );
                      },

                      complete: function(){
                        $.mobile.hidePageLoadingMsg();
                      }
                    });
       }

       function alertDismissed(button) {
            if (button==1) navigator.app.exitApp();
        }
        
        function cerrar_session(button) {
            if (button==1) {
                storage.clear();
                navigator.app.exitApp();
            }
        }
        


        function salir () {
             navigator.notification.confirm(
                '¿Desea Salir?',  // message
                 alertDismissed,             // callback to invoke with index of button pressed
                'Sondeo',            // title
                'OK,Cancelar'          // buttonLabels
            );
        }

        function onEndCallKeyDown(){
            navigator.notification.confirm(
                '¿Desea Salir?',  // message
                 cerrar_session,             // callback to invoke with index of button pressed
                'Sondeo',            // title
                'OK,Cancelar'          // buttonLabels
            );
        }

        $(document).ready(function() {

            if(storage.getItem("username") != null && storage.getItem("password") != null){
                $('#username').val(storage.getItem("username"));
                $('#password').val(storage.getItem("password"));
                iniciar_session();
            }

            login=storage.getItem("login")


            $("#desconectarse").click(function(e){
                onEndCallKeyDown();
            });

            $("#salir").click(function(e){
                salir();               
            });

            $("#g_pass").click(function(e){
                e.preventDefault();
                var url ="http://"+host+"/users/cambiar_pass.json";    
                $.ajax({
                  url: url,
                  data:{'n_pass':$('#nb_password').val(),'cn_pass':$('#con_nb_password').val(),
                        'password':$("#old_password").val(),'login':storage.getItem('username'),'id':login.usuario.id},
                  timeout: 10000,
                  type:'POST',
                  beforeSend: function( xhr ) {
                     $.mobile.showPageLoadingMsg("b", "Cargando...", true);
                  },
                  success: function( data ) {
                    alert(data.message);
                    if (data.status!='ERROR'){
                        history.back();  
                    
                    }
                  },
                  error: function(){
                     navigator.notification.alert(
                        'Imposible conectar con el Servidor!',  // message
                        null,         // callback
                        'Error',            // title
                        'OK'                  // buttonName
                    );
                  },
                  complete: function(){
                    $.mobile.hidePageLoadingMsg();
                  }
                });
                               
            });

            $("#periodo_button").click(function(e){
                e.preventDefault();
                var url ="http://"+host+"/ciudadanos/periodos.json?id="+login.ciudadano.id;    
                $.ajax({
                  url: url,
                  timeout: 10000,
                  type:'get',
                  beforeSend: function( xhr ) {
                     $.mobile.showPageLoadingMsg("b", {text: 'Cargando...',textVisible: true,theme: 'z',html: ""});
                  },
                  success: function( data ) { 
                        $("#lista_periodos").html("");
                        $("#lista_periodos").append('<li data-role="list-divider" role="heading">Periodos</li>');
                        $.each(data, function(key,value){
                            $("#lista_periodos").append(
                                '<li data-theme="c">'+
                                '<a href="javascript:carga_periodo('+ value.id +','+"'"+ value.descripcion +"'"+');">'+
                                    value.descripcion +
                                '</a></li>'
                                );
                        });
                        $("#lista_periodos").listview("refresh"); 
                        $('#nueva_pro').remove();
                    },
                  error: function(){
                     navigator.notification.alert(
                        'Imposible conectar con el Servidor!',  // message
                        null,         // callback
                        'Error',            // title
                        'OK'                  // buttonName
                    );
                  },
                  complete: function(){
                    $.mobile.hidePageLoadingMsg();
                  }
                });            
            });


          $("#resultado_button").click(function(e){
                e.preventDefault();
                var url ="http://"+host+"/ciudadanos/"+login.ciudadano.id+"/elecciones_cerradas.json";    
                $.ajax({
                  url: url,
                  timeout: 10000,
                  type:'get',
                  beforeSend: function( xhr ) {
                     $.mobile.showPageLoadingMsg("b", {text: 'Cargando...',textVisible: true,theme: 'z',html: ""});
                  },
                  success: function( data ) { 
                        $("#elecciones_cerradas").html("");
                        $("#elecciones_cerradas").append('<li data-role="list-divider" role="heading">Elecciones</li>');
                        $.each(data, function(key,value){
                            var dia = value.fecha_fin.split('-')[2];
                            var mes = value.fecha_fin.split('-')[1];
                            var anio = value.fecha_fin.split('-')[0];
                            var fecha= dia + '/' + mes + '/'+ anio;
                            $("#elecciones_cerradas").append(
                                '<li data-theme="c">'+
                                '<a href="javascript:carga_resultado('+ value.id +','+"'"+ value.descripcion +"'"+');">'+
                                    value.descripcion +"  <font size='-2'> Finalizado:"+ fecha +"</font>"+
                                '</a></li>'
                                );
                        });
                        $("#elecciones_cerradas").listview("refresh"); 
                    },
                  error: function(){
                     navigator.notification.alert(
                        'Imposible conectar con el Servidor!',  // message
                        null,         // callback
                        'Error',            // title
                        'OK'                  // buttonName
                    );
                  },
                  complete: function(){
                    $.mobile.hidePageLoadingMsg();
                  }
                });            
            });
            

            $("#anteproyectos_button").click(function  () {
              $('#col_set').html("");
              var url ="http://"+host+"/ciudadanos/"+login.ciudadano.id+"/anteproyectos.json";
                  $.ajax({
                    url: url,
                    timeout: 10000,
                    type:'get',
                    beforeSend: function( xhr ) {
                       $.mobile.showPageLoadingMsg();
                    },
                    success: function( data ) {
                        if(data!=null){
                          $.each(data, function(key,value){
                            $('#col_set').append(
                              '<div data-role="collapsible" data-inset="false" data-content-theme="c">'+
                                '<h3>'+ value.nombre +'</h3>'+
                                '<p>'+value.descripcion+'</p>'+
                                '<div>'+
                                '<div class="star" id="proyecto_star_'+value.id+'" rel="'+value.id+'"></div>'+
                                '<div class="target" id="target_'+ value.id +'" style=" background-color: #F0F0F0; border-radius: 3px; float: left; height: 15px; margin-left: 5px; padding-bottom: 2px; padding-left: 8px; padding-right: 8px; text-align: center; width: 90px; float: left; "></div>'+
                                '<input id="eleccion_'+ value.id +'" type="hidden" value="'+ value.etiqueta +'" name="eleccion_'+value.id+'">'+
                                '</div>'+
                                '<br />'+
                                '<br />'+
                              '</div>');
                          });
                            $( "#proyecto" ).trigger( "create" );
                            $('.star').each(function  () {
                              $(this).raty({  
                                cancel     : true,
                                cancelHint : 'Ninguno',
                                target     : '#target_'+$(this).attr('rel'),
                                score      : $('#eleccion_' + $(this).attr('rel') ).val(),  
                                //hints : hints,
                                click   : function(score, evt) {
                                      registrar_voto(score, $(this).attr('rel'));
                                    }
                              })
                              
                            })
                      }else{
                        $('#col_set').append('<a data-role="button" data-icon="alert" data-theme="e" data-rel="back" data-transition="fade">Ningun Proyecto</a>'
                              /*'<div data-role="collapsible" data-inset="false" data-content-theme="c">'+
                                '<h3>Ningun Proyecto</h3>'+
                                '<p></p>'+
                                '</div>'*/)
                        $( "#proyecto" ).trigger( "create" );

                      } 
                    },
                    error: function(){
                       navigator.notification.alert(
                          'Imposible conectar con el Servidor!',  // message
                          null,         // callback
                          'Error',            // title
                          'OK'                  // buttonName
                      );
                    },

                    complete: function(){
                      $.mobile.hidePageLoadingMsg();
                    }
                  });
            });


             $("#anteproyectos_button2").click(function(e){
                e.preventDefault();
                $("#detalle_proyectos").html("");
                var url ="http://"+host+"/ciudadanos/"+login.ciudadano.id+"/anteproyectos.json";    
                $.ajax({
                  url: url,
                  timeout: 10000,
                  type:'get',
                  beforeSend: function( xhr ) {
                     $.mobile.showPageLoadingMsg("b", "Cargando...", true);
                  },
                  success: function( data ) {
                       
                        
                        $.each(data, function(key,value){
                              $('#detalle_proyectos').append(
                                '<div data-role="collapsible" id="proyecto_'+value.id+'" data-collapsed="">'+
                                      '<h3>'+value.nombre+'</h3>'+
                                      '<div data-role="fieldcontain">'+
                                          '<fieldset data-role="controlgroup">'+
                                              value.descripcion +
                                          '</fieldset>'+
                                      '</div>'+
                              '</div>');
                        });
                        
                        $.each(data, function(key,value){
                         $("#proyecto_"+id).collapsible(); 
                        });

                    },
                  error: function(){
                     navigator.notification.alert(
                        'Imposible conectar con el Servidor!',  // message
                        null,         // callback
                        'Error',            // title
                        'OK'                  // buttonName
                    );
                  },

                  complete: function(){
                    $.mobile.hidePageLoadingMsg();
                  }
                });            
            });


            $("#sub").click(function(e) {
                e.preventDefault();
                iniciar_session();
            });

             /*$.plot($("#default"), data, 
            {
                series: {
                    pie: { 
                        show: true,
                        radius: 1,
                        label: {
                            show: true,
                            radius: 1,
                            formatter: function(label, series){
                                return '<div style="font-size:8pt;text-align:center;padding:2px;color:black;">'+label+'<br/>'+Math.round(series.percent)+'%</div>';
                            },
                            background: { opacity: 0.8 }
                        }
                    }
                },
                legend: {
                    show: false
                }
            });*/









        $("#g_prop").click(function(e){
                e.preventDefault();
                if($('#propuesta').val().length > 0){
                  var url ="http://"+host+"/propuestas.json";    
                  $.ajax({
                    url: url,
                    data:{'propuesta':{'periodo_propuesta_id':periodo_propuesta_id,'descripcion':$('#propuesta').val(),
                          'user_id':login.usuario.id}},
                    timeout: 10000,
                    type:'POST',
                    beforeSend: function( xhr ) {
                       $.mobile.showPageLoadingMsg("b", "Cargando...", true);
                    },
                    success: function( data ) {
                      alert(data.message);
                      if (data.status!='ERROR'){


                        $("#lista_periodos").append(
                                '<li data-theme="c">'+
                                    $('#propuesta').val() +
                                '</li>'
                                );
                        $("#lista_periodos").listview("refresh").trigger('updatelayout');; 
                        $('#propuesta').val('');
                          history.back();  
                      
                      //}else{
                        //carga_periodo(periodo_propuesta_id,leyenda);
                      }

                    },
                    error: function(){
                       navigator.notification.alert(
                          'Imposible conectar con el Servidor!',  // message
                          null,         // callback
                          'Error',            // title
                          'OK'                  // buttonName
                      );
                    },

                    complete: function(){
                      $.mobile.hidePageLoadingMsg();
                    }
                  });
                } else{
                  alert('Propuesta vacia')
                }
                               
            });
        });



        function carga_periodo(id,ley){
            $("#lista_periodos").html("");
            periodo_propuesta_id=id;
            leyenda=ley;
            var url ="http://"+host+"/periodo_propuestas/propuestas.json?id="+id;    
                $.ajax({
                  url: url,
                  timeout: 10000,
                  type:'get',
                  beforeSend: function( xhr ) {
                     $.mobile.showPageLoadingMsg();
                  },
                  success: function( data ) {
                        $("#lista_periodos").append('<li data-role="list-divider" role="heading">'+ley+' </li>');
                        $.each(data, function(key,value){
                            $("#lista_periodos").append(
                                '<li data-theme="c">'+
                                    value.descripcion +
                                '</li>'
                                );
                        });
                        $("#lista_periodos").listview("refresh");
                        $("#lista_periodos").after('<a href="#nueva_propuesta" data-role="button" data-iconpos="left" data-icon="plus" id="nueva_pro">Nueva Propuesta</a>');
                        $('#nueva_pro').button();
                    },
                  error: function(){
                     navigator.notification.alert(
                        'Imposible conectar con el Servidor!',  // message
                        null,         // callback
                        'Error',            // title
                        'OK'                  // buttonName
                    );
                  },

                  complete: function(){
                    $.mobile.hidePageLoadingMsg();
                  }
                });

        }

        function carga_anteproyecto(id){
            $("#lista_anteproyectos").html("");
            periodo_propuesta_id=id;
            leyenda=ley;
            var url ="http://"+host+"/ciudadanos/propuesta.json";    
                $.ajax({
                  url: url,
                  data: {id: id},
                  timeout: 10000,
                  type:'post',
                  beforeSend: function( xhr ) {
                     $.mobile.showPageLoadingMsg("b", "Cargando...", true);
                  },
                  success: function( data ) {
                        $("#lista_periodos").append('<li data-role="list-divider" role="heading">'+ley+' </li>');
                        $.each(data, function(key,value){
                            $("#lista_periodos").append(
                                '<li data-theme="c">'+
                                    value.descripcion +
                                '</li>'
                                );
                        });
                        $("#lista_periodos").listview("refresh");
                        $("#lista_periodos").after('<a href="#nueva_propuesta" data-role="button" data-iconpos="left" data-icon="plus" id="nueva_pro">Nueva Propuesta</a>');
                        $('#nueva_pro').button();
                    },
                  error: function(){
                     navigator.notification.alert(
                        'Imposible conectar con el Servidor!',  // message
                        null,         // callback
                        'Error',            // title
                        'OK'                  // buttonName
                    );
                  },

                  complete: function(){
                    $.mobile.hidePageLoadingMsg();
                  }
                });

        }



function registrar_voto (score,proyecto_id) {
    jQuery.ajax({
       type:'post',
       data: {proyecto_id: proyecto_id, etiqueta: score},
       //url:'<%= registrar_voto_ciudadano_path(current_user.ciudadano) %>'
       url:'http://'+host+'/ciudadanos/'+login.ciudadano.id+'/registrar_voto.json'
     });
    //alert('score: ' + score + ' proyecto: ' + proyecto_id)
  }



function carga_resultado (id,descripcion) {
  $("#cab_res").after('');
  jQuery.ajax({
     type:'get',
     //url:'<%= registrar_voto_ciudadano_path(current_user.ciudadano) %>'
     url:'http://'+host+'/periodo_electorales/'+id+'/show_resultados.json',
     beforeSend: function( xhr ) {
         $.mobile.showPageLoadingMsg();
      },
      success: function( data ) {
                var salida_owa="";
                var salida_media="";
                $.each(data.media.resultados, function  (key,value) {
                  salida_owa = salida_owa + "<div class=\"ui-grid-a ui-bar-d\">"+
                    '<div class="ui-block-a" style="font-size:10px;">'+ data.wckowa.nombre_proyectos[key] +'</div>'+
                    // '<div class="ui-block-b" style="font-size:12px;">'+ 
                    // '<div class="star" id="wckowa_star_'+key+'" rel="'+Math.round(data.wckowa.resultados[key])+'"></div>'+
                    // //Math.round(data.wckowa.resultados[key]) +
                    // '</div>'+
                    '<div class="ui-block-b" style="font-size:12px;">'+ 
                    '<div class="star" id="media_star_'+key+'" rel="'+Math.round(data.wckowa.resultados[key])+'"></div>'+
                    // Math.round(value) +
                    '</div>'+
                    //'</div>'+
                    "</div>";

                    salida_media = salida_media + "<div class=\"ui-grid-a ui-bar-d\">"+
                    '<div class="ui-block-a" style="font-size:10px;">'+ data.wckowa.nombre_proyectos[key] +'</div>'+
                    // '<div class="ui-block-b" style="font-size:12px;">'+ 
                    // '<div class="star" id="wckowa_star_'+key+'" rel="'+Math.round(data.wckowa.resultados[key])+'"></div>'+
                    // //Math.round(data.wckowa.resultados[key]) +
                    // '</div>'+
                    '<div class="ui-block-b" style="font-size:12px;">'+ 
                    '<div class="star" id="media_star_'+key+'" rel="'+Math.round(value)+'"></div>'+
                    // Math.round(value) +
                    '</div>'+
                    //'</div>'+
                    "</div>";
                })
            $("#cab_res_wckowa").after(salida_owa);
            $("#cab_res_media").after(salida_media);
            $.mobile.changePage( "#resultados_page", { transition: "slideup"} );
            $("#cab_res").trigger('create');

            $('.star').each(function  () {
                $(this).raty({  
                  readOnly   : true,
                  score      : $(this).attr('rel')
                  
                })
                
              })

            },
      error: function(){
         navigator.notification.alert(
            'Imposible conectar con el Servidor!',  // message
            null,         // callback
            'Error',            // title
            'OK'                  // buttonName
        );
      },

      complete: function(){
        $.mobile.hidePageLoadingMsg();
      }
    });
   
  
}