document.addEventListener("DOMContentLoaded", () => {
  initForm();
  initSuccess();
  initMarquee();
  initBackgroundAnimation();
  initIndexBackground();
});

function initIndexBackground() {
  const container = document.getElementById("bg-image-wall");
  if (!container) return;

  // 根据屏幕宽度确定列数和性能设置
  const isMobile = window.innerWidth < 768;
  const isVeryMobile = window.innerWidth < 480;
  const colCount = isVeryMobile ? 1 : (isMobile ? 2 : 4);

  // 创建列
  const columns = [];
  for (let i = 0; i < colCount; i++) {
    const col = document.createElement("div");
    col.className = "bg-column";
    container.appendChild(col);
    columns.push(col);
  }

  // 加载图片
  const images = Array.from({ length: 36 }, (_, i) => `images/${i + 1}.webp`);

  // 随机性地洗牌图像
  const shuffledImages = [...images].sort(() => Math.random() - 0.5);

  // 向栏目分发图片
  columns.forEach((col, colIndex) => {
    // 增加每列图片数量，确保在使用更大图片的情况下仍然显示4行
    // 根据屏幕尺寸调整每列图片数量
    const imagesPerColumn = isVeryMobile ? 22 : (isMobile ? 20 : 18);
    
    const colImages = [];
    for (let j = 0; j < imagesPerColumn; j++) {
      colImages.push(
        shuffledImages[(colIndex * imagesPerColumn + j) % shuffledImages.length]
      );
    }

    // 复制以实现无缝滚动
    const trackImages = [...colImages, ...colImages];

    // 为动画创建内部轨道 div
    const track = document.createElement("div");
    track.style.display = "flex";
    track.style.flexDirection = "column";
    // 调整间距以平衡更大的图片尺寸，同时保持4行显示
    track.style.gap = isMobile ? "12px" : "18px";

    // 布景动画：方向交替
    const direction = colIndex % 2 === 0 ? "scroll-up" : "scroll-down";
    const duration = 40 + Math.random() * 20; // 速度在 40 到 60 英里之间随机波动
    track.style.animation = `${direction} ${duration}s linear infinite`;

    // 添加图片到轨道
    trackImages.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "bg-img";
      img.alt = "";
      img.onerror = () => {
        img.style.display = "none";
      };
      track.appendChild(img);
    });

    col.appendChild(track);
  });
}

function initBackgroundAnimation() {
  const container = document.getElementById("background-container");
  if (!container) return;

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let width, height;
  let particles = [];
  let shootingStars = [];

  // 配置 - 根据屏幕尺寸调整粒子数量以优化性能
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 20 : 50;
  const colors = ["#48dbfb", "#ff9ff3", "#54a0ff", "#1dd1a1"]; // 与主题颜色匹配

  const resize = () => {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
  };

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 3 + 1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.1;
      this.fadeSpeed = Math.random() * 0.01 + 0.005;
      this.fadingIn = Math.random() > 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // 环绕屏幕
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // 脉冲α
      if (this.fadingIn) {
        this.alpha += this.fadeSpeed;
        if (this.alpha >= 0.8) this.fadingIn = false;
      } else {
        this.alpha -= this.fadeSpeed;
        if (this.alpha <= 0.1) this.fadingIn = true;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height * 0.5; // 从上半区起步
      this.len = Math.random() * 80 + 10;
      this.speed = Math.random() * 10 + 6;
      this.size = Math.random() * 1 + 0.1;

      // 射击角度（左下或右下）
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5; // 大约 45 度
      this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
      this.active = false;
    }

    update() {
      if (this.active) {
        this.x -= this.speed * Math.cos(this.angle); // 向左移动
        this.y += this.speed * Math.sin(this.angle);

        if (this.x < -this.len || this.y > height + this.len) {
          this.active = false;
          this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
        }
      } else {
        if (new Date().getTime() > this.waitTime) {
          this.reset();
          this.active = true;
        }
      }
    }

    draw() {
      if (!this.active) return;

      const tailX = this.x + this.len * Math.cos(this.angle);
      const tailY = this.y - this.len * Math.sin(this.angle);

      const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  function init() {
    resize();

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // 加几颗流星
    for (let i = 0; i < 2; i++) {
      shootingStars.push(new ShootingStar());
    }

    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 绘制粒子和线条
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();

      // 连接附近的粒子
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = p1.color;
          ctx.globalAlpha = (1 - dist / 100) * 0.2;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // 抽流星
    for (let i = 0; i < shootingStars.length; i++) {
      shootingStars[i].update();
      shootingStars[i].draw();
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  init();
}

function initMarquee() {
  const topRow = document.querySelector(".top-icons");
  const bottomRow = document.querySelector(".bottom-icons");

  if (!topRow || !bottomRow) return;

  const images = Array.from({ length: 36 }, (_, i) => `images/${i + 1}.webp`);

  const createTrack = (imgs, direction) => {
    const track = document.createElement("div");
    track.className = "marquee-track";

    // 如果需要，可以根据内容宽度调整速度，但固定时间对于均匀宽度通常没问题
    track.style.animation = `${
      direction === "left" ? "scroll-left" : "scroll-right"
    } 60s linear infinite`;

    // 复制图片以实现无缝滚动
    const allImages = [...imgs, ...imgs];

    allImages.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "game-icon-img";
      img.alt = "游戏图标";

      // 添加错误处理以隐藏损坏的图像
      img.onerror = () => {
        img.style.display = "none";
      };

      track.appendChild(img);
    });

    return track;
  };

  // 上图：从左到右
  topRow.innerHTML = "";
  topRow.appendChild(createTrack(images, "right"));

  // 底部：从右到左
  bottomRow.innerHTML = "";
  bottomRow.appendChild(createTrack(images, "left"));
}

function track(page, code) {
  fetch("api.php?action=track", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams({ page, ...(code ? { code } : {}) }),
  }).catch(() => {});
}

function initForm() {
  const btn = document.getElementById("submit-btn");
  const input = document.getElementById("secret-code");
  const text = window.__INDEX_TEXT__ || {};

  if (!btn || !input) {
    return;
  }

  track("index", "");

  btn.addEventListener("click", handleSubmit);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  });

  async function handleSubmit() {
    const code = input.value.trim();

    if (!code) {
      alert(text.alert_empty_code || "请输入暗号！");
      return;
    }

    btn.innerText = text.btn_verifying || "正在验证...";
    btn.disabled = true;

    try {
      // 模拟API调用，使用前端验证
      const validCodes = ['1', '6', '7', '8', '9', '105', '108', '111','118', '123', '211', '456', '520', '555', '654', '666', '678', '777', '888', '996', '998', '999'];
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (validCodes.includes(code)) {
        // 验证成功
        window.location.href = `success.html?code=${encodeURIComponent(code)}`;
      } else {
        // 验证失败
        alert(text.alert_verify_failed || "暗号错误");
        input.value = "";
      }
    } catch {
      alert(text.alert_network_error || "网络或服务器错误，请稍后再试");
    } finally {
      btn.innerText = text.submit_text || "提交";
      btn.disabled = false;
    }
  }
}

function initSuccess() {
  const img = document.getElementById("qr-img");
  const instructionEl = document.getElementById("success-instruction-text");
  const footerEl = document.getElementById("success-footer-text");

  if (!img) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const code = (params.get("code") || "").trim();

  if (!code) {
    return;
  }

  // 暗号到二维码URL的映射对象 - 一个暗号对应一个二维码
  const codeToQrUrl = {
    '1': 'imagesyh/1.jpg',
    '6': 'imagesyh/6.jpg',
    '7': 'imagesyh/7.jpg',
    '8': 'imagesyh/8.jpg',
    '9': 'imagesyh/9.jpg',
    '105': 'imagesyh/105.jpg',
    '108': 'imagesyh/108.jpg',
    '111': 'imagesyh/111.jpg',
    '118': 'imagesyh/118.jpg',
    '123': 'imagesyh/123.jpg',
    '211': 'imagesyh/211.jpg',
    '456': 'imagesyh/456.jpg',
    '520': 'imagesyh/520.jpg',
    '555': 'imagesyh/555.jpg',
    '654': 'imagesyh/654.jpg',
    '666': 'imagesyh/666.jpg',
    '678': 'imagesyh/678.jpg',
    '777': 'imagesyh/777.jpg',
    '888': 'imagesyh/888.jpg',
    '996': 'imagesyh/996.jpg',
    '998': 'imagesyh/998.jpg',
    '999': 'imagesyh/999.jpg'
  };

  // 根据输入的暗号获取对应的二维码URL
  const qrUrl = codeToQrUrl[code] || 'https://via.placeholder.com/200x200?text=Game+CDK';
  const instructionText = '请长按二维码识别或截图保存，使用微信扫描二维码领取奖励。';
  const footerText = '© 2025 游戏展示';
  
  // 设置二维码图片
  img.src = qrUrl;
  
  // 设置说明文字
  if (instructionEl) {
    instructionEl.textContent = instructionText;
  }
  
  // 设置页脚文字
  if (footerEl) {
    footerEl.textContent = footerText;
  }
}