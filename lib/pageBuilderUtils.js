const fse = require("fs-extra");
const path = require("path");

const processor = require("./processor");

module.exports = {
  /**
   * Based on the provided `tmplType`, return the relevant
   * template as a string.
   * @param {String} tmplType - The template type
   * @returns The appropriate template as a string
   */
  getPageTmpl: function (tmplType) {
    switch (tmplType) {
      case "css":
        try {
          return fse.readFileSync(
            path.join(__dirname, "../editor/tmpl/live-css-tmpl.html"),
            "utf8"
          );
        } catch (error) {
          console.error("Error loading file", error);
        }
      case "js":
        try {
          return fse.readFileSync(
            path.join(__dirname, "../editor/tmpl/live-js-tmpl.html"),
            "utf8"
          );
        } catch (error) {
          console.error("Error loading file", error);
        }
      case 'wat':
        try {
          return fse.readFileSync(
            path.join(
              __dirname,
              '../editor/tmpl/live-wat-tmpl.html'
            ),
            'utf8'
          );
        } catch (error) {
          console.error('Error loading file', error);
        }
      case "tabbed":
      case "webapi-tabbed":
        try {
          return fse.readFileSync(
            path.join(__dirname, "../editor/tmpl/live-tabbed-tmpl.html"),
            "utf8"
          );
        } catch (error) {
          console.error("Error loading file", error);
        }
      default:
        console.error(
          `MDN-BOB: No template found for template type ${tmplType}`
        );
        process.exit(1);
    }
  },
  /**
   * Sets the active tabs in a comma separated string.
   * @param {Object} currentPage - The current page object
   * @param {String} tmpl - The template as a string
   *
   * @returns The processed template with the active tabs set
   */
  setActiveTabs: function (currentPage, tmpl) {
    const regex = /%active-tabs%/g;

    if (currentPage.tabs) {
      return tmpl.replace(regex, `data-tabs="${currentPage.tabs}"`);
    } else {
      return tmpl.replace(regex, "");
    }
  },
  /**
   * If the `currentPage.type` is of type webapi-tabbed,
   * show the console, else hide. Also set the appropriate
   * `aria-hidden` state
   * @param {Object} currentPage - The current page object
   * @param {String} tmpl - The template as a string
   *
   * @returns The processed template with console state set
   */
  setConsoleState: function (currentPage, tmpl) {
    const stateRegEx = /%console-state%/g;
    const ariaHiddenStateRegEx = /%console-aria-state%/g;

    if (currentPage.type === "webapi-tabbed") {
      // no class to add, simple clear the pattern
      tmpl = tmpl.replace(stateRegEx, "");
      return tmpl.replace(ariaHiddenStateRegEx, false);
    } else {
      tmpl = tmpl.replace(stateRegEx, "hidden");
      return tmpl.replace(ariaHiddenStateRegEx, true);
    }
  },
  /**
   * Sets the appropriate class on the tabbed editor’s container
   * element based on the height property defined in the example’s
   * meta data
   * @param {Object} currentPage - The current page object
   * @param {String} tmpl - The template as a string
   *
   * @returns The processed template with the height class set
   */
  setEditorHeight: function (currentPage, tmpl) {
    const regex = /%editor-height%/g;

    if (currentPage.height === undefined) {
      console.error(
        `[BoB] Required height property of ${currentPage.title} is not defined`
      );
      process.exit(1);
    }

    return tmpl.replace(regex, currentPage.height);
  },
  /**
   * Sets the `<title>` and `<h4>` main page title
   * @param {Object} currentPage - The current page object
   * @param {String} tmpl - The template as a string
   *
   * @returns The processed template with the titles set
   */
  setMainTitle: function (currentPage, tmpl) {
    const regex = /%title%/g;
    let resultsArray = [];

    // replace all instances of `%title` with the `currentPage.title`
    while ((resultsArray = regex.exec(tmpl)) !== null) {
      tmpl = tmpl.replace(
        resultsArray[0].trim(),
        processor.preprocessHTML(currentPage.title)
      );
    }
    return tmpl;
  },
  setCacheBuster: function (string, tmpl) {
    const regex = /%cache-buster%/g;
    return tmpl.replace(regex, string);
  },
};
