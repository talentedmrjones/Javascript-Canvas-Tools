# Javascript Canvas Filters

Extends Javascript&#8217;s native CanvasRenderingContext2D by adding a set of filters and a filter calling method.

The following filters are included

* __grayscale__ : converts canvas to black and white
* __noise__ : adds noise to canvas, very configurable

## Usage

**_filter(filter [,options])_**

* _filter_: the name of the filter (e.g: 'grayscale')
* _options_: a JSON object containing key:value pairs. Each filter has its own options, but global options are as follows:

  * **_init_**: a _function_ thats runs just before image data is copied. Useful for manipulating canvas with methods like fillRect() or drawImage()



    var context = document.getElementById('canvas1').getContext('2d');  
    // call without options  
    context.filter('grayscale');  
    // or call with options  
    context.filter('noise',{opacity:.2});  
    // or chain filters together  
    context.fiter('grayscale').filter('noise',{opacity:.2});


### grayscale

The grayscale filter simply converts the canvas to black and white. It does not reference the _options_ argument.


### noise

For every pixel in the canvas, the noise filter applies a colored pixel.

_options_ defaults to:

    {
        mode_:"grayscale"
        ,min":0
        ,"max":255
        ,"opacity":.5
        ,"offset":1
        ,"rgb":[255,0,0]
    }

**_mode_**: determines how pixels are generated and how their color and opacity are derived. See specific modes below:

 * **_grayscale_**: the applied pixel is a random shade of gray from 0 (black) to 255 (white). The range of this value can be controlled with _min_ and _max_. The opacity of the applied pixel can be set with the _opacity_ option.

 * **_color_**: the applied pixel is a color specified by _rgb_. The opacity of the applied pixel is a random decimal value from 0 (transparent) to 1 (opaque). The range of this random opacity value can be controlled with _min_ and _max_.

**_min_**: controls the _minimum_ of the random value used in applying the noise pixel.

**_max_**: controls the _maximum_ of the random value used in applying the noise pixel.

**_opacity_**: a decimal value from 0 to 1 used to determine the opacity of the grayscale pixel

**_offset_**: used to skip pixels. Different values produce different effects. Experiment! :)

**_rgb_**: an array of three integer values representing an RGB color code. This is used by the _color_ mode to determine the color of the applied pixel

