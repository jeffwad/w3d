

define("/lib/webgl/core/camera",

	["/lib/webgl/core/glMatrix","/lib/webgl/core/modelView"],

	function(require, exports, module) {

		var	glMatrix			= require("/lib/webgl/core/glMatrix"),
			modelView			= require("/lib/webgl/core/modelView"),
			vec3				= glMatrix.vec3,
			mat4				= glMatrix.mat4,
			quat4				= glMatrix.quat4,
			degToRad			= glMatrix.degToRad,
			matrix;
		
		matrix = mat4.create();
		
		exports.matrix = matrix;
		
		var mouseDown = false;
		var lastMouseX = null;
		var lastMouseY = null;
		
		var moonRotationMatrix = mat4.create();
		mat4.identity(moonRotationMatrix);
		
		function handleMouseDown(event) {
		    mouseDown = true;
		    lastMouseX = event.clientX;
		    lastMouseY = event.clientY;
		}
		
		
		function handleMouseUp(event) {
		    mouseDown = false;
		}
		
		
		function handleMouseMove(event) {
		    if (!mouseDown) {
		        return;
		    }
		    var newX = event.clientX;
		    var newY = event.clientY;
		
		    var deltaX = newX - lastMouseX
		    var newRotationMatrix = mat4.create();
		    mat4.identity(newRotationMatrix);
		    mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
		
		    var deltaY = newY - lastMouseY;
		    //mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);
		
		    mat4.multiply(newRotationMatrix, moonRotationMatrix, moonRotationMatrix);
		
		    lastMouseX = newX
		    lastMouseY = newY;
		}
		
		
		exports.init = function(width, height) {
		
			mat4.perspective(45, width / height, 0.1, 10000.0, matrix);
		
		}
		
		exports.identity = function() {
		
			mat4.identity(modelView.matrix);
		
		}
		
		exports.translate = function(m) {
		
			mat4.translate(modelView.matrix, m);
		
		}
		
		exports.rotateX = function(deg) {
		
			mat4.rotate(modelView.matrix, degToRad(deg), [1, 0, 0]);	
			
		}
		
		exports.rotateY = function(deg) {
		
			mat4.rotate(modelView.matrix, degToRad(deg), [0, 1, 0]);	
			
		}
		
		exports.rotateZ = function(deg) {
		
			mat4.rotate(modelView.matrix, degToRad(deg), [0, 0, 1]);	
			
		}
		
		
	}

);