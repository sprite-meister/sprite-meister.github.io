# Sprite Meister

SpriteMeister Web Component configures and plays image/SVG sprite sheets in CSS background or IMG

````html
<sprite-animation cells="16x16" size="64x64" wrap="true" src="earth.png"></sprite-animation>

<sprite-animation src="earth-sprite-16x16-64x64-wrap.png"></sprite-animation>
````

![](https://i.pinimg.com/originals/0d/c9/68/0dc968448592a7d533096b74c263cc40.gif)


# Must read SVG animation articles

* https://betterprogramming.pub/did-you-know-you-could-animate-an-svg-like-this-f606528bf06a



# Resources

* https://www.androiddesignpatterns.com/2016/11/introduction-to-icon-animation-techniques.html

* Lottie - https://github.com/airbnb/lottie-web

* Circle, Arc calculations - https://stackoverflow.com/questions/60020136/generating-a-path-between-two-sets-of-pixel-coordinates-x-y

## Canvas

* https://konvajs.org/docs/shapes/Sprite.html

# Step by step Hamburger to Arrow animation

````
<g id='start' stroke='black' stroke-width='8' stroke-linecap='round'>
  <path d='M15 30L85 30'></path>
  <path d='M15 50L85 50'></path>
  <path d='M15 70L85 70'></path>
</g>
<g id='end' stroke='red' stroke-width='8' stroke-linecap='round'>
  <path d='M50 70L20 50'></path>
  <path d='M75 50L20 50'></path>
  <path d='M50 30L20 50'></path>
</g>
````

## Google IO

* https://upload.wikimedia.org/wikipedia/commons/7/7d/Product_Sans_typeface_sample.svg