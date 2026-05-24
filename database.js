/**
 * KREASI Database & Authentication Layer (Hybrid Local / Supabase)
 * 
 * Untuk mengaktifkan database Supabase asli:
 * 1. Isi variabel SUPABASE_URL dan SUPABASE_ANON_KEY di bawah ini.
 * 2. Database.js akan otomatis mengimpor Supabase Client dari CDN dan
 *    mengalihkan semua transaksi data ke server cloud Supabase Anda!
 */

const SUPABASE_URL = "https://rhyjrvydkwcbtpjjfyou.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeWpydnlka3djYnRwampmeW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjAyMTMsImV4cCI6MjA5NTE5NjIxM30.tQHkkN0vjNmpLDdzdukkPS2Sxl0UYyRdp0zJ5oSpOHo";

// Static UUIDs to satisfy PostgreSQL UUID key constraints
const MOCK_UUIDS = {
  neon_glitch: "da6e7c10-2b1a-4d2b-8a8b-1e2f3a4b5c6d",
  lofi_chords: "da6e7c10-2b1a-4d2b-8a8b-2f3a4b5c6d7e",
  midnight_poet: "da6e7c10-2b1a-4d2b-8a8b-3a4b5c6d7e8f",
  html_wizard: "da6e7c10-2b1a-4d2b-8a8b-4b5c6d7e8f9a"
};

class KreasiDatabase {
  constructor() {
    this.isSupabase = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";
    this.supabaseClient = null;

    if (this.isSupabase) {
      this.initSupabase();
    } else {
      this.initLocalStorageDB();
    }
  }

  // --- SUPABASE INITIALIZATION ---
  async initSupabase() {
    console.log("KREASI: Menggunakan Database Supabase (Cloud Mode)");
    if (!window.supabase) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = () => {
        this.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("KREASI: Supabase Client berhasil diinisialisasi.");
      };
      document.head.appendChild(script);
    } else {
      this.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }

  // --- LOCALSTORAGE INITIALIZATION ---
  initLocalStorageDB() {
    console.log("KREASI: Menggunakan Database LocalStorage (Simulasi)");
    if (!localStorage.getItem("kreasi_creators")) {
      const defaultCreators = {
        [MOCK_UUIDS.neon_glitch]: { id: MOCK_UUIDS.neon_glitch, username: "@neon_glitch", displayName: "Zaki", avatar: "Milo", bio: "3D Digital Artist based in Bandung. Cyberpunk lover.", email: "zaki@kreasi.id", password: "password123" },
        [MOCK_UUIDS.lofi_chords]: { id: MOCK_UUIDS.lofi_chords, username: "@lofi_chords", displayName: "Dina", avatar: "Bella", bio: "Sound designer & bedroom producer. Lofi beats specialist.", email: "dina@kreasi.id", password: "password123" },
        [MOCK_UUIDS.midnight_poet]: { id: MOCK_UUIDS.midnight_poet, username: "@midnight_poet", displayName: "Fajar", avatar: "Jack", bio: "Menulis sajak kala malam tiba.", email: "fajar@kreasi.id", password: "password123" },
        [MOCK_UUIDS.html_wizard]: { id: MOCK_UUIDS.html_wizard, username: "@html_wizard", displayName: "Adit", avatar: "Chloe", bio: "Creative frontend developer. CSS art enthusiast.", email: "adit@kreasi.id", password: "password123" }
      };
      localStorage.setItem("kreasi_creators", JSON.stringify(defaultCreators));
    }

    if (!localStorage.getItem("kreasi_works")) {
      const defaultWorks = [
        {
          id: "work-1",
          type: "art",
          title: "Hyper-Street Tokyo 2077",
          authorId: MOCK_UUIDS.neon_glitch,
          mediaUrl: "assets/cyberpunk_art.png",
          description: "Refleksi masa depan kota Tokyo yang dipenuhi lampu neon, reklame hologram, dan gang sempit. Menggunakan 3D render blender dikombinasikan dengan sentuhan finishing kuas digital Photoshop.",
          tags: ["cyberpunk", "3d", "neon", "tokyo"],
          likes: 142,
          likedBy: [],
          comments: [
            { author: "@skater_vibe", avatar: "Felix", text: "Gila keren parah pencahayaannya! Detail neonnya dapet banget.", time: "2 jam lalu" },
            { author: "@html_wizard", avatar: "Chloe", text: "Ini render 3D-nya berapa lama bro? Rapi bgt!", time: "1 jam lalu" }
          ],
          layoutClass: "tall"
        },
        {
          id: "work-2",
          type: "beats",
          title: "Jam 2 Pagi di Kamar Lofi",
          authorId: MOCK_UUIDS.lofi_chords,
          mediaUrl: "",
          description: "Ketukan musik lofi santai dengan balutan melodi piano klasik yang menenangkan. Dibuat khusus untuk menemani belajar atau sekadar bersantai di kala malam sunyi. Menggunakan Ableton Live.",
          tags: ["lofi", "beats", "chill", "music"],
          likes: 98,
          likedBy: [],
          comments: [
            { author: "@midnight_poet", avatar: "Jack", text: "Dengerin ini sambil nulis puisi langsung dapet banyak bait. Makasih beat-nya!", time: "5 jam lalu" }
          ],
          layoutClass: "regular"
        },
        {
          id: "work-3",
          type: "writing",
          title: "Kepingan Kota Kelabu",
          authorId: MOCK_UUIDS.midnight_poet,
          mediaUrl: "",
          description: "Sebuah sajak singkat tentang rasa kesepian dan pencarian makna diri di tengah hiruk-pikuk gemerlap lampu kota besar metropolitan.",
          tags: ["sajak", "poetry", "writing", "indie"],
          likes: 67,
          likedBy: [],
          content: "Di bawah neon yang berkedip pelan,\nkota ini menampung jutaan angan.\nNamun di sudut warung kopi yang sepi,\naku mendengarkan sunyi yang menari.\n\nApakah kita hanya figuran?\nAtau hanya warna yang pudar perlahan?",
          comments: [
            { author: "@neon_glitch", avatar: "Milo", text: "Kerasa banget vibe melankolisnya. Bikin termenung.", time: "1 hari lalu" }
          ],
          layoutClass: "wide"
        },
        {
          id: "work-4",
          type: "code",
          title: "Matrix Rain Canvas Generator",
          authorId: MOCK_UUIDS.html_wizard,
          mediaUrl: "",
          description: "CSS & JS generator super ringan untuk menampilkan efek hujan teks Matrix legendaris di canvas HTML5. Sangat responsif dan gampang ditaruh di portofoliomu.",
          tags: ["code", "js", "canvas", "matrix"],
          likes: 85,
          likedBy: [],
          content: "// Canvas Setup & Render Loop\nconst initMatrix = (canvasId) => {\n  const canvas = document.getElementById(canvasId);\n  const ctx = canvas.getContext('2d');\n  \n  canvas.width = window.innerWidth;\n  canvas.height = window.innerHeight;\n  \n  const chars = \"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ\";\n  const fontSize = 16;\n  const columns = canvas.width / fontSize;\n  \n  const drops = Array(Math.floor(columns)).fill(1);\n  \n  const draw = () => {\n    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';\n    ctx.fillRect(0, 0, canvas.width, canvas.height);\n    \n    ctx.fillStyle = '#0f8'; // Neon green\n    ctx.font = fontSize + 'px monospace';\n    \n    drops.forEach((y, x) => {\n      const text = chars[Math.floor(Math.random() * chars.length)];\n      ctx.fillText(text, x * fontSize, y * fontSize);\n      \n      if (y * fontSize > canvas.height && Math.random() > 0.975) {\n        drops[x] = 0;\n      }\n      drops[x]++;\n    });\n  };\n  setInterval(draw, 33);\n};",
          comments: [
            { author: "@skater_vibe", avatar: "Felix", text: "Bakal gw pake di layout profil gw nih! Thx sharingnya.", time: "3 hari lalu" }
          ],
          layoutClass: "regular"
        },
        {
          id: "work-5",
          type: "art",
          title: "Y2K Chrome Bubblegum",
          authorId: MOCK_UUIDS.neon_glitch,
          mediaUrl: "assets/y2k_aesthetic.png",
          description: "Eksperimen tekstur logam cair gelembung khas era akhir 90an. Ingin menghidupkan kembali nostalgia masa kecil.",
          tags: ["y2k", "3d", "render", "retro"],
          likes: 120,
          likedBy: [],
          comments: [
            { author: "@lofi_chords", avatar: "Bella", text: "Sumpah tekstur glossynya mantep banget kayak permen beneran.", time: "2 hari lalu" }
          ],
          layoutClass: "regular"
        },
        {
          id: "work-6",
          type: "art",
          title: "Neubrutalist Web Mockup",
          authorId: MOCK_UUIDS.html_wizard,
          mediaUrl: "assets/neubrutalist_art.png",
          description: "Layout mockup poster digital dengan konsep Neubrutalisme. Penuh garis tebal dan tabrakan warna cerah.",
          tags: ["brutalism", "poster", "design", "graphic"],
          likes: 104,
          likedBy: [],
          comments: [
            { author: "@neon_glitch", avatar: "Milo", text: "Garis hitam tebalnya juara! Sangat raw.", time: "1 hari lalu" }
          ],
          layoutClass: "tall"
        }
      ];
      localStorage.setItem("kreasi_works", JSON.stringify(defaultWorks));
    }

    if (!localStorage.getItem("kreasi_session")) {
      localStorage.setItem("kreasi_session", JSON.stringify(null));
    }
  }

  // --- ASYNC GETTERS (Hybrid Local / Supabase) ---
  
  async getCreators() {
    if (this.isSupabase) {
      if (!this.supabaseClient) return {};
      const { data: profiles, error } = await this.supabaseClient
        .from('profiles')
        .select('*');
      if (error) {
        console.error("Error fetching profiles:", error);
        return {};
      }
      const creators = {};
      profiles.forEach(p => {
        creators[p.id] = p;
      });
      return creators;
    } else {
      return JSON.parse(localStorage.getItem("kreasi_creators")) || {};
    }
  }

  saveCreatorsLocal(creators) {
    localStorage.setItem("kreasi_creators", JSON.stringify(creators));
  }

  async getWorks() {
    if (this.isSupabase) {
      if (!this.supabaseClient) return [];
      const { data: works, error } = await this.supabaseClient
        .from('works')
        .select('*, comments(*)');
      if (error) {
        console.error("Error fetching works:", error);
        return [];
      }
      // Sort works by created_at descending (latest first)
      works.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return works;
    } else {
      return JSON.parse(localStorage.getItem("kreasi_works")) || [];
    }
  }

  getWorksLocal() {
    return JSON.parse(localStorage.getItem("kreasi_works")) || [];
  }

  saveWorksLocal(works) {
    localStorage.setItem("kreasi_works", JSON.stringify(works));
  }

  // --- AUTHENTICATION METHODS ---
  
  async getCurrentUser() {
    if (this.isSupabase) {
      if (!this.supabaseClient) return null;
      const { data: { user } } = await this.supabaseClient.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await this.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile || { id: user.id, email: user.email };
    } else {
      return JSON.parse(localStorage.getItem("kreasi_session"));
    }
  }

  async signUp(email, password, username, displayName, avatar, bio) {
    if (!username.startsWith("@")) {
      username = "@" + username;
    }

    if (this.isSupabase) {
      const { data, error } = await this.supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      
      const { error: profileError } = await this.supabaseClient
        .from('profiles')
        .insert([{
          id: data.user.id,
          username,
          displayName,
          avatar,
          bio,
          email
        }]);
      if (profileError) throw profileError;
      return { id: data.user.id, username, displayName, avatar, bio, email };
    } else {
      const creators = this.getCreators();
      
      const emailExists = Object.values(creators).some(c => c.email.toLowerCase() === email.toLowerCase());
      const usernameExists = Object.values(creators).some(c => c.username.toLowerCase() === username.toLowerCase());
      
      if (emailExists) throw new Error("Email sudah terdaftar!");
      if (usernameExists) throw new Error("Username sudah digunakan!");

      const userId = "user-" + Date.now();
      const newCreator = {
        id: userId,
        username,
        displayName,
        avatar,
        bio,
        email,
        password,
        joinedDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      creators[userId] = newCreator;
      this.saveCreatorsLocal(creators);

      localStorage.setItem("kreasi_session", JSON.stringify(newCreator));
      return newCreator;
    }
  }

  async signIn(email, password) {
    if (this.isSupabase) {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const { data: profile } = await this.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      return profile || { id: data.user.id, email: data.user.email };
    } else {
      const creators = this.getCreators();
      const user = Object.values(creators).find(
        c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );

      if (!user) throw new Error("Email atau password salah!");

      localStorage.setItem("kreasi_session", JSON.stringify(user));
      return user;
    }
  }

  async signOut() {
    if (this.isSupabase) {
      const { error } = await this.supabaseClient.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.setItem("kreasi_session", JSON.stringify(null));
    }
  }

  async updateProfile(displayName, username, avatar, bio) {
    if (!username.startsWith("@")) {
      username = "@" + username;
    }

    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error("Anda harus masuk terlebih dahulu!");

    if (this.isSupabase) {
      const { error } = await this.supabaseClient
        .from('profiles')
        .update({ displayName, username, avatar, bio })
        .eq('id', currentUser.id);
      if (error) throw error;
      return { ...currentUser, displayName, username, avatar, bio };
    } else {
      const creators = this.getCreators();
      const updatedUser = {
        ...currentUser,
        displayName,
        username,
        avatar,
        bio
      };

      creators[currentUser.id] = updatedUser;
      this.saveCreatorsLocal(creators);
      localStorage.setItem("kreasi_session", JSON.stringify(updatedUser));

      const works = this.getWorksLocal();
      let worksChanged = false;
      works.forEach(w => {
        if (w.authorId === currentUser.id) {
          w.comments.forEach(c => {
            if (c.author === currentUser.username) {
              c.author = username;
              c.avatar = avatar;
            }
          });
          worksChanged = true;
        }
      });
      if (worksChanged) this.saveWorksLocal(works);

      return updatedUser;
    }
  }

  // --- SAVE WORK ---
  async saveWork(work) {
    if (this.isSupabase) {
      const { error } = await this.supabaseClient
        .from('works')
        .insert([{
          id: work.id,
          type: work.type,
          title: work.title,
          authorId: work.authorId,
          mediaUrl: work.mediaUrl,
          content: work.content,
          description: work.description,
          tags: work.tags,
          likes: work.likes,
          likedBy: work.likedBy,
          layoutClass: work.layoutClass
        }]);
      if (error) throw error;
    } else {
      const works = this.getWorksLocal();
      works.unshift(work);
      this.saveWorksLocal(works);
    }
  }

  // --- ADD COMMENT ---
  async addComment(workId, comment) {
    if (this.isSupabase) {
      const { error } = await this.supabaseClient
        .from('comments')
        .insert([{
          workId: workId,
          author: comment.author,
          avatar: comment.avatar,
          text: comment.text
        }]);
      if (error) throw error;
    } else {
      const works = this.getWorksLocal();
      const work = works.find(w => w.id === workId);
      if (work) {
        work.comments.push(comment);
        this.saveWorksLocal(works);
      }
    }
  }

  // --- TOGGLE LIKE ---
  async toggleLike(workId, username) {
    if (this.isSupabase) {
      const { data: work, error } = await this.supabaseClient
        .from('works')
        .select('likes, likedBy')
        .eq('id', workId)
        .single();
      if (error) throw error;

      let likes = work.likes || 0;
      let likedBy = work.likedBy || [];

      if (likedBy.includes(username)) {
        likes = Math.max(0, likes - 1);
        likedBy = likedBy.filter(u => u !== username);
      } else {
        likes++;
        likedBy.push(username);
      }

      const { error: updateError } = await this.supabaseClient
        .from('works')
        .update({ likes, likedBy })
        .eq('id', workId);
      if (updateError) throw updateError;
    } else {
      const works = this.getWorksLocal();
      const work = works.find(w => w.id === workId);
      if (work) {
        if (work.likedBy.includes(username)) {
          work.likes--;
          work.likedBy = work.likedBy.filter(u => u !== username);
        } else {
          work.likes++;
          work.likedBy.push(username);
        }
        this.saveWorksLocal(works);
      }
    }
  }

  // --- ACCOUNT HISTORY & RETRIEVAL ---
  async getAccountHistory(userId) {
    if (this.isSupabase) {
      const { data: works } = await this.supabaseClient
        .from('works')
        .select('*')
        .eq('authorId', userId);
        
      const { data: comments } = await this.supabaseClient
        .from('comments')
        .select('*, works(title, id)')
        .eq('author', (await this.getCurrentUser()).username);

      const parsedComments = (comments || []).map(c => ({
        workId: c.workId,
        workTitle: c.works ? c.works.title : "Karya",
        text: c.text,
        time: c.created_at ? new Date(c.created_at).toLocaleDateString() : "Baru saja"
      }));

      return {
        works: works || [],
        comments: parsedComments
      };
    } else {
      const creators = this.getCreators();
      const user = creators[userId];
      if (!user) return { works: [], comments: [] };

      const allWorks = this.getWorksLocal();
      const userWorks = allWorks.filter(w => w.authorId === userId);

      const userComments = [];
      allWorks.forEach(work => {
        work.comments.forEach(comment => {
          if (comment.author === user.username) {
            userComments.push({
              workId: work.id,
              workTitle: work.title,
              text: comment.text,
              time: comment.time || "Baru saja"
            });
          }
        });
      });

      return {
        works: userWorks,
        comments: userComments
      };
    }
  }
}

// Global Export
window.KreasiDB = new KreasiDatabase();
