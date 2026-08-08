(function () {
  "use strict";

  var tg = null;
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      tg = window.Telegram.WebApp;
    }
  } catch (e) { /* нет Telegram */ }

  var PLACEHOLDER =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
      '<rect width="200" height="200" fill="#242833"/>' +
      '<text x="100" y="118" font-size="64" text-anchor="middle">🎁</text>' +
      '</svg>'
    );

  var STORAGE_KEY = "wishlist_pair_v1";

  var PEOPLE = [
    { id: "sofia", label: "Софья", storage: "sofia" },
    { id: "artur", label: "Артур", storage: "artur" }
  ];

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        sofia: Array.isArray(data.sofia) ? data.sofia : [],
        artur: Array.isArray(data.artur) ? data.artur : []
      };
    } catch (e) {
      return { sofia: [], artur: [] };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      alert("Не удалось сохранить данные на этом устройстве.");
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeUrl(raw) {
    var url = (raw || "").trim();
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    return url;
  }

  function render(person) {
    var state = load();
    var items = state[person.storage];
    var listEl = document.getElementById("items-" + person.id);
    var countEl = document.getElementById("count-" + person.id);

    listEl.innerHTML = "";

    if (!items.length) {
      var tpl = document.getElementById("empty-template");
      listEl.appendChild(tpl.content.cloneNode(true));
    } else {
      items.forEach(function (item, idx) {
        var link = item.link || "#";
        var name = item.name || "Подарок";

        var card = document.createElement("div");
        card.className = "item";

        var a = document.createElement("a");
        a.className = "item-photo";
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.title = "Открыть товар: " + name;

        var img = document.createElement("img");
        img.alt = name;
        img.loading = "lazy";
        img.onerror = function () {
          img.outerHTML = '<div class="fallback">🎁</div>';
        };
        img.src = item.image || PLACEHOLDER;
        a.appendChild(img);

        var body = document.createElement("div");
        body.className = "item-body";

        var nameEl = document.createElement("div");
        nameEl.className = "item-name";
        nameEl.textContent = name;

        var open = document.createElement("a");
        open.className = "item-open";
        open.href = link;
        open.target = "_blank";
        open.rel = "noopener noreferrer";
        open.textContent = "Открыть ↗";
        if (link === "#") open.style.display = "none";

        body.appendChild(nameEl);
        body.appendChild(open);

        var del = document.createElement("button");
        del.className = "item-delete";
        del.type = "button";
        del.innerHTML = "&times;";
        del.title = "Удалить";
        del.addEventListener("click", function () {
          var current = load();
          current[person.storage].splice(idx, 1);
          save(current);
          render(person);
        });

        card.appendChild(a);
        card.appendChild(body);
        card.appendChild(del);
        listEl.appendChild(card);
      });
    }

    countEl.textContent = String(items.length);
  }

  function setupForm(person) {
    var form = document.getElementById("form-" + person.id);
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameInput = document.getElementById("name-" + person.id);
      var linkInput = document.getElementById("link-" + person.id);
      var imageInput = document.getElementById("image-" + person.id);

      var name = nameInput.value.trim();
      var link = normalizeUrl(linkInput.value);
      var image = normalizeUrl(imageInput.value);

      if (!link && !image) {
        alert("Добавьте ссылку на товар или на картинку.");
        return;
      }

      var state = load();
      state[person.storage].unshift({
        name: name || "Подарок",
        link: link,
        image: image,
        added: Date.now()
      });
      save(state);

      form.reset();
      render(person);
    });
  }

  // Инициализация Telegram WebApp
  if (tg) {
    tg.ready();
    tg.expand();
  }

  PEOPLE.forEach(function (person) {
    render(person);
    setupForm(person);
  });
})();
