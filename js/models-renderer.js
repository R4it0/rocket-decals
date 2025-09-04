/* Renders model sections from window.modelsData into #models-root */
(function () {
  if (!Array.isArray(window.modelsData)) return;

  var root = document.getElementById("models-root");
  if (!root) return;

  function createElement(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "class") {
          el.className = attrs[key];
        } else if (key === "dataset") {
          var ds = attrs[key] || {};
          Object.keys(ds).forEach(function (dkey) {
            el.setAttribute("data-" + dkey, ds[dkey]);
          });
        } else {
          el.setAttribute(key, attrs[key]);
        }
      });
    }
    (children || []).forEach(function (child) {
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else if (child) {
        el.appendChild(child);
      }
    });
    return el;
  }

  function renderSection(model) {
    var containerClasses;
    if (model.containerVariant === 2 && model.id === "model-container-m8") {
      containerClasses = "model-container-2";
    } else if (model.containerVariant === 2) {
      containerClasses = "model-container model-container-2";
    } else {
      containerClasses = "model-container";
    }

    var container = createElement("div", { id: model.id, class: containerClasses }, []);

    var iframe = createElement("iframe", {
      title: model.sketchfab.title,
      frameborder: "0",
      allowfullscreen: "",
      mozallowfullscreen: "true",
      webkitallowfullscreen: "true",
      allow: model.sketchfab.allow,
      src: model.sketchfab.src
    });
    var iframeWrapper = createElement("div", { class: "sketchfab-embed-wrapper" }, [iframe]);

    var titleClass = "lang" + (model.titleClass ? (" " + model.titleClass) : "");
    var titleEl = createElement(
      "h2",
      {
        id: (model.anchorId || model.id.replace("model-container-", "")),
        class: titleClass,
        dataset: { "lang-fr": model.title.fr, "lang-en": model.title.en }
      },
      [model.title.fr]
    );

    var titleCard = createElement("div", { class: "model-card" }, [titleEl]);

    var textBlocks = model.paragraphs.map(function (p) {
      return createElement(
        "div",
        { class: "model-card lang", dataset: { "lang-fr": p.fr, "lang-en": p.en } },
        [p.fr]
      );
    });

    var downloads = createElement(
      "div",
      { class: "download-container" },
      model.downloads.map(function (d) {
        var button = createElement(
          "button",
          { class: "download-button lang", dataset: { "lang-fr": d.label.fr, "lang-en": d.label.en } },
          [d.label.fr]
        );
        var link = createElement("a", { href: d.href, download: "" }, [button]);
        return link;
      })
    );

    var aosDir = model.imageLeft ? "fade-down-right" : "fade-down-left";
    var textCol = createElement(
      "div",
      { class: "model-text", "data-aos": aosDir, "data-aos-duration": "1500" },
      [titleCard].concat(textBlocks).concat([downloads])
    );

    // Layout: if imageLeft, text first then iframe; else iframe then text
    if (model.imageLeft) {
      container.appendChild(textCol);
      container.appendChild(iframeWrapper);
    } else {
      container.appendChild(iframeWrapper);
      container.appendChild(textCol);
    }

    return container;
  }

  window.modelsData.forEach(function (model) {
    root.appendChild(renderSection(model));
  });

  // Build the stickers dropdown menu from config
  var dropdown = document.querySelector(".dropdown .dropdown-content");
  if (dropdown) {
    // Clear existing items
    while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);

    window.modelsData.forEach(function (model) {
      var anchor = createElement(
        "a",
        {
          href: "#" + model.id,
          class: "lang",
          dataset: { "lang-fr": model.title.fr, "lang-en": model.title.en }
        },
        [model.title.fr]
      );
      var li = createElement("li", null, [anchor]);
      dropdown.appendChild(li);
    });
  }
})();


