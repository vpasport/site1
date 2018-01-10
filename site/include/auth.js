var ip = "http://10.77.0.3:8020";
var news_id = -1;
var sel_id = "news";
var confirm_id = -1;
var login;

function initialization(){
  var auth;
	
  auth = document.getElementById( "auth" );
  
  auth.style.left = document.documentElement.clientWidth / 2 - auth.clientWidth / 2 + "px";
  auth.style.top = document.documentElement.clientHeight / 2 - auth.clientHeight / 2 + "px";
}

function sendRequest( type, URL, data, successFunc, errorFunc ){
  var xhr;
  
  xhr = new XMLHttpRequest();
  
  xhr.onload = function(){
    if( this.readyState == 4 ){
      if( this.status == 200 ) successFunc( this.responseText );
      else errorFunc( this.statusText );
    }
  };
  xhr.open( type, URL, true );
  xhr.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
  
  xhr.send( JSON.stringify( data ) );
}

function singIn(){
  var pass;
  
  login = document.getElementById( "login" ).value;
  pass = document.getElementById( "password" ).value;
  data = {
    "event" : "sign in",
    "login" : login,
    "password" : pass
  };
  
  sendRequest( "POST", ip, data, function( r ){
   	r = JSON.parse( r );
    
    if( r[ "event" ] == "success" ){
      loadBlock("include/site.txt", function(r2) {
        document.body.innerHTML = r2 ;
        if (r["message"]) loadBlock("include/site_adm.txt", function(r3){
          menu.innerHTML+=r3;
          });

        sendRequest( "POST", ip, {
          "event" : "get news",
          "news id" : news_id
        }, newshandler);
        });
    } else alert( r[ "message" ] );   
  } );
}

function loadBlock( file_name, func ) {
  data = {
    "event" : "get file",
    "file" : file_name
  }
  
  sendRequest("POST", ip, data, function( r ){
    r = JSON.parse( r );
    func(r["message"]);
  });
}

function newshandler(r) {
  r = JSON.parse(r);
  
  var news = r["message"]["news"];
  var div, div2, button;
  
  if( r["event"] == "error" ) return;
  news_id = r["message"]["news id"];
  
  for( let i = 0; i < news.length; i++ ) {
    div = document.createElement('div');
    div.className = "block";
    div.id = "news" + news[i]["id"];
    
    div2 = document.createElement('div');
    div2.className = "text";
    div2.innerHTML = news[i]["txt"];
    
    button = document.createElement('input');
    button.type = "button";
    button.value = "delete";
    button.className = "button news";
    button.onclick = function() {
      chengeNews1( news[i]["id"] );
    };
      
    news_con.appendChild(div);
    div.appendChild(div2);
    div.appendChild(button);
  }
}

function detDOM( id ) {
  if ( sel_id != id ) {
    if ( sel_id == "news" ) news_con.hidden = true;
    else if ( sel_id == "offer" ) {
      news_con_offer.hidden = true;
      offer_news.hidden = true;
    }
      else if ( sel_id == "suggested_news" ) news_con_offer_suggested_news.hidden = true;
    if ( id == "news" ) {
      news_con.hidden = false;
      sendRequest( "POST", ip, {
          "event" : "get news",
          "news id" : news_id
        }, newshandler);
    }
    else if ( id == "offer" ) {
      news_con_offer.hidden = false;
      offer_news.hidden = false;
    }
     else if ( id == "suggested_news" ) {
        news_con_offer_suggested_news.hidden = false;
        sendRequest( "POST", ip, {
          "event" : "get confirm news",
          "confirm id" : confirm_id
        }, newshandlerconfirm); 
     }
    
    document.getElementById(id).className = "menu select";
    document.getElementById(sel_id).className = "menu";
    sel_id = id;
    
  }
}

function newshandlerconfirm(r) {
  r = JSON.parse(r);
  
  var news = r["message"]["confirm news"];
  var div, div2, button, button2;
  
  if( r["event"] == "error" ) return;
  confirm_id = r["message"]["confirm id"];
  
  
  for( let i = 0; i < news.length; i++ ) {
    div = document.createElement('div');
    div.className = "block";
    div.id = "suggestednews" + news[i]["id"];;
    
    div2 = document.createElement('div');
    div2.className = "text";
    div2.innerHTML = news[i]["txt"];
    
    button = document.createElement('input');
    button.type = "button";
    button.value = "delete";
    button.className = "button news";
    button.onclick = function() {
      chengeNews( news[i]["id"], "delete suggested news" );
    };
    
    button2 = document.createElement('input');
    button2.type = "button";
    button2.value = "confirm";
    button2.className = "button news";
    button2.onclick = function() {
      chengeNews( news[i]["id"], "confirm news" );
    };
    
    news_con_offer_suggested_news.appendChild(div);
    div.appendChild(div2);
    div.appendChild(button);
    div.appendChild(button2);
  }
}

function chengeNews( id, evt) {
  sendRequest( "POST", ip, {
      "event" : evt,
      "news id" : id
    }, function(r) {
      r = JSON.parse(r);
      if ( r["event"] == "success" ) news_con_offer_suggested_news.removeChild(document.getElementById("suggestednews" + id));
      else alert( "error" );
    });
}

function chengeNews1( id ) {
  sendRequest( "POST", ip, {
      "event" : "delete news",
      "news id" : id
    }, function(r) {
      r = JSON.parse(r);
      if ( r["event"] == "success" ) news_con.removeChild(document.getElementById("news" + id));
      else alert( "error" );
    });
}

function offerNews() {
  news = document.getElementById('news_text').value;
  
  sendRequest("POST", ip, {
    "event" : "offer news",
    "txt" : news,
    "author" : login
  }, function() {
    alert( "news accepted" );
  } );
}