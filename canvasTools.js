(function(){


var rand=function(min,max){
	min = min || 0;
	max = max || 255;
	return Math.floor(min+(Math.random()*(max-min)));
};

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

var CanvasTools = {
	Filters:{
		grayscale:{
			defaults:{}
			,method:function (o,rgba) {
			
				return (function (r,g,b,a) {
					var avg=((r+g+b)/3);
					return [avg,avg,avg,a];
				}).apply(this,rgba);
				
			}
		} // grayscale ()
		,noise:{
			defaults:{"mode":"grayscale","amount":100,"min":0,"max":255,"opacity":.5,"offset":1,"rgb":[255,0,0]}
			,method:function (o,rgba) {
				modes={
					grayscale:function (r,g,b,a) {
						var v=rand(o.min,o.max)
						,p=[];
						// out = alpha * new + (1 - alpha) * old
						p[0]=o.opacity * v + (1-o.opacity)*r;
						p[1]=o.opacity * v + (1-o.opacity)*g;
						p[2]=o.opacity * v + (1-o.opacity)*b;
						p[3]=a;
						return p;
					},
					color:function (r,g,b,a) {					
						var v=rand(o.min,o.max)
						,opacity=v/255
						,p=[];
						// out = alpha * new + (1 - alpha) * old
						p[0]=opacity * o.rgb[0] + (1-opacity)*r;
						p[1]=opacity * o.rgb[1] + (1-opacity)*g;
						p[2]=opacity * o.rgb[2] + (1-opacity)*b;
						p[3]=a;
						return p;
					},
					random:function (r,g,b,a) {					
						var 
						nr=rand() // new red value
						,ng=rand() // new green value 
						,nb=rand() // new blue value
						,p=[];
						// out = alpha * new + (1 - alpha) * old
						p[0]=o.opacity * nr + (1-o.opacity)*r;
						p[1]=o.opacity * ng + (1-o.opacity)*g;
						p[2]=o.opacity * nr + (1-o.opacity)*b;
						p[3]=a;
						return p;
					}
				};
				
				// if o.amount==50, then this pixel has a 50% of having the noise applied
				if (rand(0,100)<=o.amount) {
					return modes[o.mode].apply(this,rgba);
				} else {
					return rgba;
				}
				

			}
		} // noise()
		,invert:{
			defaults:{}
			,method:function (o,rgba) {
			
				return (function(r,g,b,a){
					var p = [];
					p[0]=255-r;	  
					p[1]=255-g;
					p[2]=255-b;
					p[3]=a;
					return p;
				}).apply(this,rgba);
				
			}
		} // invert ()
	} // Filters
	,Adjustments:{
		levels:function (options) {
			var defaults = {
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
			,o=extend(defaults,options)
			,minInput = o.input.min/255
			,maxInput = o.input.max/255
			,minOutput = o.output.min/255
			,maxOutput = o.output.max/255;
			
			
			this.map(function(r,g,b,a){
				var p=[],i,color;
				for (i=0;i<3;i++) {
					color = (arguments[i]/255);
					color = minOutput+(maxOutput-minOutput)*Math.pow(Math.min(Math.max(color-minInput, 0.0) / (maxInput-minInput), 1.0),(1/o.gamma));
					p[i]=color*255;
				}
				p[3]=a;
				return p;
			});
			
		}
	} // Adjustments
	,Canvas:function (canvas) {
	
		this.canvas=null;
		this.context=null;
		
		write = function () {
			this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
			this.context.putImageData(this.imageData,0,0);
		}
		
		this.setCanvas = function (canvas) {
			
			canvas = canvas || '';
		
			if (typeof canvas == 'string') {
				canvas = document.getElementById(canvas);
			}	
		
			if (false===canvas instanceof HTMLCanvasElement) {
				throw new Error('canvas is required as HTMLCanvasElement or String representing the id of a canvas element.');
				return false;
			}
			
			this.canvas = canvas;
			this.context = canvas.getContext('2d');
		};
		
		this.setCanvas(canvas);
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
		this.filter = function (filters,options,general) {
			
			var fo={}
			options = options || [{}]
			,general=general || {};
			
			if ('string'==typeof filters) {
				filters=[filters]; // is a single name, make an array for the loop below
			} else if (!filters instanceof Array) { //	otherwise SHOULD be an array
				throw new Error('filters argument should be a string or array.');
				return false;
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
			this.imageData=this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
			var d = this.imageData.data;
			
			// loop over each pixel	
			for (i=0; i<d.length; i+=4) {
				// run each filter on each pixel
				for (var f=0; f<filters.length; f++) {
					p = CanvasTools.Filters[filters[f]].method(fo[filters[f]],[d[i],d[i+1],d[i+2],d[i+3]]);
					d[i] = p[0];
					d[i+1] = p[1];
					d[i+2] = p[2];
					d[i+3] = p[3];
				}
			}

			// write the imageData back to the canvas
			write.call(this);
			
			// run the post filter callback
			if ('function' == typeof general.post) {
				general.post.apply(this);
			}

			// return this to support chaining
			return this;
		};
		
		this.adjust = function (a,o) {
			
			if ('object'!=typeof o) {
				o={};
			}
			
			if ('function' == typeof o.pre) {
				o.pre.apply(this);
			}
			
			this.imageData=this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
			CanvasTools.Adjustments[a].call(this,o);
			write.call(this);
			
			if ('function' == typeof o.post) {
				o.post.apply(this);
			}
			
			return this;
		};
		
		this.map = function (f) {
			var d = this.imageData.data;
			for (i=0; i<d.length; i+=4) {
				p = f(d[i],d[i+1],d[i+2],d[i+3]);
				d[i] = p[0];
				d[i+1] = p[1];
				d[i+2] = p[2];
				d[i+3] = p[3];
			}
		};

	} // Canvas()
}; // CanvasTools


if ('CanvasTools' in window) {
	throw new Error('\'CanvasTools\' is already in use in the global namespace.');
} else {
	window.CanvasTools=CanvasTools;
}

})() // end anonymous closure