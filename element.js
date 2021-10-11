// settings for the svg
const __DEFAULT_STEPS_IN_SPRITE__ = 24;
const __DEFAULT_VIEWBOX_WIDTH__ = 100;
const __DEFAULT_SPRITE_DURATION__ = "1s";

// constants
const __ANIMATION_METHOD_IMG__ = 0;
const __ANIMATION_METHOD_CSS__ = 1;
const __ANIMATION_METHOD_BOTH__ = 2;

// *********************************************************************************** define
class SpriteBaseClass extends HTMLElement {
  log(label, ...args) {
    console.log(`%c <${this.localName}> ${label}`, `background:green;color:white`, ...args);
  }
  // ================================================================- sprite animation - observedAttributes
  static get observedAttributes() {
    return [
      "src", // png,jpg,svg source file with relative or full path
      "method", // 0 = animation in CSS background, 1 = animation in IMG, 2 = animation in both
      "cell",
      "row",
      "width",
      "height",
      "steps",
      "duration",
      "playstate",
      "from",
      "to",
      "strip",
      "iteration",
    ];
  }
  // =================================================================== SpriteBaseClass attributeChangedCallback
  attributeChangedCallback(name, oldValue, newValue) {
    if (name == "duration") {
      this.log(`attributeChangedCallback ${name}`, oldValue, newValue);
      this.setProperty("anim_duration", newValue);
    } else if (name == "cell") {
      //!! render sprite again set background-size?
    }
  }
  // =================================================================== SpriteBaseClass constructor
  constructor({ app, template = true, shadow = true }) {
    super()
      .attachShadow({
        mode: "open",
      })
      .append(
        template // if template==true
          ? document.getElementById(this.nodeName).content.cloneNode(true) // get template by Id
          : [] // else return empty array to append
      );
    this.app = app;
  }

  // =================================================================== SpriteBaseClass setProperty
  // query(selector) {
  //return (this.shadowRoot || this).querySelector(selector);
  // }
  // =================================================================== SpriteBaseClass setProperty
  setProperty(name, value) {
    this.style.setProperty("--" + name, value);
  }
  // =================================================================== SpriteBaseClass - escapedSVG
  escapedSVG(
    escapedTAGS = false,
    // save let statement in body
    svg = "data:image/svg+xml," + this.svg
  ) {
    //! check if SVG has illegal content; Objects not cast to String, or Undefined content
    if (this.svg.includes("object") || this.svg.includes("undefined")) {
      let errorColor = "background:red;color:white;font-size:1.2em;font-weight:bold";
      let marker = "Object";
      let errorLabel = "[Object]";
      if (this.svg.includes("undefined")) {
        marker = "undefined";
        errorLabel = "undefined";
      }
      console.error(
        `%c ${this.id}/${this.templateid || "no template"} - illegal '${errorLabel}' in SpriteMeister SVG string:`,
        errorColor,
        "\n",
        this.svg.slice(this.svg.indexOf(marker) - 50, this.svg.indexOf(marker) + 50)
      );
    }

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
  dispatch(
    detail, // Event detail object
    options = { name: "sprite-meister", bubbles: true, composed: true },
    eventName = options.name
  ) {
    // empty Object check
    if (Object.keys(detail).length === 0 && detail.constructor === Object) options = { bubbles: true, composed: true };
    // log Event
    console.log(
      `dispatch %c ${eventName}:blue;color=white`,
      "background:green;color:white",
      detail,
      "\n options:",
      options
    );
    this.dispatchEvent(
      new CustomEvent(eventName, {
        ...options,
        // bubbles: options.bubbles,
        // composed: options.composed,
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
                getComputedStyle(this)
                  .getPropertyValue(`--sprite-animation-${attr}`) // getPropertyValue
                  .replace(/"/g, "") // remove double quotes
                  .trim() || // trim spaces // or default value
                {
                  //! default settings
                  method: __ANIMATION_METHOD_IMG__, //0-img 1-css 2-both
                  strip: false,
                  duration: "1s",
                  playstate: "running",
                  iteration: "Infinite",
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
            naturalWidth / cellcount,
            "px width",
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
      console.log(
        img.src.split("/").slice(-1)[0],
        `steps:${steps}, cells:${cells}, rows:${rows}, height:${height}, width:${width}`
      );

      // create CSS animation: settings with steps
      let animation = `IMGanimationX ${duration} steps(${cells}) infinite`;
      if (rows > 1) animation += `,IMGanimationY calc(${rows} * ${duration}) steps(${rows}) infinite`;

      // inject STYLE contents
      this.shadowRoot.querySelector("style#IMGanimation").innerHTML =
        `div{` +
        `background: var(--background,${this.getAttribute("background") || "transparent"});` +
        `width:${width}px;` +
        `height:${height}px;` +
        `overflow:hidden;` +
        `}` +
        `div img{` +
        `width:${naturalWidth}px;` +
        `animation:${animation};` +
        `animation-play-state:${this.playstate};` +
        `}` +
        `@keyframes IMGanimationX{` +
        `from{transform: translateX(0px)}` +
        `to{transform:translateX(-${naturalWidth}px)` +
        `}` +
        `}` +
        `@keyframes IMGanimationY{` +
        `from{transform: translateY(0)}` +
        `to{transform: translateY(-${rows * (naturalHeight / rows)}px)}` +
        `}`;
    }
    setBackGroundAnimation({}) {
      let animation = `CSSanimationX var(--duration-css) steps(var(--steps)) infinite`;
      if (rows) animation += `,CSSanimationY calc(var(--rows) * var(--duration-css)) steps(${rows}) infinite`;
      css_animation =
        `background-image:url("${this.src}");` +
        `background-size:${this.steps.split("x")[1] ? "-1px" : "cover"};` +
        `animation:${animation};` +
        `animation-play-state:var(--animation-play-state-css,${this.playstate});`;
      css_keyframes =
        `@keyframes CSSanimationX{` +
        `from{background-position-x: var(--frompx)}` +
        `to{background-position-x: var(--topx)}` +
        `}@keyframes CSSanimationY{` +
        `from{background-position-y: 0}` +
        `to{background-position-y: -${rows * height}px}` +
        `}`;
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
        this.shadowRoot.innerHTML =
          `<style>:host([hidden]){display:none}` +
          `:host{display:inline-block}` +
          `div{width:0;height:0;overflow:hidden}</style>` + // prevent FOUC
          strip +
          `<style id=IMGanimation></style><div>${div_content}</div>`;
      } catch (e) {
        console.error(e);
      }
    }
  }
);
//* <sprite-animation> */

// *********************************************************************************** define svg spriter
customElements.define(
  "sprite-meister",
  class extends SpriteBaseClass {
    // =================================================================== svg spriter - constructor
    constructor() {
      super({ template: false, shadow: true }) //
        .respond((evt) => {
          if (this.hasAttribute("templatename")) {
            //! sprite-meisters in sprite-templates must not respond
          } else {
            //! respond to editor changes
            if (evt.detail.hasOwnProperty("framenr")) this.freeze(evt.detail.framenr);
            if (evt.detail.hasOwnProperty("framedefition")) this.render(evt.detail.framedefinition);
            if (evt.detail.hasOwnProperty("duration")) this.setAttribute("duration", evt.detail.duration + "s");
          }
        });
    }
    // =================================================================== svg spriter - connectedCallback
    connectedCallback() {
      let templateString = "";
      this.templateid = this.getAttribute("template");
      if (this.templateid) {
        this.template =
          document.querySelector(`template#${this.templateid}`) ||
          console.error(
            `%c <${this.localName}> No <template id="${this.templateid}"> in DOM `,
            "background:red;color:white"
          );
        templateString = this.template?.innerHTML || "";
      }
      templateString = templateString.replace(/"/g, "'");
      this.render(templateString);
      if (this.hasAttribute("templatename")) {
        this.onclick = (evt) => {
          if (this.hasAttribute("usertemplate")) {
            if (evt.ctrlKey) {
              this.dispatch(
                {
                  templateid: this.templateid,
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
            this.templateid = "user_" + this.templateid + "_" + new Date() / 1; //666
            document
              .querySelector("sprite-templates[user]")
              .appendBodySpriteTemplate(this.templateid, this.template.innerHTML);
          }
          this.dispatch({
            to: "SPRITE-MEISTER",
            templateid: this.templateid,
            framedefinition: templateString,
          });
        };
      }
    }
    // =================================================================== svg spriter - render
    render(frame) {
      let parseStringLiteral = (str, v = {}) => {
        //console.log("parseStringLiteral", { str: [str] }, v);
        try {
          let returnString =
            new Function("v", "return((" + Object.keys(v).join(",") + ")=>`" + str + "`)(...Object.values(v))")(v) ||
            "";
          return returnString;
        } catch (e) {
          console.error(
            `%c parseStringLiteral ${e}\nid:${this.id} template:${this.templateid}`,
            "background:red;color:white;font-size:1.5em;",
            "\n id",
            this.id,
            { input_str: str },
            v,
            str
          );
          //! DO not return ""; this will list the error for every frame
          //console.error(new Error().stack);
        }
      };
      let roundN = (x, n = 1) => Number.parseFloat(x).toFixed(n);

      let circlePoints = (radius, center = [50, 50], steps = 24) => {
        let P,
          points = [];
        for (let i = 0; i < steps; i++) {
          P = 2 * Math.PI * (i / steps);
          points.push([roundN(center[0] + radius * Math.cos(P)), roundN(center[1] + radius * Math.sin(P))]);
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
            roundN(
              s * s * s * p1[0] + m * s * s * t * (c[0] || p1[0]) + m * s * t * t * (c[2] || c[0]) + t * t * t * p2[0]
            ),
            roundN(
              s * s * s * p1[1] + m * s * s * t * (c[1] || p1[1]) + m * s * t * t * (c[3] || c[1]) + t * t * t * p2[1]
            ),
          ]);
        }
        return points;
      };

      let circle = (p, radius = 2, color = "red") => {
        if (p.length != 2) console.error("invalid point", p, "must be [x,y] notation");
        return `<circle cx='${p[0]}' cy='${p[1]}' r='${radius}' fill='${color}'/>`;
      };
      setTimeout(() => {
        // this = <sprite-meister>
        let attr = (x, defaultValue) =>
          this.getAttribute(x) || (this.template && this.template.getAttribute(x)) || defaultValue;
        this.steps = ~~attr("steps", __DEFAULT_STEPS_IN_SPRITE__);
        this.setProperty("steps", this.steps - 1);
        this.vbwidth = ~~attr("w", __DEFAULT_VIEWBOX_WIDTH__);
        this.vbheight = ~~attr("h", this.vbwidth);
        this.width = attr("width", "100px");
        this.heigth = attr("height") || this.width;
        this.duration = attr("duration", __DEFAULT_SPRITE_DURATION__);
        this.iteration = attr("iteration", "infinite");
        this.log(
          `${this.id} ${this.steps} steps ${this.duration}, ${this.vbwidth}x${this.vbheight}  ${this.width} ${this.heigth}`
        );
        let q0 = 0;
        let q1 = this.steps / 4;
        let q2 = this.steps / 2;
        let q3 = this.steps - this.steps / 4;
        let q4 = this.steps;

        let $data = (this.data = {
          a1: this.getAttribute("a1") || "0",
          a2: this.getAttribute("a2") || "0",
          a3: this.getAttribute("a3") || "0",
          a4: this.getAttribute("a4") || "0",
          a5: this.getAttribute("a5") || "0",
          a6: this.getAttribute("a6") || "0",
          a7: this.getAttribute("a7") || "0",
          a8: this.getAttribute("a8") || "0",
          a9: this.getAttribute("a9") || "0",
          // width: this.width, //! there is no DOM width height yet!
          // height: this.height, //! there is no DOM width height yet!
          framecount: this.steps,
          cx: this.width / 2,
          cy: this.height / 2,
          q0, // start framenr
          q1, // q1 framenr (steps/4)
          q2, // q2 framenr (steps/2)
          q3, // q3 framenr (steps - steps/4)
          q4, // end framenr
        });
        "v1,v2,v3,v4,v5,v6,v7,v8,v9".split`,`.map((attr) => {
          // decalre setv1, setv2 as functions so an empty "" can be returned to the SVG
          // optional second parameter setv1(v,"") is documentation in string
          this.data["set" + attr] = new Function("v", `${attr}=v;return "";`); // return empty string injected in SVG
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

            frameinfo.svg = parseStringLiteral(frame || this.innerHTML, {
              n: framenr,
              framenr,
              w: this.vbwidth,
              h: this.vbheight,
              qh: this.vbheight / 4, // quarter-height
              qw: this.vbwidth / 4, // quarter-width
              hh: this.vbheight / 2, // half-height
              hw: this.vbwidth / 2, // half-width
              framecount,
              steps: framecount, // number of total steps
              ...this.data,
              // add p0,p1,p2... p9 - percentages of s (framenr)
              ...Array(10)
                .fill(framecount)
                .reduce((a, x, i) => ((a["p" + i] = (i * framecount) / 10), a), {}),

              // FUNC: attr - return from <sprite-meister> or template
              attr: (x, defaultValue = false) => {
                if (this.getAttribute(x)) return this.getAttribute(x);
                else if (this.template && this.template.getAttribute(x)) return this.template.getAttribute(x);
                else if (defaultValue) return defaultValue;
                else console.error(`Missing attribute ${framenr} "${x}"`, this);
              },
              // FUNC: doc - documentation in template string
              doc: (x) => "",
              // FUNC: round
              round: ({ value, precision = 0 }) => roundN(value, precision),
              // FUNC: minmax
              minmax: ({ value, min, max = value }) => (value < min ? min : value > max ? max : value),
              // FUNC: pulse
              pulse: ({ start = 0, mid = 0, end = start }) =>
                roundN(
                  Array(framecount)
                    .fill(framenr)
                    .map((n, t) => (t <= q2 ? start + t * ((mid - start) / q2) : mid - (t - q2) * ((mid - end) / q2)))[
                    framenr
                  ]
                ),
              // FUNC: ease
              ease: ({
                distance, //
                frames = this.steps / 2, //
                delay = q1,
                seed = (-4 * distance) / Math.pow(frames * 2, 2), // some kind of constant I picked up somewhere
              }) =>
                Array(framecount)
                  .fill(framenr)
                  .map((n, t) => seed * Math.pow(((t + frames) % (frames * 2)) - frames, 2) + distance)[framenr],

              // FUNC: delay
              delay: (time, val, defaultValue = 0) =>
                Array(framecount)
                  .fill(framenr)
                  .map((n, t) => (t > time ? val : defaultValue))[framenr],
              // FUNC: scale - returns SVG matrix
              scale: ({ start, mid, end = start, center = 50 }) =>
                roundN(
                  Array(framecount)
                    .fill(framenr)
                    .map((n, t) => {
                      let scale = t <= q2 ? start + t * ((mid - start) / q2) : mid - (t - q2) * ((mid - end) / q2);
                      return `matrix(${scale} 0 0 ${scale} ${center - center * scale} ${center - center * scale})`;
                    })[framenr]
                ),
              // FUNC circlepath
              circlepath: ({
                radius = this.vbwidth / 2 - 10, // 10 pixels less than the width
                center = [this.vbwidth / 2, this.vbheight / 2], // centerpoint of svg
                color = false,
                colorsize = 2,
              }) => {
                let points = circlePoints(radius, center, framecount);
                if (color || this.hasAttribute("paths"))
                  frameinfo.extra += points.map((p) =>
                    circle(p, colorsize, ["", "red", "blue", "green", "magenta", "teal", "orange"][color])
                  ).join``;
                return { x: points[framenr][0], y: points[framenr][1] };
              },
              // FUNC circle
              circle: ({ cx = 0, cy = 0, point = [cx, cy], color, radius }) => circle(point, color, radius),
              // FUNC arcpath
              arcpath: ({
                start, // [x,y] point
                end, // [x,y] point
                control = [start[0], start[1], end[0], end[1]], // controlpoints are start/end points
                deltax = end[0] - start[0],
                deltay = end[1] - start[1],
                c1ontrol = [start[0] + deltax / 2, start[1] - deltay / 2, end[0] - deltax / 2, end[1] - deltay / 2], // controlpoints are start/end points
                color = false,
                colorsize = 2,
              }) => {
                if (typeof control == "number") {
                  control = [start[0] + deltax / 2, start[1] - control, end[0] - deltax / 2, start[1] - control];
                } else if (Array.isArray(control)) {
                  if (control.length == 2) {
                    control = [
                      start[0] + deltax / 2 + control[0], //! x offset
                      start[1] - control[1],
                      end[0] - deltax / 2 + control[0], //! x offset
                      start[1] - control[1], //! y offset
                    ];
                  }
                }
                //if(control=="-") control = [start[0]+deltax/2, start[1]-deltax/2, end[0], end[1]];
                let startframe = start[2] || 0;
                let endframe = end[2] || framecount;
                if (framenr >= startframe && framenr <= endframe) {
                  let points = arcPoints(start, end, control, endframe - startframe - 1);
                  //points = [...points, ...points.reverse()][framenr]; // return from half way
                  if (color || this.hasAttribute("paths"))
                    frameinfo.extra += points.map((p) =>
                      circle(p, colorsize, ["", "red", "blue", "green", "magenta", "teal", "orange"][color])
                    ).join``;
                  points = points[framenr - (startframe - 0)];
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
            }) // end of frameinfo.svg
              .replace(/\n/g, "") // remove linebreaks from SVG string
              .replace(/  /g, "") // remove all spaces between >  < in SVG
              .replace(/=''/g, ""); // remove incorrect empty attribute values set by HTML

            return frameinfo;
          }); // end this.frames = .map((framecount,framenr) => frameinfo
        // this frames is array of all frameinfo

        if (this.getAttribute("cell")) {
          let [width, height] = this.getAttribute("cell").split("x");
          this.vbwidth = width;
          this.vbheight = height;
          this.log(`Custom viewBox "0 0 ${this.vbwidth} ${this.vbheight}"`);
        }
        let viewbox = `viewBox='0 0 ${this.steps * this.vbwidth} ${this.vbheight}'`;

        this.svg =
          `<svg xmlns='http://www.w3.org/2000/svg' ` +
          viewbox +
          `>${this.frames
            //!!todo clip frame
            .map(
              (frameinfo, n) =>
                `<g transform='translate(${n * this.vbwidth} 0)'>` +
                frameinfo.extra + // all extra
                frameinfo.svg + // all frame SVG
                `</g>`
            )
            .join("")}</svg>`.replaceAll('"', "'");

        let uniqueID = new Date() / 1;
        let html =
          //!! default style
          `<style>` +
          `div{` +
          `display:inline-flex;width:${this.width};` +
          `background-image:url("${this.escapedSVG(true)}");` +
          `background-size:auto ${this.width};` +
          `}` +
          `div::before{content:"";padding-top:100%}}` +
          `</style>` +
          //!! style declare animation
          `<style id="anim" onload="this.disabled=false">` +
          `div{` +
          `background-color:${this.getAttribute("background-color")};` + //! null value does add a background color
          `animation:` +
          /* animation-name               */ ` var(--anim_name, moveX)` +
          /* animation-duration           */ ` var(--anim_duration, ${this.duration})` +
          ///* animation-timing-function  */ ` var(--animtf, linear)` +
          /* animation-delay              */ ` var(--anim_delay, 0s)` +
          /* animation-iteration-count    */ ` var(--anim_iteraction_count, infinite)` +
          ///* animation-direction          */` var(--animdir, forward)`+
          /* animation-fill-mode          */ ` var(--anim_fill_mode, none)` +
          /* steps                        */ ` steps(${this.steps - 1})` +
          /* animation-play-state         */ ` var(--anim-play_state, running);` +
          `}` +
          `@keyframes moveX{` +
          `to{` +
          `background-position:${-(this.steps - 1) * this.width.replace("px", "") + "px"};` +
          `}` +
          `}` +
          `</style>` +
          //!! style animation paused
          `<style id="freeze" onload="this.disabled=true;">` +
          `div{` +
          `box-sizing:border-box;` +
          `border:2px solid red;` +
          `background-color:lightgrey;` +
          `animation-play-state:paused!important;` +
          `--posX:calc(-${this.width} * var(--framenr) );` +
          `background-position:var(--posX);` +
          `}` +
          `</style>` +
          //!! shadowDOM
          `<div></div>`;
        // console.log(
        //   `${this.nodeName} ${this.id} steps=${this.steps}:hotpink`,
        //   this.width,
        //   html.length,
        //   "bytes"
        // );
        this.shadowRoot.innerHTML = html;

        //! FireFox Bug; it doesn't process the onload on the style
        this.shadowRoot.querySelector("#freeze").disabled = true;

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
        else this.freezeframe = framenr;
      }, 50);
    }
    unfreeze() {
      this.setProperty("framenr", this.freezeframe || 0);
      this.shadowRoot.querySelector("#freeze").disabled = true;
      this.shadowRoot.querySelector("#anim").disabled = false;
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
