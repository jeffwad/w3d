/*
	@name: 			line.js

	@description:	line object

	@author:		Simon Jefford
	
*/
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

