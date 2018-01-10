const sqlite3 = require( "sqlite3" ).verbose()

function database( databasePath ){
  var db, isOpened;
  
  this.getNews = ( lastId, func ) => {
    this.db.serialize( () => {
      this.db.all( "select * from news where id > ?", [ lastId ], ( err, rows ) => { func( rows ); } );
    } );
  }
  
  this.getSuggestedNews = ( lastId, func ) => {
    this.db.serialize( () => {
      this.db.all( "select * from suggestedNews where id > ?", [ lastId ], ( err, rows ) => { func( rows ); } );
    } );
  }
  
  this.confirmNews = ( id, func ) => {
    this.db.serialize( () => {
      this.db.all( "select * from suggestedNews where id = ?", [ id ], ( err, rows ) => {
        if( rows.length == 0 ) func( false );
        else{
          this.db.run( "insert into news( txt, author ) values( ?, ? )", [ rows[0][ "txt" ], rows[0][ "author" ] ] );
          this.db.run( "delete from suggestedNews where id = ?", [ id ] );
          
          func( true );
        }
      } );
    } );
  }
  
  this.deleteSuggestedNews = ( id, func ) => {
    this.db.serialize( () => {
      try{
        this.db.all( "delete from suggestedNews where id = ?", [ id ] );
        
        func( true );
      }
      catch( err ){
        func( false );
      }
    } );
  }
  
  this.deleteNews = ( id, func ) => {
    this.db.serialize( () => {
      try{
        this.db.all( "delete from news where id = ?", [ id ] );
        
        func( true );
      }
      catch( err ){
        func( false );
      }
    } );
  }
  
  this.offerNews = ( id, author, func ) => {
    this.db.serialize( () => {
      this.db.all( "insert into suggestedNews( txt, author ) values( ?, ? )", [ id, author ] );
      
      func( true );
    } );
  }
  
  try{
    this.db = new sqlite3.Database( databasePath );
    this.isOpened = true;
    console.log( "[SUCCESS] Open database \"" + databasePath + "\"" );
  }
  catch( err ){
    this.isOpened = false;
    console.log( "[FAIL] Open database \"" + databasePath + "\"" );
  }
}

module.exports = database