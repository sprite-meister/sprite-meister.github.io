// *************************************************************************************** console
console.log =
  ((console.console = console.log), // on first definition save console.log
  // return overloaded console.log function:
  (...args) => {
    let apptitle = document.title.split("-")[0]; //! get title from call stack
    let stack;
    let file = "";
    let linenr = ""; //! todo 2 or 3 rd parameter?
    let method = "";
    try {
      try {
        stack = new Error().stack; //stack
      } catch (e) {
        // catch no Stack error
      }
      let extractLineNr = () => {
        let lines = stack
          .split("at ") //
          .filter((line, idx) => idx > 2 && line.includes(".js")) //discard extractLineNr, console.log itself
          .map((logline) => {
            let [funcname, uri] = logline.split(" ");
            try {
              file = uri && uri.split("/")[3].split(")")[0];
            } catch (e) {
              // catch <anonymous>
            }
            let line = file && Number(file.split(":")[1]);
            return {
              funcname,
              file,
              line,
            };
          })
          .filter((x) => x && x.file);
        if (lines.length) {
          return lines[0].file;
        } else {
        }
      };
      linenr = extractLineNr();
    } catch (e) {
      console.error("Overloading console error:", e, stack);
    }
    // override console.log("Hello:red;color=white", "World!") //! FIRST/ONLY colon : in string marks color!
    let /* assign label and color */ [label = "", color = "goldenrod"] = (
        typeof args[0] == "string" /* if first arg is a string */
          ? /* label = take first arg */ args.shift()
          : /* label = typeof */ typeof args[0]
      ).split(":");
    window.console.console(
      `%c ${apptitle}%c ${linenr} ${method} %c ${label} `, // label
      `background:gold;font-weight:bold`, // app title color
      `background:gold;font-size:90%`, //first label color
      `background:${color.replaceAll("=", ":")}`, // second label color
      ...args // all remaing args
    );
  });
window.console.logwc = (element, ...args) => {
  let label = typeof element != "string" ? `<${element.nodeName}>` : element;
  console.log(`%c ${label}`, "background:darkmagenta;color:white", ...args);
};
window.console.log("%c a SVG animation experiment", "background:red;color:white;font-size:1.2em");
// *********************************************************************************** end console
