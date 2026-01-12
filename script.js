let listElement;
let searchInput;
let seasonTabs = [];
let template;
let playerElement;
let titleEl;
let descriptionEl;
let downloadLink;
let yearEl;
let plyr;

let videos = [];
let currentIndex = -1;
let currentCollection = [];
let currentSeason = 1;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init() {
  listElement = document.querySelector("#video-list");
  searchInput = document.querySelector("#search");
  seasonTabs = [...document.querySelectorAll(".season-tab")];
  template = document.querySelector("#video-item-template");
  playerElement = document.querySelector("#video-player");
  titleEl = document.querySelector("#video-title");
  descriptionEl = document.querySelector("#video-description");
  downloadLink = document.querySelector("#download-link");
  yearEl = document.querySelector("#year");

  const librarySection = document.querySelector(".library");
  if (!template) {
    const newTemplate = document.createElement("template");
    newTemplate.id = "video-item-template";
    newTemplate.innerHTML = `
      <li class="card" role="listitem">
        <button type="button" class="card-button">
          <span class="card-thumb"></span>
          <span class="card-overlay">
            <strong class="card-title"></strong>
            <span class="card-meta"></span>
          </span>
        </button>
      </li>
    `;
    (librarySection ?? document.body).appendChild(newTemplate);
    template = newTemplate;
  }

  if (!listElement) {
    listElement = document.createElement("ul");
    listElement.id = "video-list";
    listElement.className = "shelf";
    listElement.setAttribute("role", "list");
    if (librarySection) {
      librarySection.appendChild(listElement);
    } else {
      document.body.appendChild(listElement);
    }
  }

  const missing = [];
  if (!listElement) missing.push("#video-list");
  if (!template) missing.push("#video-item-template");
  if (!playerElement) missing.push("#video-player");
  if (!titleEl) missing.push("#video-title");
  if (!descriptionEl) missing.push("#video-description");
  if (!downloadLink) missing.push("#download-link");

  if (missing.length) {
    console.error(`Brakuje elementów interfejsu – sprawdź index.html (${missing.join(", ")})`);
    return;
  }

  plyr = new Plyr(playerElement, {
    controls: [
      "play-large",
      "play",
      "progress",
      "current-time",
      "duration",
      "mute",
      "volume",
      "captions",
      "settings",
      "airplay",
      "fullscreen"
    ],
    ratio: "16:9",
    tooltips: { controls: true, seek: true }
  });

  currentSeason = Number(document.querySelector(".season-tab.is-active")?.dataset.season) || 1;

  if (seasonTabs.length) {
    seasonTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.disabled) {
          return;
        }
        const season = Number(tab.dataset.season);
        if (season === currentSeason) {
          return;
        }
        setActiveSeasonTab(season);
        updateLibrary({ resetCurrent: true });
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      updateLibrary();
    });
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  setActiveSeasonTab(currentSeason);
  loadVideos();
}

async function loadVideos() {
  try {
    const response = await fetch("videos.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Nie udało się pobrać listy filmów (${response.status})`);
    }
    videos = await response.json();
    updateLibrary({ resetCurrent: true });
  } catch (error) {
    listElement.innerHTML = `<li class="error">${error.message}</li>`;
  }
}

function renderList(collection) {
  currentCollection = collection;
  listElement.innerHTML = "";
  if (!collection.length) {
    listElement.innerHTML = "<li class=\"empty\">Brak wyników</li>";
    return;
  }

  const fragment = document.createDocumentFragment();
  collection.forEach(({ video, index }) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const button = item.querySelector(".card-button");
    const thumb = item.querySelector(".card-thumb");
    const title = item.querySelector(".card-title");
    const meta = item.querySelector(".card-meta");

    button.dataset.index = String(index);
    title.textContent = video.title;
    meta.textContent = buildMeta(video);

    if (video.poster) {
      thumb.style.backgroundImage = `url('${video.poster}')`;
    } else {
      thumb.style.backgroundImage = "linear-gradient(135deg, #273043, #0b0c18)";
    }

    button.addEventListener("click", () => setVideo(index, true));
    fragment.appendChild(item);
  });

  listElement.appendChild(fragment);
  highlightCurrent();
}

function setVideo(index, autoplay) {
  const video = videos[index];
  if (!video) {
    return;
  }
  currentIndex = index;
  highlightCurrent();

  const poster = video.poster ?? "";
  const type = video.type ?? inferMime(video.src);

  const tracks = [];
  if (video.subtitles) {
    tracks.push({
      kind: "captions",
      label: "English",
      srclang: "en",
      src: video.subtitles,
      default: true
    });
  }

  plyr.source = {
    type: "video",
    title: video.title,
    sources: [
      {
        src: video.src,
        type
      }
    ],
    poster,
    tracks
  };

  if (autoplay) {
    plyr.play().catch(() => null);
  }

  titleEl.textContent = video.title;
  descriptionEl.textContent = buildDescription(video);
  if (video.download === false) {
    downloadLink.hidden = true;
  } else {
    downloadLink.hidden = false;
    downloadLink.href = video.download ?? video.src;
  }
}

function highlightCurrent() {
  [...listElement.querySelectorAll(".card-button")].forEach((button) => {
    const index = Number(button.dataset.index);
    button.setAttribute("aria-pressed", index === currentIndex ? "true" : "false");
  });
}

function inferMime(url) {
  const extension = url.split("?").shift()?.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "mkv":
      return "video/x-matroska";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "m3u8":
      return "application/x-mpegURL";
    default:
      return "video/mp4";
  }
}

function buildMeta(video) {
  const parts = [];
  if (typeof video.season === "number") {
    parts.push(`Season ${video.season}`);
  }
  if (typeof video.episode === "number") {
    parts.push(`Episode ${video.episode}`);
  }
  if (video.air_date) {
    parts.push(video.air_date);
  }
  if (video.duration) {
    parts.push(video.duration);
  }
  return parts.join(" • ");
}

function buildDescription(video) {
  const info = [];
  if (video.season) {
    info.push(`Season ${video.season}`);
  }
  if (video.episode) {
    info.push(`Episode ${video.episode}`);
  }
  if (video.air_date) {
    info.push(`Air date ${video.air_date}`);
  }
  const intro = info.length ? `${info.join(" · ")}. ` : "";
  return `${intro}${video.description ?? ""}`.trim();
}

function setActiveSeasonTab(season) {
  currentSeason = season;
  seasonTabs.forEach((tab) => {
    const tabSeason = Number(tab.dataset.season);
    const isActive = tabSeason === season;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function updateLibrary({ resetCurrent = false, autoplay = false } = {}) {
  const seasonEpisodes = videos
    .map((video, index) => ({ video, index }))
    .filter(({ video }) => (video.season ?? 1) === currentSeason);

  const query = searchInput?.value.trim().toLowerCase() ?? "";
  const filtered = query
    ? seasonEpisodes.filter(({ video }) => video.title.toLowerCase().includes(query))
    : seasonEpisodes;

  renderList(filtered);

  if (!filtered.length) {
    if (!seasonEpisodes.length) {
      currentIndex = -1;
      titleEl.textContent = `Sezon ${currentSeason} w przygotowaniu`;
      descriptionEl.textContent = "";
      downloadLink.hidden = true;
    }
    return;
  }

  const currentInFiltered = filtered.some(({ index }) => index === currentIndex);
  if (resetCurrent || !currentInFiltered) {
    setVideo(filtered[0].index, autoplay);
  } else {
    highlightCurrent();
  }
}

// init is triggered on DOMContentLoaded
