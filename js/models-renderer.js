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

  // Modal builder
  var modalOverlay = createElement("div", { class: "modal-overlay", id: "model-modal" }, []);
  var modalContent = createElement("div", { class: "modal-content" }, []);
  var modalClose = createElement("button", { class: "modal-close", ariaLabel: "Close" }, ["×"]);
  modalContent.appendChild(modalClose);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  function openModalFor(model) {
    // reset content except close button
    while (modalContent.children.length > 1) modalContent.removeChild(modalContent.lastChild);

    var titleClass = "lang" + (model.titleClass ? (" " + model.titleClass) : "");
    var titleEl = createElement(
      "h2",
      {
        class: titleClass,
        dataset: { "lang-fr": model.title.fr, "lang-en": model.title.en }
      },
      [model.title.fr]
    );

    var iframe = createElement("iframe", {
      title: model.sketchfab.title,
      frameborder: "0",
      allowfullscreen: "",
      mozallowfullscreen: "true",
      webkitallowfullscreen: "true",
      allow: model.sketchfab.allow,
      src: model.sketchfab.src
    });
    var iframeWrapper = createElement("div", { class: "sketchfab-embed-wrapper modal-embed" }, [iframe]);

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

    modalContent.appendChild(titleEl);
    modalContent.appendChild(iframeWrapper);
    textBlocks.forEach(function (b) { modalContent.appendChild(b); });
    modalContent.appendChild(downloads);

    modalOverlay.classList.add("open");
    document.body.classList.add("modal-open");

    // Applique la langue courante au contenu nouvellement injecté
    try {
      var current = (document.documentElement.getAttribute("lang") || "fr").toLowerCase();
      if (typeof window.applyLanguageGlobally === "function") {
        window.applyLanguageGlobally(current);
      }
    } catch (e) {
      // ignore
    }
  }

  modalClose.addEventListener("click", function () {
    modalOverlay.classList.remove("open");
    document.body.classList.remove("modal-open");
  });
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("open");
      document.body.classList.remove("modal-open");
    }
  });

  // Search bar
  var searchWrapper = createElement("div", { class: "models-search" }, []);
  var searchInput = createElement("input", {
    type: "search",
    class: "models-search-input",
    ariaLabel: "Search"
  });
  // i18n for placeholder
  searchInput.dataset.placeholderFr = "Rechercher un sticker...";
  searchInput.dataset.placeholderEn = "Search a sticker...";
  function setSearchPlaceholderByLang(lang) {
    if (lang === "en") {
      searchInput.setAttribute("placeholder", searchInput.dataset.placeholderEn);
    } else {
      searchInput.setAttribute("placeholder", searchInput.dataset.placeholderFr);
    }
  }
  var initialLang = (document.documentElement.getAttribute("lang") || "fr").toLowerCase();
  setSearchPlaceholderByLang(initialLang);
  var langBtn = document.getElementById("toggleLangBtn");
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      var current = (document.documentElement.getAttribute("lang") || "fr").toLowerCase();
      var next = current === "fr" ? "en" : "fr";
      setTimeout(function () { setSearchPlaceholderByLang(next); }, 0);
    });
  }
  searchWrapper.appendChild(searchInput);

  // Cards grid
  var grid = createElement("div", { class: "cards-grid" }, []);
  window.modelsData.forEach(function (model) {
    var cardEmbed = createElement("iframe", {
      title: model.sketchfab.title,
      frameborder: "0",
      allowfullscreen: "",
      mozallowfullscreen: "true",
      webkitallowfullscreen: "true",
      allow: model.sketchfab.allow,
      src: model.sketchfab.src
    });
    var cardEmbedWrap = createElement("div", { class: "card-embed-wrapper" }, [cardEmbed]);
    var cardTitle = createElement(
      "h3",
      {
        class: "card-title lang" + (model.titleClass ? (" " + model.titleClass) : ""),
        dataset: { "lang-fr": model.title.fr, "lang-en": model.title.en }
      },
      [model.title.fr]
    );
    var openBtn = createElement(
      "button",
      { class: "card-open-btn lang", dataset: { "lang-fr": "Voir", "lang-en": "View" } },
      ["Voir"]
    );
    var card = createElement("div", { class: "model-card-tile", id: model.id }, [cardTitle, cardEmbedWrap, openBtn]);
    if (model.new === true || model.isNew === true) {
      var badge = createElement(
        "span",
        { class: "badge-new lang", dataset: { "lang-fr": "Nouveau", "lang-en": "New" } },
        ["New"]
      );
      card.appendChild(badge);
    }
    openBtn.addEventListener("click", function () { openModalFor(model); });
    card.addEventListener("click", function (e) {
      if (e.target !== openBtn) openModalFor(model);
    });
    grid.appendChild(card);
  });
  root.appendChild(searchWrapper);
  root.appendChild(grid);

  // Search filtering
  function normalize(str) {
    return (str || "").toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "");
  }
  searchInput.addEventListener("input", function () {
    var q = normalize(searchInput.value);
    var children = Array.prototype.slice.call(grid.children);
    children.forEach(function (card) {
      var modelId = card.id;
      var model = window.modelsData.find(function (m) { return m.id === modelId; });
      if (!model) return;
      var hay = [model.title.fr, model.title.en, modelId].map(normalize).join(" ");
      var match = q.length === 0 || hay.indexOf(q) !== -1;
      card.style.display = match ? "flex" : "none";
    });
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

      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        var el = document.getElementById(model.id);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        openModalFor(model);
      });
    });
  }
})();


