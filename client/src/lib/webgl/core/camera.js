/*
	@name: 			camera.js

	@description:	Defines a camera

	@author:		Simon Jefford
	
*/
var	glMatrix			= require("/lib/webgl/core/glMatrix"),
	modelView			= require("/lib/webgl/core/modelView"),
	vec3				= glMatrix.vec3,
	mat4				= glMatrix.mat4,
	quat4				= glMatrix.quat4,
	degToRad			= glMatrix.degToRad,
	lastX,
	lastY,
	perspective,
	rotation;

//	create a perspective matrix
perspective = mat4.create();

//	create an identity rotation matrix
rotation = mat4.create();
mat4.identity(rotation);



//	export the perspective matrix
exports.perspective = perspective;
exports.rotation = rotation;

//	initialise the camera
exports.init = function(width, height) {

	mat4.perspective(60, width / height, 0.1, 10000.0, perspective);

};

//	reset the model view matrix
exports.identity = function() {

	mat4.identity(modelView.matrix);

};

//	move the camera
exports.translate = function(m) {

	mat4.translate(modelView.matrix, m);

};

//	start listening for mouse events that move the camera
exports.startRotation = function(e) {
	lastX = e.clientX;
	lastY = e.clientY;
};

//	stop listening for mouse events that move the camera
exports.stopRotation = function(e) {
	lastX = e.clientX;
	lastY = e.clientY;
};

//	creates a rotation matrix about x and y based upon mouse movement
exports.orbit = function(e) {

	var x = e.clientX,
		y = e.clientY,
		deltaX = x - lastX,
		deltaY = y - lastY,
		rotationMatrix = mat4.create();
		
	mat4.identity(rotationMatrix);

	
	//mat4.translate(rotationMatrix, [(x - lastX)/50, (y - lastY)/50, 0]);

	if(Math.abs(deltaX) > Math.abs(deltaY)) {
		mat4.translate(rotationMatrix, [deltaX/20, 0, -deltaY/20]);
		mat4.rotateY(rotationMatrix, degToRad(deltaX / 10));
	}
	else {
		mat4.translate(rotationMatrix, [0, -deltaY/10, 0]);			
		mat4.rotateX(rotationMatrix, degToRad(deltaY / 10));
		mat4.rotateZ(rotationMatrix, degToRad(-deltaY / 10));
		
	}



	//else {
		//mat4.rotateZ(rotationMatrix, degToRad(deltaY / 10));
		//mat4.rotateX(rotationMatrix, degToRad(deltaY / 10));
	//} 
//	;


//	mat4.translate(rotationMatrix, [-(x - lastX)/50, -(y - lastY)/50, 0]);

	mat4.multiply(rotationMatrix, rotation, rotation);

	lastX = x;
	lastY = y;
}

//	creates a rotation matrix about y based upon mouse movement
exports.rotateYByMouse = function(e) {

	var x = e.clientX,
		rotationMatrix = mat4.create();
		
	mat4.identity(rotationMatrix);
	mat4.rotate(rotationMatrix, degToRad((x - lastX) / 10), [0, 1, 0]);

	mat4.multiply(rotationMatrix, rotation, rotation);

	lastX = x;
}

//	creates a rotation matrix about x based upon mouse movement
exports.rotateXByMouse = function(e) {

	var y = e.clientY,
		rotationMatrix = mat4.create();
		
	mat4.identity(rotationMatrix);
	mat4.rotate(rotationMatrix, degToRad((y - lastY) / 10), [1, 0, 0]);

	mat4.multiply(rotationMatrix, rotation, rotation);

	lastY = y;
}


//	rotate around the x axis
exports.rotateX = function(deg) {

	mat4.rotateX(modelView.matrix, degToRad(deg));	
	
};

//	rotate around the y axis
exports.rotateY = function(deg) {

	mat4.rotateY(modelView.matrix, degToRad(deg));	
	
};


//	rotate around the z axis
exports.rotateZ = function(deg) {

	mat4.rotateZ(modelView.matrix, degToRad(deg));	
	
};


