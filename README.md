# Javascript Canvas Tools

Offers easy canvas manipulation including several filters. Adjustments (e.g.: levels) and Blends (e.g.: multiply,screen,linear burn) coming soon!

## Instantiation

    <canvas id="cvs" width="100" height="100"></canvas>
    <script>
        (function(){
        	// call with ID as string
            var Canvas = new CanvasTools.Canvas('cvs');
            
            // or call with canvas element itself
            var Canvas = new CanvasTools.Canvas(document.getElementById('cvs'));
        }();
    </script>

## Filter Methods

    <canvas id="cvs" width="100" height="100"></canvas>
    <script>
        (function(){
            var Canvas = new CanvasTools.Canvas('cvs');
            Canvas.context.fillStyle = '#e6e6e6';
            Canvas.context.fillRect(0,0,100,100);
            Canvas.filter('noiseGray');
        })();
    </script>

**_filter ( filter , [ options , general ] )_**

* _filter_: the name of the filter (e.g: 'grayscale')
* _options_: a JSON object containing key:value pairs. Each filter has its own options (see below)
* _general_: a JSON object containing key:value pairs for the following options:
  * **_pre_**: a _function_ thats runs just before image data is copied. Useful for manipulating canvas with methods like fillRect() or drawImage()
  * **_post_**: a _function_ thats runs after filter has been applies. Useful for manipulating canvas with methods like fillRect() or drawImage()


### grayscale

The grayscale filter does exactly that: converts color to grayscale.

_options_ defaults:

    {
        weighted:true
    } 

**_true_**: uses a calculation that takes into account the individual color intensities observed by the human eye. ((r * 1.299)+(g * 1.587)+(b * 1.114))/3

**_false_**: calculates without any weights. (r+g+b)/3

### noiseGray

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

### noiseColor

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

### noiseRandom

Applies a randomly colored pixel to every pixel of the canvas.

_options_ defaults:

    {
        opacity:.5
    }
    
**_opacity_**: A decimal value from 0-1. Sets the transparency of the colored pixel.