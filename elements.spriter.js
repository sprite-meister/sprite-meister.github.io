class MeisterElement extends HTMLElement {
  log(label, ...args) {
    console.log(`<${this.localName}> ${label}:green;color=white`, ...args);
  }
  constructor({ app, template = true, shadow = true }) {
    super()
      .attachShadow({
        mode: "open",
      })
      .append(
        template
          ? document.getElementById(this.nodeName).content.cloneNode(true)
          : []
      );
    this.app = app;
    //console.log(this.nodeName, this.id, this.getRootNode().host);
    // map the tree of elements, communicate to up,down or siblings
    // _PARENT
    // _PARENTS
    // _CHILDREN
    // _SIBLINGS
  }
  appendTemplate() {
    let template = document.getElementById(this.nodeName);
    if (template) {
      console.log(`append template`, this.nodeName);
      this.shadowRoot.append(template.content.cloneNode(true));
    } else {
      this.log("No template:red;color=white");
    }
  }
  addHTML({ root = this.shadowRoot || this, where = "beforeend", html }) {
    try {
      if (!root.insertAdjacentElement) {
        setTimeout(() => {
          root.insertAdjacentHTML(where, html);
        });
      } else {
        root.insertAdjacentHTML(where, html);
      }
    } catch (e) {
      console.error(this.shadowRoot.insertAdjacentHTML);
    }
  }
  dispatch(detail, bubbles = true, composed = true) {
    console.log("dispatch detail:lightblue", detail);
    this.dispatchEvent(
      new CustomEvent(this.app, {
        bubbles,
        composed,
        detail,
      })
    );
  }
  listen(settings) {
    let func = settings;
    let name = this.app;
    let root = document;
    if (typeof settings == "object") {
      name = settings.name || name;
      func = settings.do;
      root = settings.root || root;
    }
    this.log(`listen to '${name}'`);
    root.addEventListener(name, func);
  }
  respond(func) {
    this.listen((evt) => {
      if (evt.detail.to && evt.detail.to.includes(this.nodeName)) {
        func(evt);
      } else {
        //console.error(`not for me`,evt.detail.to)
      }
    });
  }
  shadowSelector(selector) {
    return this.shadowRoot.querySelector(selector);
  }
  shadowSelectorAll(selector) {
    return [...this.shadowRoot.querySelectorAll(selector)];
  }
  setProperty(name, value, root = this) {
    root.style.setProperty("--" + name, value);
  }
}

customElements.define(
  "sprite-configurator",
  class extends MeisterElement {
    constructor() {
      super({ template: true, shadow: true });

      this.shadowSelector("#data").innerHTML = [
        "Columns,columns,12,Total number of horizontal columns",
        "Rows,rows,4,Total number of vertical rows",
        "Width:,width,4,pixel width of one sprite",
        "Height:,height,4,pixel height of one sprite",
        "Wraprows:,wraprows,1,number of rows the animation will automaticall wrap",
        "Startrow:,startrow,1,startrow",
        "Duration:,duration,4,Number of seconds <b>per one row</b>",
      ]
        .map((field) => {
          let [label, id, value, description] = field.split(",");
          Object.defineProperty(this, id, {
            set: (val) => {
              this.shadowSelector("#" + id).value = val;
            },
            get: () => {
              return this.shadowSelector("#" + id).value;
            },
          });
          return `<div>${label}</div><input onkeyup='this.getRootNode().host.keyup(event,this.id,this.value)' id='${id}' value='${value}'/><div>${description} <span id='guess_${id}'></span></div>`;
        })
        .join("");
      this.shadowSelectorAll("input").map((input) => {
        this[input.id] = input.value;
        //this.setProperty(input.id, input.value);
      });
    }
    connectedCallback() {
      this.load();
    }
    load(uri = "./spritesheets/magic.png") {
      let img = this.shadowSelector("#spritesheet");
      img.src = uri;
      console.log(img.src.length,'bytes');

      this.setProperty("background-url", `url(${uri})`);
    }
    imgloaded() {
      let img = this.shadowSelector("#spritesheet");
      let guess = (
        dimension,
        size,
        low = 2,
        high = 256,
        max_rows_columns = 20
      ) => {
        let guess = [];
        for (let g = high; g > low; g--) {
          let r = size / g;
          //console.log(size,g,r)
          if (r == ~~r && r < max_rows_columns) {
            guess.push([r]);
          }
        }
        this.shadowSelector("#guess_" + dimension).innerHTML = guess
          .map(
            (r) =>
              `<sprite-dimension-guess data-label='${dimension}' data-value='${r}'>${r}</sprite-dimension-guess>`
          )
          .join("");
        return guess[0];
      };
      this.columns = guess("columns", img.naturalWidth);
      this.rows = guess("rows", img.naturalHeight);
      this.rerender();
    }
    keyup(evt) {
      let img = this.shadowSelector("#spritesheet");
      let { id, value } = evt.target;
      console.log(id, value, evt);
      this.setProperty(id, value);
      this.rerender();
    }
    rerender() {
      let img = this.shadowSelector("#spritesheet");
      this.width = img.naturalWidth / this.columns;
      this.height = img.naturalHeight / this.rows;
      this.setProperty("width", this.width);
      this.setProperty("height", this.height);
      this.imgtoggle();
    }
    imgtoggle(state = false) {
      this.shadowSelector("#spritesheetplayer").style.display = "inherit";
      this.shadowSelector("#spritesheet").style.display = "none";
    }
    setProperty(name, value) {
      super.setProperty(
        name,
        value,
        this.shadowSelector("#spritesheetcontainer")
      );
    }
  }
);
customElements.define(
  "sprite-dimension-guess",
  class extends MeisterElement {
    constructor() {
      super({});
      this.onclick = (evt) => {
        let { label, value } = this.dataset;
        this.setProperty(label.value, value.value);
        this.call("sprite-configurator").rerender();
      };
      let listenLevel = this.shadowRoot.host.getRootNode(); // = parent-element
      // OR let listenLevel = this.shadowRoot.closest('parent-element');
      // OR let listenLevel = this.getRootNode();
      //let div1=this.shadowRoot.getElementsByTagName('div');
      listenLevel.addEventListener("click", (evt) => {
        console.log(21, evt.currentTarget, evt.composedPath());
        let div = this.shadowRoot.querySelector("div");
        if (div)
          div.classList.toggle("selected", evt.composedPath().includes(div));
      });
    }
  }
);
