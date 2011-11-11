(function(){

// shortcuts enhance performance by removing the heirarchy lookup in later calls
var Floor=Math.floor
,Random=Math.random
,Pow=Math.pow
,Min=Math.min
,Max=Math.max;

// filters run significantly slower by calling rand() vs doing the calculation directly
var rand=function(min,max){
	min = min || 0;
	max = max || 255;
	return Floor(min+(Random()*(max-min)));
};

// why isnt this in core javascript already?
var extend = function(obj, extObj) {
    if (arguments.length > 2) {
        for (var a = 1; a < arguments.length; a++) {
            extend(obj, arguments[a]);
        }
    } else {
        for (var i in extObj) {
            obj[i] = extObj[i];
        }
    }
    return obj;
};

/* Thanks to John Resig for the array min and max http://ejohn.org/blog/fast-javascript-maxmin/ */
Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

Array.fill = function (length, val) {
    var array = [];
    while (length) {
        array[length-1] = val;
        length--;
    }
    return array;
};

var CanvasTools = {
	Filters:{
		grayscale:{
			defaults:{weighted:true}
			,method:function (options,r,g,b,a) {		
				var avg;		
				if (options.weighted) {
                    // standard luminence calculation based on the human eye's sensitivity to green
					avg=(((r*.299)+(g*.587)+(b*.114)));
				} else {
					avg=((r+g+b)/3);
				}
				return [avg,avg,avg,a];	
			}
		} // grayscale ()
		,noiseGray:{
			defaults:{"min":0,"max":255,"opacity":.5}
			,method:function(o,r,g,b,a){
				var v=Floor(o.min+(Random()*(o.max-o.min))) // filters run up to 65% faster without keeping this random range calculation
				,p=[];
				// out = alpha * new + (1 - alpha) * old
				p[0]=o.opacity * v + (1-o.opacity)*r;
				p[1]=o.opacity * v + (1-o.opacity)*g;
				p[2]=o.opacity * v + (1-o.opacity)*b;
				p[3]=a;
				return p;
			}
		} // noiseGray ()
		,noiseColor:{
			defaults:{"min":0,"max":100,"rgb":[255,0,0]}
			,method:function (o,r,g,b,a) {
				var v=Floor(o.min+(Random()*(o.max-o.min)))
				,opacity=v/100
				,p=[];
				// out = alpha * new + (1 - alpha) * old
				p[0]=opacity * o.rgb[0] + (1-opacity)*r;
				p[1]=opacity * o.rgb[1] + (1-opacity)*g;
				p[2]=opacity * o.rgb[2] + (1-opacity)*b;
				p[3]=a;
				return p;
			}
		} // noiseColor()
		,noiseRandom:{
			defaults:{"opacity":.5}
			,method:function (o,r,g,b,a) {
				var 
				nr=Floor((Random()*(255))) // new red value
				,ng=Floor((Random()*(255))) // new green value 
				,nb=Floor((Random()*(255))) // new blue value
				,p=[];
				// out = alpha * new + (1 - alpha) * old
				p[0]=o.opacity * nr + (1-o.opacity)*r;
				p[1]=o.opacity * ng + (1-o.opacity)*g;
				p[2]=o.opacity * nr + (1-o.opacity)*b;
				p[3]=a;
				return p;
			}
		} // noiseRandom()
		,invert:{
			defaults:{}
			,method:function (o,r,g,b,a) {
				var p = [];
				p[0]=255-r;	  
				p[1]=255-g;
				p[2]=255-b;
				p[3]=a;
				return p;				
			}
		} // invert ()
	} // Filters
	,Adjustments:{
		levels:{
			defaults:{
				gamma:1
				,input:{
					min:0
					,max:255
				},
				output:{
					min:0
					,max:255
				}
			}
			,method:function(o,r,g,b,a){
				var minInput = o.input.min/255
				,maxInput = o.input.max/255
				,minOutput = o.output.min/255
				,maxOutput = o.output.max/255
				p=[]
				;
                // in these cases, DRY code adversely affected performance by adding yet another function call.
                // profiling shows that calling the calculation directly is significantly faster
				p[0]=(minOutput+(maxOutput-minOutput)*Pow(Min(Max((r/255)-minInput, 0.0) / (maxInput-minInput), 1.0),(1/o.gamma)))*255;
				p[1]=(minOutput+(maxOutput-minOutput)*Pow(Min(Max((g/255)-minInput, 0.0) / (maxInput-minInput), 1.0),(1/o.gamma)))*255;
				p[2]=(minOutput+(maxOutput-minOutput)*Pow(Min(Max((b/255)-minInput, 0.0) / (maxInput-minInput), 1.0),(1/o.gamma)))*255;
				p[3]=a;
				
				return p;
			}
		}// levels	
	} // Adjustments
	,Blends:{
        // functions calls in blends accept rgba values for the top and bottom layers, plus an additional alpha for final output
		linearBurn:function (tr, tg, tb, ta, br, bg, bb, ba, alpha) {

			or=((br+tr) < 255 ) ? 0 : (br+tr-255);
			og=((bg+tg) < 255 ) ? 0 : (bg+tg-255);
			ob=((bb+tb) < 255 ) ? 0 : (bb+tb-255);

			return CanvasTools.Blends.normal(or, og, ob, ta, br, bg, bb, ba, alpha);
			
		} // linearBurn()
		,normal:function (tr, tg, tb, ta, br, bg, bb, ba, alpha) {

			var a=(ta*alpha)/255 // float value of top opacity (weighted by alpha)
			,ac = 1-a
			,p=[];
			
			// p = opacity * top color + (1 - opacity) * bottom
			p[0] = a*tr + ac*br;
			p[1] = a*tg + ac*bg;
			p[2] = a*tb + ac*bb;
			p[3] = (ta*alpha + ba*ac);
			
			return p;
		} // normal
		,multiply:function (tr, tg, tb, ta, br, bg, bb, ba, alpha) {
		        
		        t = br * tr + 0x80;
                or = ((t >> 8) + t) >> 8;
                t = bg * tg + 0x80;
                og = ((t >> 8) + t) >> 8;
                t = bb * tb + 0x80;
                ob = ((t >> 8) + t) >> 8;
                
			return CanvasTools.Blends.normal(or, og, ob, ta, br, bg, bb, ba, alpha);
			
		} // multiply ()
		,screen:function (tr, tg, tb, ta, br, bg, bb, ba, alpha) {
			
			or=255 - (((255 - tr)*(255 - br))/255);
			og=255 - (((255 - tg)*(255 - bg))/255);
			ob=255 - (((255 - tb)*(255 - bb))/255);
			
			return CanvasTools.Blends.normal(or, og, ob, ta, br, bg, bb, ba, alpha);
			
		} // screen ()
	} // Blends
	,Canvas:function (canvas) {

		// instance specific properties and methods
		this.canvas=null; 
		this.context=null;
		this.setCanvas(canvas);		

	} // Canvas()
}; // CanvasTools


// shared (prototypical) properties and methods

CanvasTools.Canvas.prototype.adjust = function (adjustments,options,general) {
		
	var a
	,ao={}
	,options = options || [{}]
	,general=general || {};
	
	if ('string'==typeof adjustments) {
		adjustments=[adjustments]; // is a single name, make an array for the loop below
	} else if (!adjustments instanceof Array) { //	otherwise SHOULD be an array
		throw new Error("'adjustments' argument should be a string or array of strings referring to available adjustments.");
	}
	
	if ('undefined'==typeof options.length) {
		options=[options]; // make it an array so it works with the following loop
	}
	
	// merge passed options with defaults for each filter/options pair
	for (a=0; a<adjustments.length; a++) {
		ao[adjustments[a]]=extend(CanvasTools.Adjustments[adjustments[a]].defaults,options[a]);
	}
	
	// run pre filter callback
	if ('function' == typeof general.pre) {
		general.pre.apply(this);
	}
	
	// store reference to the image data;
	var imageData=this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
	var d = imageData.data;
	
	// loop over each pixel	
	for (i=0; i<d.length; i+=4) {
		// run each adjustment on each pixel
		for (a=0; a<adjustments.length; a++) {
			p = CanvasTools.Adjustments[adjustments[a]].method(ao[adjustments[a]],d[i],d[i+1],d[i+2],d[i+3]);
			d[i] = p[0];
			d[i+1] = p[1];
			d[i+2] = p[2];
			d[i+3] = p[3];
		}
	}

	// write the imageData back to the canvas
	this.setImageData(imageData);
	
	// run the post filter callback
	if ('function' == typeof general.post) {
		general.post.apply(this);
	}

	// return this to support chaining
	return this;
};



/*
	Function: filter
		Applies filters to the Canvas instance
	
	Parameters:
		array|string filters - the name of a single filter or array of filters to run. e.g: 'invert' OR ['grayscale','noise'] 
		array|object options - a single object or, an array of options objects. e.g:{} OR [{},{}] indexes of options should match index of respective filter
		object general - a JSON object containing general options such as pre and post callback functions
	
	Returns:
	  CanvasTools.Canvas 'this' The original calling instance.

*/
CanvasTools.Canvas.prototype.filter = function (filters,options,general) {
		
	var fo={}
	options = options || [{}]
	,general=general || {};
	
	if ('string'==typeof filters) {
		filters=[filters]; // is a single name, make an array for the loop below
	} else if (!filters instanceof Array) { //	otherwise SHOULD be an array
		throw new Error('filters argument should be a string or array.');
	}
	
	if ('undefined'==typeof options.length) {
		options=[options]; // make it an array so it works with the following loop
	}
	
	// merge passed options with defaults for each filter/options pair
	for (var f=0; f<filters.length; f++) {
		fo[filters[f]]=extend(CanvasTools.Filters[filters[f]].defaults,options[f]);
	}
	
	// run pre filter callback
	if ('function' == typeof general.pre) {
		general.pre.apply(this);
	}
	
	// store reference to the image data;
	var imageData=this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
	var d = imageData.data;
	
	// loop over each pixel	
	for (i=0; i<d.length; i+=4) {
		// run each filter on each pixel
		for (var f=0; f<filters.length; f++) {
			p = CanvasTools.Filters[filters[f]].method(fo[filters[f]],d[i],d[i+1],d[i+2],d[i+3]);
			d[i] = p[0];
			d[i+1] = p[1];
			d[i+2] = p[2];
			d[i+3] = p[3];
		}
	}

	// write the imageData back to the canvas
	this.setImageData(imageData);
	
	// run the post filter callback
	if ('function' == typeof general.post) {
		general.post.apply(this);
	}

	// return this to support chaining
	return this;
};

CanvasTools.Canvas.prototype.blend = function (mode, top, alpha, general) {
	
	if ('string'!=typeof mode || !mode in CanvasTools.Blends) {
		throw new Error("'mode' argument should be a string, and should refer to an available blending mode.");
	}
	
	if (!top instanceof CanvasTools.Canvas) {
		throw new Error("'top' argument must be an instance of CanvasTools.Canvas");
	}
		
	if ('number'!=typeof alpha || alpha < 0 || alpha > 1) {
		alpha = 1;
	}
	
	general = general || {};
	
	// run pre filter callback
	if ('function' == typeof general.pre) {
		general.pre.apply(this);
	}
	
	// store reference to the image data;
	var imageData=this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
	var b = imageData.data;

	var topImageData=top.context.getImageData(0,0,top.canvas.width,top.canvas.height);
	var t = topImageData.data;
	
	// loop over each pixel	
	for (i=0; i<t.length; i+=4) {
		p = CanvasTools.Blends[mode](t[i], t[i+1], t[i+2], t[i+3], b[i], b[i+1], b[i+2], b[i+3], alpha);
		b[i] = p[0];
		b[i+1] = p[1];
		b[i+2] = p[2];
		b[i+3] = p[3];
	}

	// write the imageData back to the canvas
	this.setImageData(imageData);
	
	// run the post filter callback
	if ('function' == typeof general.post) {
		general.post.apply(this);
	}

	// return this to support chaining
	return this;
};

CanvasTools.Canvas.prototype.setCanvas = function (element) {

	if (typeof element == 'string' && element.length > 0) {	
		element = document.getElementById(element);
	} else {
		element = document.createElement('canvas');
	}
	
	if (true===element instanceof HTMLImageElement) {
		var canvas = document.createElement('canvas');
		canvas.width=element.width;
		canvas.height=element.height;
		canvas.getContext('2d').drawImage(element,0,0);
		element = canvas;
	}

	if (false===element instanceof HTMLCanvasElement) {
		throw new Error('canvas is required as HTMLCanvasElement, HTMLImageElement, or a string representing the id of a canvas or img element.');
	}
	
	this.canvas = element;
	this.context = this.canvas.getContext('2d');
	
	return this;
};

CanvasTools.Canvas.prototype.setImageData = function (imageData) {
	// this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	this.context.putImageData(imageData,0,0);
}


CanvasTools.Canvas.prototype.getPNG = function () {
	return this.canvas.toDataURL("image/png");
}

CanvasTools.Canvas.prototype.setDimensions = function (w,h) {
	this.canvas.width=w;
	this.canvas.height=h;
	return this;
}

CanvasTools.Canvas.prototype.getWidth = function () {
	return this.canvas.width;
}

CanvasTools.Canvas.prototype.getHeight = function () {
	return this.canvas.height;
}

CanvasTools.Canvas.prototype.getHistogram = function (channel, Canvas) {
	
	var data = this.context.getImageData(0,0,this.canvas.width,this.canvas.height).data
	,pixels=this.canvas.width*this.canvas.height
	,averages={red:Array.fill(256,0),green:Array.fill(256,0),blue:Array.fill(256,0),luminosity:Array.fill(256,0)}
	,avg
	,i
	,canvas = document.createElement('canvas')
	,context = canvas.getContext('2d')
	,x,y,total=0;
	canvas.width=256;
	canvas.height=100;
	
	for (i=0; i<data.length; i+=4) {
		avg = Math.ceil(((data[i]*.3)+(data[i+1]*.59)+(data[i+2]*.11)));
		averages.red[data[i]]++;
		averages.green[data[i+1]]++;
		averages.blue[data[i+2]]++;
		averages.luminosity[avg]++;
	}
	
	/* 	thanks to Peter Facey for his RGB explanation http://www.brisk.org.uk/photog/histo3.html */
	if (channel=='rgb') {
		averages.rgb=Array.fill(256,0);
		for (x=0;x<256;x++) {
			averages.rgb[x]=averages.red[x] + averages.green[x] + averages.blue[x];
		}
	}

	context.strokeStyle = '#000';
	context.lineWidth   = 1;
	
	var max = Array.max(averages[channel]);

	averages[channel].forEach(function(y,x) {
		
		y=y|0;
		
		y=Math.floor(((y/max)*100));

		context.moveTo(x+.5,100);
		context.lineTo(x+.5,100-y);
		context.stroke();
	});
	
	Canvas.setImageData(context.getImageData(0,0,256,100));
}


// check namespace and assign CanvasTools to window
if ('CanvasTools' in window) {
	throw new Error('\'CanvasTools\' is already defined in the window object.');
} else {
	window.CanvasTools=CanvasTools;
}

})() // end anonymous closure