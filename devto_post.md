---
title: Create SVG Spritesheet animations with 1 Template Literal String
published: false
description: One Template Literal String creates the whole SVG Spritesheet Client-Side
tags: 
//cover_image: https://direct_url_to_image.jpg
---

# Disclaimer:

The Online **SpriteMeister Generator**: https://SpriteMeister.github.io
is a Working Model v.042 - not intended for Production use. (but you can)

## Only an idiot creates yet another animation tool

There comes a point in time when you have to kill your darlings.
Drop development and toss the result in the bin, because you realize you must be the only idiot on [this globe](https://jsfiddle.net/WebComponents/samzdpL2/) doing what you are doing.

![](https://i.pinimg.com/originals/0d/c9/68/0dc968448592a7d533096b74c263cc40.gif)

I can't toss this one in the bin, it is too much fun, and the current version satisfies my needs. 

Can other developers use this? I don't know. Let me know!

I [donate all my code to the Public Domain](https://github.com/sprite-meister/sprite-meister.github.io).
Tagged with **the Unlicense**, so feel free to do whatever you want with it.

## About Spritesheet Animations

It all started in **1872** when photographer [Eadweard Muybridge](https://en.wikipedia.org/wiki/Eadweard_Muybridge) took a sequence of images. And used a "projector" to quickly show each _frame_

![](//sprite-meister.github.io/spritesheets/muybridge_horse.jpg)

The SpriteMeiser ``<sprite-animation>`` Web Component displays that whole JPG **of 15 frames** in the Browser. **frame by frame**

```html
<script src="//sprite-meister.github.io/elements.js"></script>

<sprite-animation 
    steps="15"
    cell="183x122"
    duration="1s"
    src="//sprite-meister.github.io/spritesheets/muybridge_horse.jpg">
</sprite-animation>
```

Creating a _Sprite Sheet_ Animation:

![](//sprite-meister.github.io/spritesheets/muybridge_horse.jpg)

{% jsfiddle https://jsfiddle.net/WebComponents/cLhn3d2m result,html %}

# But why stop there?

* SVG images can be animated, 
* and SVG can be created _**client-side**_
as I have done with [Playingcards](https://cardmeister.github.io), [Chesspieces](https://chessmeister.github.io), [Flags](https://flagmeister.github.ui), [Icons](https://iconmeister.github.io) and [Pie-charts](https://dev.to/dannyengelman/what-web-technologies-are-required-to-draw-a-pie-chart-in-2021-spoiler-alert-a-standard-web-component-will-do-1j56))

## So everthying required to animate a Hamburger icon to an Arrow is:

```html
<script src="//sprite-meister.github.io/element.js"></script>

<sprite-meister duration="4s">
    ${ setv1( 40-ease({distance:25}) , "top and bottom X position" ) , 
        setv2( ease({distance:20})    , "top and bottom line to Y=50" )
    }
    <g stroke="black" stroke-width="8" stroke-linecap="round" transform="${rotate(180-ease({distance:180}))}">
        <path d="M${v1} 30L85 ${50 - v2}"></path>
        <path d="M15 50L85 50"></path>
        <path d="M${v1} 70L85 ${50 + v2}"></path>
    </g>
</sprite-meister>
```

#### ``<sprite-meister>`` parses the String Literal to 24 (default) SVG frames:

{% jsfiddle https://jsfiddle.net/WebComponents/k3csj7nz result,html %}

## Then PacMan is just 2 rotating semi-circles:

..and a squinting eye!

```html
<script src="//sprite-meister.github.io/element.js"></script>

<sprite-meister duration=".5s">
  ${ setv1( pulse({mid:45}) ,"rotation" ),
     setv2( ease({distance:1}) ,"squint eye")
  }
  <g fill="yellow">
    <g transform="rotate(${ -v1 } 50 50)">
      <path d="m90 50a1 1 0 0 0 -80 0"></path>
      <ellipse cx="60" cy="30" rx="${5 + v2}" ry="${5 - v2}" fill="black"></ellipse>
    </g>
    <path transform="rotate(${v1} 50 50)" d="m10 50a1 1 0 0 0 80 0"></path>
  </g>
</sprite-meister>
```

{% jsfiddle https://jsfiddle.net/WebComponents/Lvxhrn1g result,html %}

## in true OOP fashion, 1 ghost is a ``<template>``:

```html
<template spritemeister id="ghost" duration=".5s" steps="24" ghostcolor="hotpink">
  ${setv1(ease({distance:1}),"squeeze eyes")} 
  ${setv2(ease({distance:1}),"bounce eyes")} 
  ${setv3(pulse({mid:2}),"bounce ghost")} 
  ${setv4(pulse({start:0,mid:2}),"wiggle skirt")} 
  <g transform="skewY(${v3})">
    <path fill="${attr('ghostcolor','red')}"
          d="M82 94 c7-13 4-44 1-65s-40-55-63-1 c-7 22-7 53-3 66
             l${v4}-11 l7 11l8-13l8 13l8-12l8 12l7-12z"></path>
    <g id="eye${framenr}" transform="translate(0 ${v2})">
      <ellipse fill="white" cx="${58 + v1}" cy="${30 + v1}" rx="${5 + v1}" ry="${5 - v1}"></ellipse>
      <ellipse fill="black" cx="${60 + v1}" cy="${30 + v1}" rx="${1 + v1}" ry="${2 - v1}"></ellipse>
    </g>
    <use x="0" y="36" href="#eye${framenr}" transform="rotate(180 50 50)"></use>
    <text x="25" y="75">${attr("id")} </text>
  </g>
</template>
```

## Then 4 ghosts are created with:

```html
<sprite-meister id="Blinky" template="ghost" ghostcolor="red"></sprite-meister>
<sprite-meister id="Pinky"  template="ghost" ghostcolor="hotpink"></sprite-meister>
<sprite-meister id="Inky"   template="ghost" ghostcolor="cyan"></sprite-meister>
<sprite-meister id="Clyde"  template="ghost" ghostcolor="orange"></sprite-meister>
```

{% jsfiddle https://jsfiddle.net/WebComponents/g0u168fb result,html %}

# It works for me

The Online **SpriteMeister Generator**: https://SpriteMeister.github.io

helped me create the spite-sheet animations I needed.

I hereby donate all my code to the Public Domain.

https://github.com/sprite-meister/sprite-meister.github.io

<hr>

# How it is done

```html
<sprite-meister id="bounce" duration="1s" steps="24">
    <ellipse
    cx="50"
    cy="${70 - ease({distance:36})}"
    rx="${ framenr > 11 ? minmax({value:30,min:41 - ease({distance:10})}) : 30}"
    ry="${minmax({value:30,min:30 - ease({distance:30})})}"
    fill="none"
    stroke="red"
    stroke-width="5"
    ></ellipse>
    <text y="12">n:${framenr}</text>
</sprite-meister>
```

* The ``<sprite-meister>`` Web Component reads its content as a String
* The String is passed to a ``parseStringLiteral`` Function
* **together** with a {} data object containing variables AND functions (see 'ease' in above code)
* every **function** generates ONE value for every frame-step
* with all data the Web Component creates one SVG (24 framesteps wide)

{% jsfiddle https://jsfiddle.net/WebComponents/fne8kvp5 result,html %}


## Known issues

* The Repo is a mess, all code should be refactored
* Because 1 SVG is created for every frame-step, a **Absolute** reference will always point to frame 1
* Same goes for % Percentages in the X plane
* The SVG is 1 frame high, so Y plane percentages are fine
* ...

Minimal documentation in [documentation.html](https://spritemeister.github.io/documentation.html) I told you, it is a Working Model v.042




