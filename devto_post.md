---
title: Create SVG Spritesheet animations with 1 Template Literal String
published: false
description: One Template Literal String creates the whole SVG Spritesheet Client-Side
tags: 
//cover_image: https://direct_url_to_image.jpg
---

## Only an idiot develops yet another animation tool

There comes a point in time when you have to kill your darlings.
Drop development and toss the result in the bin, because you realize you must be the only idiot on this globe doing what you are doing.

{% jsfiddle https://jsfiddle.net/WebComponents/ez6mtbcd result,html %}


I can't toss this one in the bin, it is too much fun, and the current version satisfies my needs. 

Can other developers use this? I don't know. Let me know!

I donate all my code to the Public Domain. Tagged with **the Unlicense**, so feel free to do whatever you want with it.

## About Spritesheet Animations

It all started in **1872** when photographer [Eadweard Muybridge](https://en.wikipedia.org/wiki/Eadweard_Muybridge) took a sequence of images.

And then used a "projector" to quickly show each _frame_

![](//sprite-meister.github.io/spritesheets/muybridge_horse.jpg)

The SpriteMeiser ``<sprite-animation>`` Web Component displays that whole JPG **of 15 frames**  
in the Browser **frame by frame**

```html
<script src="//sprite-meister.github.io/elements.js"></script>

<sprite-animation 
    steps="15"
    cell="183x122"
    duration="1s"
    src="//sprite-meister.github.io/spritesheets/muybridge_horse.jpg">
</sprite-animation>
```

Creating a SpiteSheet Animation:

{% jsfiddle https://jsfiddle.net/WebComponents/cLhn3d2m result,html %}

## Sprite Meister

[]() generates the full SVG clientsheet, which can then be played as animation

```html
<script src="//sprite-meister.github.io/elements.js"></script>

<sprite-animation 
    steps="15"
    cell="183x122"
    duration="1s"
    src="//sprite-meister.github.io/spritesheets/muybridge_horse.jpg">
</sprite-animation>
```
