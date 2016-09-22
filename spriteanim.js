/*******************************************************************************************
* SpriteAnim v0.1.7 (beta)
* Author: Catalin Berta
* E-mail: catalinberta (at) gmail (dot) com
* Documentation: https://github.com/catalinberta/SpriteAnimJS
* Most of the awesome webgl support is from: http://webglsamples.org
*******************************************************************************************/
(function(window) {
	"use strict";
	var SpriteAnim = function(canvasId,forceCanvas) {
		this.canvas = document.getElementById(canvasId); // Select given canvas ID
		this.useCanvas = forceCanvas || false;
		this.init();
	}
	// Get type of context
	SpriteAnim.prototype.init = function() {
		if(this.useCanvas) { // Manually force 2d Canvas
			this.context = this.canvas.getContext("2d"); // Get 2D context
		} else {
			if(this.webgl_support(this.canvas)) { // If WebGL is supported
				this.context = this.create3DContext(this.canvas);  // Get 3D context
				if(!document.getElementById('spriteAnimFragmentShader')) {
					this.injectShaders();
				}
			} else {
				this.context = this.canvas.getContext("2d"); // Fallback to 2D context
				this.useCanvas = true;
			}
		}
	}
	// Start method
	SpriteAnim.prototype.start = function(spriteObj) {
		this.spriteObj = spriteObj;
		this.onStart(); // onStart callback function

		// Add classname, if specified
		if(spriteObj.className) {
			if(this.canvas.className) { // If class attribute already exists
				this.canvas.className = this.canvas.className + ' ' + spriteObj.className; // Add new class(es) along the existing one(s)
			} else {
				this.canvas.className = spriteObj.className; // Add new specified class(es) 
			}
		}
		// Sprite Info
		this.width = this.spriteObj.frameWidth; // Set canvas width
		this.height = this.spriteObj.frameHeight; // Set canvas width
		this.totalWidth = this.spriteObj.image.width; // Sprite total width
		this.totalHeight = this.spriteObj.image.height; // Sprite total height
		this.image = this.spriteObj.image; // Sprite image

		this.canvas.width = this.width; // Set canvas width
		this.canvas.height = this.height; // Set canvas width
		// Frame stuff
		this.horizontalframeIndex = 0; // Frame index
		this.verticalFrameIndex = 0;
		this.horizontalFrames = (this.totalWidth / spriteObj.frameWidth) || 1; // Horizontal frames
		this.verticalFrames = (this.totalHeight / spriteObj.frameHeight) || 1; // Vertical frames
		// FPS stuff
		this.fps = this.spriteObj.fps || 30;
		this.timestamp_init = Date.now(); // Before execution of ticker
		this.interval = 1000 / this.fps; // Frame's interval in ms 
		this.timestamp_now, this.delta; // Vars
		this.loopSprite = this.spriteObj.loop || false; // If should loop boolean
		this.playSprite = true; // Play state boolean
		// If support for WebGL is enabled, jump to webgl section
		if(!this.useCanvas) {
			this.webglStart(spriteObj);
			return;
		}
		this.canvasTicker(); // Start ticker
	}
	// Stop method
	SpriteAnim.prototype.stop = function() {
		this.playSprite = false;
		// If support for WebGL is enabled, jump to webgl section
		if(this.webgl_support(this.canvas)) {
			this.webglStop();
			return;
		}
		this.context.clearRect(0, 0, this.totalWidth, this.totalHeight);
	}
	// New tick update
	SpriteAnim.prototype.canvasUpdate = function () {
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
	// On start callback
	SpriteAnim.prototype.onStart = function() {
		if(this.spriteObj.onStart) {
			this.spriteObj.onStart();
		}
	};
	// On complete callback
	SpriteAnim.prototype.onComplete = function() {
		if(this.spriteObj.onComplete) {
			this.spriteObj.onComplete();
		}
	};
	// Draw new frame
	SpriteAnim.prototype.draw = function() {
		this.context.clearRect(0, 0, this.totalWidth, this.totalHeight);
		this.context.drawImage(
			this.image,
			(this.horizontalframeIndex-1) * this.totalWidth / this.horizontalFrames,
			(this.verticalFrameIndex-1) * this.totalHeight / this.verticalFrames,
			this.totalWidth / this.horizontalFrames,
			this.totalHeight,
			0,
			0,
			this.totalWidth / this.horizontalFrames,
			this.totalHeight);
	};
	// Ticker
	SpriteAnim.prototype.canvasTicker = function() {
		if(this.playSprite) {
			window.requestAnimationFrame(this.canvasTicker.bind(this));
			this.timestamp_now = Date.now();
			this.delta = this.timestamp_now - this.timestamp_init;
			if (this.delta > this.interval) {
				this.timestamp_init = this.timestamp_now - (this.delta % this.interval);
				this.canvasUpdate();
			}
		}
	};
	SpriteAnim.prototype.injectShaders = function() {
		// Vertex Shader
		var vertexShader   = document.createElement("script");
		vertexShader.type  = "x-shader/x-vertex";
		vertexShader.id = "spriteAnimVertexShader";
		vertexShader.text = 'uniform float u_frameOffset; uniform vec4 u_screenDims; attribute vec2 centerPosition; attribute float perSpriteFrameOffset; attribute float spriteWidth; attribute float spriteHeight; attribute vec2 cornerOffset; attribute vec2 spriteTextureSize; attribute float spritesPerRow; attribute float numFrames; attribute vec4 textureWeights; varying vec2 v_texCoord; varying vec4 v_textureWeights;  void main() { float frameNumber = mod(u_frameOffset + perSpriteFrameOffset, numFrames); float row = floor(frameNumber / spritesPerRow);  vec2 upperLeftTC = vec2(spriteTextureSize.x * (frameNumber - (row * spritesPerRow)), spriteTextureSize.y * row);vec2 tc = upperLeftTC + spriteTextureSize * (cornerOffset + vec2(0.5, 0.5));v_texCoord = tc; v_textureWeights = textureWeights; vec2 scaledOffset = vec2(spriteWidth,spriteHeight) * cornerOffset; vec2 pos = centerPosition + 1.0 * scaledOffset; gl_Position = vec4(pos * u_screenDims.xy + u_screenDims.zw, 1.0, 1.0); }';
		document.body.appendChild(vertexShader);
		// Fragment Shader
		var fragmentShader   = document.createElement("script");
		fragmentShader.type  = "x-shader/x-fragment";
		fragmentShader.id = "spriteAnimFragmentShader";
		fragmentShader.text  = "precision mediump float; uniform sampler2D u_texture0; uniform sampler2D u_texture1; uniform sampler2D u_texture2; uniform sampler2D u_texture3; varying vec2 v_texCoord; varying vec4 v_textureWeights; void main() { vec4 color; if (v_textureWeights.x > 0.0) color = texture2D(u_texture0, v_texCoord); else if (v_textureWeights.y > 0.0) color = texture2D(u_texture1, v_texCoord); else if (v_textureWeights.z > 0.0) color = texture2D(u_texture2, v_texCoord); else color = texture2D(u_texture3, v_texCoord); gl_FragColor = color; }"
		document.body.appendChild(fragmentShader);
	}
	SpriteAnim.prototype.webglStart = function(spriteObj) {
		var that = this;
		this.onload = null;
		this.spriteSheets_ = [];
		this.textures_ = [];
		this.currentTextureUnit_ = 0;

		this.context.pixelStorei(this.context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		this.context.enable(this.context.BLEND);
		this.context.disable(this.context.DEPTH_TEST);
		this.context.disable(this.context.CULL_FACE);
		this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);

		//SpriteSystem
		this.constantAttributeInfo_ = [
			{ size: 1, offset: 0 }, // Rotation
			{ size: 1, offset: 0 }, // Per-sprite frame offset
			{ size: 1, offset: 0 }, // Sprite size
			{ size: 2, offset: 0 }, // Corner offset
			{ size: 2, offset: 0 }, // Sprite texture size
			{ size: 1, offset: 0 }, // Sprites per row
			{ size: 1, offset: 0 }, // Num frames
			{ size: 4, offset: 0 }  // Texture weights
		];
		this.initialize_ = function() {
			if (this.initialized_)
				return;
			var constantAttributeInfo = this.constantAttributeInfo_;
			var cumulativeOffset = 0;
			for (var ii = 0; ii < constantAttributeInfo.length; ++ii) {
				constantAttributeInfo[ii].offset = cumulativeOffset;
				cumulativeOffset += constantAttributeInfo[ii].size;
			}
			this.constantAttributeStride_ = cumulativeOffset;  
			this.initialized_ = true;
		};
		this.constantAttributeStride_ = 0;

		this.SPRITE_HEIGHT_INDEX = 0;
		this.PER_SPRITE_FRAME_OFFSET_INDEX = 1;
		this.SPRITE_WIDTH_INDEX = 2;
		this.CORNER_OFFSET_INDEX = 3;
		this.SPRITE_TEXTURE_SIZE_INDEX = 4;
		this.SPRITES_PER_ROW_INDEX = 5;
		this.NUM_FRAMES_INDEX = 6;
		this.TEXTURE_WEIGHTS_INDEX = 7;

		this.initialize_();
		this.sysLoadProgram_(this.spriteObj);
		this.frameOffset_ = 0;
		this.spriteBuffer_ = this.context.createBuffer();
		this.sysClearAllSprites();

		this.offsets_ = [
			[-0.5, -0.5],
			[-0.5,  0.5],
			[ 0.5, -0.5],
			[ 0.5, -0.5],
			[-0.5,  0.5],
			[ 0.5,  0.5]
		];

		this.initialized_ = false;
		this.screenWidth_ = this.width;
		this.screenHeight_ = this.height;

		this.onload = this.spriteSheetCreateSprite;
		//addSpriteSheet
		this.params_ = {frames: this.horizontalFrames*this.verticalFrames, spritesPerRow: this.horizontalFrames, width: this.width, height: this.height};
		this.textureUnit_ = 0;
		this.perSpriteFrameOffset_ = 0;
		this.spriteSheets_.push(this);
		
		var texture = this.context.createTexture();
		this.context.bindTexture(this.context.TEXTURE_2D, texture);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, this.image);

		this.textureUnit_ = this.currentTextureUnit_;
		this.textureWidth_ = this.image.width;
		this.textureHeight_ = this.image.height;
		this.textures_[this.currentTextureUnit_] = texture;
		++this.currentTextureUnit_;
		if (this.onload) {
			this.onload();
		}
	}
	SpriteAnim.prototype.webglStop = function() {
		this.playSprite = false;
		this.sysDraw('clear');
	}
	SpriteAnim.prototype.webgl_support = function(canvas) {
		var names = ["webgl", "experimental-webgl"];
		var context = null;
		for (var ii = 0; ii < names.length; ++ii) {
			try {
				context = this.canvas.getContext(names[ii]);
			} catch(e) {}
			if (context) {
				break;
			}
		}
		if (context) {
			return true;
		}
	}
	SpriteAnim.prototype.create3DContext = function(canvas) {
		var names = ["webgl", "experimental-webgl"];
		var context = null;
		for (var ii = 0; ii < names.length; ++ii) {
			try {
				context = this.canvas.getContext(names[ii]);
			} catch(e) {}
			if (context) {
				break;
			}
		}
		if (context) {
			this.context = context;
			if (!this.canvas.tdl) {
				this.canvas.tdl = {};
			}
			context.tdl = {};
			context.tdl.depthTexture = this.getExtensionWithKnownPrefixes("WEBGL_depth_texture");
		}
		return context;
	};
	SpriteAnim.prototype.getExtensionWithKnownPrefixes = function(name) {
		this.browserPrefixes_ = [
			"",
			"MOZ_",
			"OP_",
			"WEBKIT_"
		];
		for (var ii = 0; ii < this.browserPrefixes_.length; ++ii) {
			var prefixedName = this.browserPrefixes_[ii] + name;
			var ext = this.context.getExtension(prefixedName);
			if (ext) {
				return ext;
			}
		}
	};
	SpriteAnim.prototype.spriteSheetCreateSprite = function() {
		var screenWidth = this.canvas.width;
		var screenHeight = this.canvas.height;
		// Position the sprite
		var centerX = 0;
		var centerY = 0;
		var perSpriteFrameOffset = this.perSpriteFrameOffset_++;
		if (this.perSpriteFrameOffset_ >= this.params_.frames) {
			this.perSpriteFrameOffset_ = 0;
		}
		// Generalize the sprite size to vec2 if sprites are non-square.
		var spriteHeight = this.params_.height;
		var spriteWidth = this.params_.width;
		var spriteTextureSizeX = (1.0 * this.params_.width) / this.textureWidth_;
		var spriteTextureSizeY = (1.0 * this.params_.height) / this.textureHeight_;
		var spritesPerRow = this.params_.spritesPerRow;
		var numFrames = this.params_.frames;
		var textureWeights = [ 0.0, 0.0, 0.0, 0.0 ];
		textureWeights[this.textureUnit_] = 1.0;
		for (var ii = 0; ii < this.offsets_.length; ++ii) {
			this.sysAddVertex_(centerX, centerY,perSpriteFrameOffset,spriteHeight,spriteWidth,this.offsets_[ii][0],this.offsets_[ii][1],spriteTextureSizeX,
				spriteTextureSizeY,spritesPerRow,numFrames,textureWeights);
		}
		this.webglTicker();
	};
	SpriteAnim.prototype.sysLoadShader = function(shaderSource, shaderType) {
		var shader = this.context.createShader(shaderType);
		this.context.shaderSource(shader, shaderSource);
		this.context.compileShader(shader);
		var compiled = this.context.getShaderParameter(shader, this.context.COMPILE_STATUS);
		return shader;
	}
	SpriteAnim.prototype.sysClearAllSprites = function() {
		// Might as well choose an even multiple of 6, which is the number
		// of vertices per sprite
		this.sysResizeCapacity_(120, false);
		this.frameOffset_ = 0;
		this.numVertices_ = 0;
		this.precisePositionView_ = null;
	};
	SpriteAnim.prototype.sysLoadProgram_ = function(options) {
		var fragmentShaderName = 'spriteAnimFragmentShader';
		var vertexShader = this.sysLoadShader(document.getElementById('spriteAnimVertexShader').text, this.context.VERTEX_SHADER);
		var fragmentShader = this.sysLoadShader(document.getElementById(fragmentShaderName).text, this.context.FRAGMENT_SHADER);
		var program = this.context.createProgram();
		this.context.attachShader(program, vertexShader);
		this.context.attachShader(program, fragmentShader);
		this.context.linkProgram(program);
		var linked = this.context.getProgramParameter(program, this.context.LINK_STATUS);
		this.context.deleteShader(vertexShader);
		this.context.deleteShader(fragmentShader);
		this.program_ = program;
		this.frameOffsetLoc_ = this.context.getUniformLocation(program, "u_frameOffset");
		this.screenDimsLoc_ = this.context.getUniformLocation(program, "u_screenDims");
		this.centerPositionLoc_ = this.context.getAttribLocation(program, "centerPosition");
		this.spriteHeightLoc_ = this.context.getAttribLocation(program, "spriteHeight");
		this.perSpriteFrameOffsetLoc_ = this.context.getAttribLocation(program, "perSpriteFrameOffset");
		this.spriteWidthLoc_ = this.context.getAttribLocation(program, "spriteWidth");
		this.cornerOffsetLoc_ = this.context.getAttribLocation(program, "cornerOffset");
		this.spriteTextureSizeLoc_ = this.context.getAttribLocation(program, "spriteTextureSize");
		this.spritesPerRowLoc_ = this.context.getAttribLocation(program, "spritesPerRow");
		this.numFramesLoc_ = this.context.getAttribLocation(program, "numFrames");
		this.textureWeightsLoc_ = this.context.getAttribLocation(program, "textureWeights");
		this.texture0Loc_ = this.context.getUniformLocation(program, "u_texture0");
		this.texture1Loc_ = this.context.getUniformLocation(program, "u_texture1");
		this.texture2Loc_ = this.context.getUniformLocation(program, "u_texture2");
		this.texture3Loc_ = this.context.getUniformLocation(program, "u_texture3");
	};
	SpriteAnim.prototype.sysResizeCapacity_ = function(capacity) {
		// Capacity is actually specified in vertices.
		this.capacity_ = capacity;
		this.positionData_ = new Float32Array(2 * capacity);
		this.constantData_ = new Float32Array(this.constantAttributeStride_ * capacity);
		this.startPositionData_ = new Array(2 * capacity);
		this.spriteHeightData_ = new Array(capacity);
		this.spriteWidthData_ = new Array(capacity);
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.spriteBuffer_);
		this.context.bufferData(this.context.ARRAY_BUFFER,
			Float32Array.BYTES_PER_ELEMENT * (this.positionData_.length + this.constantData_.length),
			this.context.DYNAMIC_DRAW);
	};
	SpriteAnim.prototype.sysSetupConstantLoc_ = function(location, index) {
		if (location == -1)
		return; // Debugging
		var baseOffset = Float32Array.BYTES_PER_ELEMENT * this.positionData_.length;
		var constantStride = this.constantAttributeStride_;
		var constantAttributeInfo = this.constantAttributeInfo_;
		this.context.enableVertexAttribArray(location);
		this.context.vertexAttribPointer(location,
			constantAttributeInfo[index].size, this.context.FLOAT, false,
			constantStride * Float32Array.BYTES_PER_ELEMENT,
			baseOffset + Float32Array.BYTES_PER_ELEMENT * constantAttributeInfo[index].offset);
	};
	SpriteAnim.prototype.sysDraw = function() {
		// Reset frame index
		if(this.frameOffset_ == this.spriteSheets_[0].params_.frames) {
			if(this.loopSprite) {
				this.frameOffset_ = -1;
				if(this.spriteObj.onComplete) {
					this.spriteObj.onComplete();
				}
			} else {
				this.playSprite = false;
				return;
			}
		}
		
		// Recompute all sprites' positions. Wrap around offscreen.
		var numVertices = this.numVertices_;
		for (var i = 0; i < numVertices; ++i) {
			this.positionData_[2 * i] = this.width / 2;
			this.positionData_[2 * i + 1] = this.height / 2;
		}
		// Upload all sprites' positions.
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.spriteBuffer_);
		if (!this.precisePositionView_ || this.precisePositionView_.length != 2 * numVertices) {
			this.precisePositionView_ =  this.positionData_.subarray(0, 2 * numVertices);
		}
		this.context.bufferSubData(this.context.ARRAY_BUFFER, 0, this.precisePositionView_);
		// Bind all textures.
		for (var ii = 0; ii < this.currentTextureUnit_; ++ii) {
			this.context.activeTexture(this.context.TEXTURE0 + ii);
			this.context.bindTexture(this.context.TEXTURE_2D, this.textures_[ii]);
		}
		// Prepare to draw.
		this.context.useProgram(this.program_);
		// Set up streams.
		this.context.enableVertexAttribArray(this.centerPositionLoc_);
		this.context.vertexAttribPointer(this.centerPositionLoc_, 2, this.context.FLOAT, false, 0, 0);
		this.sysSetupConstantLoc_(this.spriteHeightLoc_, this.SPRITE_HEIGHT_INDEX);
		this.sysSetupConstantLoc_(this.perSpriteFrameOffsetLoc_, this.PER_SPRITE_FRAME_OFFSET_INDEX);
		this.sysSetupConstantLoc_(this.spriteWidthLoc_, this.SPRITE_WIDTH_INDEX);
		this.sysSetupConstantLoc_(this.cornerOffsetLoc_, this.CORNER_OFFSET_INDEX);
		this.sysSetupConstantLoc_(this.spriteTextureSizeLoc_, this.SPRITE_TEXTURE_SIZE_INDEX);
		this.sysSetupConstantLoc_(this.spritesPerRowLoc_, this.SPRITES_PER_ROW_INDEX);
		this.sysSetupConstantLoc_(this.numFramesLoc_, this.NUM_FRAMES_INDEX);
		this.sysSetupConstantLoc_(this.textureWeightsLoc_, this.TEXTURE_WEIGHTS_INDEX);
		// Set up uniforms.
		this.context.uniform1f(this.frameOffsetLoc_, this.frameOffset_++);
		this.context.uniform4f(this.screenDimsLoc_,
			2.0 / this.canvas.width,
			-2.0 / this.canvas.height,
			-1.0,
			1.0);
		this.context.uniform1i(this.texture0Loc_, 0);
		this.context.uniform1i(this.texture1Loc_, 1);
		this.context.uniform1i(this.texture2Loc_, 2);
		this.context.uniform1i(this.texture3Loc_, 3);
		// Do the draw call.
		this.context.drawArrays(this.context.TRIANGLES, 0, this.numVertices_);
	};
	SpriteAnim.prototype.sysAddVertex_ = function(centerX, centerY,perSpriteFrameOffset,spriteHeight,spriteWidth,cornerOffsetX, cornerOffsetY,
		spriteTextureSizeX,spriteTextureSizeY,spritesPerRow,numFrames,textureWeights) {
		if (this.numVertices_ == this.capacity_) {
			this.sysResizeCapacity_(this.capacity_ * 2, true);
		}
		var vertexIndex = this.numVertices_;
		++this.numVertices_;
		// Base index into the constant data
		var baseIndex = this.constantAttributeStride_ * vertexIndex;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.SPRITE_HEIGHT_INDEX].offset] = spriteHeight;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.PER_SPRITE_FRAME_OFFSET_INDEX].offset] = perSpriteFrameOffset;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.SPRITE_WIDTH_INDEX].offset] = spriteWidth;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.CORNER_OFFSET_INDEX].offset] = cornerOffsetX;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.CORNER_OFFSET_INDEX].offset + 1] = cornerOffsetY;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.SPRITE_TEXTURE_SIZE_INDEX].offset] = spriteTextureSizeX;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.SPRITE_TEXTURE_SIZE_INDEX].offset + 1] = spriteTextureSizeY;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.SPRITES_PER_ROW_INDEX].offset] = spritesPerRow;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.NUM_FRAMES_INDEX].offset] = numFrames;
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.TEXTURE_WEIGHTS_INDEX].offset] = textureWeights[0];
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.TEXTURE_WEIGHTS_INDEX].offset + 1] = textureWeights[1];
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.TEXTURE_WEIGHTS_INDEX].offset + 2] = textureWeights[2];
		this.constantData_[baseIndex + this.constantAttributeInfo_[this.TEXTURE_WEIGHTS_INDEX].offset + 3] = textureWeights[3];
		// Upload the changes
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.spriteBuffer_);
		this.context.bufferSubData(this.context.ARRAY_BUFFER,
			Float32Array.BYTES_PER_ELEMENT * (this.positionData_.length + baseIndex),
			this.constantData_.subarray(baseIndex, baseIndex + this.constantAttributeStride_));
	};
	SpriteAnim.prototype.webglTicker = function() {
		if(this.playSprite) {
			window.requestAnimationFrame(this.webglTicker.bind(this));
			this.timestamp_now = Date.now();
			this.delta = this.timestamp_now - this.timestamp_init;
			if (this.delta > this.interval) {
				this.context.viewport(0, 0, this.width, this.height);
				this.context.clearColor(0.0, 0.0, 0.0, 0);
				this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
				this.sysDraw();
				this.timestamp_init = this.timestamp_now - (this.delta % this.interval);
			}
		}
	}
	window.SpriteAnim = SpriteAnim;
})(window);