/*
	@name: 			main.js

	@description:	core webgl functions

	@author:		Simon Jefford
	
*/
var object				= require("object"),
	utils				= require("/lib/webgl/core/utils"),
	vertex				= require("/lib/webgl/shaders/vertex.gl"),
	fragment			= require("/lib/webgl/shaders/fragment.gl"),
	gl,
	program,
	uniforms,
	attributes,
	objects,
	modelViewMatrix,
	perspectiveMatrix,
	createShader,
	createProgram,
	getContext,
	loadIdentity,
	multMatrix,
	mvTranslate,
	perspective,
	setMatrixUniforms,
	modelViewMatrixStack;



attributes = {};
uniforms = {};
objects = [];
modelViewMatrixStack = [];

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


createProgram = function() {

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

modelViewMatrixStack = [];

function mvPushMatrix(m) {
	if (m) {
		modelViewMatrixStack.push(m.dup());
		modelViewMatrix = m.dup();
	}
	else {
		modelViewMatrixStack.push(modelViewMatrix.dup());
	}
}

function mvPopMatrix() {
	if (modelViewMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	modelViewMatrix = modelViewMatrixStack.pop();
	return modelViewMatrix;
}


function loadIdentity() {
	modelViewMatrix = Matrix.I(4);
}


function multMatrix(m) {
	modelViewMatrix = modelViewMatrix.x(m);
}


function mvTranslate(v) {
	var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
	multMatrix(m);
}

function mvRotate(ang, v) {
	var arad = ang * Math.PI / 180.0;
	var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
	multMatrix(m);
}


function perspective(fovy, aspect, znear, zfar) {
	perspectiveMatrix = makePerspective(fovy, aspect, znear, zfar);
}


function setMatrixUniforms() {
	try {
		gl.uniformMatrix4fv(uniforms.uPMatrix, false, new Float32Array(perspectiveMatrix.flatten()));
		gl.uniformMatrix4fv(uniforms.uMVMatrix, false, new Float32Array(modelViewMatrix.flatten()));
	}
	catch(e) {
		alert(e)
	}
}


getContext = function(canvas) {

	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = parseFloat(canvas.style.width, 10);
		gl.viewportHeight = parseFloat(canvas.style.height, 10);

		canvas.addEventListener("webglcontextcreationerror", function(e) {
			console.error(e.statusMessage);
		}, false);
	}
	catch(e) {
		throw new Error("Could not initialise WebGL, sorry :-(");
	}

};

  function createRotationMatrix(angle, v) {
    var arad = angle * Math.PI / 180.0;
    return Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
  }


  var mouseDown = false;
  var lastMouseX = null;
  var lastMouseY = null;

  var moonRotationMatrix = Matrix.I(4);

  function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  }


  function handleMouseUp(event) {
    mouseDown = false;
  }

y = -30;
  function handleMouseMove(event) {
    if (!mouseDown) {
      return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX
    var newRotationMatrix = createRotationMatrix(deltaX / 10, [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    newRotationMatrix = newRotationMatrix.x(createRotationMatrix(deltaY / 10, [1, 0, 0]));

    moonRotationMatrix = newRotationMatrix.x(moonRotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
	y = newY;
  }


render = function() {

	var i;

	//	reset
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	perspective(45, gl.viewportWidth / gl.viewportHeight, 1, 10000.0);
	loadIdentity();

	//	move the camera
	mvRotate(0, [1, 0, 0]);
	mvRotate(-30, [0, 1, 0]);
	mvRotate(0, [0, 0, 1]);	
	mvTranslate([-30, -8, -30.0])

	multMatrix(moonRotationMatrix);

	//	render objects
	for(i = 0, l = objects.length; i < l; i++) {
		objects[i].render();
	}
};


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

		mvPushMatrix();

		mvTranslate(this.position);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(attributes.aVertexPosition, this.size, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.vertexAttribPointer(attributes.aVertexColour, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		gl.lineWidth(1);
		setMatrixUniforms();

		gl.drawElements(this.type, this.indices.length, gl.UNSIGNED_SHORT, 0);

		mvPopMatrix();

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

		mvPushMatrix();
		mvTranslate(this.position);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(attributes.aVertexPosition, this.size, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.vertexAttribPointer(attributes.aVertexColour, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		setMatrixUniforms();
		gl.drawElements(this.type, this.indices.length, gl.UNSIGNED_SHORT, 0);
		mvPopMatrix();

	}

};


exports.init = function(canvas) {

	getContext(canvas);
	createProgram();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

//*
	object.create(exports.line, {
		position: [0.0, 0.0, 0.0],
		vertices: [
	    	-1000000.0, 0.0, 0.0,
			1000000.0, 0.0, 0.0
		],
		colours: [1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0],
		size: 3,
		items: 2
	});
// */	
//*
	object.create(exports.line, {
		position: [0.0, 0.0, 0.0],
		vertices: [
	    	0.0, -1000000.0, 0.0,
			0.0, 1000000.0, 0.0
		],
		colours: [0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0],
		size: 3,
		items: 2
	});	
// */
//*
	object.create(exports.line, {
		position: [0.0, 0.0, 0.0],
		vertices: [
	    	0.0, 0.0, 1000000.0,
			0.0, 0.0, -1000000.0
		],
		colours: [0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0],
		size: 3,
		items: 2
	});	
// */

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;


	setInterval(render, 1000/60);
	
};

