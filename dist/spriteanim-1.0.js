function SpriteAnim(canvasId) {
	// Canvas
	this.canvas = document.getElementById(canvasId); // Select given canvas ID

	// Start method
	this.start = function(spriteObj) {
		// If support for WebGL is enabled
		if(this.webgl_support(this.canvas)) {
			this.webgl(spriteObj);
			return;
		}
		// Fallback to canvas
		this.context = this.canvas.getContext("2d"); // Get context

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

/*
 * Copyright 2011, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

SpriteAnim.prototype.webgl_support = function(canvas) {
	var names = ["webgl", "experimental-webgl"];
	var context = null;
	for (var ii = 0; ii < names.length; ++ii) {
		try {
			context = canvas.getContext(names[ii]);
		} catch(e) {}
		if (context) {
			break;
		}
	}
	if (context) {
		return true;
	}
}
SpriteAnim.prototype.webgl = function(spriteObj) {
	var tdl = tdl || {};
	tdl.webgl = tdl.webgl || {};
	gl = null;

	tdl.webgl.create3DContext = function(canvas, opt_attribs) {
		if (opt_attribs === undefined) {
			opt_attribs = {alpha:false};
			tdl.misc.applyUrlSettings(opt_attribs, 'webgl');
		}
		var names = ["webgl", "experimental-webgl"];
		var context = null;
		for (var ii = 0; ii < names.length; ++ii) {
			try {
				context = canvas.getContext(names[ii], opt_attribs);
			} catch(e) {}
			if (context) {
				break;
			}
		}
		if (context) {
			gl = context;
			if (!canvas.tdl) {
				canvas.tdl = {};
			}

			context.tdl = {};
			context.tdl.depthTexture = tdl.webgl.getExtensionWithKnownPrefixes("WEBGL_depth_texture");

			function returnFalse() {
				return false;
			}

			canvas.onselectstart = returnFalse;
			canvas.onmousedown = returnFalse;
		}
		return context;
	};

	/**
	 * Browser prefixes for extensions.
	 * @type {!Array.<string>}
	 */
	tdl.webgl.browserPrefixes_ = [
	"",
	"MOZ_",
	"OP_",
	"WEBKIT_"
	];

	tdl.webgl.getExtensionWithKnownPrefixes = function(name) {
		for (var ii = 0; ii < tdl.webgl.browserPrefixes_.length; ++ii) {
			var prefixedName = tdl.webgl.browserPrefixes_[ii] + name;
			var ext = gl.getExtension(prefixedName);
			if (ext) {
				return ext;
			}
		}
	};

	tdl.webgl.requestAnimationFrame = function(callback, element) {
		if (!tdl.webgl.requestAnimationFrameImpl_) {
			tdl.webgl.requestAnimationFrameImpl_ = function() {
				var functionNames = [
				"requestAnimationFrame",
				"webkitRequestAnimationFrame",
				"mozRequestAnimationFrame",
				"oRequestAnimationFrame",
				"msRequestAnimationFrame"
				];
				for (var jj = 0; jj < functionNames.length; ++jj) {
					var functionName = functionNames[jj];
					if (window[functionName]) {
			  			//tdl.log("using ", functionName);
			 			return function(name) {
						  	return function(callback, element) {
						  		return window[name].call(window, callback, element);
						  	};
			  			}(functionName);
					}
				}
				tdl.log("using window.setTimeout");
				return function(callback, element) {
					return window.setTimeout(callback, 1000 / 70);
				};
			}();
		}
		return tdl.webgl.requestAnimationFrameImpl_(callback, element);
	};


	var atlas = new SpriteAtlas();
	var canvas;
	var lastTime;
	var spriteSystem;
	var fpsTimer;
	var fpsElem;
	var countElements = [];

	var browserWidth;
	var browserHeight;


	canvas = document.getElementById('canvas');
	gl = tdl.webgl.create3DContext(canvas, {antialias: false})
	if (!gl)
		return;
	spriteSystem = new SpriteSystem(spriteObj);

	winresize();
	lastTime = new Date().getTime() * 0.001;


	atlas.onload = start;

	atlas.addSpriteSheet('boom', {url: 'images/explosion.png', frames: 59,
		spritesPerRow: 8,
		width: 256, height: 256});

	atlas.startLoading();

	function start() {
		atlas.spriteSheets_[0].createSprite(spriteSystem);
		render();
	}


	function render() {
		tdl.webgl.requestAnimationFrame(render, canvas);
		var now = new Date().getTime() * 0.001;
		var deltaT = now - lastTime;

		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		spriteSystem.draw(atlas, 0);
		lastTime = now;
	}

	// The following code snippets were borrowed basically verbatim from JSGameBench.

	function getWindowSize() {
		var width = 0;
		var height = 0;

		if (typeof(window.innerWidth) == 'number') {
			width = window.innerWidth;
			height = window.innerHeight;
		} else if (window.document.documentElement &&
			(window.document.documentElement.clientWidth ||
				window.document.documentElement.clientHeight)) {
			width = window.document.documentElement.clientWidth;
			height = window.document.documentElement.clientHeight;
		} else if (window.document.body &&
			(window.document.body.clientWidth ||
				window.document.body.clientHeight)) {
			width = window.document.body.clientWidth;
			height = window.document.body.clientHeight;
		}

		browserWidth = width;
		browserHeight = height;
	}

	function winresize() {
		getWindowSize();
		canvas.width = 200;//browserWidth;
		canvas.height = 200;//browserHeight;
		spriteSystem.setScreenSize(200, 200);
	}
}
function SpriteAtlas() {
	this.onload = null;
	this.numOutstandingRequests_ = 0;
	this.spriteSheets_ = [];
	this.textures_ = [];
	this.currentTextureUnit_ = 0;
}

SpriteAtlas.prototype.addSpriteSheet = function(name, params) {
	this.spriteSheets_.push(new SpriteSheet(this, name, params));
};

SpriteAtlas.prototype.startLoading = function() {
	var len = this.spriteSheets_.length;
	this.numOutstandingRequests_ = len;
	for (var ii = 0; ii < len; ++ii) {
		this.spriteSheets_[ii].startLoading();
	}
};

SpriteAtlas.prototype.spriteSheetLoaded_ = function(sheet, image, params) {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

	sheet.initialize(this.currentTextureUnit_, image.width, image.height);
	this.textures_[this.currentTextureUnit_] = texture;
	++this.currentTextureUnit_;

	if (--this.numOutstandingRequests_ == 0) {
		if (this.onload) {
			this.onload();
		}
	}
};
function SpriteSheet(atlas, name, params) {
	this.atlas_ = atlas;
	this.name_ = name;
	this.params_ = params;
	this.textureUnit_ = 0;
	this.perSpriteFrameOffset_ = 0;
}

SpriteSheet.prototype.startLoading = function() {
	var that = this;
	var image = new Image();
	this.image_ = image;
	image.onload = function() {
		that.onload_();
	};
	image.src = this.params_.url;
};

SpriteSheet.prototype.initialize = function(textureUnit, width, height) {
	this.textureUnit_ = textureUnit;
	this.textureWidth_ = width;
	this.textureHeight_ = height;
};

SpriteSheet.prototype.createSprite = function(system) {
	var screenWidth = system.screenWidth();
	var screenHeight = system.screenHeight();
	// Position the sprite at a random position
	var centerX = Math.random() * screenWidth;
	var centerY = Math.random() * screenHeight;
	// And at a random rotation
	var rotation = Math.random() * 2.0 * Math.PI;
	// Random velocity
	var velocityX = Math.random() * (screenWidth / 5.0) - screenWidth / 10.0;
	var velocityY = Math.random() * (screenHeight / 5.0) - screenHeight / 10.0;
	var perSpriteFrameOffset = this.perSpriteFrameOffset_++;
	if (this.perSpriteFrameOffset_ >= this.params_.frames) {
		this.perSpriteFrameOffset_ = 0;
	}
	// Generalize the sprite size to vec2 if sprites are non-square.
	var spriteSize = this.params_.width;
	var spriteTextureSizeX = (1.0 * this.params_.width) / this.textureWidth_;
	var spriteTextureSizeY = (1.0 * this.params_.height) / this.textureHeight_;
	var spritesPerRow = this.params_.spritesPerRow;
	var numFrames = this.params_.frames;
	var textureWeights = [ 0.0, 0.0, 0.0, 0.0 ];
	textureWeights[this.textureUnit_] = 1.0;
	system.addSprite(centerX, centerY,
		rotation,
		velocityX, velocityY,
		perSpriteFrameOffset,
		spriteSize,
		spriteTextureSizeX, spriteTextureSizeY,
		spritesPerRow,
		numFrames,
		textureWeights);
};

SpriteSheet.prototype.onload_ = function() {
	this.atlas_.spriteSheetLoaded_(this, this.image_, this.params_);
};
// "options" is a JavaScript object containing key/value pairs. The
// current options the sprite system watches for are:
//   slow: [true|false]   Whether to use the legacy bandwidth-intensive shader for comparison purposes.
function SpriteSystem(options) {
	SpriteSystem.initialize_();
	this.options = options;
	this.dumpOffsets();
	this.loadProgram_(options);
	this.frameOffset_ = 0;
	this.spriteBuffer_ = gl.createBuffer();
	this.clearAllSprites();
}

SpriteSystem.prototype.clearAllSprites = function() {
	// Might as well choose an even multiple of 6, which is the number
	// of vertices per sprite
	this.resizeCapacity_(120, false);
	this.frameOffset_ = 0;
	this.numVertices_ = 0;
	this.precisePositionView_ = null;
};

SpriteSystem.prototype.loadProgram_ = function(options) {
	var fragmentShaderName = (options && options['slow']) ? 'slowSpriteFragmentShader' : 'spriteFragmentShader';
	var vertexShader = loadShader(document.getElementById('spriteVertexShader').text, gl.VERTEX_SHADER);
	var fragmentShader = loadShader(document.getElementById(fragmentShaderName).text, gl.FRAGMENT_SHADER);
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
	this.program_ = program;

	this.frameOffsetLoc_ = gl.getUniformLocation(program, "u_frameOffset");
	this.screenDimsLoc_ = gl.getUniformLocation(program, "u_screenDims");

	this.centerPositionLoc_ = gl.getAttribLocation(program, "centerPosition");
	this.rotationLoc_ = gl.getAttribLocation(program, "rotation");
	this.perSpriteFrameOffsetLoc_ = gl.getAttribLocation(program, "perSpriteFrameOffset");
	this.spriteSizeLoc_ = gl.getAttribLocation(program, "spriteSize");
	this.cornerOffsetLoc_ = gl.getAttribLocation(program, "cornerOffset");
	this.spriteTextureSizeLoc_ = gl.getAttribLocation(program, "spriteTextureSize");
	this.spritesPerRowLoc_ = gl.getAttribLocation(program, "spritesPerRow");
	this.numFramesLoc_ = gl.getAttribLocation(program, "numFrames");
	this.textureWeightsLoc_ = gl.getAttribLocation(program, "textureWeights");

	this.texture0Loc_ = gl.getUniformLocation(program, "u_texture0");
	this.texture1Loc_ = gl.getUniformLocation(program, "u_texture1");
	this.texture2Loc_ = gl.getUniformLocation(program, "u_texture2");
	this.texture3Loc_ = gl.getUniformLocation(program, "u_texture3");
};

	SpriteSystem.prototype.resizeCapacity_ = function(capacity, preserveOldContents) {
	// Capacity is actually specified in vertices.
	var oldPositionData = null;
	var oldConstantData = null;
	var oldStartPositionData = null;
	var oldVelocityData = null;
	var oldSpriteSizeData = null;
	if (preserveOldContents) {
		oldPositionData = this.positionData_;
		oldConstantData = this.constantData_;
		oldStartPositionData = this.startPositionData_;
		oldVelocityData = this.velocityData_;
		oldSpriteSizeData = this.spriteSizeData_;
	}

	this.capacity_ = capacity;
	this.positionData_ = new Float32Array(2 * capacity);
	this.constantData_ = new Float32Array(SpriteSystem.constantAttributeStride_ * capacity);
	this.startPositionData_ = new Array(2 * capacity);
	this.velocityData_ = new Array(2 * capacity);
	this.spriteSizeData_ = new Array(capacity);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer_);
	gl.bufferData(gl.ARRAY_BUFFER,
		Float32Array.BYTES_PER_ELEMENT * (this.positionData_.length + this.constantData_.length),
		gl.DYNAMIC_DRAW);

	if (preserveOldContents) {
		this.positionData_.set(oldPositionData);
		this.constantData_.set(oldConstantData);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positionData_);
		gl.bufferSubData(gl.ARRAY_BUFFER, Float32Array.BYTES_PER_ELEMENT * this.positionData_.length, this.constantData_);

		for (var ii = 0; ii < oldStartPositionData.length; ++ii) {
			this.startPositionData_[ii] = oldStartPositionData[ii];
		}
		for (var ii = 0; ii < oldVelocityData.length; ++ii) {
			this.velocityData_[ii] = oldVelocityData[ii];
		}
		for (var ii = 0; ii < oldSpriteSizeData.length; ++ii) {
			this.spriteSizeData_[ii] = oldSpriteSizeData[ii];
		}
	}
};

// These offsets are in units of floating-point numbers.
SpriteSystem.constantAttributeInfo_ = [
	{ size: 1, offset: 0 }, // Rotation
	{ size: 1, offset: 0 }, // Per-sprite frame offset
	{ size: 1, offset: 0 }, // Sprite size
	{ size: 2, offset: 0 }, // Corner offset
	{ size: 2, offset: 0 }, // Sprite texture size
	{ size: 1, offset: 0 }, // Sprites per row
	{ size: 1, offset: 0 }, // Num frames
	{ size: 4, offset: 0 }  // Texture weights
];
SpriteSystem.constantAttributeStride_ = 0;

SpriteSystem.ROTATION_INDEX = 0;
SpriteSystem.PER_SPRITE_FRAME_OFFSET_INDEX = 1;
SpriteSystem.SPRITE_SIZE_INDEX = 2;
SpriteSystem.CORNER_OFFSET_INDEX = 3;
SpriteSystem.SPRITE_TEXTURE_SIZE_INDEX = 4;
SpriteSystem.SPRITES_PER_ROW_INDEX = 5;
SpriteSystem.NUM_FRAMES_INDEX = 6;
SpriteSystem.TEXTURE_WEIGHTS_INDEX = 7;

SpriteSystem.offsetForIndex = function(index) {
	return SpriteSystem.constantAttributeInfo_[index].offset;
};

SpriteSystem.initialized_ = false;

SpriteSystem.initialize_ = function() {
	if (SpriteSystem.initialized_)
		return;
	var constantAttributeInfo = SpriteSystem.constantAttributeInfo_;
	var cumulativeOffset = 0;
	for (var ii = 0; ii < constantAttributeInfo.length; ++ii) {
		constantAttributeInfo[ii].offset = cumulativeOffset;
		cumulativeOffset += constantAttributeInfo[ii].size;
	}
	SpriteSystem.constantAttributeStride_ = cumulativeOffset;  
	SpriteSystem.initialized_ = true;
};

SpriteSystem.prototype.dumpOffsets = function() {
	var constantAttributeInfo = SpriteSystem.constantAttributeInfo_;
	for (var ii = 0; ii < constantAttributeInfo.length; ++ii) {
	}
};

SpriteSystem.offsets_ = [
	[-0.5, -0.5],
	[-0.5,  0.5],
	[ 0.5, -0.5],
	[ 0.5, -0.5],
	[-0.5,  0.5],
	[ 0.5,  0.5]
];

SpriteSystem.prototype.setScreenSize = function(width, height) {
	this.screenWidth_ = width;
	this.screenHeight_ = height;
};

SpriteSystem.prototype.screenWidth = function() {
	return this.screenWidth_;
};

SpriteSystem.prototype.screenHeight = function() {
	return this.screenHeight_;
};

SpriteSystem.prototype.addSprite = function(centerX, centerY,
	rotation,
	velocityX, velocityY,
	perSpriteFrameOffset,
	spriteSize,
	spriteTextureSizeX, spriteTextureSizeY,
	spritesPerRow,
	numFrames,
	textureWeights) {
	var offsets = SpriteSystem.offsets_;
	for (var ii = 0; ii < offsets.length; ++ii) {
		this.addVertex_(centerX, centerY,
			rotation,
			velocityX, velocityY,
			perSpriteFrameOffset,
			spriteSize,
			offsets[ii][0], offsets[ii][1],
			spriteTextureSizeX, spriteTextureSizeY,
			spritesPerRow,
			numFrames,
			textureWeights);
	}
};

SpriteSystem.prototype.setupConstantLoc_ = function(location, index) {
	if (location == -1)
	return; // Debugging
	var baseOffset = Float32Array.BYTES_PER_ELEMENT * this.positionData_.length;
	var constantStride = SpriteSystem.constantAttributeStride_;
	var constantAttributeInfo = SpriteSystem.constantAttributeInfo_;
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location,
		constantAttributeInfo[index].size, gl.FLOAT, false,
		constantStride * Float32Array.BYTES_PER_ELEMENT,
		baseOffset + Float32Array.BYTES_PER_ELEMENT * constantAttributeInfo[index].offset);
};

SpriteSystem.prototype.draw = function(atlas, deltaTime) {
	gl.enable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	// Recompute all sprites' positions. Wrap around offscreen.
	var numVertices = this.numVertices_;
	for (var ii = 0; ii < numVertices; ++ii) {
		var newPosX = this.startPositionData_[0] ;
		var newPosY = this.startPositionData_[0];

		var spriteSize = this.spriteSizeData_[ii];
		if (newPosX > canvas.width + 1.1 * spriteSize) {
			newPosX = -spriteSize;
		} else if (newPosX < -1.1 * spriteSize) {
			newPosX = canvas.width + spriteSize;
		}
		if (newPosY > canvas.height + 1.1 * spriteSize) {
			newPosY = -spriteSize;
		} else if (newPosY < -1.1 * spriteSize) {
			newPosY = canvas.height + spriteSize;
		}

		// this.startPositionData_[0] = 0;
		// this.startPositionData_[2 * ii + 1] = 0;
		this.positionData_[2 * ii] = 111;
		this.positionData_[2 * ii + 1] = 111;

	}

	// Upload all sprites' positions.
	gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer_);
	if (!this.precisePositionView_ || this.precisePositionView_.length != 2 * numVertices) {
		this.precisePositionView_ = this.positionData_.subarray(0, 2 * numVertices);
	}
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.precisePositionView_);

	// Bind all textures.
	for (var ii = 0; ii < atlas.currentTextureUnit_; ++ii) {
		gl.activeTexture(gl.TEXTURE0 + ii);
		gl.bindTexture(gl.TEXTURE_2D, atlas.textures_[ii]);
	}

	// Prepare to draw.
	gl.useProgram(this.program_);

	// Set up streams.
	gl.enableVertexAttribArray(this.centerPositionLoc_);
	gl.vertexAttribPointer(this.centerPositionLoc_, 2, gl.FLOAT, false, 0, 0);
	this.setupConstantLoc_(this.rotationLoc_, SpriteSystem.ROTATION_INDEX);
	this.setupConstantLoc_(this.perSpriteFrameOffsetLoc_, SpriteSystem.PER_SPRITE_FRAME_OFFSET_INDEX);
	this.setupConstantLoc_(this.spriteSizeLoc_, SpriteSystem.SPRITE_SIZE_INDEX);
	this.setupConstantLoc_(this.cornerOffsetLoc_, SpriteSystem.CORNER_OFFSET_INDEX);
	this.setupConstantLoc_(this.spriteTextureSizeLoc_, SpriteSystem.SPRITE_TEXTURE_SIZE_INDEX);
	this.setupConstantLoc_(this.spritesPerRowLoc_, SpriteSystem.SPRITES_PER_ROW_INDEX);
	this.setupConstantLoc_(this.numFramesLoc_, SpriteSystem.NUM_FRAMES_INDEX);
	this.setupConstantLoc_(this.textureWeightsLoc_, SpriteSystem.TEXTURE_WEIGHTS_INDEX);

	if(this.frameOffset_ == 0) {
		if(this.options.onStart) {
			this.options.onStart();
		}
	}

	if(this.frameOffset_ == atlas.spriteSheets_[0].params_.frames) {
		this.frameOffset_ = -1;
		if(this.options.onComplete) {
			this.options.onComplete();
		}
	}

	// Set up uniforms.
	gl.uniform1f(this.frameOffsetLoc_, this.frameOffset_++);
	gl.uniform4f(this.screenDimsLoc_,
		2.0 / this.screenWidth_,
		-2.0 / this.screenHeight_,
		-1.0,
		1.0);
	// FIXME: query atlas for the number of textures.
	gl.uniform1i(this.texture0Loc_, 0);
	gl.uniform1i(this.texture1Loc_, 1);
	gl.uniform1i(this.texture2Loc_, 2);
	gl.uniform1i(this.texture3Loc_, 3);

	// Do the draw call.
	gl.drawArrays(gl.TRIANGLES, 0, this.numVertices_);
};

SpriteSystem.prototype.addVertex_ = function(centerX, centerY,
	rotation,
	velocityX, velocityY,
	perSpriteFrameOffset,
	spriteSize,
	cornerOffsetX, cornerOffsetY,
	spriteTextureSizeX, spriteTextureSizeY,
	spritesPerRow,
	numFrames,
	textureWeights) {
	if (this.numVertices_ == this.capacity_) {
		this.resizeCapacity_(this.capacity_ * 2, true);
	}

	var vertexIndex = this.numVertices_;
	++this.numVertices_;

	this.positionData_[2 * vertexIndex    ] = centerX;
	this.positionData_[2 * vertexIndex + 1] = centerY;
	this.startPositionData_[2 * vertexIndex    ] = centerX;
	this.startPositionData_[2 * vertexIndex + 1] = centerY;
	this.velocityData_[2 * vertexIndex    ] = velocityX;
	this.velocityData_[2 * vertexIndex + 1] = velocityY;
	this.spriteSizeData_[vertexIndex] = spriteSize;

	// Base index into the constant data
	var baseIndex = SpriteSystem.constantAttributeStride_ * vertexIndex;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.ROTATION_INDEX)] = rotation;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.PER_SPRITE_FRAME_OFFSET_INDEX)] = perSpriteFrameOffset;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.SPRITE_SIZE_INDEX)] = spriteSize;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.CORNER_OFFSET_INDEX)    ] = cornerOffsetX;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.CORNER_OFFSET_INDEX) + 1] = cornerOffsetY;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.SPRITE_TEXTURE_SIZE_INDEX)    ] = spriteTextureSizeX;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.SPRITE_TEXTURE_SIZE_INDEX) + 1] = spriteTextureSizeY;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.SPRITES_PER_ROW_INDEX)] = spritesPerRow;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.NUM_FRAMES_INDEX)] = numFrames;
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.TEXTURE_WEIGHTS_INDEX)    ] = textureWeights[0];
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.TEXTURE_WEIGHTS_INDEX) + 1] = textureWeights[1];
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.TEXTURE_WEIGHTS_INDEX) + 2] = textureWeights[2];
	this.constantData_[baseIndex + SpriteSystem.offsetForIndex(SpriteSystem.TEXTURE_WEIGHTS_INDEX) + 3] = textureWeights[3];

	// Upload the changes to the constant data immediately, since we
	// won't touch it again.
	gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer_);
	gl.bufferSubData(gl.ARRAY_BUFFER,
		Float32Array.BYTES_PER_ELEMENT * (this.positionData_.length + baseIndex),
		this.constantData_.subarray(baseIndex, baseIndex + SpriteSystem.constantAttributeStride_));
};


function loadShader(shaderSource, shaderType) {
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	return shader;
}