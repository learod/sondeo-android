       var login=null;
       var leyenda=null;
       var storage = window.localStorage;   
       var periodo_propuesta_id; 

       /*var data = [
            { label: "Series1",  data: 10},
            { label: "Series2",  data: 30},
            { label: "Series3",  data: 90},
            { label: "Series4",  data: 70},
            { label: "Series5",  data: 80},
            { label: "Series6",  data: 110}
        ]; */ 

       function iniciar_session() {
           var url ="http://"+host+"/iniciar.json?login="+$("#username").val()+"&password="+$("#password").val();    
                $.ajax({
                      url: url,
                      timeout: 10000,
                      type:'get',
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
                            $.mobile.changePage( "#bienvenido", { transition: "slideup"} );
                        }else{
                            alert(login.message);
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
                     $.mobile.showPageLoadingMsg("b", "Cargando...", true);
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
            periodo_propuesta_id=id;
            leyenda=ley;
            var url ="http://"+host+"/periodo_propuestas/propuestas.json?id="+id;    
                $.ajax({
                  url: url,
                  timeout: 10000,
                  type:'get',
                  beforeSend: function( xhr ) {
                     $.mobile.showPageLoadingMsg("b", "Cargando...", true);
                  },
                  success: function( data ) {
                        $("#lista_periodos").html("");
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
