(function(){
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
	
	// filters property holds filter functions
	CanvasRenderingContext2D.prototype.filters={};
		
	CanvasRenderingContext2D.prototype.write = function () {
		this.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.putImageData(this.imageData,0,0);
	};


	CanvasRenderingContext2D.prototype.filter = function (f,o) {
		
		if ('undefined'==typeof o) {
			o={};
		}
		
		if ('function' == typeof o.pre) {
			o.pre.apply(this);
		}
		
		this.imageData=this.getImageData(0,0,this.canvas.width,this.canvas.height);
		this.filters[f].apply(this,[o]);
		this.write();
		
		if ('function' == typeof o.post) {
			o.post.apply(this);
		}
		
		return this;
	};
	
	/* FILTER FUNCTIONS */
	
	// GRAYSCALE
	CanvasRenderingContext2D.prototype.filters.grayscale = function () {
		var 
		avg						// add pixel vaues and divide by 3
		,i						// data index
		,p=this.imageData.data 	// p is a much shorter reference this keeping filesize lower
		;

		for (i=0;i<p.length;i+=4) {
			avg=((p[i]+p[i+1]+p[i+2])/3);
			p[i]=avg;	  
			p[i+1]=avg;
			p[i+2]=avg;
		}
		
		return true;
	};
	
	// NOISE
	CanvasRenderingContext2D.prototype.filters.noise = function (options) {
		var 
		defaults = {"mode":"grayscale","min":0,"max":255,"opacity":.5,"offset":1,"rgb":[255,0,0]}
		,o = extend(defaults,options)
		,i
		,p=this.imageData.data
		,v // random value between min and max range
		,rand=function(){
			return Math.floor(o.min+(Math.random()*(o.max-o.min)));
		}
		,modes={
			grayscale:function () {			
				// out = alpha * new + (1 - alpha) * old
				p[i]=o.opacity * v + (1-o.opacity)*p[i];
				p[i+1]=o.opacity * v + (1-o.opacity)*p[i+1];
				p[i+2]=o.opacity * v + (1-o.opacity)*p[i+2];
			},
			color:function (i) {					
				opacity=v/255;
				// out = alpha * new + (1 - alpha) * old
				p[i]=opacity * o.rgb[0] + (1-opacity)*p[i];
				p[i+1]=opacity * o.rgb[1] + (1-opacity)*p[i+1];
				p[i+2]=opacity * o.rgb[2] + (1-opacity)*p[i+2];
			}
		};
		
		for (i=0; i<p.length; i+=parseInt(o.offset,10)*4) {
			v=rand();
			modes[o.mode](i);
		}
		
		
		return p;
	}; // noise()
	
})();