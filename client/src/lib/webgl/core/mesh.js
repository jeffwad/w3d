/*
	@name: 			mesh.js

	@description:	mesh object

	@author:		Simon Jefford
	
*/
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

