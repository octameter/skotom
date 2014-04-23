var App = {

  initialize: function() {
    // 0.AUGMENT
    kontify(this);

    // 2.CONTROL
    Controller.init();
    this.bind();
    Controller.dispatch(Controller.SETUP, '')
    
    // 3.VIEW
    
    Home.init();

    // 1.MODEL
    Model.init();
    
  },

  bind: function() {
    Controller.on(Controller.SETUP, function() {


      
        Controller.dispatch(Controller.START, '');
    
    });

  }

};

var Controller = {
  //EVENT: 'EVENT',
  HOME: 'HOME',
  SETUP: 'SETUP',
  START: 'START',
  END: 'END',
  COMPLETE: 'COMPLETE',

  // ENVIROMENT
  init: function(domain) {
    // AUGMENT
    eventify(this);
    // BINDING
    this.bind();

  },
  // BINDING 
  bind: function() {
    DOM(document).on('click', function(e){
    	Controller.dispatch(Controller.HOME, e);
    })
  }

};



var Model = {
  that: this,
  // RESOUCES
  
  init: function() {
    
  },

  data: {}

  
};

/**
 * VIEWS

 */
var Nav = {

  container: DOM("NAV"),
  init: function() {
  	this.bind()
  },

  bind: function() {
    
  },

  update: function() {

  },
  done: function() {
    
  }
};


var Home = {

  container: DOM("output"),
  init: function() {
  	testify(this)
  	this.bind()

  },

  bind: function() {
    Controller.on(Controller.HOME, function(e){
    	console.warn('jaa gedrückt!', e)
    	Home.startTest(e.koord.offsetX, e.koord.offsetY)
    })


  },

  update: function() {

  },
  done: function() {
    
  },







};

var Test = {

  container: DOM("TEST"),
  init: function() {

  },

  bind: function() {
    
  },

  update: function() {

  },
  done: function() {
    
  }
};

var Result = {

  container: DOM("RESULT"),
  init: function() {

  },

  bind: function() {
    
  },

  update: function() {

  },
  done: function() {
    
  }
};

var About = {

  container: DOM("ABOUT"),
  init: function() {

  },

  bind: function() {
    
  },

  update: function() {

  },
  done: function() {
    
  }
};


var testify = function(that){

	that.startTest = function(mouseX, mouseY){
		log('Start Text at x', mouseX, 'y', mouseY)
		this.x0 = mouseX;
		this.y0 = mouseY;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		var kreis = Svg.circle({
			strokeWidth: 1,
			fill: 'none',
			stroke: 'black',
			x: this.x0,
			y: this.y0,
			r: 100
			
		})
		DOM('output').append(kreis)

		.append(Svg.line({
			color: 'black',
			strokeWidth: 1,
			x1: this.x0,
			y1: this.y0 + 5,
			x2: this.x0, 
			y2: this.y0-5
		}))
		.append(Svg.line({
			color: 'black',
			strokeWidth: 1,
			x1: this.x0 + 5,
			y1: this.y0,
			x2: this.x0-5, 
			y2: this.y0
		}))
		//from Top
		.append(Svg.line({
			color: 'black',
			strokeWidth: 1,
			x1: this.x0,
			y1: 0,
			x2: this.x0, 
			y2: this.y0 -20,
		}))
		//from Bottom
		
		.append(Svg.line({
			color: 'black',
			strokeWidth: 1,
			x1: this.x0,
			y1: this.height,
			x2: this.x0, 
			y2: this.y0 +20,
		}))

		//from Left
		.append(Svg.line({
			color: 'black',
			strokeWidth: 1,
			x1: 0,
			y1: this.y0,
			x2: this.x0 - 20, 
			y2: this.y0 ,
		}))
		//from Right
		.append(Svg.line({
			color: 'black',
			strokeWidth: 1,
			x1: this.x0 + 20,
			y1: this.y0,
			x2: this.width, 
			y2: this.y0 ,
		}))



		this.checkTop();

	}
	that.stepTop = 0;
	that.stopped = false;
	that.checkTop = function(){
		 
		document.addEventListener('keydown', t)

		var t = function(e){
			console.log(e.keyCode)
			if(e.keyCode == 32){
				console.log('pressed space btn')
				this.stopped = true;
				
			}
		}


		 DOM('output')

		 .append(Svg.line({
			color: 'red',
			strokeWidth: 6,
			x1: that.x0,
			y1: that.stepTop,
			x2: that.x0, 
			y2: that.stepTop+6,

		}))

		 that.stepTop += 10;

		 if(that.stepTop >= that.y0 || that.stopped){
		 	return true
		 }
		 else{
		 	setTimeout(arguments.callee, 500)

		 }

	}

}





function log(){
  if(DEBUG){
    console.log.apply(console,arguments);
  }    
}

var DEBUG = true;





