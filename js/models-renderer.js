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

  // Small expand icon overlay for cards
  function createExpandIcon() {
    var img = createElement("img", { src: "img/arrow-expand-all.svg", alt: "", class: "card-expand-img", ariaHidden: "true" }, []);
    var wrap = createElement("div", { class: "card-expand-all", ariaHidden: "true", title: "Expand" }, [img]);
    return wrap;
  }

  // Small download-all icon overlay for cards with downloads
  function createDownloadIcon() {
    var img = createElement("img", { src: "img/download.svg", alt: "", class: "card-download-img", ariaHidden: "true" }, []);
    var wrap = createElement("div", { class: "card-download-all", ariaHidden: "true", title: "Download all" }, [img]);
    return wrap;
  }

  function downloadAllForModel(model) {
    try {
      var files = Array.isArray(model.downloads) ? model.downloads : [];
      if (!files.length) return;
      files.forEach(function(d, idx) {
        if (!d || !d.href) return;
        var a = document.createElement('a');
        a.href = d.href;
        a.setAttribute('download', '');
        a.style.display = 'none';
        document.body.appendChild(a);
        // Stagger a bit to avoid some browsers ignoring rapid clicks
        setTimeout(function(){ a.click(); document.body.removeChild(a); }, idx * 120);
      });
    } catch(e) {
      // ignore
    }
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

  // Image-only modal for image cards
  function openImageModalFor(item) {
    while (modalContent.children.length > 1) modalContent.removeChild(modalContent.lastChild);

    var titleClass = "lang" + (item.titleClass ? (" " + item.titleClass) : "");
    var titleEl = createElement(
      "h2",
      {
        class: titleClass,
        dataset: { "lang-fr": (item.title && item.title.fr) || "", "lang-en": (item.title && item.title.en) || "" }
      },
      [item.title && item.title.fr ? item.title.fr : ""]
    );

    var imgSrc = item.image || item.thumbnail || "img/x.avif";
    var img = createElement("img", { src: imgSrc, alt: (item.title && item.title.fr) || "" }, []);
    var imgWrapper = createElement("div", { class: "modal-image" }, [img]);

    modalContent.appendChild(titleEl);
    modalContent.appendChild(imgWrapper);

    modalOverlay.classList.add("open");
    document.body.classList.add("modal-open");

    try {
      var current = (document.documentElement.getAttribute("lang") || "fr").toLowerCase();
      if (typeof window.applyLanguageGlobally === "function") {
        window.applyLanguageGlobally(current);
      }
    } catch (e) {}
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

  // Cards grid (Sketchfab)
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
    card.appendChild(createExpandIcon());
    if (Array.isArray(model.downloads) && model.downloads.length > 0) {
      var dl = createDownloadIcon();
      dl.addEventListener('click', function(e){ e.stopPropagation(); e.preventDefault(); downloadAllForModel(model); });
      card.appendChild(dl);
      card.classList.add('has-download');
    }
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

  // Second grid (Images only, no modal) from modelsImagesData
  var imagesData = Array.isArray(window.modelsImagesData) ? window.modelsImagesData : [];
  var imageGrid = createElement("div", { class: "cards-grid" }, []);
  imagesData.forEach(function (item) {
    var imgSrc = item.image || item.thumbnail || "img/x.avif";
    var img = createElement("img", { src: imgSrc, alt: (item.title && item.title.fr ? item.title.fr : "") + " preview" }, []);
    var imgWrap = createElement("div", { class: "card-embed-wrapper" }, [img]);
    var cardTitle = createElement(
      "h3",
      {
        class: "card-title lang" + (item.titleClass ? (" " + item.titleClass) : ""),
        dataset: { "lang-fr": item.title && item.title.fr ? item.title.fr : "", "lang-en": item.title && item.title.en ? item.title.en : "" }
      },
      [item.title && item.title.fr ? item.title.fr : ""]
    );
    var card = createElement("div", { class: "model-card-tile", id: item.id }, [cardTitle, imgWrap]);
    card.appendChild(createExpandIcon());
    if (item.new === true || item.isNew === true) {
      var badge2 = createElement(
        "span",
        { class: "badge-new lang", dataset: { "lang-fr": "Nouveau", "lang-en": "New" } },
        ["New"]
      );
      card.appendChild(badge2);
    }
    // Open image-only modal on click
    card.addEventListener("click", function () { openImageModalFor(item); });
    imageGrid.appendChild(card);
  });

  // Append CTA card after last client card
  var ctaCard = createElement(
    "a",
    {
      class: "model-card-tile cta-card",
      href: "https://discord.gg/hzwB24PfaG",
      target: "_blank",
      rel: "noopener noreferrer"
    },
    [
      createElement("div", { class: "cta-plus" }, ["+"]),
      createElement(
        "div",
        { class: "cta-text lang", dataset: { "lang-fr": "Commande ton sticker via notre serveur Discord", "lang-en": "Order your decal via our Discord server" } },
        ["Commande ton sticker via notre serveur Discord"]
      )
    ]
  );
  imageGrid.appendChild(ctaCard);

  root.appendChild(searchWrapper);

  // Titles for each category
  var title3D = createElement(
    "h2",
    {
      id: "title-3d",
      class: "featured-title lang",
      dataset: { "lang-fr": "Equipes", "lang-en": "Teams" }
    },
    ["Aperçu 3D"]
  );
  root.appendChild(title3D);

  // Empty state for 3D grid
  var empty3D = createElement(
    "div",
    {
      class: "empty-state lang",
      dataset: { "lang-fr": "Aucun résultat dans Équipes", "lang-en": "No results in Teams" }
    },
    ["Aucun résultat dans Équipes"]
  );
  empty3D.style.display = "none";

  root.appendChild(grid);
  root.appendChild(empty3D);

  var titleImages = createElement(
    "h2",
    {
      id: "title-images",
      class: "featured-title lang",
      dataset: { "lang-fr": "Clients", "lang-en": "Customers" }
    },
    ["Galerie d'images"]
  );
  root.appendChild(titleImages);

  // Empty state for Images grid
  var emptyIMG = createElement(
    "div",
    {
      class: "empty-state lang",
      dataset: { "lang-fr": "Aucun résultat dans Clients", "lang-en": "No results in Clients" }
    },
    ["Aucun résultat dans Clients"]
  );
  emptyIMG.style.display = "none";

  root.appendChild(imageGrid);
  root.appendChild(emptyIMG);

  // Search filtering for both datasets independently
  function normalize(str) {
    return (str || "").toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "");
  }

  function filterGrid(gridEl, dataset, emptyEl) {
    var children = Array.prototype.slice.call(gridEl.children);
    var anyVisible = false;
    children.forEach(function (card) {
      var item = dataset.find(function (m) { return m.id === card.id; });
      if (!item) return;
      var keywords = Array.isArray(item.keywords) ? item.keywords : [];
      var titleFr = item.title && item.title.fr ? item.title.fr : "";
      var titleEn = item.title && item.title.en ? item.title.en : "";
      var hay = [titleFr, titleEn, item.id]
        .concat(keywords)
        .map(normalize)
        .join(" ");
      var match = currentQuery.length === 0 || hay.indexOf(currentQuery) !== -1;
      card.style.display = match ? "flex" : "none";
      if (match) anyVisible = true;
    });
    if (emptyEl) emptyEl.style.display = anyVisible ? "none" : "flex";
  }

  var currentQuery = "";
  searchInput.addEventListener("input", function () {
    currentQuery = normalize(searchInput.value);
    filterGrid(grid, window.modelsData, empty3D);
    filterGrid(imageGrid, imagesData, emptyIMG);
  });

  // Build the stickers dropdown menu: only two categories (Equipe/Clients)
  var dropdown = document.querySelector(".dropdown .dropdown-content");
  if (dropdown) {
    while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);

    var items = [
      { id: "title-3d", fr: "Équipe", en: "Team" },
      { id: "title-images", fr: "Clients", en: "Clients" }
    ];

    items.forEach(function (it) {
      var anchor = createElement(
        "a",
        {
          href: "#" + it.id,
          class: "lang",
          dataset: { "lang-fr": it.fr, "lang-en": it.en }
        },
        [it.fr]
      );
      var li = createElement("li", null, [anchor]);
      dropdown.appendChild(li);

      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        var el = document.getElementById(it.id);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }
})();


