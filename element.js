const __ANIMATION_METHOD_IMG__ = 0;
const __ANIMATION_METHOD_CSS__ = 1;
const __ANIMATION_METHOD_BOTH__ = 2;

// *********************************************************************************** define
class SpriteBaseClass extends HTMLElement {
  log(label, ...args) {
    console.log(`%c <${this.localName}> ${label}`, `background:green;color:white`, ...args);
  }
  // =================================================================== SpriteBaseClass constructor
  constructor({ app, template = true, shadow = true }) {
    super()
      .attachShadow({
        mode: "open",
      })
      .append(template ? document.getElementById(this.nodeName).content.cloneNode(true) : []);
    this.app = app;
  }

  // =================================================================== SpriteBaseClass setProperty
  query(selector) {
    return (this.shadowRoot || this).querySelector(selector);
  }
  // =================================================================== SpriteBaseClass setProperty
  setProperty(name, value) {
    this.style.setProperty("--" + name, value);
  }
  // =================================================================== SpriteBaseClass - escapedSVG
  escapedSVG(escapedTAGS = false) {
    let svg = "data:image/svg+xml," + this.svg;
    svg = svg.replace(/#/g, "%23");
    svg = svg.replace(/=''/g, ""); // remove incorrect empty attribute values set by HTML
    if (escapedTAGS) svg = svg.replace(/</g, "%3C").replace(/>/g, "%3E");
    return svg;
  }
  // =================================================================== SpriteBaseClass - listen
  listen(settings) {
    let func = settings;
    let name = "sprite-meister";
    let root = document.body;
    if (typeof settings == "object") {
      name = settings.name || name;
      func = settings.do;
      root = settings.root || root;
      if (root == document) console.error("use document.body to listen on ", name, func);
    }
    this.log(`listen to '${name}'`);
    root.addEventListener(name, func);
  }
  // =================================================================== SpriteBaseClass - dispatch
  dispatch(detail, options = { name: "sprite-meister", bubbles: true, composed: true }) {
    let eventName = options.name;
    if (Object.keys(detail).length === 0 && detail.constructor === Object)
      // empty Object check
      options = { bubbles: true, composed: true };
    console.log(
      `dispatch %c ${eventName}:blue;color=white`,
      "background:green;color:white",
      detail,
      "\n options:",
      options
    );
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: options.bubbles,
        composed: options.composed,
        detail,
      })
    );
  }
  // =================================================================== SpriteBaseClass - respond
  respond(func) {
    this.listen((evt) => {
      if (evt.detail.to && evt.detail.to.includes(this.nodeName)) {
        func(evt);
      } else {
        //console.error(`not for me`,evt.detail.to)
      }
    });
  }
}
// *********************************************************************************** define sprite animation
customElements.define(
  "sprite-animation",
  class extends SpriteBaseClass {
    // ================================================================- sprite animation - observedAttributes
    static get observedAttributes() {
      return [
        "src",
        "cell",
        "row",
        "method",
        "width",
        "height",
        "steps",
        "duration",
        "playstate",
        "from",
        "to",
        "strip",
      ];
    }
    // ================================================================- sprite animation - constructor

    constructor() {
      super({ template: false, shadow: true });
      this.constructor.observedAttributes.map(
        (attr) =>
          Object.defineProperty(
            this,
            attr,
            {
              set: (val) => this.setAttribute(attr, val),
              get: () =>
                this.getAttribute(attr) ||
                getComputedStyle(this).getPropertyValue(`--sprite-animation-${attr}`).replace(/"/g, "").trim() ||
                {
                  method: __ANIMATION_METHOD_IMG__, //0-img 1-css 2-both
                  strip: false,
                  duration: "1s",
                  playstate: "running",
                  from: 0,
                  //to: this.steps ? this.steps.split("x")[0] : undefined,
                }[attr],
            }
            // console.log(attr, this[attr])
          ) // end defineProperty
      );
      ["start", "iteration", "end"].map((name) => {
        this.shadowRoot.addEventListener("animation" + name, (evt) => {
          //console.warn(this.steps,name);
          if (name == "iteration") {
            if (this.hasAttribute("shift")) {
              let row = ~~this.row;
              let rows = ~~this.steps.split("x")[1];
              if (row == rows - 1) row = 0;
              else row++;
              //this.setAttribute("row",row);
              //this.render();
            }
          }
        });
      });
      this.onmouseover = (evt) => {
        console.log(evt.target.composedPath);
      };
    }
    // =============================================================== sprite animation - connectedCallback
    connectedCallback() {
      this.render();
    }
    // =============================================================== sprite animation - play
    play() {}
    // =============================================================== sprite animation - pause
    pause() {}
    // =============================================================== sprite animation - keyframes
    keyframes(columns, rows, width, height) {
      let percent = (r) => row * ~~(100 / rows);
      let frame = (p, x, y) => `\n${p}%{ 
            background-position-y:${y};
            background-position-x:${x}px;
        }`;
      let keyframes = frame(0, 0, 0);
      let row = 0;
      console.log(columns, rows, width, height);
      while (row++ < rows) {
        let p = percent(row);
        keyframes += frame(p, -columns * width, -(row - 1) * height);
        if (row < rows) keyframes += frame(p + 0.001, 0, -row * height);
      }
      console.warn(keyframes);
    }
    // =============================================================== sprite animation - style
    setIMGAnimation({
      img,
      naturalWidth = img.naturalWidth,
      naturalHeight = img.naturalHeight,
      steps = this.steps ||
        (() => {
          //divide naturalWidth until its an integer
          let cellcount = 1;
          do {
            cellcount++;
          } while (!(naturalWidth % cellcount) == 0);
          this.log(
            "auto calculated cells:",
            cellcount,
            "cells ",
            naturalWidth / cellcount,"px width",
            "from IMG width:",
            naturalWidth
          );
          return String(cellcount);
        })(),
      duration = this.duration,
      width,
      height,
    }) {
      let [cells, rows = 1] = steps.split("x");
      height = height || naturalHeight / rows;
      width = width || naturalWidth / cells;
      console.warn(img.src.split("/").slice(-1)[0], " = ", steps, cells, rows, height, width);
      let animation = `IMGanimationX ${duration} steps(${cells}) infinite`;
      if (rows > 1) animation += `,IMGanimationY calc(${rows} * ${duration}) steps(${rows}) infinite`;

      this.shadowRoot.querySelector("style#IMGanimation").innerHTML = `
      div {
        background: var(--background,lightgreen);
        width:${width}px;
        height:${height}px;
        overflow:hidden;
      }
      div img{
        width:${naturalWidth}px;
        animation:${animation};
        animation-play-state:${this.playstate};
      }
      @keyframes IMGanimationX{
        from{transform: translateX(0px)}
        to{transform:translateX(-${naturalWidth}px)
        }
      }
      @keyframes IMGanimationY{
        from{transform: translateY(0)}
        to{transform: translateY(-${rows * (naturalHeight / rows)}px)}
      }`;
    }
    setBackGroundAnimation({}) {
      let animation = `CSSanimationX var(--duration-css) steps(var(--steps)) infinite`;
      if (rows) animation += `,CSSanimationY calc(var(--rows) * var(--duration-css)) steps(${rows}) infinite`;
      css_animation = `background-image:url("${this.src}");
        background-size:${this.steps.split("x")[1] ? "-1px" : "cover"};
        animation:${animation};
        animation-play-state:var(--animation-play-state-css,${this.playstate});
        `;
      css_keyframes = `@keyframes CSSanimationX{
          from{background-position-x: var(--frompx)}
          to{background-position-x: var(--topx)}
        }@keyframes CSSanimationY{
          from{background-position-y: 0}
          to{background-position-y: -${rows * height}px}
        }`;
    }
    // =============================================================== sprite animation - render
    render() {
      try {
        let width, height, cells, rows, duration;
        if (this.src.includes("spriter")) {
          //! extract sprite info from URI
          let config = this.src.split(/spriter/)[1];
          let [empty, stepsX, cellX, wrap, durationS] = config.split(/-|\./);
          this.cell = cellX;
          this.steps = stepsX;
          duration = durationS;
          this.log(`extract data from filename`, config);
        }
        [width = console.error("missing width"), height = width] = (this.cell || "").split("x");
        //[cells, rows = 0] = this.steps.split("x");
        let [durationimg, durationcss = durationimg] = (duration || this.duration).split(",");
        width = ~~width;
        height = ~~height;
        cells = ~~cells;
        rows = ~~rows;
        //this.keyframes(cells, 4, width, height);
        let div_content = "";

        if (this.method == __ANIMATION_METHOD_IMG__ || this.method == __ANIMATION_METHOD_BOTH__) {
          div_content = `<img src="${this.src}" onload="this.getRootNode().host.setIMGAnimation({img:this})">`;
        }
        if (this.method == __ANIMATION_METHOD_CSS__ || this.method == __ANIMATION_METHOD_BOTH__) {
        }
        //CSS background animation loops cells (continues from 0) when tocell > cellcount

        let strip = this.strip ? `<img style="width:100vw" src="${this.src}">` : ``;
        // console.log(
        //   `spriter method:${this.method} = `,
        //   cells,
        //   rows,
        //   width,
        //   height,
        //   durationimg,
        //   this.src,
        //   "\n",
        //   style.length,
        //   "bytes CSS"
        // );
        this.shadowRoot.innerHTML = `<style>:host([hidden]){
          display:none;
        }
        :host{
          display:inline-block;
        }
        div{
          width:0; /* prevent FOUC */
          height:0;
          overflow:hidden;
        }</style>
        ${strip}
        <style id=IMGanimation></style>
        <div>${div_content}</div>`;
      } catch (e) {
        console.error(e);
      }
    }
  }
);

// *********************************************************************************** define svg spriter
customElements.define(
  "sprite-meister",
  class extends SpriteBaseClass {
    // =================================================================== svg spriter - constructor
    constructor() {
      super({ template: false, shadow: true }).respond((evt) => {
        //! respond to editor changes
        //! sprite-meisters in sprite-templates don't respond
        if (!this.hasAttribute("templatename")) {
          if (evt.detail.hasOwnProperty("framenr")) {
            this.freeze(evt.detail.framenr);
          } else {
            this.render(evt.detail.framedefinition);
          }
        }
      });
    }
    // =================================================================== svg spriter - connectedCallback
    connectedCallback() {
      let templateid = this.getAttribute("template");
      this.template = document.querySelector(`template#${templateid}`) || console.error("missing template");
      this.templatecontent = this.template.innerHTML.replace(/"/g, "'");
      this.render(this.templatecontent);
      if (this.hasAttribute("templatename")) {
        this.onclick = (evt) => {
          if (this.hasAttribute("usertemplate")) {
            if (evt.ctrlKey) {
              this.dispatch(
                {
                  templateid,
                },
                {
                  name: "remove-template",
                  bubbles: true,
                  composed: true,
                }
              );
              this.remove();
            }
          } else {
            templateid = "user_" + templateid + "_" + new Date() / 1;
            document
              .querySelector("sprite-templates[user]")
              .appendBodySpriteTemplate(templateid, this.template.innerHTML);
          }
          this.dispatch({
            to: "SPRITE-MEISTER",
            templateid,
            framedefinition: this.templatecontent,
          });
        };
      }
    }
    // =================================================================== svg spriter - render
    render(frame) {
      let parseStringLiteral = (str, v = {}) => {
        try {
          return new Function("v", "return((" + Object.keys(v).join(",") + ")=>`" + str + "`)(...Object.values(v))")(v);
        } catch (e) {
          console.error("parse", e);
          console.error(new Error().stack);
        }
      };
      let round = (x, n = 1) => Number.parseFloat(x).toFixed(n);

      let circlePoints = (radius, center = [50, 50], steps = 24) => {
        let points = [];
        for (let i = 0; i < steps; i++) {
          points.push([
            round(center[0] + radius * Math.cos(2 * Math.PI * (i / steps))),
            round(center[1] + radius * Math.sin(2 * Math.PI * (i / steps))),
          ]);
        }
        return points;
      };

      let arcPoints = (
        p1, // point1 [x,y]
        p2, // point2 [x,y]
        c = [50, 50], // controlpoints [x,y] or [x1,y1,x2,y1]
        steps
      ) => {
        let points = [];
        for (let i = 0; i <= steps; i++) {
          let t = i / steps;
          let s = 1 - t;
          let m = 3;
          points.push([
            round(
              s * s * s * p1[0] + m * s * s * t * (c[0] || p1[0]) + m * s * t * t * (c[2] || c[0]) + t * t * t * p2[0]
            ),
            round(
              s * s * s * p1[1] + m * s * s * t * (c[1] || p1[1]) + m * s * t * t * (c[3] || c[1]) + t * t * t * p2[1]
            ),
          ]);
        }
        return points;
      };

      let circle = (p, radius = 2, color = "red") =>
        `<circle cx='${p[0]}' cy='${p[1]}' r='${radius}' fill='${color}'></circle>`;
      setTimeout(() => {
        let attr = (x, defaultValue) => this.getAttribute(x) || (this.template && this.template.getAttribute(x)) || defaultValue;
        this.steps = ~~attr("steps", 10);
        this.setProperty("steps", this.steps - 1);
        this.vbwidth = ~~attr("w", 100);
        this.vbheight = ~~attr("h", this.vbwidth);
        this.width = attr("width", "80px");
        this.heigth = attr("height") || this.width;
        this.duration = attr("duration", "1s");
        let q0 = 0;
        let q1 = this.steps / 4;
        let q2 = this.steps / 2;
        let q3 = this.steps - this.steps / 4;
        let q4 = this.steps;

        let $data = (this.data = {
          width: this.width,
          height: this.height,
          q0,
          q1,
          q2,
          q3,
          q4,
        });
        "v1,v2,v3,v4,v5,v6,v7,v8,v9".split`,`.map((attr) => {
          Object.defineProperty(this.data, attr, {
            get() {
              return $data[attr];
            },
            set(val) {
              $data[attr] = val;
              return ""; // return empty string, don't inject anything into the SVG string
            },
          });
        });
        this.frames = Array(this.steps) //spritecount
          .fill(this.steps)
          .map((framecount, framenr) => {
            let frameinfo = {
              extra: "",
            };
            frameinfo.svg = parseStringLiteral(frame, {
              framenr,
              w: this.vbwidth,
              h: this.vbheight,
              steps: framecount, // number of total steps
              ...this.data,
              // add p0,p1,p2... p9 - percentages of s (framenr)
              ...Array(10)
                .fill(framecount)
                .reduce((a, x, i) => ((a["p" + i] = (i * framecount) / 10), a), {}),
              // FUNC: round
              round: round,
              // FUNC: minmax
              minmax: (v, min, max = v) => (v < min ? min : v > max ? max : v),
              // FUNC: pulse
              pulse: (start, mid, end = start) =>
                round(
                  Array(framecount)
                    .fill(framenr)
                    .map((n, t) => (t <= q2 ? start + t * ((mid - start) / q2) : mid - (t - q2) * ((mid - end) / q2)))[
                    framenr
                  ]
                ),
              // FUNC: ease
              ease: (
                distance, //
                cycle = this.steps / 2, //
                delay = q1,
                a = (-4 * distance) / Math.pow(cycle * 2, 2)
              ) =>
                Array(framecount)
                  .fill(framenr)
                  .map((n, t) => a * Math.pow(((t + cycle) % (cycle * 2)) - cycle, 2) + distance)[framenr],
              // FUNC: delay
              delay: (time, val, defaultValue = 0) =>
                Array(framecount)
                  .fill(framenr)
                  .map((n, t) => (t > time ? val : defaultValue))[framenr],
              // FUNC: scale - returns SVG matrix
              scale: (start, mid, end = start, center = 50) =>
                round(
                  Array(framecount)
                    .fill(framenr)
                    .map((n, t) => {
                      let scale = t <= q2 ? start + t * ((mid - start) / q2) : mid - (t - q2) * ((mid - end) / q2);
                      return `matrix(${scale} 0 0 ${scale} ${center - center * scale} ${center - center * scale})`;
                    })[framenr]
                ),
              // FUNC circlepath
              circlepath: (radius, center = [50, 50]) => circlePoints(radius, center, framecount)[framenr],
              // FUNC circle
              circle: (p, color, radius) => circle(p, color, radius),
              // FUNC arcpath
              arcpath: (
                start,
                end,
                control = [start[0], start[1], end[0], end[1]], // controlpoints are start/end points
                color
              ) => {
                let startframe = start[2] || 0;
                let endframe = end[2] || framecount;
                if (framenr >= startframe && framenr <= endframe) {
                  let points = arcPoints(start, end, control, endframe - startframe - 1);
                  //points = [...points, ...points.reverse()][framenr]; // return from half way
                  if (color)
                    frameinfo.extra += points.map((p) =>
                      circle(p, 1, ["", "red", "blue", "green", "magenta", "teal", "orange"][color])
                    ).join``;
                  points = points[framenr - (startframe - 0)];
                  //   if (start[2] == 5)
                  //     console.error(
                  //       framenr,
                  //       start,
                  //       startframe,
                  //       end,
                  //       endframe,
                  //       points
                  //     );
                  if (color === 0) return { x: 0, y: 0 };
                  else return { x: points[0], y: points[1] };
                } else {
                  if (framenr < endframe) return { x: start[0], y: start[1] };
                  else return { x: end[0], y: end[1] };
                }
              },
              // FUNC rotate
              rotate: (v, cx = 50, cy = 50) => `rotate(${v} ${cx} ${cy})`,
              // FUNC end
            })
              .replace(/\n/g, "") // remove linebreaks from SVG string
              .replace(/  /g, "") // remove all spaces between >  < in SVG
              .replace(/=''/g, ""); // remove incorrect empty attribute values set by HTML
            return frameinfo;
          });

        this.viewBox = `viewBox='0 0 ${this.steps * this.vbwidth} ${this.vbheight}'`;
        this.svg = `<svg xmlns='http://www.w3.org/2000/svg' ${this.viewBox} width='100'>${this.frames
          //!!todo clip frame
          .map(
            (frameinfo, n) => `<g transform='translate(${n * this.vbwidth} 0)'>${frameinfo.svg}${frameinfo.extra}</g>`
          )
          .join("")}</svg>`.replaceAll('"', "'");

        let html =
          `<style>
              div{
                display:inline-flex;width:${this.width};
                background-image:url("${this.escapedSVG(true)}");
                background-size:auto ${this.width};
              }
              div::before{content:"";padding-top:100%}}
           </style>` +
          `<style id=anim onload="this.disabled=false">
              div{
                background-color:${this.getAttribute("background-color")};
                animation:moveX ${this.duration} steps(${this.steps - 1}) Infinite;
              }
              @keyframes moveX{
                to{
                  background-position:${-(this.steps - 1) * this.width.replace("px", "") + "px"};
                }
              }
            </style>` +
          `<style id=freeze onload="this.disabled=true">
            div{
              xbox-sizing:border-box;
              border:1px solid red;
              background-color:lightgrey;
              animation-play-state:paused!important;
              --posX:calc(-${this.width} * var(--framenr) );
              background-position:var(--posX);
            }
            </style>` +
          `<div></div>`;
        // console.log(
        //   `${this.nodeName} ${this.id} steps=${this.steps}:hotpink`,
        //   this.width,
        //   html.length,
        //   "bytes"
        // );
        this.shadowRoot.innerHTML = html;
        //! only dispatch for editted sprite
        if (this.loaded) this.dispatch({ sprite: this });
        this.log("render", this.id);
        if (this.hasAttribute("freeze")) {
          this.freeze(this.getAttribute("freeze"));
        }
        this.loaded = true;
      });
    } // render
    // =================================================================== svg spriter - duration
    duration() {
      this.setProperty("duration", "2s");
    }
    // =================================================================== svg spriter - freeze
    freeze(framenr) {
      setTimeout(() => {
        this.shadowRoot.querySelector("#freeze").disabled = framenr < 0;
        this.shadowRoot.querySelector("#anim").disabled = framenr > -1;
        this.setProperty("framenr", framenr);
        if (framenr < 0) this.style.removeProperty("--framenr");
      }, 50);
    }
    // =================================================================== svg spriter - escapedSVG
    framed(n = 0) {
      return this.frames[n].svg;
    }
  }
); // define svg-sprite

// a function to get the intersection point of 2 lines, Returns the point of intersection or false if there is no intersection point
function Intersect(p1, p2, p3, p4) {
  let denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  let ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  let ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
  if (ua > 0 && ua < 1 && ub > 0 /*&& ub < 1*/) {
    return { x: p1.x + ua * (p2.x - p1.x), y: p1.y + ua * (p2.y - p1.y) };
  } else {
    return false;
  }
}

// curved line between 2 points
// https://stackoverflow.com/questions/66980862/how-to-make-custom-svg-paths
function getCubicBezierPath(p1, p2) {
  const midY = (p1.y + p2.y) / 2;
  return `M${p1.x},${p1.y}C${p1.x},${midY},${p2.x},${midY},${p2.x},${p2.y}`;
}
