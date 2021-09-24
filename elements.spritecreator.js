// *********************************************************************************** base class Meister
class MeisterElement extends HTMLElement {
  log(label, ...args) {
    //    console.log(`<${this.localName}> ${label}:green;color=white`, ...args);
  }
}
// *********************************************************************************** base class SpriteMeister
class SpriteMeister extends MeisterElement {
  constructor() {
    super().attachShadow({
      mode: "open",
    });
    document.body.addEventListener("qomponents", () =>
      this.dispatchEvent(
        new CustomEvent("qomponent", {
          bubbles: true,
          composed: true,
          detail: this,
        })
      )
    );
  }
  appendTemplate() {
    let template = document.getElementById(this.nodeName);
    if (template) {
      this.log(`append template`, this.nodeName);
      this.shadowRoot.append(template.content.cloneNode(true));
    } else {
      this.log("No template:red;color=white");
    }
  }
  addElement(
    // 1st:
    el = "div",
    // 2nd:
    { innerHTML = "", classes = [], attrs = {}, children = [], ...props } = {},
    // 3rd:
    {
      root = this.shadowRoot || this, //!! default root is shadowRoot
      insertroot = "append", //!! default  append (or: prepend)
      insertchildren = "append", //!! append (or: prepend) children
    } = {}
  ) {
    el = document.createElement(el);
    //this.setAttributes(attrs, el);
    Object.keys(attrs).map((key) => el.setAttribute(key, attrs[key]));
    el.classList.add(...classes);
    Object.assign(el, props);
    innerHTML && (el.innerHTML = innerHTML);
    el[insertchildren](...children);
    root && root[insertroot](el);
    return el;
  }
  addHTML({ root = this.shadowRoot || this, where = "beforeend", html = "[HTML]" }) {
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
  dispatch(detail, options = { name: "sprite-meister", bubbles: true, composed: true }) {
    let eventName = options.name;
    if (Object.keys(detail).length === 0 && detail.constructor === Object)
      // empty Object check
      options = { bubbles: true, composed: true };
    console.log(`dispatch %c ${eventName}:blue;color=white`, "background:green;color:white", { detail, options });
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: options.bubbles,
        composed: options.composed,
        detail,
      })
    );
  }
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
    if (typeof func == "function") {
      root.addEventListener(name, (evt) => {
        console.log(
          `${this.nodeName} %c reponds to event from %c ${evt.target.nodeName} :blue;color=white`,
          "background:green;color:white",
          "background:orange"
        );
        func(evt);
      });
    }
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
  query(selector) {
    return (this.shadowRoot || this).querySelector(selector);
  }
  queryAll(selector) {
    return [...(this.shadowRoot || this).querySelectorAll(selector)];
  }
  setProperty(name, value) {
    this.style.setProperty("--" + name, value);
  }
}

// *********************************************************************************** define sprite-frames
customElements.define(
  "sprite-frames",
  class extends SpriteMeister {
    // ------------------------------------------------------------------- sprite frames - constructor
    constructor() {
      super().appendTemplate();
      this.listen((evt) => {
        if (evt.target.nodeName == "SPRITE-MEISTER") {
          console.log(`${this.nodeName} reponds to event from ${evt.target.nodeName}`);
          this.render(evt.target);
        }
      });
    } // constructor
    mouse(framenr, svgelement) {
      // dispatch SPRITE-MEISTER framenr
      this.dispatch({ to: "SPRITE-MEISTER", framenr });
    }
    render(sprite) {
      try {
        this.setProperty("steps", sprite.steps - 1);
        let svg = (sprite, framenr, frame) => {
          let viewBox = `viewBox='0 0 ${sprite.vbwidth} ${sprite.vbheight}'`;
          let svghtml = `<svg xmlns='http://www.w3.org/2000/svg' ${viewBox}>${frame}</svg>`;
          var oParser = new DOMParser();
          var doc = oParser.parseFromString(svg, "image/svg+xml");
          var failed = doc.documentElement.nodeName.indexOf("parsererror") > -1;
          if (failed) {
            console.error("failed to load the doc : " + doc.documentElement.nodeName);
          }
          //svghtml = `<sprite-meister id="" template="battery" freeze="${framenr}" steps="24" duration="3s" background-color="lightcoral"></sprite-meister>`;
          //svghtml = framenr;
          return (
            `<div class='frame'` +
            ` onmouseenter='this.getRootNode().host.mouse(${framenr})'` +
            ` onmouseleave='this.getRootNode().host.mouse(-1)'>${svghtml}</div>`
          );
        };
        console.log(svg.length);
        let gap = 2;
        let html = sprite.frames
          .map((f, framenr) => svg(sprite, framenr, f.svg))
          .join("")
          .replaceAll('"', "'");
        this.shadowSelector("#spriteframes").innerHTML = html;
      } catch (e) {
        console.error(`render error:`, [this], e);
      }
    }
  }
);
// *********************************************************************************** define sprite-templates
customElements.define(
  "sprite-templates",
  class extends SpriteMeister {
    // ------------------------------------------------------------------- sprite templates - constructor
    constructor() {
      super().appendTemplate();
    }
    // ------------------------------------------------------------------- sprite templates - storeTemplates
    storeTemplates() {
      let store = [...document.querySelectorAll("[usertemplate")].reduce((store, template) => {
        store[template.id] = template.innerHTML;
        return store;
      }, {});
      store = JSON.stringify(store);
      localStorage.setItem("usertemplates", store);
    }
    // ------------------------------------------------------------------- sprite templates - restoreTemplates
    restoreTemplates() {
      let store = localStorage.getItem("usertemplates");
      if (store) {
        try {
          store = JSON.parse(store);
        } catch (e) {
          console.error(666, e);
        }
        Object.keys(store).map((id) => this.appendBodySpriteTemplate(id, store[id]));
      }
    }
    // ------------------------------------------------------------------- sprite templates - connectedCallback
    connectedCallback() {
      let html = "";
      if (this.hasAttribute("user")) {
        html += "<h3>localStorage templates</h3>";
        let usertemplates = localStorage.getItem("usertemplates");
        this.restoreTemplates();
        this.listen({
          name: "store-user-templates",
          do: (evt) => this.storeTemplates(),
          root: document.body,
        });
        this.listen({
          name: "remove-template",
          do: (evt) => this.removeTemplate(evt.detail.templateid),
        });
      } else {
        html += "<h3>standard templates</h3>";
        html += [...document.querySelectorAll("template[spritemeister]")].map((tmpl) => this.appendSpriter(tmpl.id));
      }
      this.listen();
    }
    // --------------------------------------------------------- sprite templates - appendBodySpriteTemplate
    appendBodySpriteTemplate(id, innerHTML) {
      this.log(`append user sprite:red;color=white`, id);
      let template = this.addElement(
        "template",
        {
          id,
          innerHTML,
        },
        {
          root: document.body,
        }
      );
      let spriter = this.appendSpriter(id);
      template.setAttribute("usertemplate", id);
      spriter.setAttribute("usertemplate", id);

      //this.dispatch({ id });
    }
    // --------------------------------------------------------- sprite templates - appendSpriter
    appendSpriter(id) {
      return this.addElement("sprite-meister", {
        attrs: {
          id,
          templatename: id,
          template: id,
        },
      });
    }
    // --------------------------------------------------------- sprite templates - getTemplate
    getTemplate(id) {
      return document.querySelector(`template[id="${id}"]`);
    }
    // --------------------------------------------------------- sprite templates - removeTemplate
    removeTemplate(id) {
      let template = this.getTemplate(id);
      if (template) {
        template.remove();
        this.storeTemplates();
      }
    }
  }
);

// *********************************************************************************** define sprite-filmstrip
customElements.define(
  "sprite-filmstrip",
  class extends SpriteMeister {
    // ------------------------------------------------------------------- sprite filmstrip - constructor
    constructor() {
      super().appendTemplate();
      this.listen((evt) => {
        let sprite = evt.detail.sprite;
        if (sprite) {
          this.shadowSelector("img").src = sprite.escapedSVG();
          this.setProperty("duration", evt.detail.sprite.duration);
          this.setProperty("steps", evt.detail.sprite.steps - 1);
        }
      });
    } // constructor
  }
);
// *********************************************************************************** define sprite-source
customElements.define(
  "sprite-source",
  class extends SpriteMeister {
    // ------------------------------------------------------------------- sprite source - constructor
    constructor() {
      super();
      this.appendTemplate();
    }
    // ------------------------------------------------------------------- sprite source - dispatchUpdate
    dispatchUpdate() {
      this.dispatch({ to: "SPRITE-MEISTER", framedefinition: this.value });
    }
    // ------------------------------------------------------------------- sprite source - connectedCallback
    connectedCallback() {
      this.textarea = this.shadowSelector("textarea");
      if (this.hasAttribute("editor")) {
        this.load();
        this.listen({
          name: "keyup",
          do: (evt) => this.processTextarea_setHeight(false), // false = force updates
          root: this.textarea,
        });
        this.listen({
          name: "sprite-meister",
          do: (evt) => {
            console.log(666);
            this.processTextarea_setHeight(evt);

            if (evt.detail.framedefinition) {
              this.value = evt.detail.framedefinition;
            }
          },
        });
        this.listen({
          name: "save-sprite",
          do: (evt) => {},
        });
      } else {
        this.listen((evt) => {
          let sprite = evt.detail.sprite;
          if (evt.detail.sprite) {
            let svg = sprite.escapedSVG(this.hasAttribute("escapedtags"));
            //! don't call this.load here!
            this.value = svg;
          }
        });
      }
    } // connectedCallback
    // ------------------------------------------------------------------- sprite source - processTextarea
    processTextarea_setHeight(evt) {
      let linecount = this.value.split(/\n/).length;
      this.setProperty("editorEditHeight", linecount + 4 + "em");
      console.log("linecount:", linecount);
      this.save();
      //do NOT dispatchUpdate if already triggered by an evt
      if (!evt) this.dispatchUpdate();
    }
    // ------------------------------------------------------------------- sprite source - GET/SET templateid
    get templateid() {
      return this.getAttribute("templateid");
    }
    set templateid(v) {
      this.setAttribute("templateid", v);
    }
    // ------------------------------------------------------------------- sprite source - GET/SET value
    get value() {
      return this.textarea.value;
    }
    set value(v) {
      this.textarea.value = this.undoHTMLformatting(v);
      let title = this.querySelector('span[slot="title"]');
      if (title) {
        title.innerHTML = `${this.getAttribute("title")} - ${v.length} bytes`;
      }
      if (this.hasAttribute("editor")) {
        if (event && event.detail.templateid) {
          console.log("save user template value", event.detail.templateid);
          this.templateid = event.detail.templateid;
        }
        //666
        // if user template then update that template
        // saver will then save all user templates in the page
        // that way we can add user templates by default in index.html
      }
    }
    // ------------------------------------------------------------------- sprite source - save
    save() {
      console.log(`Save sprite:red;color=white`, this.id, this.templateid);
      localStorage.setItem(this.id, this.value);
      //save all user templates//666
      this.dispatch(
        {},
        {
          name: "store-user-templates",
        }
      );
    }
    // ------------------------------------------------------------------- sprite source - load
    load(frame = localStorage.getItem(this.id)) {
      let spm = new URLSearchParams(location.search).get("sprite");
      if (!frame || spm) {
        let frame_template = document.getElementById(spm);
        if (!frame_template) frame_template = document.getElementById("bounce");
        frame = frame_template.innerHTML;
        console.log("loaded:red", spm);
        location.replace(location.origin + location.pathname);
      }
      this.value = frame;
      this.save();
      setTimeout(() => {
        this.dispatchUpdate();
      }); //quickfix first load
    }
    // ------------------------------------------------------------------- sprite source - formattemplate
    undoHTMLformatting(frame) {
      return frame;
      if (frame) {
        frame = frame.replace(/\>[\t\s ]+\</g, "><"); // remove whitespace between tags
        if (frame[0] == "\n") frame = frame.slice(1, Infinity);
        frame = frame.trim();
        frame = frame.replace(/"/g, "'");
        //frame = frame.replace(/ /g, "X");
        //frame = frame.replace(/,/g," ");
        frame = frame.replace(/=''/g, ""); // remove incorrect empty attribute values set by HTML

        frame = frame.replace("/(<!--)[sS]*(-->)/", ""); // remove comments

        // remove newline / carriage return
        // str.replace(/\n/g, "");
        // remove whitespace (space and tabs) before tags
        // str.replace(/[\t ]+\</g, "<");
        // remove whitespace between tags
        // str.replace(/\>[\t ]+\</g, "><");
        // remove whitespace after tags
        // str.replace(/\>[\t ]+$/g, ">");
      }
      return frame;
    }
  } // class
); // define sprite save
