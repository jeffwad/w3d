

define("/app/main",

	["sys","object","/lib/webgl/core/main","/lib/webgl/shaders/vertex.gl","/lib/webgl/shaders/fragment.gl"],

	function(require, exports, module) {

		var sys 				= require("sys"),
			object				= require("object"),
			gl					= require("/lib/webgl/core/main"),
			vertex				= require("/lib/webgl/shaders/vertex.gl"),
			fragment			= require("/lib/webgl/shaders/fragment.gl");
		
		
		var canvas = document.createElement("canvas");
		canvas.width = self.innerWidth;
		canvas.height = self.innerHeight;
		canvas.style.width = self.innerWidth + "px";
		canvas.style.height = self.innerHeight + "px";
		document.body.style.margin = 0;
		document.body.style.padding = 0;
		document.body.appendChild(canvas);
		
		
		gl.init(canvas);
		
		gl.program(vertex, fragment);
		
		//	set the axis
		object.create(gl.line, {
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
		object.create(gl.line, {
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
		object.create(gl.line, {
			position: [0.0, 0.0, 0.0],
			vertices: [
		    	0.0, 0.0, 1000000.0,
				0.0, 0.0, -1000000.0
			],
			colours: [0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0],
			size: 3,
			items: 2
		});	
		
		
		
		//	create the test cube
		var colours = [
		      [1.0, 0.0, 0.0, 1.0],     // Front face
		      [1.0, 1.0, 0.0, 1.0],     // Back face
		      [0.0, 1.0, 0.0, 1.0],     // Top face
		      [1.0, 0.5, 0.5, 1.0],     // Bottom face
		      [1.0, 0.0, 1.0, 1.0],     // Right face
		      [0.0, 0.0, 1.0, 1.0]     // Left face
		    ];
		var unpackedColours = []
		for (var i in colours) {
			var colour = colours[i];
			for (var j=0; j < 4; j++) {
				unpackedColours = unpackedColours.concat(colour);
			}
		}
		
		// /*
		object.create(gl.mesh, {
			position: [1.0, 1.0, -1.0],
		    vertices: [
				// Front face
				-1.0, -1.0,  1.0,
				1.0, -1.0,  1.0,
				1.0,  1.0,  1.0,
				-1.0,  1.0,  1.0,
		
				// Back face
				-1.0, -1.0, -1.0,
				-1.0,  1.0, -1.0,
				1.0,  1.0, -1.0,
				1.0, -1.0, -1.0,
		
				// Top face
				-1.0,  1.0, -1.0,
				-1.0,  1.0,  1.0,
				1.0,  1.0,  1.0,
				1.0,  1.0, -1.0,
		
				// Bottom face
				-1.0, -1.0, -1.0,
				1.0, -1.0, -1.0,
				1.0, -1.0,  1.0,
				-1.0, -1.0,  1.0,
		
				// Right face
				1.0, -1.0, -1.0,
				1.0,  1.0, -1.0,
				1.0,  1.0,  1.0,
				1.0, -1.0,  1.0,
		
				// Left face
				-1.0, -1.0, -1.0,
				-1.0, -1.0,  1.0,
				-1.0,  1.0,  1.0,
				-1.0,  1.0, -1.0,
		    ],
			size: 3,
			items: 24,
			indices: [
				0, 1, 2,      0, 2, 3,    // Front face
				4, 5, 6,      4, 6, 7,    // Back face
				8, 9, 10,     8, 10, 11,  // Top face
				12, 13, 14,   12, 14, 15, // Bottom face
				16, 17, 18,   16, 18, 19, // Right face
				20, 21, 22,   20, 22, 23  // Left face
		    ],
			colours: unpackedColours
		
		});
		
		//	bind camera moves
		canvas.addEventListener("mousedown", function(e) {
			gl.camera.startRotation(e);
			document.addEventListener("mousemove", gl.camera.rotateXYByMouse, false);
		});
		document.addEventListener("mouseup", function(e) {
			document.removeEventListener("mousemove", gl.camera.rotateXYByMouse, false);
			gl.camera.stopRotation(e);
		});
		
		gl.run();
		
		
		// */
		
	}

);