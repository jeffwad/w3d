/*
	@name: 			modelView.js

	@description:	Model View 

	@author:		Simon Jefford
	
*/
var	glMatrix			= require("/lib/webgl/core/glMatrix"),
	vec3				= glMatrix.vec3,
	mat4				= glMatrix.mat4,
	quat4				= glMatrix.quat4,
	matrix,
	stack;

matrix = mat4.create();
stack = [];

exports.matrix = matrix;

exports.push = function() {
	var copy = mat4.create();
	mat4.set(matrix, copy);
	stack.push(copy);
}

exports.pop = function() {
	if (stack.length == 0) {
		throw "Invalid pop matrix";
	}
	matrix = stack.pop();
}

