// build filtering object
(function(){
	
	// filters property holds filter functions
	CanvasRenderingContext2D.prototype.filters={};
		
	CanvasRenderingContext2D.prototype.write = function () {
		this.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.putImageData(this.oldImageData,0,0);
	};


	CanvasRenderingContext2D.prototype.filter = function (f,o) {
		
		if ('undefined'==typeof o) {
			o={};
		}
		
		if ('function' == typeof o.init) {
			o.init.apply(this);
		}
		
		this.oldImageData=this.getImageData(0,0,this.canvas.width,this.canvas.height);

		if ('function' == typeof o.pre) {
			o.pre.apply(this);
		}

		this.filters[f].apply(this,[o]);
		
		if ('function' == typeof o.post) {
			o.post.apply(this);
		}
		
		this.write();
		
		return this;
	};
	
	/* FILTER FUNCTIONS */
	
	// GRAYSCALE
	CanvasRenderingContext2D.prototype.filters.grayscale = function () {
		var 
		avg
		,i
		,p=this.oldImageData.data;

		for (i=0;i<p.length;i+=4) {
			avg=((p[i]+p[i+1]+p[i+2])/3);
			p[i]=avg;	  
			p[i+1]=avg;
			p[i+2]=avg;
		}
		
		return p;
	};
	
	// NOISE
	CanvasRenderingContext2D.prototype.filters.noise = function (o) {
		var o = jQuery.extend({"mode":"grayscale","min":0,"max":255,"opacity":1,"offset":1,"value":.5,"rgb":[255,0,0]},o),
		i,
		p=this.oldImageData.data,
		v, // random value between min and max range
		
		rand=function(){
			return Math.floor(o.min+(Math.random()*(o.max-o.min)));
		};
		
		
		
		var modes={
			
			grayscale:function () {
			
				for (i=0; i<p.length; i += parseInt(o.offset)*4) {
					v=rand();
					// out = alpha * new + (1 - alpha) * old
					p[i]=o.opacity * v + (1-o.opacity)*p[i];
					p[i+1]=o.opacity * v + (1-o.opacity)*p[i+1];
					p[i+2]=o.opacity * v + (1-o.opacity)*p[i+2];
				}
			},
			color:function () {
				for (i=0; i<p.length; i += parseInt(o.offset)*4) {
					
					v=rand();
					o.opacity=v/255;
					// out = alpha * new + (1 - alpha) * old
					p[i]=o.opacity * o.rgb[0] + (1-o.opacity)*p[i];
					p[i+1]=o.opacity * o.rgb[1] + (1-o.opacity)*p[i+1];
					p[i+2]=o.opacity * o.rgb[2] + (1-o.opacity)*p[i+2];
				}
			}
			
		}
		
		modes[o.mode]();
		return p;
	};
	
	

	
})();