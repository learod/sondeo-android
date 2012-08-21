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
           var url ="http://"+host+"/iniciar.json";    
                $.ajax({
                      url: url,
                      timeout: 10000,
                      data : {login: $("#username").val(), password: $("#password").val() },
                      type:'post',
                      beforeSend: function( xhr ) {
                         $.mobile.showPageLoadingMsg("b", "Cargando...", true);
                      },
                      success: function( data ) {
                        login=data;
                        if (login.status!='ERROR'){
                            $(".nombre").html(login.usuario.name);
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



            $(".config").click(function(e){
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
            

            $("#anteproyectos_button").click(function  () {
              //$("#lista_anteproyectos").html("");
              $('#col_set').html("");
              var url ="http://"+host+"/ciudadanos/"+login.ciudadano.id+"/anteproyectos.json";
                  $.ajax({
                    url: url,
                    // data: {id: id},
                    timeout: 10000,
                    type:'get',
                    beforeSend: function( xhr ) {
                       $.mobile.showPageLoadingMsg();
                    },
                    success: function( data ) {
                          //$("#lista_anteproyectos").append('<li data-role="list-divider" role="heading">Anteproyectos</li>');
                          $.each(data, function(key,value){
                            $('#col_set').append(
                              '<div data-role="collapsible" data-inset="false" data-content-theme="c">'+
                                '<h3>'+ value.nombre +'</h3>'+
                                '<p>'+value.descripcion+'</p>'+
                                '<div>'+
                                '<div class="star" id="proyecto_star_'+value.id+'" rel="'+value.id+'"></div>'+
                                '<div class="target" id="target_'+ value.id +'" style=" background-color: #F0F0F0; border-radius: 3px; float: left; height: 15px; margin-left: 5px; padding-bottom: 2px; padding-left: 8px; padding-right: 8px; text-align: center; width: 90px; float: left; "></div>'+
                                '</div>'+
                                '<br />'+
                                '<br />'+
                                //'<ul><li></li></ul>'

                              '</div>');
                              /*$("#lista_anteproyectos").append(
                                  //'<li data-theme="c"><a data-url="id='+value.id+'" href="#proyecto&id='+value.id+'">'+
                                  '<li data-theme="c" id="a_p_'+value.id+'" rel="'+value.id+'" class="a_p">'+
                                      value.nombre +
                                  '</a></li>'
                                  );*/
                          });
                          //$("#lista_anteproyectos").listview("refresh");

                          ///ACAAAAAAAAAA
                          /*$('.a_p').live('vclick', function(event) {
                            $('#col_set').append('<div data-role="collapsible">'+
                              '<h3>pppp '+ $(this).attr('id') +'</h3>'+
                              '<p>Im the collapsible content. By default Im closed, but you can click the header to open me.</p>'+
                              '</div>');*/
                            $( "#proyecto" ).trigger( "create" );
                            $('.star').each(function  () {
                              $(this).raty({  
                                cancel     : true,
                                cancelHint : 'Ninguno',
                                target     : '#target_'+$(this).attr('rel'),
                                //score      : $('#eleccion_' + $(this).attr('id') ).val(),  
                                //hints : hints,
                                click   : function(score, evt) {
                                      //registrar_voto(score, $(this).attr('id'));
                                    }
                              })
                              
                            })
                            //$( "#col_set" ).collapsible("refresh");
                            //$.mobile.changePage( "#proyecto", { transition: "slideup"} );
                              //event.preventDefault();
                              //alert("i'm running!");
                          //});
                          // $("#lista_periodos").after('<a href="#nueva_propuesta" data-role="button" data-iconpos="left" data-icon="plus" id="nueva_pro">Nueva Propuesta</a>');
                          // $('#nueva_pro').button();
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
            })

            $('#proyecto').bind( "pageinit", function( e, data ){
              // alert();
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
                           
                              //'<div data-role="collapsible-set" data-theme="" data-content-theme="">'+
                              $('#detalle_proyectos').append(
                                '<div data-role="collapsible" id="proyecto_'+value.id+'" data-collapsed="">'+
                                      '<h3>'+value.nombre+'</h3>'+
                                      '<div data-role="fieldcontain">'+
                                          '<fieldset data-role="controlgroup">'+
                                              value.descripcion +
                                          '</fieldset>'+
                                      '</div>'+
                                  //'</div>'+
                              '</div>');
                        });
                        
                       // $("#detalle_proyectos").collapsibleset('refresh');
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
