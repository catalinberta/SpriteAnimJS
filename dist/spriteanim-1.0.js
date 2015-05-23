function SpriteAnim(canvasId) {
	// Canvas
	this.canvas = document.getElementById(canvasId); // Select given canvas ID
	this.context = this.canvas.getContext("2d"); // Get context
	// Start method
	this.start = function(spriteObj) {
		this.spriteObj = spriteObj;
		this.canvas.width = this.spriteObj.frameWidth; // Set canvas width
		this.canvas.height = this.spriteObj.frameHeight; // Set canvas width

		// Sprite Info
		this.width = this.spriteObj.image.width; // Sprite total width
		this.height = this.spriteObj.image.height; // Sprite total height
		this.image = this.spriteObj.image; // Sprite image

		// FPS stuff
		this.fps = this.spriteObj.fps;
		this.timestamp_init = Date.now(); // Before execution of ticker
		this.interval = 1000 / this.fps; // Frame's interval in ms 
		this.timestamp_now, this.delta; // Vars
		
		// Frame stuff
		this.horizontalframeIndex = 0; // Frame index
		this.verticalFrameIndex = 0;
		this.horizontalFrames = (this.width / spriteObj.frameWidth) || 1; // Horizontal frames
		this.verticalFrames = (this.height / spriteObj.frameHeight) || 1; // Vertical frames

		this.loopSprite = this.spriteObj.loop || false; // If should loop boolean
		this.playSprite = true; // Play state boolean

		// Add classname, if specified
		if(spriteObj.className) {
			if(this.canvas.className) { // If class attribute already exists
				this.canvas.className = this.canvas.className + ' ' + spriteObj.className; // Add new class(es) along the existing one(s)
			} else {
				this.canvas.className = spriteObj.className; // Add new specified class(es) 
			}
		}

		this.onStart(); //onStart callback function
	}

	// Stop method
	this.stop = function() {
		this.playSprite = false;
		this.context.clearRect(0, 0, this.width, this.height);
	}

	// On start callback
	this.onStart = function() {
		this.ticker();
		if(this.spriteObj.onStart) {
			this.spriteObj.onStart();
		}
	};

	// On complete callback
	this.onComplete = function() {
		if(this.spriteObj.onComplete) {
			this.spriteObj.onComplete();
		}
	};

	// New tick update
	this.update = function () {
        if (this.horizontalframeIndex < this.horizontalFrames) {	
        	this.horizontalframeIndex += 1;    
        	this.draw();
        } else {
        	if(this.verticalFrameIndex < this.verticalFrames) {
	        	this.verticalFrameIndex += 1;
	        	this.horizontalframeIndex = 1;
	        	this.draw();
	       	} else {
	       		if(this.loopSprite) {
	       			this.verticalFrameIndex = 1;
	        		this.horizontalframeIndex = 1;
	        		this.draw();
	       		} else {
	       			this.stop();
	       		}
	       		this.onComplete();
	       	}
        }
	};

	// Draw new frame
	this.draw = function() {
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.drawImage(
		this.image,
		(this.horizontalframeIndex-1) * this.width / this.horizontalFrames,
		(this.verticalFrameIndex-1) * this.height / this.verticalFrames,
		this.width / this.horizontalFrames,
		this.height,
		0,
		0,
		this.width / this.horizontalFrames,
		this.height);
	};

	// Ticker
	this.ticker = function() {
		if(this.playSprite) {
			window.requestAnimationFrame(this.ticker.bind(this));
			this.timestamp_now = Date.now();
		    this.delta = this.timestamp_now - this.timestamp_init;
		    if (this.delta > this.interval) {
		    	this.timestamp_init = this.timestamp_now - (this.delta % this.interval);
				this.update();
			}
		}
	};
	
}