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
var tdl = tdl || {};


tdl.webgl = tdl.webgl || {};

gl = null;

tdl.webgl.setupWebGL = function(canvas, opt_attribs, opt_onError) {

  opt_onError = opt_onError;

  if (canvas.addEventListener) {
    canvas.addEventListener("webglcontextcreationerror", function(event) {
          opt_onError(event.statusMessage);
        }, false);
  }
  var context = tdl.webgl.create3DContext(canvas, opt_attribs);
  if (context) {
    if (canvas.addEventListener) {
      canvas.addEventListener("webglcontextlost", function(event) {
        //tdl.log("call tdl.webgl.handleContextLost");
        event.preventDefault();
        tdl.webgl.handleContextLost(canvas);
      }, false);
      canvas.addEventListener("webglcontextrestored", function(event) {
        //tdl.log("call tdl.webgl.handleContextRestored");
        tdl.webgl.handleContextRestored(canvas);
      }, false);
    }
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLRenderingContext} The created context.
 */
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

    // Disallow selection by default. This keeps the cursor from changing to an
    // I-beam when the user clicks and drags.  It's easier on the eyes.
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

/**
 * Given an extension name like WEBGL_compressed_texture_s3tc
 * returns the supported version extension, like
 * WEBKIT_WEBGL_compressed_teture_s3tc
 * @param {string} name Name of extension to look for
 * @return {WebGLExtension} The extension or undefined if not
 *     found.
 */
tdl.webgl.getExtensionWithKnownPrefixes = function(name) {
  for (var ii = 0; ii < tdl.webgl.browserPrefixes_.length; ++ii) {
    var prefixedName = tdl.webgl.browserPrefixes_[ii] + name;
    var ext = gl.getExtension(prefixedName);
    if (ext) {
      return ext;
    }
  }
};

/**
 * Provides requestAnimationFrame in a cross browser way.
 * @param {function(RequestAnimationEvent): void} callback. Callback that will
 *        be called when a frame is ready.
 * @param {!Element} element Element to request an animation frame for.
 * @return {number} request id.
 */
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

function init() {
  canvas = document.getElementById('canvas');
  gl = tdl.webgl.setupWebGL(canvas, { antialias: false });
  if (!gl)
    return;

  spriteSystem = new SpriteSystem();

  winresize();
  lastTime = new Date().getTime() * 0.001;
  

  atlas.onload = start;

  atlas.addSpriteSheet('boom', {url: 'images/explosion.png', frames: 59,
                                spritesPerRow: 8,
                                width: 256, height: 256});



  atlas.startLoading();
}

function start() {
  atlas.getSpriteSheet(0).createSprite(spriteSystem);
  render();
}


function render() {
  tdl.webgl.requestAnimationFrame(render, canvas);
  var now = new Date().getTime() * 0.001;
  var deltaT = now - lastTime;
  console.log(deltaT)

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
  canvas.width = 500;//browserWidth;
  canvas.height = 500;//browserHeight;
  spriteSystem.setScreenSize(500, 500);
}
