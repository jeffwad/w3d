/*
	@name: 			main.js

	@description:	core webgl functions

	@author:		Simon Jefford
	
*/
var object				= require("object"),
	some				= require("iter").some,
	glMatrix			= require("/lib/webgl/core/glMatrix"),
	modelView			= require("/lib/webgl/core/modelView"),
	camera				= require("/lib/webgl/core/camera"),
	//line				= require("/lib/webgl/core/line"),
	//mesh				= require("/lib/webgl/core/mesh"),
	vec3				= glMatrix.vec3,
	mat4				= glMatrix.mat4,
	quat4				= glMatrix.quat4,
	degToRad			= glMatrix.degToRad,
	gl,
	program,
	uniforms,
	attributes,
	objects,
	createShader,
	createProgram,
	getContext,
	setMatrixUniforms,
	render;


//	we have no gl at this point
gl = false;

//	containers
attributes = {};
uniforms = {};
objects = [];


//	creates and compiles a shader from source
createShader = function(type, src) {

	var shader;

	//	create a shader	
	shader = gl.createShader(gl[type.toUpperCase() + "_SHADER"]);

	//	bind it's source and compile
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error("Could not create shader: " + type + ": " + gl.getShaderInfoLog(shader));
	}
	return shader;
	
};



setMatrixUniforms = function () {
	try {
		gl.uniformMatrix4fv(uniforms.uPMatrix, false, new Float32Array(camera.perspective));
		gl.uniformMatrix4fv(uniforms.uMVMatrix, false, new Float32Array(modelView.matrix));
	}
	catch(e) {
		alert(e)
	}
}


getContext = function(canvas) {

	if(!some(["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"], function(name) {
		try {
			gl = canvas.getContext(name);
			gl.viewportWidth = parseFloat(canvas.style.width, 10);
			gl.viewportHeight = parseFloat(canvas.style.height, 10);

			canvas.addEventListener("webglcontextcreationerror", function(e) {
				console.error(e.statusMessage);
			}, false);
		}
		catch(e) {}
		if(gl) {
	  		return true;
		}
		return false;
	})) {
		throw new Error("Could not initialise WebGL, sorry :-(");
	}

};



render = function() {

	requestAnimFrame(render);

	var i;

	//	reset
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//mat4.identity(modelView.matrix);
	camera.identity();

	//	move the camera to it's initial position
	camera.rotateY(-30);
	camera.translate([-30, -8, -30]);

	//	
	mat4.multiply(modelView.matrix, camera.rotation);

	//mat4.multiply(modelView.matrix, moonRotationMatrix);

	//	render objects
	for(i = 0, l = objects.length; i < l; i++) {
		objects[i].render();
	}
};


//	initialise gl
exports.init = function(canvas) {

	getContext(canvas);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

	camera.init(gl.viewportWidth, gl.viewportHeight);

};

//	creates a program, attaches the shaders, and links the program
exports.program = function(vertex, fragment) {

	//	create the prgram, attach the shaders and link
	program = gl.createProgram();

    gl.attachShader(program, createShader("vertex", vertex));
    gl.attachShader(program, createShader("fragment", fragment));
    gl.linkProgram(program);

	//	did it work
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error("Could not initialise shaders");
    }
	
	//	bind the current program
	gl.useProgram(program);

	//	get the attribute locations and enable their arrays
	attributes.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
	gl.enableVertexAttribArray(attributes.aVertexPosition);

	attributes.aVertexColour = gl.getAttribLocation(program, "aVertexColour");
    gl.enableVertexAttribArray(attributes.aVertexColour);

	//	get the uniform locations
	uniforms.uPMatrix = gl.getUniformLocation(program, "uPMatrix");
	uniforms.uMVMatrix = gl.getUniformLocation(program, "uMVMatrix");

};


exports.run = function() {
	render();
};

exports.camera = camera;

exports.line = {

	__init__: function() {

		this.type = gl.LINES;
		this.indices = [0, 1];
		//	vertices
		this.vBuffer = gl.createBuffer();
    	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		this.cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colours), gl.STATIC_DRAW);

		//	indexes
		this.iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

		objects.push(this);

	},

	render: function() {

		modelView.push();

		mat4.translate(modelView.matrix, this.position);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(attributes.aVertexPosition, this.size, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.vertexAttribPointer(attributes.aVertexColour, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		gl.lineWidth(1);
		setMatrixUniforms();

		gl.drawElements(this.type, this.indices.length, gl.UNSIGNED_SHORT, 0);

		modelView.pop();

	}

};

exports.mesh = {

	__init__: function() {

		this.type = gl.TRIANGLES;
	
		//	vertices
		this.vBuffer = gl.createBuffer();
    	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		//	colours
		this.cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colours), gl.STATIC_DRAW);

		//	indexes
		this.iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

		objects.push(this);

	},

	render: function() {

		modelView.push();
	
		mat4.translate(modelView.matrix, this.position);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(attributes.aVertexPosition, this.size, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.vertexAttribPointer(attributes.aVertexColour, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		setMatrixUniforms();
		gl.drawElements(this.type, this.indices.length, gl.UNSIGNED_SHORT, 0);

		modelView.pop();

	}

};

//exports.line = line;
//exports.mesh = mesh;

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();




