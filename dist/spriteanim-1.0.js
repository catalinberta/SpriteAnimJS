function SpriteAnim(canvasId) {
	// Canvas
	this.canvas = document.getElementById(canvasId); // Select given canvas ID
	this.context = this.canvas.getContext("2d"); // Get context

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
		this.timestamp_init = Date.now(); // Before ticker starts
		this.interval = 1000 / this.fps; // Frame's interval in ms 
		this.timestamp_now, this.delta; // Vars
		
		// Frame stuff
		this.frameIndex = 0; // Frame index
		this.numberOfFrames = (this.width / spriteObj.frameWidth) || 1; // Number of the spritesheet's total frames (horizontally for now, stay tuned)
		this.loopSprite = this.spriteObj.loop || false; // If should loop boolean
		this.playSprite = true; // Play state boolean

		this.onStart(); //onStart callback function
	}

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

	this.update = function () {
		this.draw();

        if (this.frameIndex < this.numberOfFrames - 1) {	
            this.frameIndex += 1;
        } else {
            if(this.loopSprite) {
            	this.frameIndex = 0;
            } else {
            	this.playSprite = false;
            }
            this.onComplete();
        }
	};
	this.draw = function() {
		this.context.clearRect(0, 0, this.width, this.height);

		this.context.drawImage(
		this.image,
		this.frameIndex * this.width / this.numberOfFrames,
		0,
		this.width / this.numberOfFrames,
		this.height,
		0,
		0,
		this.width / this.numberOfFrames,
		this.height);
	};

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