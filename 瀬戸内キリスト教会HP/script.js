let videos = [];
let index = 1;
let autoSlide = null;

// =====================
// 初期起動
// =====================
document.addEventListener("DOMContentLoaded", () => {
  fetchVideosFromJSON();
});

// =====================
// JSON取得（←ここ重要）
// =====================
async function fetchVideosFromJSON() {
  try {
    const res = await fetch("./videos.json");
    const data = await res.json();

    videos = data;

    if (!videos || videos.length === 0) return;

    render();
    startAutoSlide();
    initSwipe();

  } catch (e) {
    console.error("JSON取得エラー:", e);
  }
}

// =====================
// 描画
// =====================
function render() {
  const slides = document.getElementById("slides");
  if (!slides) return;

  slides.innerHTML = "";

  const first = videos[0];
  const last = videos[videos.length - 1];

  slides.innerHTML += createSlide(last, -1);

  videos.forEach((v, i) => {
    slides.innerHTML += createSlide(v, i);
  });

  slides.innerHTML += createSlide(first, 0);

  createDots();
  update(false);
}

// =====================
// スライド生成
// =====================
function createSlide(v, i) {
  const id = v.id;
  const thumb = v.thumbnail;

  return `
    <div class="slide">
      <a href="https://www.youtube.com/watch?v=${id}" target="_blank">
        <img src="${thumb}" loading="lazy">
        ${i === 0 ? '<span class="new-badge"></span>' : ''}
      </a>
    </div>
  `;
}

// =====================
// 更新
// =====================
function update(animate = true) {
  const slides = document.getElementById("slides");
  if (!slides) return;

  slides.style.transition = animate ? "0.4s ease" : "none";
  slides.style.transform = `translateX(-${index * 100}%)`;

  updateDots();
}

// =====================
// 次・前
// =====================
function nextSlide() {
  stopAutoSlide();

  index++;
  update();

  setTimeout(() => {
    if (index === videos.length + 1) {
      index = 1;
      update(false);
    }
    startAutoSlide();
  }, 400);
}

function prevSlide() {
  stopAutoSlide();

  index--;
  update();

  setTimeout(() => {
    if (index === 0) {
      index = videos.length;
      update(false);
    }
    startAutoSlide();
  }, 400);
}

// =====================
// 自動再生
// =====================
function startAutoSlide() {
  stopAutoSlide();
  autoSlide = setInterval(nextSlide, 6000);
}

function stopAutoSlide() {
  if (autoSlide) clearInterval(autoSlide);
}

// =====================
// ドット
// =====================
function createDots() {
  const dots = document.getElementById("dots");
  if (!dots) return;

  dots.innerHTML = "";

  for (let i = 0; i < videos.length; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";

    dot.addEventListener("click", () => {
      index = i + 1;
      update();
    });

    dots.appendChild(dot);
  }
}

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  if (!dots.length) return;

  dots.forEach(dot => dot.classList.remove("active"));

  let realIndex = index - 1;

  if (realIndex < 0) realIndex = videos.length - 1;
  if (realIndex >= videos.length) realIndex = 0;

  if (dots[realIndex]) {
    dots[realIndex].classList.add("active");
  }
}

// =====================
// スワイプ
// =====================
function initSwipe() {
  const slider = document.querySelector(".slider");
  if (!slider) return;

  let startX = 0;
  let endX = 0;

  slider.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", e => {
    endX = e.changedTouches[0].clientX;

    if (startX - endX > 50) {
      nextSlide();
    } else if (endX - startX > 50) {
      prevSlide();
    }
  });
}