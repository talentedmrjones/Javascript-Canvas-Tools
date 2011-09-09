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

var mix = function (min,max,color) {
	return min+(max-min)*color;
}

var CanvasTools = {
	Filters:{
		grayscale:function (options) {
			this.map(function (r,g,b,a) {
				var avg=((r+g+b)/3);
				return [avg,avg,avg,a];
			});	
			
		} // grayscale ()
		,noise:function (options) {
			var 
			defaults = {"mode":"grayscale","min":0,"max":255,"opacity":.5,"offset":1,"rgb":[255,0,0]}
			,o = extend(defaults,options)
			,modes={
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
			
			this.map(modes[o.mode]);
			
		} // noise()
		,invert:function () {

			 this.map(function(r,g,b,a){
			 	var p = [];
				p[0]=255-r;	  
				p[1]=255-g;
				p[2]=255-b;
				p[3]=a;
				return p;
			 });
	
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
	,Canvas:function (c) {
	
		c = c || '';
	
		if (typeof c == 'string') {
			c = document.getElementById(c);
		}	
	
		if (false===c instanceof HTMLCanvasElement) {
			throw new Error('canvas is required as HTMLCanvasElement or String representing the id of a canvas element.');
			return false;
		}
		
		this.canvas = c;
		this.context = this.canvas.getContext('2d');
		
		write = function () {
			this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
			this.context.putImageData(this.imageData,0,0);
		}
		
		this.filter = function (f,o) {
			
			if ('object'!=typeof o) {
				o={};
			}
			
			if ('function' == typeof o.pre) {
				o.pre.apply(this);
			}
			
			this.imageData=this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
			CanvasTools.Filters[f].call(this,o);
			write.call(this);
			
			if ('function' == typeof o.post) {
				o.post.apply(this);
			}
			
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