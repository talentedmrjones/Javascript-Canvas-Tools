# Javascript Canvas Tools v0.3.2

Offers easy canvas manipulation including filters, adjustments, blending modes.

**As seen in use on [talentedmrjones.com](http://talentedmrjones.com)**

## Instantiation
	
    <img src="fern.jpg" id="img1" />
    <canvas id="cvs" width="100" height="100"></canvas>
    <script>
        (function(){
        	// call with ID of canvas as string
            var Canvas = new CanvasTools.Canvas('cvs');
            
            // call with ID of img as string
            var Canvas = new CanvasTools.Canvas('img1');
            
            // or call with element itself
            var Canvas = new CanvasTools.Canvas(document.getElementById('cvs'));
            var Canvas = new CanvasTools.Canvas(document.getElementById('img1'));
            
        }();
    </script>

## Filters

    <canvas id="cvs" width="100" height="100"></canvas>
    <script>
        (function(){
            var Canvas = new CanvasTools.Canvas('cvs');
            Canvas.context.fillStyle = '#e6e6e6';
            Canvas.context.fillRect(0,0,100,100);
            Canvas.filter('noiseGray');
        })();
    </script>

### filter ( filter , _[ options , general ]_ )

* _filter_: the name of the filter (e.g: 'grayscale')
* _options_: a JSON object containing key:value pairs. Each filter has its own options (see below)
* _general_: a JSON object containing key:value pairs for the following options:
  * **_pre_**: a _function_ thats runs just before image data is copied. Useful for manipulating canvas with methods like fillRect() or drawImage()
  * **_post_**: a _function_ thats runs after filter has been applies. Useful for manipulating canvas with methods like fillRect() or drawImage()

#### Available filters:

#### grayscale

The grayscale filter does exactly that: converts color to grayscale.

_options_ defaults:

    {
        weighted:true
    } 

**_true_**: uses a calculation that takes into account the individual color intensities observed by the human eye. ((r * 1.299)+(g * 1.587)+(b * 1.114))/3

**_false_**: calculates without any weights. (r+g+b)/3

#### noiseGray

Applies a random shade of gray to every pixel in the canvas.

_options_ defaults:

    {
        "min":0
        ,"max":255
        ,"opacity":.5
    }

**_min_**: controls the _minimum_ of the random value used in applying the noise pixel. Lower values allow more black.

**_max_**: controls the _maximum_ of the random value used in applying the noise pixel. Higher values allow more white.

**_opacity_**: a decimal value from 0–1 used to determine the opacity of the grayscale pixel

#### noiseColor

Applies a specific color to every pixel in the canvas with a random opacity.

_options_ defaults:

    {
        "min":0
        ,"max":100
        ,"rgb":[255,0,0]
    }
    
**_min_**: controls the _minimum_ of the random opacity

**_max_**: controls the _maximum_ of the random opacity

**_rgb_**: and array of integer values from 0–255 as [r,g,b]. Specifies the color of the applied pixel.

#### noiseRandom

Applies a randomly colored pixel to every pixel of the canvas.

_options_ defaults:

    {
        opacity:.5
    }
    
**_opacity_**: A decimal value from 0-1. Sets the transparency of the colored pixel.

## Adjustments
    <img src="fern.jpg" id="img1" />
    <canvas id="cvs" width="100" height="100"></canvas>
    <script>
        (function(){
            var Canvas = new CanvasTools.Canvas('cvs');
            Canvas.context.drawImage(document.getElementById('img1'),0,0);
            Canvas.adjust('levels');
        })();
    </script>

### adjust ( adjustment , _[ options , general ]_ )

* _adjustment_: the name of the adjustment (e.g: 'levels')
* _options_: a JSON object containing key:value pairs. Each adjustment has its own options (see below)
* _general_: a JSON object containing key:value pairs for the following options:
  * **_pre_**: a _function_ thats runs just before image data is copied. Useful for manipulating canvas with methods like fillRect() or drawImage()
  * **_post_**: a _function_ thats runs after filter has been applies. Useful for manipulating canvas with methods like fillRect() or drawImage()

#### Available adjustments:

#### levels

The levels adjustment functions exactly like Photoshops levels. It accepts a gamma, and minimum input and output levels.

_options_ defaults:

    {
        gamma:1
        ,input:{
            min:0,
            max:255
        }
        ,output:{
            min:0,
            max:255
        }
    }

**_gamma_**: a float value from 0 to 1 representing the overall brightness of the image

**_input.min_**: the minimum input level

**_input.max_**: the maximum input level

**_output.min_**: the minimum output level

**_output.max_**: the maximum output level


## Blending Modes

Blending modes are designed to function identically to Photoshop. Thanks to [Jerry Huxtable](http://www.jhlabs.com/index.html) for his [Java Image Filters](http://www.jhlabs.com/ip/filters/index.html). They were of the utmost help in applying the correct equations.

### blend ( mode , top , _[ alpha , general ]_ )

blend the _top_ Canvas with the current instance. The calling instance is treated as the underlying (bottom) layer.

* _mode_: the name of the blending mode (e.g: 'screen')
* _top_: an instance of CanvasTools.Canvas representing the top layer to blend
* _alpha_: a float value from 0–1 representing the opacity for the top layer
* _general_: a JSON object containing key:value pairs for the following options:
  * **_pre_**: a _function_ thats runs just before image data is copied. Useful for manipulating canvas with methods like fillRect() or drawImage()
  * **_post_**: a _function_ thats runs after filter has been applies. Useful for manipulating canvas with methods like fillRect() or drawImage()

#### Available blending modes:

* _normal_
* _screen_
* _multiply_
* _linear burn_

## Miscelaneous

### getHistogram ( channel , Canvas )

Generates a histogram of the specified channel, using _Canvas_ as the output canvas.

* _channel_ may be on of the following values
  * **_red_** charts the values of red
  * **_green_** charts the values of green
  * **_blue_** charts the values of blue
  * **_rgb_** charts the values of (red+green+blue)
  * **_luminosity_** charts the luminance values of the image (R*.3)+(G*.59)+(B*.11)

* _Canvas_ is a separate canvas element set at 256x100 used to output the histogram chart (see histogram.html example)
  