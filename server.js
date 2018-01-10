var IP, PORT, siteFolder;

const express = require( "express" );
const bodyToJSON = require( "body-parser" );
const Web3 = require( "web3" );
const contract = require( "./contract.js" );
const fs = require( "fs" );
const Database = require( "./database.js" );

function printConnectData( requestType, connectInfo, requestUrl, data ){
  console.log( "[" + requestType.toUpperCase() + "] New request" );
  console.log( "  Address: " + connectInfo[0] + ":" + connectInfo[1] );
  console.log( "  Request URL: " + requestUrl );
  
  if( data != undefined ) console.log( "  Data: " + data );
  
  console.log( "" );
}

function getResponse( tp, message ){
  return { "event" : tp, "message" : message };
}

function checkAccount( web3, login, pass ){
  try{
    web3.personal.unlockAccount( login, pass, 1000 );
    
    return true;
  } catch( err ){ return false; }
}

function initialization(){
  var server, filePath, web3, database, TrashCoin, response;
  
  IP = "10.77.0.3";
  // IP = "localhost";
  PORT = 8020;
  siteFolder = "site/";
  
  server = express();
  web3 = new Web3();
  database = new Database( "database.db" );
  
  web3.setProvider( new web3.providers.HttpProvider( "http://localhost:8545" ) );
  TrashCoin = web3.eth.contract( contract.ABI ).at( contract.address );
  
  server.use( bodyToJSON.json() );
  
  server.use( function( req, res, next ){
    res.header( "Access-Control-Allow-Origin", req.headers.origin );
    res.header( "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE" );
    res.header( "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" );
    next();
  } );
  
  server.use( function( req, res, next ){
    printConnectData( req.method, [ "???", req.connection.remotePort ], req.originalUrl, req.body );
    next();
  } );
  
  server.post( "/", function( req, res ){
    try{
      evnt = req.body[ "event" ];
      
      console.log( req.body );
      
      switch( evnt ){
        case "sign in":
          try{
            web3.personal.unlockAccount( req.body[ "login" ], req.body[ "password" ], 1000 );
            response = getResponse( "success", TrashCoin.checkAdmin( req.body[ "login" ] ) );
          } catch( err ){ response = getResponse( "error", "invalid login or password" ) }
        break;
        
        case "get file":
          if( req.body[ "file" ] == undefined ) response = getResponse( "error", "file not sended" );
          else if( !fs.existsSync( siteFolder + req.body[ "file" ] ) ) response = getResponse( "error", "file \"" + req.body[ "file" ] + "\" not exists" );
          else response = getResponse( "success", fs.readFileSync( siteFolder + req.body[ "file" ], "utf8" ) );
        break;
        
        case "get news":
          database.getNews( req.body[ "news id" ], ( news ) => {
            var lastId, newsText;
            
            if( news.length == 0 ) response = getResponse( "error", "void" );
            else{
              lastId = news[ news.length - 1 ][ "id" ];
              response = getResponse( "success", {
                "news id" : lastId,
                "news" : news
              } );
            }
          } );
        break;
        
        case "get confirm news":
          database.getSuggestedNews( req.body[ "confirm id" ], ( news ) => {
            var lastId, newsText;
            
            if( news.length == 0 ) response = getResponse( "error", "void" );
            else{
              lastId = news[ news.length - 1 ][ "id" ];
              response = getResponse( "success", {
                "confirm id" : lastId,
                "confirm news" : news
              } );
            }
          } );
        break;
        
        case "confirm news":
          database.confirmNews( req.body[ "news id" ], ( r ) => {
            if( r ) response = getResponse( "success", "" );
            else response = getResponse( "error", "" );
          } );
        break;
        
        case "delete suggested news":
          database.deleteSuggestedNews( req.body[ "news id" ], ( r ) => {
            if( r ) response = getResponse( "success", "" );
            else response = getResponse( "error", "" );
          } );
        break;
        
        case "delete news":
          database.deleteNews( req.body[ "news id" ], ( r ) => {
            if( r ) response = getResponse( "success", "" );
            else response = getResponse( "error", "" );
          } );
        break;
        
        case "offer news":
          database.offerNews( req.body[ "txt" ], req.body[ "author" ], ( r ) => {
            if( r ) response = getResponse( "success", "" );
            else response = getResponse( "error", "" );
          } );
        break;
        
        default: response = getResponse( "error", "undefined event" );
      }
    } catch( err ){ response = getResponse( "void", "void" ); }
    
    function waitResponse(){
      if( response != undefined ){
        console.log( "  [R] " + response );
        res.end( JSON.stringify( response ) );
        response = undefined;
        
        return;
      }
      
      setTimeout( waitResponse, 10 );
    };
    
    waitResponse();
  } );
  
  server.use( function( req, res ){
    filePath = "void";
    
    switch( req.originalUrl ){
      case "/" : filePath = "index.html"; break;
      case "/favicon.ico" : break;
      default: filePath = req.originalUrl;
    }
    
    if( filePath != "void" ) res.sendFile( siteFolder + filePath, { root : __dirname } );
  } );
  
  server.listen( PORT, IP, function(){
    console.log( "Run server [http://" + IP + ":" + PORT + "]" );
    console.log();
  } );
}

initialization();