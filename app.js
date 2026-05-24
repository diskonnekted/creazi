// --- APP STATE MANAGEMENT ---
class KreasiApp {
  constructor() {
    this.theme = localStorage.getItem("kreasi_theme") || "cyberpunk";
    this.activeCategory = "all";
    this.searchQuery = "";
    
    // Auth & Dashboard States
    this.currentUser = null;
    this.activeHistoryTab = "works";
    
    // Synthesizer States
    this.currentPlayingId = null;
    this.audioContext = null;
    this.sequencerInterval = null;
    this.activeDetailId = null;
    
    this.cacheDOM();
    this.bindEvents();
    this.applyTheme(this.theme);
    
    // Load auth session first, then render
    this.checkAuthSession().then(() => {
      this.renderFeed();
    });
  }

  // Fetch active session user from DB
  async checkAuthSession() {
    try {
      const user = await window.KreasiDB.getCurrentUser();
      
      const loginBtn = document.getElementById("header-login-btn");
      const profileBadge = document.getElementById("header-profile-badge");
      
      if (user) {
        this.currentUser = user;
        
        // Update header UI
        if (loginBtn) loginBtn.style.display = "none";
        if (profileBadge) {
          profileBadge.style.display = "flex";
          document.getElementById("header-profile-avatar").src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatar}`;
          document.getElementById("header-profile-username").textContent = user.username;
        }
      } else {
        this.currentUser = null;
        
        // Update header UI
        if (loginBtn) loginBtn.style.display = "inline-flex";
        if (profileBadge) profileBadge.style.display = "none";
      }
      await this.updateStats();
    } catch (err) {
      console.error("Auth session check failed:", err);
    }
  }

  cacheDOM() {
    // Layout headers
    this.html = document.documentElement;
    this.themeSelector = document.getElementById("theme-selector");
    this.profileBadge = document.getElementById("header-profile-badge");
    
    // Actions / Buttons
    this.heroCreateBtn = document.getElementById("hero-create-btn");
    this.heroScrollBtn = document.getElementById("hero-scroll-btn");
    this.filtersContainer = document.getElementById("category-filter-pills");
    this.searchInput = document.getElementById("feed-search-input");
    this.bentoGrid = document.getElementById("creations-bento-grid");
    
    // Stats elements
    this.statWorksCount = document.getElementById("stat-works-count");
    this.statCommentsCount = document.getElementById("stat-comments-count");
    this.statLikesCount = document.getElementById("stat-likes-count");
    
    // Modals
    this.detailModal = document.getElementById("detail-modal");
    this.detailModalClose = document.getElementById("detail-modal-close");
    this.createModal = document.getElementById("create-modal");
    this.createModalClose = document.getElementById("create-modal-close");
    this.profileModal = document.getElementById("profile-modal");
    this.profileModalClose = document.getElementById("profile-modal-close");
    
    // --- Auth & Dashboard Modals ---
    this.authModal = document.getElementById("auth-modal");
    this.authModalClose = document.getElementById("auth-modal-close");
    this.authTabLogin = document.getElementById("auth-tab-login");
    this.authTabRegister = document.getElementById("auth-tab-register");
    this.loginForm = document.getElementById("login-form");
    this.registerForm = document.getElementById("register-form");
    
    this.profileDashboardModal = document.getElementById("profile-dashboard-modal");
    this.profileDashboardClose = document.getElementById("profile-dashboard-close");
    this.dashboardAvatar = document.getElementById("dashboard-avatar");
    this.dashboardDisplayName = document.getElementById("dashboard-display-name");
    this.dashboardHandle = document.getElementById("dashboard-handle");
    this.dashboardBio = document.getElementById("dashboard-bio");
    this.dashboardEditBtn = document.getElementById("dashboard-edit-btn");
    this.dashboardLogoutBtn = document.getElementById("dashboard-logout-btn");
    
    this.historyTabWorks = document.getElementById("history-tab-works");
    this.historyTabComments = document.getElementById("history-tab-comments");
    this.historyWorksCount = document.getElementById("history-works-count");
    this.historyCommentsCount = document.getElementById("history-comments-count");
    this.historyContentWorks = document.getElementById("history-content-works");
    this.historyContentComments = document.getElementById("history-content-comments");
    
    // Create Post Modal form
    this.createWorkForm = document.getElementById("create-work-form");
    this.createTypeSelector = document.getElementById("create-type-selector");
    this.mediaLinkGroup = document.getElementById("media-link-group");
    this.mediaLinkInput = document.getElementById("create-media-input");
    this.mediaLinkLabel = document.getElementById("media-link-label");
    this.textContentGroup = document.getElementById("text-content-group");
    this.textContentInput = document.getElementById("create-content-input");
    
    // Profile form
    this.editProfileForm = document.getElementById("edit-profile-form");
    
    // Detail modal inner elements
    this.detailTitle = document.getElementById("detail-modal-title");
    this.detailMediaContainer = document.getElementById("detail-media-container");
    this.detailAuthorAvatar = document.getElementById("detail-author-avatar");
    this.detailAuthorName = document.getElementById("detail-author-name");
    this.detailAuthorHandle = document.getElementById("detail-author-handle");
    this.detailLikeBtn = document.getElementById("detail-like-btn");
    this.detailLikeCount = document.getElementById("detail-like-count");
    this.detailDescription = document.getElementById("detail-work-description");
    this.detailCommentsCount = document.getElementById("detail-comments-count");
    this.detailCommentsList = document.getElementById("detail-comments-list");
    this.detailCommentForm = document.getElementById("detail-comment-form");
    this.detailCommentInput = document.getElementById("detail-comment-input");
  }

  bindEvents() {
    // Theme switching
    this.themeSelector.addEventListener("click", (e) => {
      const button = e.target.closest(".vibe-option");
      if (!button) return;
      
      const themeName = button.dataset.vibe;
      this.applyTheme(themeName);
    });

    // Login Modal Open
    const headerLoginBtn = document.getElementById("header-login-btn");
    if (headerLoginBtn) {
      headerLoginBtn.addEventListener("click", () => {
        this.openAuthModal();
      });
    }

    this.authModalClose.addEventListener("click", () => {
      this.closeModal(this.authModal);
    });

    // Auth tabs toggle
    this.authTabLogin.addEventListener("click", () => {
      this.toggleAuthTab("login");
    });
    this.authTabRegister.addEventListener("click", () => {
      this.toggleAuthTab("register");
    });

    // Forms Auth Submission
    this.loginForm.addEventListener("submit", (e) => this.handleLoginSubmit(e));
    this.registerForm.addEventListener("submit", (e) => this.handleRegisterSubmit(e));

    // Profile Dashboard Modal triggers
    this.profileBadge.addEventListener("click", () => {
      this.openProfileDashboard();
    });
    this.profileDashboardClose.addEventListener("click", () => {
      this.closeModal(this.profileDashboardModal);
    });

    // Dashboard action buttons
    this.dashboardEditBtn.addEventListener("click", () => {
      this.closeModal(this.profileDashboardModal);
      this.openProfileModal();
    });
    this.dashboardLogoutBtn.addEventListener("click", () => {
      this.handleLogout();
    });

    // Profile History tab selectors
    this.historyTabWorks.addEventListener("click", () => {
      this.toggleHistoryTab("works");
    });
    this.historyTabComments.addEventListener("click", () => {
      this.toggleHistoryTab("comments");
    });

    // Profile Modal edit close
    this.profileModalClose.addEventListener("click", () => {
      this.closeModal(this.profileModal);
    });

    // Limited profile modal close
    const limitedCloseBtn = document.getElementById("limited-profile-close");
    if (limitedCloseBtn) {
      limitedCloseBtn.addEventListener("click", () => {
        this.closeModal(document.getElementById("limited-profile-modal"));
      });
    }

    // Limited profile register CTA
    const limitedRegisterBtn = document.getElementById("limited-register-btn");
    if (limitedRegisterBtn) {
      limitedRegisterBtn.addEventListener("click", () => {
        this.closeModal(document.getElementById("limited-profile-modal"));
        this.openAuthModal();
        this.toggleAuthTab("register");
      });
    }

    // Click author inside detail modal opens profile
    const detailAuthorMeta = document.querySelector(".detail-info-panel .author-meta");
    if (detailAuthorMeta) {
      detailAuthorMeta.style.cursor = "pointer";
      detailAuthorMeta.addEventListener("click", async () => {
        const worksList = await window.KreasiDB.getWorks();
        const work = worksList.find(w => w.id === this.activeDetailId);
        if (work) {
          this.closeModal(this.detailModal);
          this.openCreatorProfile(work.authorId);
        }
      });
    }

    // Create Modal Trigger
    this.heroCreateBtn.addEventListener("click", () => {
      if (!this.currentUser) {
        this.openAuthModal();
        alert("Kamu harus masuk (login) terlebih dahulu untuk berbagi karya!");
        return;
      }
      this.openCreateModal();
    });
    this.createModalClose.addEventListener("click", () => {
      this.closeModal(this.createModal);
    });

    // Scroll to feed button
    this.heroScrollBtn.addEventListener("click", () => {
      document.getElementById("feed-filters").scrollIntoView({ behavior: "smooth" });
    });

    // Filtering logic
    this.filtersContainer.addEventListener("click", (e) => {
      const button = e.target.closest(".filter-pill");
      if (!button) return;
      
      this.filtersContainer.querySelectorAll(".filter-pill").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      
      this.activeCategory = button.dataset.category;
      this.renderFeed();
    });

    // Search logic
    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderFeed();
    });

    // Work Detail Modal close
    this.detailModalClose.addEventListener("click", () => {
      this.closeModal(this.detailModal);
      this.stopSynthesizer();
    });

    // Type selector logic in Create Post modal
    this.createTypeSelector.addEventListener("click", (e) => {
      const typeOption = e.target.closest(".type-option-card");
      if (!typeOption) return;
      
      this.createTypeSelector.querySelectorAll(".type-option-card").forEach(opt => opt.classList.remove("selected"));
      typeOption.classList.add("selected");
      
      this.adjustCreateFormFields(typeOption.dataset.type);
    });

    // Forms submissions
    this.createWorkForm.addEventListener("submit", (e) => this.handleCreateWorkSubmit(e));
    this.editProfileForm.addEventListener("submit", (e) => this.handleEditProfileSubmit(e));
    this.detailCommentForm.addEventListener("submit", (e) => this.handleCommentSubmit(e));

    // Like button click inside details
    this.detailLikeBtn.addEventListener("click", (e) => this.handleLikeClick(e));

    // Close modal on clicking outside wrapper
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.closeModal(e.target);
        this.stopSynthesizer();
      }
    });
  }

  // --- THEME ---
  applyTheme(themeName) {
    this.theme = themeName;
    this.html.setAttribute("data-theme", themeName);
    localStorage.setItem("kreasi_theme", themeName);

    // Update active button state
    this.themeSelector.querySelectorAll(".vibe-option").forEach(btn => {
      if (btn.dataset.vibe === themeName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // --- STATS ---
  async updateStats() {
    const worksList = await window.KreasiDB.getWorks();
    
    // Total works
    this.statWorksCount.textContent = worksList.length;
    
    // Total comments
    let totalComments = 0;
    worksList.forEach(w => totalComments += w.comments.length);
    this.statCommentsCount.textContent = totalComments;

    // Total likes
    let totalLikes = 0;
    worksList.forEach(w => totalLikes += w.likes);
    this.statLikesCount.textContent = totalLikes;
  }

  // --- RENDER BENTO FEED ---
  async renderFeed() {
    this.bentoGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: var(--accent-secondary); margin-bottom: 15px;"></i>
        <h3 style="font-family: var(--font-heading);">Memuat Galeri Karya...</h3>
      </div>
    `;

    try {
      const creatorsList = await window.KreasiDB.getCreators();
      const worksList = await window.KreasiDB.getWorks();
      this.bentoGrid.innerHTML = "";

      const filteredWorks = worksList.filter(work => {
        const creator = creatorsList[work.authorId] || this.currentUser || { displayName: "User", username: "@deleted" };
        const matchesCategory = this.activeCategory === "all" || work.type === this.activeCategory;
        const matchesSearch = work.title.toLowerCase().includes(this.searchQuery) ||
                              creator.displayName.toLowerCase().includes(this.searchQuery) ||
                              creator.username.toLowerCase().includes(this.searchQuery) ||
                              work.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
        return matchesCategory && matchesSearch;
      });

      if (filteredWorks.length === 0) {
        this.bentoGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; border: 3px dashed var(--border-color); background-color: var(--card-bg);">
            <i class="fa-solid fa-face-sad-tear" style="font-size: 3rem; margin-bottom: 15px; color: var(--accent-primary);"></i>
            <h3 style="font-family: var(--font-heading); margin-bottom: 8px;">Karya Tidak Ditemukan</h3>
            <p style="color: var(--text-secondary);">Coba cari kata kunci lain atau bagikan karya pertamamu sekarang!</p>
          </div>
        `;
        return;
      }

      filteredWorks.forEach(work => {
        const creator = creatorsList[work.authorId] || this.currentUser || { displayName: "User", username: "@deleted", avatar: "Felix" };
        const card = document.createElement("article");
        card.className = `bento-card ${work.layoutClass || "regular"}`;
        card.id = `card-${work.id}`;

        let typeIcon = "fa-palette";
        if (work.type === "beats") typeIcon = "fa-music";
        else if (work.type === "writing") typeIcon = "fa-pen-nib";
        else if (work.type === "code") typeIcon = "fa-code";

        let bodyHTML = "";
        if (work.type === "art") {
          const fallBackImg = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
          bodyHTML = `
            <div class="card-body art">
              <img src="${work.mediaUrl || fallBackImg}" alt="${work.title}" loading="lazy">
            </div>
          `;
        } else if (work.type === "writing") {
          bodyHTML = `
            <div class="card-body text">
              <p class="text-quote">"${work.content ? work.content.split('\n')[0] : work.description}"</p>
              <p style="font-size:0.75rem; color:var(--accent-secondary); font-family:var(--font-heading); text-transform:uppercase;">[ Baca Selengkapnya ]</p>
            </div>
          `;
        } else if (work.type === "code") {
          bodyHTML = `
            <div class="card-body code">
              <pre class="code-pre"><code>${work.content ? this.escapeHTML(work.content) : work.description}</code></pre>
            </div>
          `;
        } else if (work.type === "beats") {
          bodyHTML = `
            <div class="card-body beats">
              <div class="music-title-wrap">
                <div class="music-vinyl" id="vinyl-${work.id}"></div>
                <div class="music-info">
                  <h4>${work.title}</h4>
                  <p>${creator.displayName}</p>
                </div>
              </div>
              <div class="player-controls">
                <button class="play-pause-btn" data-beat-id="${work.id}" id="play-btn-${work.id}">
                  <i class="fa-solid fa-play"></i>
                </button>
                <div class="audio-bar-mock">
                  <div class="audio-progress-mock" id="progress-${work.id}" style="width: 0%;"></div>
                </div>
              </div>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="card-header">
            <div class="card-author" style="cursor: pointer;">
              <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${creator.avatar}" alt="Avatar">
              <span>${creator.username}</span>
            </div>
            <div class="card-tag"><i class="fa-solid ${typeIcon}"></i> ${work.type}</div>
          </div>
          ${bodyHTML}
          <div class="card-footer">
            <div class="card-title">${work.title}</div>
            <div class="card-stats">
              <span><i class="fa-solid fa-heart"></i> ${work.likes}</span>
              <span><i class="fa-solid fa-comment"></i> ${work.comments ? work.comments.length : 0}</span>
            </div>
          </div>
        `;

        card.addEventListener("click", (e) => {
          if (e.target.closest(".play-pause-btn")) {
            e.stopPropagation();
            const beatId = e.target.closest(".play-pause-btn").dataset.beatId;
            this.toggleBeat(beatId);
          } else if (e.target.closest(".card-author")) {
            e.stopPropagation();
            this.openCreatorProfile(work.authorId);
          } else {
            this.openDetailModal(work.id);
          }
        });

        this.bentoGrid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      this.bentoGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; border: 3px dashed var(--accent-primary); background-color: var(--card-bg);">
          <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; margin-bottom: 15px; color: var(--accent-primary);"></i>
          <h3 style="font-family: var(--font-heading); margin-bottom: 8px;">Gagal Memuat Feed</h3>
          <p style="color: var(--text-secondary);">${err.message}</p>
        </div>
      `;
    }
  }

  escapeHTML(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- FORM FIELDS CONTROLLER ---
  adjustCreateFormFields(type) {
    if (type === "art") {
      this.mediaLinkGroup.style.display = "block";
      this.mediaLinkLabel.textContent = "Image URL (Link Gambar)";
      this.mediaLinkInput.placeholder = "Contoh: assets/cyberpunk_art.png atau link unsplash";
      this.mediaLinkInput.required = false;
      this.textContentGroup.style.display = "none";
    } else if (type === "beats") {
      this.mediaLinkGroup.style.display = "block";
      this.mediaLinkLabel.textContent = "SoundCloud / Spotify Link (Opsional)";
      this.mediaLinkInput.placeholder = "Masukkan link track jika ada";
      this.mediaLinkInput.required = false;
      this.textContentGroup.style.display = "none";
    } else if (type === "writing" || type === "code") {
      this.mediaLinkGroup.style.display = "none";
      this.textContentGroup.style.display = "block";
      this.textContentInput.required = true;
      if (type === "writing") {
        this.textContentInput.placeholder = "Tulis sajak, puisi, atau micro-story kerenmu di sini...";
      } else {
        this.textContentInput.placeholder = "Paste snippet kode Javascript/HTML/CSS kreatifmu...";
      }
    }
  }

  // --- MODAL UTILITIES ---
  openModal(modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  closeModal(modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // --- AUTH MODAL CONTROLLER ---
  openAuthModal() {
    this.loginForm.reset();
    this.registerForm.reset();
    this.toggleAuthTab("login");
    this.openModal(this.authModal);
  }

  toggleAuthTab(tab) {
    if (tab === "login") {
      this.authTabLogin.classList.add("active");
      this.authTabRegister.classList.remove("active");
      this.loginForm.style.display = "block";
      this.registerForm.style.display = "none";
      document.getElementById("auth-modal-title").textContent = "Masuk ke KreaZi";
    } else {
      this.authTabLogin.classList.remove("active");
      this.authTabRegister.classList.add("active");
      this.loginForm.style.display = "none";
      this.registerForm.style.display = "block";
      document.getElementById("auth-modal-title").textContent = "Daftar Akun Baru";
    }
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("login-email-input").value.trim();
    const password = document.getElementById("login-password-input").value;

    try {
      const user = await window.KreasiDB.signIn(email, password);
      this.closeModal(this.authModal);
      await this.checkAuthSession();
      this.renderFeed();
      alert(`Selamat datang kembali, ${user.displayName}!`);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("reg-email-input").value.trim();
    const username = document.getElementById("reg-username-input").value.trim();
    const displayName = document.getElementById("reg-name-input").value.trim();
    const password = document.getElementById("reg-password-input").value;

    const avatars = ["Felix", "Bella", "Jack", "Milo", "Chloe"];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    const bio = "Creator baru di KreaZi. Salam kenal!";

    try {
      const user = await window.KreasiDB.signUp(email, password, username, displayName, avatar, bio);
      this.closeModal(this.authModal);
      await this.checkAuthSession();
      this.renderFeed();
      alert(`Pendaftaran sukses! Selamat datang, ${user.displayName}!`);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async handleLogout() {
    if (confirm("Apakah kamu yakin ingin keluar?")) {
      await window.KreasiDB.signOut();
      this.closeModal(this.profileDashboardModal);
      await this.checkAuthSession();
      this.renderFeed();
      alert("Kamu berhasil keluar.");
    }
  }

  // --- PROFILE DASHBOARD CONTROLLER ---
  async openProfileDashboard() {
    if (!this.currentUser) {
      this.openAuthModal();
      return;
    }

    this.dashboardEditBtn.style.display = "inline-flex";
    this.dashboardLogoutBtn.style.display = "inline-flex";
    document.querySelector("#profile-dashboard-modal h2").textContent = "Dashboard Profil";

    const user = this.currentUser;
    this.dashboardAvatar.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatar}`;
    this.dashboardDisplayName.textContent = user.displayName;
    this.dashboardHandle.textContent = user.username;
    this.dashboardBio.textContent = user.bio || "Belum ada bio.";

    this.toggleHistoryTab("works");
    this.openModal(this.profileDashboardModal);
  }

  toggleHistoryTab(tab) {
    this.activeHistoryTab = tab;
    if (tab === "works") {
      this.historyTabWorks.classList.add("active");
      this.historyTabComments.classList.remove("active");
      this.historyContentWorks.style.display = "flex";
      this.historyContentComments.style.display = "none";
    } else {
      this.historyTabWorks.classList.remove("active");
      this.historyTabComments.classList.add("active");
      this.historyContentWorks.style.display = "none";
      this.historyContentComments.style.display = "flex";
    }
    
    const modalTitle = document.querySelector("#profile-dashboard-modal h2").textContent;
    if (modalTitle === "Dashboard Profil") {
      this.renderAccountHistory();
    }
  }

  async renderAccountHistory() {
    if (!this.currentUser) return;

    try {
      const history = await window.KreasiDB.getAccountHistory(this.currentUser.id);
      this.historyWorksCount.textContent = history.works.length;
      this.historyCommentsCount.textContent = history.comments.length;

      // 1. Render Works History
      this.historyContentWorks.innerHTML = "";
      if (history.works.length === 0) {
        this.historyContentWorks.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 15px 0; font-size: 0.85rem;">Kamu belum membagikan karya.</p>`;
      } else {
        history.works.forEach(work => {
          const item = document.createElement("div");
          item.className = "history-item";
          item.innerHTML = `
            <span class="history-item-title" data-work-id="${work.id}">${work.title}</span>
            <div>
              <span class="history-item-meta" style="margin-right: 5px;">${work.type}</span>
              <span class="history-item-meta"><i class="fa-solid fa-heart"></i> ${work.likes}</span>
            </div>
          `;
          
          item.querySelector(".history-item-title").addEventListener("click", () => {
            this.closeModal(this.profileDashboardModal);
            this.openDetailModal(work.id);
          });
          
          this.historyContentWorks.appendChild(item);
        });
      }

      // 2. Render Comments History
      this.historyContentComments.innerHTML = "";
      if (history.comments.length === 0) {
        this.historyContentComments.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 15px 0; font-size: 0.85rem;">Kamu belum menulis komentar.</p>`;
      } else {
        history.comments.forEach(comment => {
          const item = document.createElement("div");
          item.className = "history-comment-log";
          item.innerHTML = `
            <p class="history-comment-target">Mengomentari karya <strong data-work-id="${comment.workId}">"${comment.workTitle}"</strong>:</p>
            <p class="history-comment-text">"${this.escapeHTML(comment.text)}"</p>
          `;
          
          item.querySelector("strong").addEventListener("click", () => {
            this.closeModal(this.profileDashboardModal);
            this.openDetailModal(comment.workId);
          });
          
          this.historyContentComments.appendChild(item);
        });
      }
    } catch (err) {
      console.error("Failed to render account history:", err);
    }
  }

  // --- GENERAL CREATOR PROFILE ROUTER ---
  async openCreatorProfile(authorId) {
    const creatorsList = await window.KreasiDB.getCreators();
    let creator = creatorsList[authorId];
    
    if (authorId === "user" || (this.currentUser && creator && creator.id === this.currentUser.id)) {
      this.openProfileDashboard();
      return;
    }
    
    if (!creator) {
      creator = { displayName: "User", username: "@deleted", avatar: "Felix", bio: "Akun tidak ditemukan." };
    }

    if (this.currentUser) {
      this.openOtherProfileDashboard(creator);
    } else {
      this.openLimitedProfileModal(creator);
    }
  }

  async openCreatorProfileByUsername(username) {
    const creatorsList = await window.KreasiDB.getCreators();
    const creator = Object.values(creatorsList).find(c => c.username === username);
    if (creator) {
      this.openCreatorProfile(creator.id);
    } else {
      if (this.currentUser && this.currentUser.username === username) {
        this.openProfileDashboard();
      } else {
        const mockCreator = { displayName: username.substring(1), username: username, avatar: "Felix", bio: "Member KreaZi." };
        if (this.currentUser) {
          this.openOtherProfileDashboard(mockCreator);
        } else {
          this.openLimitedProfileModal(mockCreator);
        }
      }
    }
  }

  async openOtherProfileDashboard(creator) {
    this.dashboardEditBtn.style.display = "none";
    this.dashboardLogoutBtn.style.display = "none";
    document.querySelector("#profile-dashboard-modal h2").textContent = `Profil ${creator.displayName}`;
    
    this.dashboardAvatar.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${creator.avatar}`;
    this.dashboardDisplayName.textContent = creator.displayName;
    this.dashboardHandle.textContent = creator.username;
    this.dashboardBio.textContent = creator.bio || "Belum ada bio.";

    this.activeHistoryTab = "works";
    this.historyTabWorks.classList.add("active");
    this.historyTabComments.classList.remove("active");
    this.historyContentWorks.style.display = "flex";
    this.historyContentComments.style.display = "none";
    
    this.renderOtherAccountHistory(creator);
    this.openModal(this.profileDashboardModal);
  }

  async renderOtherAccountHistory(creator) {
    try {
      const history = await window.KreasiDB.getAccountHistory(creator.id);
      
      this.historyWorksCount.textContent = history.works.length;
      this.historyCommentsCount.textContent = history.comments.length;

      // 1. Works
      this.historyContentWorks.innerHTML = "";
      if (history.works.length === 0) {
        this.historyContentWorks.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 15px 0; font-size: 0.85rem;">Kreator ini belum membagikan karya.</p>`;
      } else {
        history.works.forEach(work => {
          const item = document.createElement("div");
          item.className = "history-item";
          item.innerHTML = `
            <span class="history-item-title" data-work-id="${work.id}">${work.title}</span>
            <div>
              <span class="history-item-meta" style="margin-right: 5px;">${work.type}</span>
              <span class="history-item-meta"><i class="fa-solid fa-heart"></i> ${work.likes}</span>
            </div>
          `;
          item.querySelector(".history-item-title").addEventListener("click", () => {
            this.closeModal(this.profileDashboardModal);
            this.openDetailModal(work.id);
          });
          this.historyContentWorks.appendChild(item);
        });
      }

      // 2. Comments
      this.historyContentComments.innerHTML = "";
      if (history.comments.length === 0) {
        this.historyContentComments.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 15px 0; font-size: 0.85rem;">Kreator ini belum menulis komentar.</p>`;
      } else {
        history.comments.forEach(comment => {
          const item = document.createElement("div");
          item.className = "history-comment-log";
          item.innerHTML = `
            <p class="history-comment-target">Mengomentari karya <strong data-work-id="${comment.workId}">"${comment.workTitle}"</strong>:</p>
            <p class="history-comment-text">"${this.escapeHTML(comment.text)}"</p>
          `;
          item.querySelector("strong").addEventListener("click", () => {
            this.closeModal(this.profileDashboardModal);
            this.openDetailModal(comment.workId);
          });
          this.historyContentComments.appendChild(item);
        });
      }
    } catch (err) {
      console.error("Failed to render other account history:", err);
    }
  }

  openLimitedProfileModal(creator) {
    document.getElementById("limited-avatar").src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${creator.avatar}`;
    document.getElementById("limited-display-name").textContent = creator.displayName;
    document.getElementById("limited-handle").textContent = creator.username;
    document.getElementById("limited-bio").textContent = creator.bio || "Belum ada bio.";
    document.getElementById("limited-prompt-username").textContent = creator.username;
    
    this.openModal(document.getElementById("limited-profile-modal"));
  }

  // --- PROFILE EDIT CONTROLLER ---
  openProfileModal() {
    if (!this.currentUser) return;
    
    document.getElementById("profile-name-input").value = this.currentUser.displayName;
    document.getElementById("profile-handle-input").value = this.currentUser.username;
    document.getElementById("profile-avatar-select").value = this.currentUser.avatar;
    document.getElementById("profile-bio-input").value = this.currentUser.bio || "";
    
    this.openModal(this.profileModal);
  }

  async handleEditProfileSubmit(e) {
    e.preventDefault();
    const displayName = document.getElementById("profile-name-input").value.trim();
    const username = document.getElementById("profile-handle-input").value.trim();
    const avatar = document.getElementById("profile-avatar-select").value;
    const bio = document.getElementById("profile-bio-input").value.trim();

    if (!displayName || !username) return;

    try {
      const updatedUser = await window.KreasiDB.updateProfile(displayName, username, avatar, bio);
      this.closeModal(this.profileModal);
      await this.checkAuthSession();
      this.renderFeed();
      alert("Profil berhasil diperbarui!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  // --- POST CREATOR CONTROLLER ---
  openCreateModal() {
    this.createWorkForm.reset();
    this.adjustCreateFormFields("art");
    this.createTypeSelector.querySelectorAll(".type-option-card").forEach(opt => {
      opt.classList.remove("selected");
      if (opt.dataset.type === "art") opt.classList.add("selected");
    });
    this.openModal(this.createModal);
  }

  async handleCreateWorkSubmit(e) {
    e.preventDefault();
    if (!this.currentUser) {
      this.openAuthModal();
      return;
    }

    const title = document.getElementById("create-title-input").value.trim();
    const type = this.createTypeSelector.querySelector(".type-option-card.selected").dataset.type;
    const rawTags = document.getElementById("create-tags-input").value.trim();
    const tags = rawTags ? rawTags.split(",").map(t => t.trim().toLowerCase()).filter(t => t) : [];
    const mediaUrl = this.mediaLinkInput.value.trim();
    const content = this.textContentInput.value.trim();
    const description = document.getElementById("create-desc-input").value.trim();

    if (!title || !description) return;

    try {
      let layoutClass = "regular";
      const worksList = await window.KreasiDB.getWorks();
      if (type === "art" && worksList.length % 2 === 0) layoutClass = "tall";
      if (type === "writing") layoutClass = "wide";

      const newWork = {
        id: `work-${Date.now()}`,
        type: type,
        title: title,
        authorId: this.currentUser.id,
        mediaUrl: mediaUrl,
        content: (type === "writing" || type === "code") ? content : "",
        description: description,
        tags: tags,
        likes: 0,
        likedBy: [],
        comments: [],
        layoutClass: layoutClass
      };

      await window.KreasiDB.saveWork(newWork);
      this.closeModal(this.createModal);
      this.renderFeed();
      await this.updateStats();
      alert("Karyamu berhasil dipublikasikan!");
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  }

  // --- WORK DETAILS & INTERACTION CONTROLLER ---
  async openDetailModal(workId) {
    this.activeDetailId = workId;
    const worksList = await window.KreasiDB.getWorks();
    const work = worksList.find(w => w.id === workId);
    if (!work) return;

    const creatorsList = await window.KreasiDB.getCreators();
    const creator = creatorsList[work.authorId] || this.currentUser || { displayName: "User", username: "@deleted", avatar: "Felix" };

    this.detailTitle.textContent = work.title;
    this.detailAuthorName.textContent = creator.displayName;
    this.detailAuthorHandle.textContent = creator.username;
    this.detailAuthorAvatar.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${creator.avatar}`;
    this.detailDescription.textContent = work.description;
    this.detailLikeCount.textContent = work.likes;

    // Likes state
    if (this.currentUser && work.likedBy.includes(this.currentUser.username)) {
      this.detailLikeBtn.classList.add("liked");
      this.detailLikeBtn.style.backgroundColor = "var(--accent-primary)";
      this.detailLikeBtn.style.color = "#ffffff";
    } else {
      this.detailLikeBtn.classList.remove("liked");
      this.detailLikeBtn.style.backgroundColor = "";
      this.detailLikeBtn.style.color = "";
    }

    // Reset media
    this.detailMediaContainer.className = "detail-media-container";
    this.detailMediaContainer.innerHTML = "";

    // Set custom visualizer based on post type
    if (work.type === "art") {
      const fallBackImg = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
      this.detailMediaContainer.innerHTML = `<img src="${work.mediaUrl || fallBackImg}" alt="${work.title}">`;
    } else if (work.type === "writing") {
      this.detailMediaContainer.classList.add("text-view");
      this.detailMediaContainer.innerHTML = `<div>${work.content ? work.content.replace(/\n/g, '<br>') : work.description}</div>`;
    } else if (work.type === "code") {
      this.detailMediaContainer.classList.add("code-view");
      this.detailMediaContainer.innerHTML = `<pre><code>${work.content ? this.escapeHTML(work.content) : work.description}</code></pre>`;
    } else if (work.type === "beats") {
      this.detailMediaContainer.classList.add("beats-view");
      this.detailMediaContainer.innerHTML = `
        <div class="vinyl-large" id="detail-vinyl">
          <div class="vinyl-center"></div>
        </div>
        <button class="neo-btn" id="detail-audio-play-btn" style="border-radius: 50px; padding: 12px 25px;">
          <i class="fa-solid fa-play"></i> PLAY SYNTESIZER BEAT
        </button>
      `;

      const detailPlayBtn = document.getElementById("detail-audio-play-btn");
      detailPlayBtn.addEventListener("click", () => {
        this.toggleBeat(work.id);
        this.updateDetailAudioButton(work.id, detailPlayBtn);
      });
      this.updateDetailAudioButton(work.id, detailPlayBtn);
    }

    this.renderComments(work.comments);
    this.openModal(this.detailModal);
  }

  renderComments(comments) {
    this.detailCommentsCount.textContent = comments ? comments.length : 0;
    this.detailCommentsList.innerHTML = "";

    if (!comments || comments.length === 0) {
      this.detailCommentsList.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 20px 0;">Belum ada komentar. Jadilah yang pertama berkomentar!</p>`;
      return;
    }

    comments.forEach(comment => {
      const commentItem = document.createElement("div");
      commentItem.className = "comment-item";
      commentItem.innerHTML = `
        <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.avatar}" alt="Avatar" class="clickable-avatar" style="cursor: pointer;">
        <div class="comment-content-wrap">
          <div class="comment-author-time">
            <strong class="clickable-author" style="cursor: pointer;">${comment.author}</strong>
            <span>${comment.time || "Baru saja"}</span>
          </div>
          <div class="comment-text">${this.escapeHTML(comment.text)}</div>
        </div>
      `;
      
      commentItem.querySelectorAll(".clickable-avatar, .clickable-author").forEach(elem => {
        elem.addEventListener("click", () => {
          this.closeModal(this.detailModal);
          this.openCreatorProfileByUsername(comment.author);
        });
      });

      this.detailCommentsList.appendChild(commentItem);
    });
  }

  async handleCommentSubmit(e) {
    e.preventDefault();
    if (!this.currentUser) {
      this.openAuthModal();
      alert("Kamu harus masuk (login) terlebih dahulu untuk berkomentar!");
      return;
    }

    const workId = this.activeDetailId;
    const commentText = this.detailCommentInput.value.trim();
    if (!commentText) return;

    const newComment = {
      author: this.currentUser.username,
      avatar: this.currentUser.avatar,
      text: commentText,
      time: "Baru saja"
    };

    try {
      await window.KreasiDB.addComment(workId, newComment);
      this.detailCommentInput.value = "";
      
      // Fetch updated work to refresh comments list
      const worksList = await window.KreasiDB.getWorks();
      const updatedWork = worksList.find(w => w.id === workId);
      if (updatedWork) {
        this.renderComments(updatedWork.comments);
      }
      
      this.renderFeed();
      await this.updateStats();
    } catch (err) {
      alert("Comment failed: " + err.message);
    }
  }

  async handleLikeClick(e) {
    if (!this.currentUser) {
      this.openAuthModal();
      alert("Kamu harus masuk (login) terlebih dahulu untuk menyukai karya!");
      return;
    }

    const workId = this.activeDetailId;
    const username = this.currentUser.username;

    try {
      await window.KreasiDB.toggleLike(workId, username);
      
      const updatedWorks = await window.KreasiDB.getWorks();
      const updatedWork = updatedWorks.find(w => w.id === workId);
      
      if (updatedWork) {
        this.detailLikeCount.textContent = updatedWork.likes;
        if (updatedWork.likedBy.includes(username)) {
          this.detailLikeBtn.classList.add("liked");
          this.detailLikeBtn.style.backgroundColor = "var(--accent-primary)";
          this.detailLikeBtn.style.color = "#ffffff";
          this.spawnLikeParticles(e);
        } else {
          this.detailLikeBtn.classList.remove("liked");
          this.detailLikeBtn.style.backgroundColor = "";
          this.detailLikeBtn.style.color = "";
        }
      }
      
      this.renderFeed();
      await this.updateStats();
    } catch (err) {
      alert("Like failed: " + err.message);
    }
  }

  spawnLikeParticles(e) {
    const btn = this.detailLikeBtn;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const colors = ["#ff0055", "#00ff88", "#00ffff", "#e0ff2b"];

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.className = "like-particle";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.border = "1px solid #000";
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 80;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 20;

      particle.style.setProperty("--tx", `${tx}px`);
      particle.style.setProperty("--ty", `${ty}px`);
      particle.style.position = "fixed";
      particle.style.zIndex = "300";

      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 600);
    }
  }

  // --- AUDIO SYNTH SEQUENCER ---
  toggleBeat(beatId) {
    if (this.currentPlayingId === beatId) {
      this.stopSynthesizer();
    } else {
      this.stopSynthesizer();
      this.playSynthesizer(beatId);
    }
  }

  playSynthesizer(beatId) {
    this.currentPlayingId = beatId;
    
    const cardVinyl = document.getElementById(`vinyl-${beatId}`);
    if (cardVinyl) cardVinyl.classList.add("playing");
    
    const cardPlayBtn = document.getElementById(`play-btn-${beatId}`);
    if (cardPlayBtn) cardPlayBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;

    const detailVinyl = document.getElementById("detail-vinyl");
    if (detailVinyl) detailVinyl.classList.add("playing");

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = this.audioContext;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const chords = [
      [220, 261.63, 329.63],
      [174.61, 220, 261.63],
      [261.63, 329.63, 392],
      [196, 246.94, 293.66]
    ];

    const melody = [
      329.63, 349.23, 392, 440,
      392, 349.23, 329.63, 293.66,
      261.63, 293.66, 329.63, 349.23,
      329.63, 293.66, 220, 196
    ];

    let step = 0;
    let progressPct = 0;
    
    this.sequencerInterval = setInterval(() => {
      const chordIndex = Math.floor(step / 4) % chords.length;
      const noteIndex = step % melody.length;
      
      chords[chordIndex].forEach(freq => {
        this.playOscillator(freq, 0.05, 0.8, "sawtooth");
      });

      if (step % 2 === 0) {
        this.playOscillator(melody[noteIndex], 0.08, 0.4, "sine");
      }

      if (step % 2 === 1) {
        this.playNoise(0.02, 0.05);
      }

      progressPct = ((step % 16) + 1) * 6.25;
      
      const progressBar = document.getElementById(`progress-${beatId}`);
      if (progressBar) progressBar.style.width = `${progressPct}%`;

      step++;
    }, 300);
  }

  playOscillator(frequency, volume, duration, type = "sine") {
    const ctx = this.audioContext;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  playNoise(volume, duration) {
    const ctx = this.audioContext;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  stopSynthesizer() {
    if (this.sequencerInterval) {
      clearInterval(this.sequencerInterval);
      this.sequencerInterval = null;
    }

    if (this.currentPlayingId) {
      const beatId = this.currentPlayingId;
      
      const cardVinyl = document.getElementById(`vinyl-${beatId}`);
      if (cardVinyl) cardVinyl.classList.remove("playing");
      
      const cardPlayBtn = document.getElementById(`play-btn-${beatId}`);
      if (cardPlayBtn) cardPlayBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;

      const progressBar = document.getElementById(`progress-${beatId}`);
      if (progressBar) progressBar.style.width = "0%";

      const detailVinyl = document.getElementById("detail-vinyl");
      if (detailVinyl) detailVinyl.classList.remove("playing");

      this.currentPlayingId = null;
    }
  }

  updateDetailAudioButton(beatId, button) {
    if (!button) return;
    if (this.currentPlayingId === beatId) {
      button.innerHTML = `<i class="fa-solid fa-pause"></i> PAUSE SYNTESIZER`;
      button.style.backgroundColor = "var(--accent-primary)";
      button.style.color = "#ffffff";
    } else {
      button.innerHTML = `<i class="fa-solid fa-play"></i> PLAY SYNTESIZER BEAT`;
      button.style.backgroundColor = "var(--accent-secondary)";
      button.style.color = "#000000";
    }
  }
}

// --- INITIALIZE APPLICATION ---
document.addEventListener("DOMContentLoaded", () => {
  window.KreasiAppInstance = new KreasiApp();
});
