function introfy( that ){

  var container = that.container;
  
  if( !container ) 
  console.log( "bibliothek/code/utils/intro is missing container");
  
  that.setTitle = function( title )
  { 
    container.find(".intro-title").text( title );
  };
  
  that.setClaim = function( claim )
  {
    container.find(".intro-claim").text( claim );
  };
  
  that.setDetail = function( detail )
  {
    return container.find(".intro-detail").html( detail );
  };
  
  that.addFeature = function( feature )
  {
    var li = container.find(".intro-features").add( "li", { "class": "cell" });
    li.add( "h3" ).html( feature.title );
    li.add( "div"  ).html( feature.description );
    return li;
  };
  
  that.addFeatures = function( features )
  {
    for( var i = 0; i < features.length; i++)
    {
      that.addFeature( features[i] );
    }
  };
  
  that.removeFeatures = function( feature )
  {
    container.find(".intro-features").removeChilds();
  };
  
  that.setDisclaimer = function( disclaimer )
  {
    var credits = "";
    credits += "<em>Bereitgestellt durch</em><br>";
    credits += "<b class=fontAlert>Klinik für Klinische Pharmakologie</b><br>";
    credits += "<b class=fontAlert>und Toxikologie</b><br>";
    credits += "<span>UniversitätsSpital Zürich</span>";
    
    var copyright = "<p>Copyright © 2013 EPha.ch AG - All rights reserved<p>";
    
    container.find(".intro-credits").html( disclaimer && disclaimer.credits || credits );
    container.find(".intro-copyright").html( disclaimer && disclaimer.copyright || copyright );
  };
  
}
function kontify( that ){

  that.enviroment = function() {
        
    // FILLIN IE STUPID
    if (!window.location.origin) 
    {
      var origin = window.location.protocol + "//";
      origin += window.location.hostname;
      origin += (window.location.port ? ":" + window.location.port: "");
        
      window.location.origin = origin;
    }  
    
    if( document.domain == "localhost" 
       || document.domain == "10.129.240.36"
       || document.domain == "10.129.245.22"
       || document.domain == "10.129.144.18"
       || document.domain == "10.129.246.198"
       || document.domain == "10.129.247.72"
       || document.domain == "192.168.1.44"
       || document.domain == "10.129.225.76"
       || document.domain == "127.0.0.1"
    )
    {
      document.domain = document.domain;
      that.node = "http://" + document.domain + ":8080";
      that.origin = location.origin + location.pathname;
      that.live = false;

    }
    else
    {
      //if (!window.device) document.domain = "epha.ch";
      that.node = "http://node.epha.ch";
      that.origin = location.origin;
      that.live = true;
    }


  };
    
  that.signOn = function( callback ) {
    
    if( window.device ) 
    {
      DOM(document.body).addClass("phonegap");
      // IOS 7 FIX STATUSBAR
      if( 
          window.device &&
          window.device.cordova == "3.1.0" && 
          window.device.platform == "iOS" && 
          parseFloat(window.device.version) === 7.0 
        )
        {
          DOM(document.body).addClass("ios7");
        }
      
      var device_actor = localStorage.getItem("device_actor");
      callback( device_actor ? JSON.parse( device_actor ) : null );
    }
    else 
    { 
      var first = DOM(document.body).find("article");
    
      var iframe = first.addPrevious("header").addClass("kontify color1").add("iframe", 
      {
          src: that.node
      });
    
      iframe.on("load", function() 
      { 
        // CALL
        // sso.postMessage( { request:"REDIRECT", target:data.target }, "*"); 

        DOM(window).on("msg", function( data) 
        {  

          if( data.transfer.request == "REDIRECT"){
            if (typeof that.relocate == "function") that.relocate(data.transfer.target);
            else location.replace(data.transfer.target); 
          }
            
          if( data.transfer.request == "ACTOR_GET") callback( data.transfer.actor ); 
        });
      
        iframe.element.contentWindow.postMessage({request: "ACTOR_GET"}, "*");
      }); 
    }

  };
  
  /*
    // in App.initalize use:
    
    App.relocateOn(function(url){
      if (url.indexOf("consilium") > -1) url += "#/id:12312";
      location.replace(url);
    });
  */
  
  that.relocateOn = function(callback){
    that.relocate = callback;
  };
  
  that.report = function( text ) 
  {  
    if( !that.time ) that.time = new Date(); 
    
    console.log( text, new Date().getTime() - that.time );
  }
}function storify( that ) {  
  
  var data = {};
  
  that.memory = {
      
    set:function( type, value, sterms )
    { 
      if( value instanceof Array )
      {
        if( sterms )
        {
          for( var i = 0; i < value.length; i++)
          {
            value[i]["_term"] = '';
            
            for( var t = 0; t < sterms.length; t++)
            {
              if( value[i][sterms[t]] ) value[i]["_term"] += value[i][sterms[t]].toUpperCase() + " ";
            }
          }          
        }
        // DATA ADDED TO ARRAY
        data[ type ] = ( !data[ type ] ) ? value : data[ type ].concat( value );
      }
      else
      data[ type ] = value;

      return data[type];
    }
    ,
    get: function( type )
    {
      return data[type];  
    }
    ,
    remove:function( type )
    {
      delete data[type];
    }
    ,
    search:function( type, searchString )
    {
      var search = searchString.toUpperCase().split(" ");
      
      var source = data[type].slice(0);
      
      return source.filter( function(ele)
      {   
          for( var i = 0; i < search.length; i++)
          {
            if( ele["_term"] && ele["_term"].indexOf( search[i] ) > -1) { continue; }

            return false;
          }

          return true;
      });
    }
  };

  /**
   * LOCALSTROAGE
   */
  that.storage = {
    
    available: ("localStorage" in window && window["localStorage"] !== null)
    ,
    set:function( key, value ) 
    { 
      if( !this.available ) return;
      
      localStorage.setItem( key, JSON.stringify( value || {} ) ); 
    }
    ,
    get:function( key ) 
    {
      if( !this.available ) return;
      
      var item = localStorage.getItem( key );
      
      return ( typeof item == "string" ) ? JSON.parse( item ) : item; 
    }  
    ,
    remove: function( key ) 
    { 
      if( !this.available ) return;
      
      return localStorage.removeItem( key ); 
    }
  };

  /**
   * AJAX
   */
  that.remote = {

    "create":function(uri, callback, data, accessToken)
    {
      this.rest("POST", uri, callback, data, accessToken);
    }
    ,
    "read":function(uri, callback, data, accessToken)
    {
      if(data != null && typeof data == "object")
      {
        uri += "?" + this.toUrlVariables(data);
      }
      this.rest("GET", uri, callback, null, accessToken);
    },
    "update":function(uri, callback, data, accessToken)
    {
      this.rest("PUT", uri, callback, data, accessToken );
    }
    ,
    "delete":function(uri, callback, data, accessToken)
    {
      this.rest("DELETE", uri, callback, data, accessToken );
    }
    ,
    /**
     * readyState
     * 0: request not initialized 
     * 1: server connection established
     * 2: request received 
     * 3: processing request 
     * 4: request finished and response is ready
     */
    rest: function( method, uri, callback, data, accessToken, noheaders) { 

      var request = new XMLHttpRequest() || ActiveXObject("MSXML2.XMLHTTP.3.0");
      request.open( method, uri, true);
      
      if( !noheaders )
      request.setRequestHeader("Content-Type", "application/json");
      
      if( !noheaders && accessToken ) 
      request.setRequestHeader("Authorization", accessToken);   
      
      request.onreadystatechange = function()
      {   
        if( request.readyState == 4)
        {                 
          if( request.status == 200 && request.responseText) 
          callback( { status: request.status, message:JSON.parse( request.responseText ) } );
          else 
          callback( { status: request.status, message:request.statusText } ); 
        }
      };
      request.send( JSON.stringify( data ) );
    }
    ,
    form: function( method, uri, params ) 
    {
      var form = DOM( DOM( document ).create("form") );
      form.attrib("method", method);
      form.attrib("action", uri);
      
      for( var key in params) {
        if(params.hasOwnProperty(key)) {
          form.add("input").attrib("type", "hidden").attrib("name", key).attrib("value", params[key] );
        }
      }
      form.element.submit();
    }  
    ,
    toUrlVariables: function(data) 
    {
      var query = [];
      for (var key in data){
        query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
      }
      return query.join("&");
    }
  };
};


/** 
* EXTEND ARRAY
**/
// Returned Array mit Unique Properties
Array.prototype.unique = function( property ) 
{
  var uniques = {};
  
  this.forEach( function( element, index ) 
  {      
    var unique = (property != null) ? element[ property ] : element;
    
    if( uniques[ unique ] == null ) uniques[ unique ] = 1;  
  });
               
  return Object.keys(uniques);
};
// Returned Array Objects mit Unique Objet properties
Array.prototype.single = function( property ) 
{
  var uniques = {};
  
  return this.filter( function(element) 
  {
    var unique = element[ property ];
    
    if( uniques[ unique ] == 1) return false;
    
    uniques[ unique ] = 1; return true;  
  });

};

Array.prototype.at = function( index )
{
  return this[ index ];
};

Array.prototype.by = function( key, id )
{
  var index = this.length;
  while( index-- )
  {
    if( this[ index ][ key ] == id ) {
      return this[ index ];
    }
  }
};

Array.prototype.byId = function(id){
  return this.by("id", id);
};

Array.prototype.has = function( key, array )
{
  return this.filter( function(element) 
  {
      var flag = false; // delete
      
      for(var i = 0; i < array.length; i++)
      {
        var source = ( typeof element == "object" ) ? element[key] : element;
        var target = ( typeof array[i] == "object" ) ? array[i][key] : array[i];
        
        if( source == target ) flag = true;
      }
      
      return flag; // return false;
   });
};

Array.prototype.merge = function( key, array ){
  
  for( var i = 0; i < this.length; i++)
  {
    for(var j = 0; j < array.length; j++)
    {
      if( this[i][key] == array[j][key]) {
        
        for( var property in array[j] )
        {
          if( array[j].hasOwnProperty( property) && property != key)
          {
            this[i][property] = array[j][property];
          }
        }
      }
    }
  }
  return (this);
};

Array.prototype.clone = function()
{
  return this.slice(0);
};

Array.prototype.sortABC = function( property )
{
  return this.sort( function( a,b) 
  {
    var links = a[property].replace(/Ö/, "Oe").replace(/Ä/, "Ae").replace(/Ü/,"Ue");
    var rechts = b[property].replace(/Ö/, "Oe").replace(/Ä/, "Ae").replace(/Ü/,"Ue");
    
    if( links < rechts) return -1;
    if( links > rechts) return 1;
    return 0;
  });
};

Array.prototype.sort123 = function( key )
{
  return this.sort( function( a,b)
  {
    return ( Math.floor( a[key] ) - Math.floor( b[key] ) );
  });
};

Array.prototype.sort321 = function( key )
{
  return this.sort( function( a,b)
  {
    return ( Math.floor( b[key] ) - Math.floor( a[key] ) );
  });
};

Array.prototype.notIn = function( key, array )
{
    return this.filter( function(element) 
    {
        var flag = true;
        
        for(var i = 0; i < array.length; i++)
        {
            if( element[key] == array[i][key]) flag = false;
        }
        
        return flag;
    });
};

Array.prototype.get = function( property,  value )
{ 
  for(var i = 0; i < this.length; i++)
  {
    if( this[i][property] == value ) return this[i];
  }
  
  return null;
};

Array.prototype.changeItem = function( key, property, value )
{
  var done = false;
  
    for(var i = 0; i < this.length; i++)
    {
        if( this[i]["id"] == key)
        {
          this[i][property] = value ; done = true;
        }
    }
    
    return done;
};

Array.prototype.firstById = function( id ) 
{
  for( var i = 0; i < this.length; i++ )
  {
    if( this[i].id == id ) { this.unshift( this.splice( i, 1 )[0] ); break; }
  }

  return this;
};

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};




var util = {

  fill: function( zahl ) { return ( zahl < 10 ) ? "0"+zahl : zahl; }
  ,
	zeit: function(pattern, ms) {
      
      var cur = (ms) ? new Date(ms) : new Date();
    
      var milli =   this.fill( cur.getMilliseconds() );
      var sekunde = this.fill( cur.getSeconds() );
      var minute =  this.fill( cur.getMinutes() ); 
      var stunde =  this.fill( cur.getHours() );
      
      var day =     this.fill( cur.getDate() );	
      var month =   this.fill( cur.getMonth() + 1 );
      var year =    this.fill( cur.getFullYear() );
          
      switch (pattern)
      {
          case ("yyyy-MM-ddThh:mm.ss.ms"): return year + "-" + month + "-" + day + "T" + stunde + ":" + minute + ":" + sekunde + "." + milli;
          case ("yyyy-MM-dd hh:mm.ss"): return year + "-" + month + "-" + day + " " + stunde + ":" + minute + ":" + sekunde;
          case ("yyyy-MM-dd"): return year + "-" + month + "-" + day;
          case ("dd.mm.yyyy hh:mm"): return day + "." + month + "." + year + " " + stunde + ":" + minute;
          case ("dd.MM.yyyy hh:mm"): return day + "." + month + "." + year + " " + stunde + ":" + minute;
          case ("dd.mm.yyyy"): return day + "." + month + "." + year;
          case ("dd.MM"): return day + "." + month;
          case ("hh:mm"): return stunde + ":" + minute;
          case ("dd"): return day;
          case ("ddInMonth"): return new Date(year, month, 0).getDate();
          case ("MM"): return month;
          case ("yyyy"): return year;
          case ("hh"): return stunde;
          case ("mm"): return minute;
          case ("midnight"): cur.setHours(0, 0, 0, 0); return cur.getTime(); 
          case ("weekend"): return (cur.getDay() == 0 || cur.getDay() == 6 ); 
          default: return cur.getTime();
      };
	}
  ,  
  ajax: function( method, uri, callback, data, accessToken) { 
    
    if (method == "GET" && typeof data == "object"){
      uri += "?" + this.toQuery(data);
    }
    var request = new XMLHttpRequest() || ActiveXObject("MSXML2.XMLHTTP.3.0");
    request.open( method, uri, true);
    
    if( data )
    request.setRequestHeader("Content-Type", "application/json");
    
    if( accessToken ) 
    request.setRequestHeader("Authorization", accessToken);
      
    request.onreadystatechange = function(){   
      if( request.readyState == 4){                 
        if( request.status == 200 && request.responseText) 
        callback( { status: request.status, message:JSON.parse( request.responseText ) } );
        else 
        callback( { status: request.status, message:request.statusText } ); 
      }
    };
    request.send( JSON.stringify( data ) );
  }
};
function eventify( that ) {
  
  // REGISTRY
  var commands = {};
  
  that.on = function(type, call) 
  {
    if (!(type in commands)) commands[type] = [call];
    else (commands[type].indexOf( call ) != -1 ) ?  console.log( "Function exists") : commands[type].push( call);
  };
 
  that.off =  function( type, call ) 
  {  
    commands[type].splice( commands[type].indexOf( call), 1); 
  };
   
  that.dispatch = function(type, data) 
  {
    //log('dispatch: ', type, data, this)
    if(commands[type]){
      for (var i = 0; i < commands[type].length; i++){
        commands[type][i]( data ); 
      } 
    }
    else{
      console.log('You are dispatching an Event that is not caught jet. Type: '+type+ ' on ', this)
    }
    /*}
    catch(error){
      console.trace()
      console.log(error, type, data)
    }*/

  };
  
};
/**
	Copyright (C) 2013
	            _                 _     
	           | |               | |    
	  ___ _ __ | |__   __ _   ___| |__  
	 / _ \ '_ \| '_ \ / _` | / __| '_ \ 
	|  __/ |_) | | | | (_| || (__| | | |
	 \___| .__/|_| |_|\__,_(_)___|_| |_|
	     | |                            
	     |_|        
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of this 
	software and associated documentation files (the "Software"), to deal in the Software 
	without restriction, including without limitation the rights to use, copy, modify, merge, 
	publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
	to whom the Software is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all copies or 
	substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
	INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
	PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
	FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
	ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.          
 */

(function(window, document, undefined){

	function selector(id)
	{	
    // Ensure 'new' operator
    if (!(this instanceof selector)) return new selector(id);
    
    if(typeof id === "string") 
    {
        this.element = document.getElementById(id);
    }			
    else if(id instanceof HTMLElement)
    {
        this.element = id;
    }
    else if( id instanceof NodeList )
    {
        this.element = id;
    }
    else if( id === window )
    {
      this.element = window;
    }
    else if( id === document )
    {
      this.element = document;
    }
    else if( id instanceof selector) // TODO review: support for DOM(DOM('someId'))
    {
      return id;
    }
    else
    {
      this.element = document.createDocumentFragment();
    }		
    // TODO Add Selectors
	}
	
	selector.prototype = {
    
	    // TODO return null if not found
      find: function(select){
        var result = this.element.querySelector(select);
        return result ? DOM(result) : null;
      },
      findAll: function(select){
        return DOM( this.element.querySelectorAll(select) );
      }
      ,
      off: function(type) {
			  
        // KEEP REFERENCES OF EVENT HANDLERS
        if( this.element )  this.element.eventHandlers = this.element.eventHandlers || {}; 
			  
          switch( type )
          {
            case "tangent":
            case "touchstart":           
              type = ("ontouchstart" in window ) ? "touchstart" : "mousedown";
              break;
            
            case "touchmove":            
              type = ("ontouchmove" in window ) ? "touchmove" : "mousemove";
              break;
              
            case "touchend":
              type = ("ontouchend" in window ) ? "touchend" : "mouseup";
              break;
            
            case "touchcancel":
              type = ("ontouchcancel" in window ) ? "touchcancel" : "mousecancel";
              break;
              
            case "touchleave":
              type = ("ontouchleave" in window ) ? "touchleave" : "mouseleave";
              break;
            
            case "done":
            case "stage":
              if('ontransitionend' in window) type = 'transitionend';
              else if('onwebkittransitionend' in window) type = 'webkitTransitionEnd';
              else if('onotransitionend' in this.element || navigator.appName == 'Opera') type = 'oTransitionEnd';
              else return;
              break;
          }    			  
        
          if( this.element.eventHandlers[ type ])
          this.element.removeEventListener( type, this.element.eventHandlers[ type ], false);
          return this;
      },
      on: function(type, callback, params){
        
        // DATA PASSED INTO HANDLER
        var data = params || {};
        
        var eventHandler = function(event){
          
          // MULTI FINGER
          if (event.touches && event.touches.length > 0) event = event.touches[0];
          
          // HAS BEEN CLICKED
          data.target = event.target || event.srcElement;
          
          //DELEGATION ROUNDS
          if (data.watch && typeof data.watch == "string"){
            var rounds = 3;
            
            while (rounds--){
              if (data.target.nodeName == data.watch.toUpperCase()) break;
              else if (rounds < 1) return;
              else data.target = data.target.parentNode; 
            }
            
          }
          
          // SET ON ELEMENTS
          if (data.target && data.target.hasAttribute){
            if (data.target.hasAttribute("data"))
              data.transfer = JSON.parse(data.target.getAttribute("data"));
            
            if (data.target.hasAttribute("href"))
              data.href = data.target.getAttribute("href");           
          }
          
          if (data.target && data.target.value != null) data.value = data.target.value;
          
          // MESSAGEEVENT
          if (event.data && event.origin){
            data.transfer = event.data;
            data.origin = event.origin;
            data.timeStamp = event.timeStamp;
            data.type = event.type;
          }
          
          // RETURN 13
          if (event.keyCode) data.keyCode = event.keyCode;
          
          // KOORDINATEN
          if (event.clientX > 0 || event.offsetX > 0 || event.layerX > 0){      
            data.koord = {
              clientX : event.clientX, 
              clientY : event.clientY,
              mouseX : event.mouseX,
              mouseY : event.mouseY,
              offsetX : event.offsetX || event.layerX,
              offsetY : event.offsetY || event.layerY
            };
          }
          
          callback(data);
        };

        // KEEP REFERENCES OF EVENT HANDLERS
        if (this.element) this.element.eventHandlers = this.element.eventHandlers || {}; 
        
        switch(type) {
          
          // data.type touchstart | touchend | touchleave
          case "tangent":

            function contactHandler( data )
            {
              var element = DOM( data.target );
              var x = data.koord.clientX;
              var y = data.koord.clientY;
              var transient = data.target.tagName.toLowerCase();
              transient = !!( transient == "a" || transient == "button" );

              function finalize( data )
              {
                if( data.type == "touchend" )
                {
                  if( transient ) element.removeClass("selected");
                  
                  if( element.element != data.target ) 
                  {
                    data.type = "touchleave";
                  }
                  
                  callback( data );
                }
               else if( data.type == "touchleave")
                {
                  element.removeClass("selected");
                  data.target = element.element;
                  callback( data ); 
                }
                else if( data.type == "touchmove")
                {
                  var moveX = data.koord.clientX;
                  var moveY = data.koord.clientY;
                  
                  if( Math.abs(moveX - x) > 10 || Math.abs(moveY - y) > 6 )
                  {
                      element.removeClass("selected");
                      data.type = "touchleave";
                      callback( data );
                  }
                  else {
                    x = data.koord.clientX;
                    y = data.koord.clientY;
                    return;
                  }
                }
 
                element.off( "touchmove", finalize );
                element.off( "touchend", finalize );
                element.off( "touchleave", finalize );
              }
              
              if(data.type == "touchstart")
              {  
                callback( data ); 
                
                if( transient ) element.addClass("selected");   
                
                element.on( "touchmove", finalize );
                
                if( data && data.watch ) element.on( "touchend", finalize, { watch: data.watch } );
                // TODO review, (data && data.url ? { url: data.url } : null )
                else element.on( "touchend", finalize );
 
                element.on( "touchleave", finalize );
              }
            }
            this.on("touchstart", contactHandler, data);
            return this;
            
          case "touchstart":            
            type = ("ontouchstart" in window ) ? "touchstart" : "mousedown";
            data.type = "touchstart";
            break;
            
          case "touchmove":            
            type = ("ontouchmove" in window ) ? "touchmove" : "mousemove";
            data.type = "touchmove";
            break;									

          case "touchend":
            type = ("ontouchend" in window ) ? "touchend" : "mouseup";
            data.type = "touchend";
            break;		
            
          case "touchcancel":
            type = ("ontouchcancel" in window ) ? "touchcancel" : "mousecancel";
            data.type = "touchcancel";
            break;	
            
          case "touchleave":
            type = ("ontouchleave" in window ) ? "touchleave" : "mouseleave";
            data.type = "touchleave";
            break;	
                    
          case "mouseover":     data.type = "over";   break;
          case "mouseout":     data.type = "out";   break;
            
          case "modal":         type = "blur";        break;
          case "msg":           type = "message";     break;
          case "tab":	        type = "visibilitychange"; break;
          case "return":        type = "keydown";     break;						
          case "keydown":        type = "keydown";     break;						

          case "change":  break;
          case "keyup":   break;
          case "focus":   break;
          case "input":   break;
          
		  case "done":
          case "stage":
          case "transitionend": 
            if('ontransitionend' in window) type = 'transitionend';
            else if('onwebkittransitionend' in window) type = 'webkitTransitionEnd';
            else if('onotransitionend' in this.element || navigator.appName == 'Opera') type = 'oTransitionEnd';
            else { eventHandler(data); return; }
            break;

          case "ready":
            // cordova device plugin required for "deviceready" event 
            type = (!!window.cordova) ? "deviceready" : "DOMContentLoaded";
            break;
            
          case "load":    break;
          case "resume":  break;  
          case "submit":  break;
          case "resize":  break;
          case "click":   break;
      
          default: console.log( "No definition for " + type, this.element );
        }
				try{
        this.element.eventHandlers[ type ] = eventHandler;
        this.element.addEventListener( type, eventHandler, false );
        }
        catch(err){
          console.log('on error:',err, this, type, callback)
          console.trace()
        }


        return this;
      },
      parent: function()
      {
          return DOM( this.element.parentNode );
      },
      inherit: function( parent )
      {
          this.prototype = new parent();
          
          return this;
      },
      prefix: function( type )
      {
          var prefixes = ["webkit", "moz", "ms", "o", ""];
          var results = [];

          for( var i = 0; i < prefixes.length; i++)
          {
              results.push(prefixes[i]+type.charAt(0).toUpperCase() + type.slice(1));
          }
          return results;
      },
      hash:function( value )
      {
        if( value )
        window.location.hash = value; 
        else
        return window.location.hash.replace("#","");    
      },
      removeHash:function()
      {
        history.pushState("", document.title, window.location.pathname);
      },
      /**
       * @returns tv || tablet || mobile || desktop
       */
      device: function()
      {
        var ua = navigator.userAgent;
			  
        return  ua.match(/GoogleTV|SmartTV|Internet.TV|NetCast|NETTV|AppleTV|boxee|Kylo|Roku|DLNADOC|CE\-HTML/i) ? 'tv'
          // tv-based gaming console
        : ua.match(/Xbox|PLAYSTATION.3|Wii/i) ? 'tv'
          // tablet
        : ua.match(/iPad/i) || ua.match(/tablet/i) && !ua.match(/RX-34/i) || ua.match(/FOLIO/i) ? 'tablet'
          // android tablet
        : ua.match(/Linux/i) && ua.match(/Android/i) && !ua.match(/Fennec|mobi|HTC.Magic|HTCX06HT|Nexus.One|SC-02B|fone.945/i) ? 'tablet'
          // Kindle or Kindle Fire
        : ua.match(/Kindle/i) || ua.match(/Mac.OS/i) && ua.match(/Silk/i) ? 'tablet'
          // pre Android 3.0 Tablet
        : ua.match(/GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC(.Flyer|\_Flyer)|Sprint.ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos.S7|Dell.Streak.7|Advent.Vega|A101IT|A70BHT|MID7015|Next2|nook/i) || ua.match(/MB511/i) && ua.match(/RUTEM/i) ? 'tablet'
          // unique Mobile User Agent
        : ua.match(/BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google.Wireless.Transcoder/i) ? 'mobile'
          // odd Opera User Agent - http://goo.gl/nK90K
        : ua.match(/Opera/i) && ua.match(/Windows.NT.5/i) && ua.match(/HTC|Xda|Mini|Vario|SAMSUNG\-GT\-i8000|SAMSUNG\-SGH\-i9/i) ? 'mobile'
          // Windows Desktop
        : ua.match(/Windows.(NT|XP|ME|9)/) && !ua.match(/Phone/i) || ua.match(/Win(9|.9|NT)/i) ? 'desktop'
          // Mac Desktop
        : ua.match(/Macintosh|PowerPC/i) && !ua.match(/Silk/i) ? 'desktop'
          // Linux Desktop
        : ua.match(/Linux/i) && ua.match(/X11/i) ? 'desktop'
          // Solaris, SunOS, BSD Desktop
        : ua.match(/Solaris|SunOS|BSD/i) ? 'desktop'
          // Desktop BOT/Crawler/Spider
        : ua.match(/Bot|Crawler|Spider|Yahoo|ia_archiver|Covario-IDS|findlinks|DataparkSearch|larbin|Mediapartners-Google|NG-Search|Snappy|Teoma|Jeeves|TinEye/i) && !ua.match(/Mobile/i) ? 'desktop'
          // assume it is a Mobile Device (mobile-first)
        : 'mobile';
      }
      ,
      style: function( property, value)
      { 
          if( value != undefined )
          {
            this.element.style.setProperty( property, value);
            
			return this;
          }
          else this.element.style.getAttribute( property );
      }
      ,
      setStylePrefix: function( property, value){
        
        var prefix = ["-webkit","-moz","-ms","-o"];
        
        for( var i = 0; i < prefix.length; i++)
        {
          this.style( prefix[i]+"-"+property, value);
        }
        return this;
      }
      ,
      show: function()
      {
        if( this.element instanceof NodeList )
        {
          var todos = this.element.length;
          while( todos-- )
          {
            this.element[ todos ].style["display"] = "block";           
            this.element[ todos ].style["visibility"] = "visible";          
          }
        }
        else {
          this.element.style["display"] = "block";
          this.element.style["visibility"] = "visible"; 
        }
          
        return this;
      }
      ,
      invisible: function()
      {
        this.element.style["visibility"] = "hidden"; 			  
      }
      ,
      hide: function( visible )
      {
        if( this.element instanceof NodeList )
        {
          var todos = this.element.length;
          while( todos-- ) this.element[ todos ].style["display"] = "none";                
        }
        else {
          this.element.style["display"] = "none";
        }
          
        return this;
      }
      ,
      focus: function() {
        
        this.element.focus();
        
        return this;
      }
      ,
      blur: function() {
        
        this.element.blur();
        
        return this;
      }
      ,
      swipe: function( direction ) {
        
        this.replaceClass(/(right|left|top|bottom|middle)/, direction);
        
        return this;
      }
      ,
      html: function( value )
      {
          if(value != null)
          {
              this.element.innerHTML = value;
              return this;
          }
          else return this.element.innerHTML;
      }
      ,
      text: function( value )
      {
          if( value != null )
          {
            this.element.textContent = value;
            return this;
          }
          else return this.element.textContent;
      }
      ,
      hellip: function(zeichen)
      {
        var value = this.text();
        if (zeichen < value.length - 2) this.text(value.substr(0, zeichen - 1) + "…");
        return this;
      }
      ,
      add: function(tag, attributes, text) {
      // RETURNS THE CHILD
        var child = (typeof tag === "string") ? this.create( tag ): tag;
        
        for (var attribute in attributes) 
        {
            // TODO eventually support events here
            child.setAttribute( attribute, attributes[attribute] );
        }
        if(tag == "textarea" && text) child.value = text;  
        
        if(tag != "textarea" && text) child.innerHTML =  text;			    
        
        this.element.appendChild( child );

        return DOM(child);
      }
      ,
      addPrevious: function(tag, attributes, text)
      {
        var previous = this.create(tag, attributes, text);
        
        this.parent().element.insertBefore( previous, this.element );
        
        return DOM(previous);
      }
      ,
      addNext: function(tag, attributes, text)
      {
        return this.parent().add( tag, attributes, text);
      }
      ,
      
      append: function(htmlElement){
        this.element.appendChild(htmlElement)
        return this
      },
      remove: function()
      {
        if( this.element instanceof NodeList )
        {
          var todos = this.element.length;        
          while( todos-- ) this.element[ todos ].parentNode.removeChild( this.element[ todos ] );             
        }
        else this.element.parentNode.removeChild( this.element ); 
        
        return this;
      }
      ,
      removeChilds: function()
      {	
        while(this.element.hasChildNodes())
        {
          this.element.removeChild(this.element.lastChild);						
        }
        
        return this; 
      }
      ,
      hasChilds: function()
      {
        return this.element.hasChildNodes();
      }
      ,
      addClass: function( className ) 
      {
        var classes = className.split(" ");
        
        for( var i = 0; i < classes.length; i++) this.element.classList.add(classes[i]);
		
        return this;
      }
      ,
      removeClass: function( className )
      {
        if( this.element instanceof NodeList )
        {
          var todos = this.element.length;        
          while( todos-- ) this.element[ todos ].classList.remove( className );             
        }    
        else this.element.classList.remove( className );
        
        return this;
      }
      ,
      replaceClass: function(search, replace)
      {
        this.element.className = this.element.className.replace(search, replace);
        return this;
      }
      ,
      hasClass:function( className )
      {
        return this.element.classList.contains( className );
      }
      ,
      create: function( tag )
      {						
        return document.createElement(tag);
      }
      ,
      fragment:function()
      {
        this.element = document.createDocumentFragment();
        
        return this;
      }
      ,
      fragments: function( array )
      {
          var fragment = document.createDocumentFragment();
          
          for( var i = 0; i < array.length; i++)
          {
              fragment.appendChild( array[i] );
          }						
          
          this.add( fragment );
          
          return this;
      }					
      ,
      attrib: function(attribute, newValue)
      {
        if (attribute && newValue)
        {
            this.element.setAttribute(attribute, newValue);
            return this;
        } else {
            return this.element.getAttribute(attribute);
        }
      }
      ,
      run: function(func,arg){
        return func(this,arg);
      }
      ,      
      get: function(property)
      {
         return this.element[property];
      }
      ,
      set: function(property, value)
      {
        this.element[property] = value;
        return this;
      }
      ,
      toggle: function( attribute, values )
      {
          this.attrib( attribute, ( this.attrib( attribute ) == values[0] ) ? values[1] : values[0] ); 
      },
      toggleShow: function()
      {
          this.hasClass('hidden')?this.removeClass('hidden'):this.addClass('hidden');
      }
      ,
      removeAttrib: function( attrib )
      {
        this.element.removeAttribute( attrib );
        return this;
      }
      ,
      width: function( value )
      {				
          if( value ) this.attrib("width", value );
          
          return Math.floor( this.element.offsetWidth );
      }
      ,
      height: function( value )
      {
        if( value ) this.attrib("height", value );
        //clientHeight ohne Border
        return Math.floor( this.element.offsetHeight );
      }
      ,
      child: function(index)
      {
          return DOM( this.element.childNodes[index] );
      }
      ,
      // TODO childs -> children -> getChildren
      childs: function()
      {
        return this.element.childNodes;
      }
      ,
      scrollToIndex: function( index )
      {
        var total = this.height();				
          
        var item = this.child( index ).height();

        var scroll =  Math.floor( index * item ) - ( total / 2 ) + ( item / 2) + ( index % 2 );
          
        this.scrollTo("scrollTop", scroll, 500);
      }
      ,
      scrollX: function(from, to, duration)
      {					
        var start = from;
        var change = to - start;
        var currentTime = 0;
        var increment = 20;
        var	element = this.element;
  
        // http://robertpenner.com/easing/
        function easeInOutQuad(t, b, c, d) {
              t /= d/2;
              if (t < 1) return c/2*t*t + b;
              t--;
              return -c/2 * (t*(t-2) - 1) + b;
            };
  
        var animateScroll = null;
        
        animateScroll = function(){        
            currentTime += increment;
            var val = easeInOutQuad(currentTime, start, change, duration);                        
            element["scrollLeft"] = val; 
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
      }
      ,
      tracking: function( domain ) {
          var _gaq = [];
          _gaq.push(['_setAccount', 'UA-9955206-2']);
          _gaq.push(['_setDomainName', domain]);
          _gaq.push(['_trackPageview']);
          window._gaq = _gaq;
          
         (function() {
           var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
           ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
           var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
         })();
      }
      ,
      track: function( url )
      {
        _gaq.push(['_trackPageview', url]);  
      }
      ,
      log: function ( problem )
      {
        console.log(this.element).bind( problem ); 
        return this;
      }
      ,
      info: function( html ) 
      {
        
        this.addClass("blur");
        window.confirm(html);
        this.removeClass("blur");
      }
      ,
      busy: function() {
        
        var spinners = this.add("div");     
        
        for(var i = 0; i < 12; i++)
        {
          var spinner = spinners.add("div").addClass("spinner");
          spinner.setStylePrefix( "transform", "rotate("+(i*30)+"deg) translate(0, -120%)");
          spinner.setStylePrefix( "animation-delay", (i / 12)+"s");
        }
        
        return spinners;
      }
      ,
      notBusy: function() 
      {  
        return this.find(".spinner").parent().remove();  
      }
      ,
      carousel: function(selector, args){
        
        var slides = DOM(this.element).findAll(selector),
            l = slides.length;

        if (!slides || l < 2) return this;
        
        var args = args || {},
            idx = 0,
            options = {
              duration: args.duration || 2500
            };
        
        var i = l;
        while (i--) slides.element[i].style.opacity = 0;
            
        slides.element[idx].style.opacity = 1;
        
        setInterval(function(){
          slides.element[idx].style.opacity = 0;
          idx = ++idx % slides.element.length;
          slides.element[idx].style.opacity = 1;
        }, options.duration);
        
        return this;
      }
      ,
      error:function( type ) 
      {         
        this.removeChilds();

        var header, detail, email;
        
        switch( type )
        {
          case "oldbrowser": 
          {
            header = "Aktuellen Browser verwenden";
            detail = "Ihr Browser ist zu alt. Die verwendeten Darstellungen k&ouml;nnen nur von den aktuellen Versionen der Browser <a href='http://chrome.google.com'>Chrome</a>, <a href='http://mozilla.org/firefox/'>Firefox</a>, <a href='http://windows.microsoft.com/de-ch/internet-explorer/download-ie'>Internet Explorer</a>, <a href='http://www.opera.com/de/''>Opera</a> oder <a href='www.apple.com/de/safari'>Safari</a> korrekt dargestellt werden.";
            break;
          }
          default: 
          {
            header = "Die Anfrage war leider fehlerhaft";
            detail = "Der Service ist aktuell nicht verf&uuml;gbar. Bitte versuchen Sie es sp&auml;ter noch einmal.";
            break;
          }
        }
        
        email = "Email: support@epha.ch";
        
        var display = this.add("div").addClass("error");
        display.add("h2").text( header );
        display.add("p").html(detail);
        display.add("p").text(email);
      }
	};
	
	window.DOModule = selector.prototype;
	
	window.DOM = selector;
	
})(this, document, undefined);
DOModule.setSlider = function( value )
{
  value = parseInt( value );
  
  if( window.device )
  {
    this.find("input").set("value", value);
  }
  else 
  { 
    var slider = this.find(".slider");    
    var thumb = slider.find("a");
    var hundert = slider.width() - thumb.width();
    // TODO slider.width() is 0 if container is display: none;
  
    thumb.style("left", parseInt(hundert * value / 100) + "px");
  }
};

DOModule.addSlider = function( callback )
{
  if( window.device )
  {
    var slider = this.add("input", { type: "range", min: 0, max: 100 });
    
    slider.on("change", function(data) {
      callback(data);
    });
  }
  else 
  {
      var slider = this.add("div").addClass("slider");
      var sliderArea = slider.parent().parent();
      var thumb = slider.add("a").addClass("knob");
    
      function onDrag(data)
      {
        var thumbWidth = thumb.width();      
        var hundert = slider.width() - (thumbWidth * 0.5);
        
        var value = parseInt((data.koord.clientX - thumbWidth)/ hundert * 100);
        value = Math.min(Math.max(value, 0), 100);
        thumb.style("left", parseInt(hundert * value / 100) + "px");

        callback( {"value":value} );
      }
    
      function onDragEnd()
      {
        slider.removeClass("dragging");
        sliderArea.off("touchmove");
        sliderArea.off("touchend");
        sliderArea.off("touchleave");
      }
    
      slider.on("touchstart", function(event)
      {
        onDrag(event);
        slider.addClass("dragging");
        sliderArea.on("touchmove", onDrag);
        sliderArea.on("touchend", onDragEnd);
        sliderArea.on("touchleave", onDragEnd);
      });
  }

  return this;
};

/*
      function onDrag(data)
      {
        var thumbWidth = thumb.width();      
        var hundert = slider.width() - (thumbWidth * 0.5);
        
        var value = parseInt((data.koord.clientX - thumbWidth)/ hundert * 100);
        value = Math.min(Math.max(value, 0), 100);
        thumb.style("left", parseInt(hundert * value / 100) + "px");
        
        console.log( data.koord.clientX, thumbWidth, hundert );
        
        callback(value);
      }
    
      function onDragEnd()
      {
        slider.removeClass("dragging");
        slider.off("touchmove");
        slider.off("touchend");
        slider.off("touchleave");
      }
    
      slider.on("touchstart", function(event)
      {
        onDrag(event);
        slider.addClass("dragging");
        slider.on("touchmove", onDrag);
        slider.on("touchend", onDragEnd);
        slider.on("touchleave", onDragEnd);
      });
      
*/
DOModule.datetimeBuild = function( params )
{
  this.removeChilds();
  
  for(var j = params.min; j <= params.max; j++)
  {
    // DAY AND MONTH AND HOUR AND MINUTES
    if( params.zeit <= 60 )
    {
      this.add("option").set("value",j).text( ( j < 10 ) ? "0" + j : j);
    
      if(params.zeit == j)
      this.child(j-1).set("selected","selected");
    }

    // YEAR
    if( params.zeit > 1900 )
    {
      if( params.zeit == j ) 
      this.add("option").set("value",j).text(j).set("selected","selected");
      
      else
      this.add("option").set("value",j);
    }
  }
};

DOModule.datetimeSet = function( ms )
{
  ms = parseInt( ms || new Date().getTime() );

  if( window.device && window.device.platform != "Android" )
  {
    this.find("input[type=date]").set("value", util.zeit("yyyy-MM-dd", ms));
    this.find("input[type=time]").set("value", util.zeit("hh:mm", ms));
  }
  else {   
    //DATE
    this.find(".dd").datetimeBuild( {  min:1, max:util.zeit("ddInMonth", ms), zeit:util.zeit("dd", ms) } );
    this.find(".MM").datetimeBuild( { min:1, max:12, zeit:util.zeit("MM", ms) } );
    this.find(".yyyy").datetimeBuild( {  min:2013, max:util.zeit("yyyy", ms), zeit:util.zeit("yyyy", ms) } );
    
    //TIME
    this.find(".hh").datetimeBuild( {  min:1, max:24, zeit:util.zeit("hh", ms) } );
    this.find(".mm").datetimeBuild( { min:1, max:60, zeit:util.zeit("mm", ms) } );
  }
};

DOModule.datetimeOff = function()
{
  if( window.device && window.device.platform != "Android" )
  {
    this.find("input[type=date]").set("disabled","disabled");
    this.find("input[type=time]").set("disabled","disabled");
  }
  else {
    this.find(".dd").set("disabled","disabled");
    this.find(".MM").set("disabled","disabled");
    this.find(".yyyy").set("disabled","disabled");
    //TIME
    this.find(".hh").set("disabled","disabled");
    this.find(".mm").set("disabled","disabled");
    //DATE
  }
};

DOModule.datetimeOn = function()
{
  if( window.device && window.device.platform != "Android" )
  {
    this.find("input[type=date]").removeAttrib("disabled");
    this.find("input[type=time]").removeAttrib("disabled");
  }
  else {
    this.find(".dd").removeAttrib("disabled");
    this.find(".MM").removeAttrib("disabled");
    this.find(".yyyy").removeAttrib("disabled");
    //TIME
    this.find(".hh").removeAttrib("disabled");
    this.find(".mm").removeAttrib("disabled");
    //DATE
  }
};

DOModule.datetimeCreate = function( callback ) 
{
  /*function hasInputType(typename) {
      var el = document.createElement("input");
      el.setAttribute("type", typename);
      return (el.type !== "text");
  }*/

  if( window.device && window.device.platform != "Android" )
  {
    function getHTML5DateTime(data)
    {
      // FIX IF NO SECONDS
      var time = ( hhmm.element.value.split(":").length == 2 ) ? hhmm.element.value +":00" : hhmm.element.value;
      // MAKE DATE
      var datetime = new Date(yyyymmdd.element.value + "T" + time);
      // CHECK DATE
      callback( (  datetime.getTime() > 0 ) ? datetime.getTime() : new Date().getTime() );
    }
    
    var yyyymmdd = this.add("input", { type: "date"}).addClass("optionen");
    var hhmm = this.add("input", { type: "time"}).addClass("optionen");
    
    yyyymmdd.on("change", getHTML5DateTime);
    hhmm.on("change", getHTML5DateTime);
  }
  else 
  {
     var that = this;
     
  
    function getDateTime()
    {
      return new Date
      (
          that.find(".yyyy option:checked").get("value"),
          that.find(".MM option:checked").get("value") - 1,
          that.find(".dd option:checked").get("value"),
          
          that.find(".hh option:checked").get("value"),
          that.find(".mm option:checked").get("value")
      )
      .getTime();     
    };
    // DATE
    var datumLabel = this.add("span").addClass("optionenLabel").html("<b>Datum</b>");
    
    
    var dd = this.add("select").addClass("dd optionen").on("change", function() 
    {  
      callback( getDateTime() );
    });
     
    var MM = this.add("select").addClass("MM optionen").on("change", function(data)
    {
      var ms = getDateTime();

      // RECALCULATE DAYS IN MONTH 
      that.find(".dd").datetimeBuild( { min:1, max:util.zeit("ddInMonth", ms), zeit:util.zeit("dd", ms) } );
      
      callback( ms );
    });
    
    var yyyy = this.add("select").addClass("yyyy optionen").on("change", function(data)
    {
      callback( getDateTime() );
    });
    // TIME
    var zeitLabel = this.add("span").addClass("optionenLabel").html("<b>Zeit</b>");
    
    var hh = this.add("select").addClass("hh optionen").on("change", function(data)
    {
      callback( getDateTime() );
    });
    
    var mm = this.add("select").addClass("mm optionen").on("change", function(data)
    {
      callback( getDateTime() );
    });
    
    if (DOM().device() == "tablet"){
      
      datumLabel.style("line-height", "35px");
      zeitLabel.style("line-height", "35px");
      
      if (window.device && window.device.platform == "Android"){
        
        datumLabel.style("line-height", "30px");
        zeitLabel.style("line-height", "30px");
        dd.style("line-height", "1em");
        MM.style("line-height", "1em");
        yyyy.style("line-height", "1em");
        hh.style("line-height", "1em");
        mm.style("line-height", "1em");
        
      }
    }
  }
};DOModule.legend = function( text )
{  
  this.find("legend").html( text );
};

DOModule.addListe = function() 
{  
  return this.add("ul").addClass("listeNext");
};

DOModule.addRow = function( params ) 
{  
  var item = this.add("li");
  
  if( params.data ) item.attrib("data", JSON.stringify( params.data ));
  
  return item.add("div").addClass("row")
          .add("div").addClass("row_caretLeft")
          .addNext("div").addClass("row_title") 
          .addNext("div").addClass("row_value")
          .addNext("div").addClass("row_caretRight")
          .parent()
        .addNext("p").addClass("row_detail")
      .parent()
      .fillRow( params );
};

// TODO EVENTHANDLER RAUS
DOModule.addRemovableRow = function( params ) {
  
  var item = this.add("li");
 
  var row = item.add("div").addClass("row")
      .add("div").addClass("row_caretLeft")
      .addNext("div").addClass("row_title");
  
  if (params.callback){
    var btn = row.addNext("div")
    .addClass("row_delete")
    .addClass("button")
    .addClass("grey")
    .text("✕"); // × ╳

    btn.on("touchstart", function(e){
      btn.text("Löschen")
        .addClass("red")
        .off("touchstart")
        .on("touchstart", function(){
          item.remove();
          params.callback();
        });
    });
    
  }
  
  item.fillRow(params);
  
  return item;
};

DOModule.fillRow = function( params ) {

    this.find(".row_title").add("span", {style:"font-size:100%;font-weight:bold;"}).html(params.title || "");
    
    if( params.zeit ) 
    this.find(".row_title").add("br").addNext("span", { style:"font-size:90%;"}).html(params.zeit);
    
    if( params.farbe )
    this.find(".row_value").style("background", params.farbe).html( params.value || ""); 
    
    this.find(".row_detail").html(params.detail || "");      
    
    // PROCEED TO 
    if( params.caretRight) {
      this.find(".row_caretRight").addSymbol("caretR");     
    }
    
    if( params.caretLeft ) {
      this.find(".row_caretLeft").addSymbol("caretL");           
    }
    
    return this;
} ;/**
  Copyright (C) 2013
              _                 _     
             | |               | |    
    ___ _ __ | |__   __ _   ___| |__  
   / _ \ '_ \| '_ \ / _` | / __| '_ \ 
  |  __/ |_) | | | | (_| || (__| | | |
   \___| .__/|_| |_|\__,_(_)___|_| |_|
       | |                            
       |_|        
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this 
  software and associated documentation files (the "Software"), to deal in the Software 
  without restriction, including without limitation the rights to use, copy, modify, merge, 
  publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
  to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or 
  substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
  FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.          
 */
var Svg = {

	line: function( params )
	{
		var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke", params.color || "white");
    line.setAttribute("stroke-width", params.strokeWidth || "1");
    line.setAttribute("x1", params.x1);
    line.setAttribute("y1", params.y1);
    line.setAttribute("x2", params.x2);
    line.setAttribute("y2", params.y2);
    
    if( params.className )
    line.setAttribute("class", params.className);
    
    if( params.data )
    line.setAttribute("data", JSON.stringify( params.data ) ); 
    
		return line;
	},
	label: function( params )
  {
		var labelX = document.createElementNS("http://www.w3.org/2000/svg", "text");
    		labelX.setAttribute("x", params.x);
    		labelX.setAttribute("dx", - params.text.length * 3);
    		labelX.setAttribute("y", params.y - 10);
    		labelX.setAttribute("fill", "rgba(255,255,255,1)");
    		labelX.setAttribute("font-size", "11pt");		
    		labelX.setAttribute("style", "background:blue");		
    		labelX.textContent = params.text; 
    		return labelX;
	},
	rect: function ( params )
	{
		var area = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		area.setAttribute("x", params.x);
		area.setAttribute("y", params.y);
		area.setAttribute("width", params.width);
		area.setAttribute("height", params.height);
	
		area.setAttribute("fill", params.fill || "");
		area.setAttribute("stroke", params.stroke || "");
	  area.setAttribute("stroke-width", "2");
	  
    if( params.className )
    area.setAttribute("class", params.className);
	  
    if( params.data )
    area.setAttribute("data", JSON.stringify( params.data ) ); 
    
    return area;
	},
  circle:function( params )
  {
    var kreis = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    kreis.setAttribute("fill", params.fill);
    kreis.setAttribute("stroke", params.stroke || "#FFFFFF" );
    kreis.setAttribute("stroke-width", params.strokeWidth || "0");
    // kreis.setAttribute("data", params.data || {});
    kreis.setAttribute("cx", params.x);
    kreis.setAttribute("cy", params.y);
    kreis.setAttribute("r", params.r);
    
    if( params.className )
    kreis.setAttribute("class", params.className);
    
    if( params.data ) kreis.setAttribute("data", JSON.stringify( params.data ) ); 
    
    return kreis;
  },
  polygon:function( params )
  {
    var poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("fill", params.fill);
    poly.setAttribute("points", params.points);
    return poly;
  },
  polyline:function( params )
  {
    var caret = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    caret.setAttribute("stroke",params.stroke);
    caret.setAttribute("stroke-width", params.strokeWidth);
    caret.setAttribute("fill", params.fill);
    caret.setAttribute("points", params.points);
    return caret;
  },
  path:function( params )
  {
    var grenze = document.createElementNS("http://www.w3.org/2000/svg", "path");
    grenze.setAttribute("fill",params.fill);
    grenze.setAttribute("stroke", params.stroke);
    grenze.setAttribute("stroke-width", params.strokeWidth);
    grenze.setAttribute("d",params.d);
    return grenze;
  },
  symbol:function() 
  {
    var sym = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sym.setAttribute("viewBox","0 0 60 60");
    sym.setAttribute("width","100%");
    sym.setAttribute("height","100%");
    return sym;
  },
  play : function() 
  {   
    var params = { "fill":"rgba(255,255,255,1)", "stroke":"rgba(204,204,204,0.8)","strokeWidth":"1" };
    params.d = "M 15 30 L 15 15 C 15 5, 20 6, 25 10 L 45 25 C 50 28, 50 32, 45 35 L 25 50 C 20 55, 15 54, 15 45 L 15 30 Z";
    
    var svg = this.symbol(); 
    svg.appendChild( this.path( params ) );
    return svg;
  },
  pause : function() 
  {
    var pauseIcon = this.symbol();
  
    var params = { "fill":"rgba(100,100,100,0.8)", "stroke":"#CCCCCC", "stroke-width":"2", "width":"20", "height":"40","y":"10" };
    params.x = "5";
    pauseIcon.appendChild( this.rect( params ) );
    params.x = "35";
    pauseIcon.appendChild( this.rect( params ) );
      
    return pauseIcon;
  },
  error : function() 
  {   
    var params = {
      fill:"rgba(255,255,255,0.8)",
      points:"15,15 20,15 30,25 40,15 45,15 45,20 35,30 45,40 45,45 40,45 30,35 20,45 15,45 15,40 25,30 15,20 15,15"
    };
    
    var svg = this.symbol(); 
    svg.appendChild( this.circle( {x:"30",y:"30",r:"27", fill:"rgba(255,55,55,0.6)", stroke:"#FFFFFF", "strokeWidth":0 } ) );
    svg.appendChild( this.polygon( params ) );                        
    return svg;
  },    
  caretL : function() 
  {   
    var params = { "stroke":"rgba(150,150,150,1)", "strokeWidth":"10","fill":"none" ,"points":"45,5 15,30 45,55" };
    
    var symbol = this.symbol();
    symbol.appendChild( this.polyline( params ) );
    return symbol;
  },
  caretR : function() 
  {   
    var params = { "stroke":"rgba(150,150,150,1)", "strokeWidth":"10","fill":"none" ,"points":"15,5 45,30 15,55" };
    
    var symbol = this.symbol();
    symbol.appendChild( this.polyline( params ) );
    return symbol;
  },
    /**
     * CLOSE BUTTON
     * @param percentSize
     * @returns svgElement
     */
    close: function(params){
      
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      
      if (!params) params = {};
      if (!params.fill) params.fill = "rgba(105, 105, 105, 0.8)";
      if (!params.stroke) params.stroke = "#fff";
      
      svg.setAttribute("viewBox", "0 0 60 60");
      svg.setAttribute("x", params.x || 0);
      svg.setAttribute("y", params.y || 0);
      svg.setAttribute("width", params.width || 60);
      svg.setAttribute("height", params.height || 60);
      
      if( params.right && params.top )
      {
        svg.style["position"] = "absolute";
        svg.style["right"] = params.right;
        svg.style["top"] = params.top; 
        svg.style["cursor"] = "pointer"; 
      }
      
      var kreis = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      kreis.setAttribute("fill", params.fill);
      kreis.setAttribute("stroke", params.stroke);
      kreis.setAttribute("stroke-width", "6");
      kreis.setAttribute("cx", "30");
      kreis.setAttribute("cy", "30");
      kreis.setAttribute("r", "27");
      svg.appendChild(kreis);
        
      var linie1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      linie1.setAttribute("fill", params.fill);
      linie1.setAttribute("stroke", params.stroke);
      linie1.setAttribute("stroke-width", "8");
      linie1.setAttribute("x1", "15");
      linie1.setAttribute("y1", "15");
      linie1.setAttribute("x2", "45");
      linie1.setAttribute("y2", "45");
      svg.appendChild(linie1);
      
      var linie2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      linie2.setAttribute("fill", params.fill);
      linie2.setAttribute("stroke", params.stroke);
      linie2.setAttribute("stroke-width", "8");
      linie2.setAttribute("x1", "45");
      linie2.setAttribute("y1", "15");
      linie2.setAttribute("x2", "15");
      linie2.setAttribute("y2", "45");
      svg.appendChild(linie2);

      return svg;
    },
  
    /**
     * FULLSCREEN
     * @returns
     */
    fullScreen : function() 
    {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox","0 0 60 60");
      svg.setAttribute("width","100%");
      svg.setAttribute("height","100%");
      
        var first = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          first.setAttribute("fill", "rgba(100,100,100,0.8)");
          first.setAttribute("stroke", "#CCCCCC" );
          first.setAttribute("stroke-width", "2");    
          first.setAttribute("x","15");
          first.setAttribute("y","15");
          first.setAttribute("width","30");
          first.setAttribute("height","30");          
    
          function bigger(evt) 
          {
            evt.target.setAttributeNS(null,"x","10");
            evt.target.setAttributeNS(null,"y","10");
            evt.target.setAttributeNS(null,"width","40");
            evt.target.setAttributeNS(null,"height","40");          
          }
    
          function smaller(evt) 
          {
            evt.target.setAttributeNS(null,"x","15");
            evt.target.setAttributeNS(null,"y","15");
            evt.target.setAttributeNS(null,"width","30");
            evt.target.setAttributeNS(null,"height","30");          
          }
    
        first.addEventListener("mouseover", bigger, false);
        first.addEventListener("mouseout", smaller, false);

      svg.appendChild(first);
      
      return svg;
    },
    

    /**
     * THUMBS UP
     * @param votes
     * @returns
     */
    likes : function(votes) 
    {   
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      
      svg.setAttribute("viewBox","0 0 70 50");
      svg.setAttribute("width","100%");
      svg.setAttribute("height","100%");
      
      var grenze = document.createElementNS("http://www.w3.org/2000/svg", "path");
      grenze.setAttribute("fill", "rgba(255,255,255,0.9)" );
      grenze.setAttribute("stroke", "rgba(204,204,204,0.8)" );
      grenze.setAttribute("stroke-width", "2");
      grenze.setAttribute("d","M23,8 L23,12 28,24 34,24 36,31 34,38 30,38 24,42 18,43" +
                  "C18,43 12,41 15,38 " +  // 5.Finger
                  "C15,38 10,36 14,32 " +  // 4.Finger
                  "C14,32  8,30 13,26 " +  // 3.Finger
                  "C13,26  6,19 20,21" +   // 2.Finger
                  "C20,21 14,6  21,8z");   // 1.Finger
      svg.appendChild(grenze);
      
      if(votes > 0)
      {
        var like = document.createElementNS("http://www.w3.org/2000/svg", "text");
        like.setAttribute("id","like");
        like.setAttribute("x","28");
        like.setAttribute("y","20");
        like.setAttribute("font-family", "Verdana");
        like.setAttribute("font-size", "12");
        like.setAttribute("fill", "rgba(204,204,204,0.8)" );
        like.textContent ="+"+votes;
        svg.appendChild(like);
      }
      
      return svg;
    }
};

DOModule.timeLegend = function( xMin, xMax, xStep, y, minInMs, xInMs ) {

  for(var x = xMin; x <= xMax; x += xStep )
  {
    var params = {
        x: x + xStep / 2,
        y: y,
        text: util.zeit( "dd.MM", minInMs + x * xInMs) 
    };
    
    this.add( Svg.label( params) );    
  }
};

DOModule.timeGrid = function( xMin, xMax, xStep, yMin, yMax, yStep, minInMs, xInMs) {

  var now = new Date().getTime();
  
  for(var x = xMin; x <= xMax + 1; x += xStep )
  {
      // Vertical Line
      this.add( Svg.line( { x1:x, y1:yMin, x2:x, y2:yMax, color: "rgba(255,255,255,1)"} ) ); 

      // Weekends
      if( util.zeit("weekend", minInMs + x * xInMs ) )
      this.add( Svg.rect( { x:x, y:yMin, width: xStep, height:yMax - yMin, fill:"rgba(255,255,255,0.3)" } ) );     
      
      // Today
      if( now >  minInMs + x * xInMs && now <  minInMs + x * xInMs + 86400000 )
      this.add( Svg.rect( { x:x, y:yMin, width: xStep, height:yMax - yMin, fill:"rgba(100,255,100,0.3)" } ) );  

  }       
  // Horizontal Line      
  for(var y = yMin; y <= yMax; y+= yStep) this.add( Svg.line( { x1:xMin, y1:y, x2:xMax,y2:y, color:"rgba(255,255,255,1)" } ) );

};

DOModule.drawSymptom = function( x, y, r, farbe, data )
{
  var circle = Svg.circle( { x:x, y:y, r:r, fill:farbe, strokeWidth:2, data:data, className:"movePoint"  } );
  
  return this.add( circle );
};

DOModule.drawNotizen = function(x, y, width, height, farbe, data )
{  
  return this.add( Svg.rect( { x:x, y:y, width: width, height:height, fill:farbe, stroke:"white", data:data, className:"movePoint"  } ) );  
};

DOModule.drawConnect = function( x1, y1, x2, y2, padding, farbwert )
{
  var x = (x2 - x1);
  var y = ((y2 - y1) >= 0) ? (y2 - y1) : (y1 - y2);
      
  var atan2 = Math.atan2(y, x);

  var xPad = ( Math.cos(atan2) * padding );
  var yPad = ( Math.sin(atan2) * padding );
  
  if( y2 < y1)
  {
    yPad = -1 * yPad;     
  }

  this.add( Svg.line( { x1:x1 + xPad, y1:y1 + yPad, x2:x2- xPad, y2:y2-yPad, strokeWidth:4, color:farbwert, className:"connectLine"}) );
};


DOModule.addSymbol = function(type, params){
  switch(type){    
    case "error": this.add( Svg.error() );      break;
    case "busy":  this.add( Svg.busy() );       break;
    case "play":  this.add( Svg.play() );       break;
    case "close": this.add( Svg.close(params) );  break;
    case "caretL": this.add( Svg.caretL() );    break;
    case "caretR": this.add( Svg.caretR() );    break;
  }
  return this;
};

// PROJEKT VERORDNUNG
DOModule.chartSchema = function( schemaArray, produkt )
{	
	var nodes = this.element.getElementsByTagName("rect");

	for( var n = nodes.length; n > 0 ; n--)
	{
		var data = JSON.parse( nodes[ n - 1 ].getAttribute("data") );
	
		if( !data || !produkt ) continue;
		
		if( data.EAN13 == produkt.EAN13) this.element.removeChild( nodes[ n - 1 ] );
	}
	
	var menge = parseInt( produkt.Menge );
	var verwendet = 0;
	
	for( var i = 0; i < menge && verwendet <= menge; i++ )
	{
		var x = (5 * Chart.stepInMs  / Chart.xInMs ) + ( i * Chart.stepInMs / Chart.xInMs );
		var y = 60;
		var width = 10;

		for( var j = 0; j < schemaArray.length && verwendet <= menge; j++)
		{
			var xSchema = x + ( schemaArray[j].zeit / 30 * Chart.stepInMs / Chart.xInMs );
			
			var height = ( parseInt( schemaArray[j].value ) * 0.25 ) * 30;
			
			verwendet += parseInt( schemaArray[j].value );
		

			if( verwendet <= menge )
			this.add( Chart.drawRectangel(xSchema, y - height, width, height, JSON.stringify( produkt ), "#cc5" ) );		
		}	
	}
};

// LOGO CONSILIUM
DOModule.addConsilium = function()
{
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox","0 0 160 90");
  svg.setAttribute("width","100%");
  svg.setAttribute("height","160");      
  
  svg.appendChild( Svg.circle( { x:20, y:45, r:10, fill:'white' } ) );
  svg.appendChild( Svg.line( { x1:20, y1:45, x2:60,y2:60,strokeWidth:5, color:'white' } ) );
  svg.appendChild( Svg.circle( { x:60, y:60, r:10, fill:'white' } ) );
  svg.appendChild( Svg.line( { x1:60, y1:60, x2:100,y2:30,strokeWidth:5, color:'white' } ) );
  svg.appendChild( Svg.circle( { x:100, y:30, r:10, fill:'white' } ) );
  svg.appendChild( Svg.line( { x1:100, y1:30, x2:140,y2:45,strokeWidth:5, color:'white' } ) );
  svg.appendChild( Svg.line( { x1:100, y1:30, x2:140,y2:45,strokeWidth:5, color:'white' } ) );
  svg.appendChild( Svg.circle( { x:140, y:45, r:10, fill:'white' } ) );
  
  
  this.add( svg );
  return this;
};



