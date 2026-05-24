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
    // Load Supabase SDK dynamically if not loaded
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
    // Seed default creators if empty
    if (!localStorage.getItem("kreasi_creators")) {
      const defaultCreators = {
        neon_glitch: { id: "neon_glitch", username: "@neon_glitch", displayName: "Zaki", avatar: "Milo", bio: "3D Digital Artist based in Bandung. Cyberpunk lover.", email: "zaki@kreasi.id", password: "password123" },
        lofi_chords: { id: "lofi_chords", username: "@lofi_chords", displayName: "Dina", avatar: "Bella", bio: "Sound designer & bedroom producer. Lofi beats specialist.", email: "dina@kreasi.id", password: "password123" },
        midnight_poet: { id: "midnight_poet", username: "@midnight_poet", displayName: "Fajar", avatar: "Jack", bio: "Menulis sajak kala malam tiba.", email: "fajar@kreasi.id", password: "password123" },
        html_wizard: { id: "html_wizard", username: "@html_wizard", displayName: "Adit", avatar: "Chloe", bio: "Creative frontend developer. CSS art enthusiast.", email: "adit@kreasi.id", password: "password123" }
      };
      localStorage.setItem("kreasi_creators", JSON.stringify(defaultCreators));
    }

    // Seed default works if empty
    if (!localStorage.getItem("kreasi_works")) {
      const defaultWorks = [
        {
          id: "work-1",
          type: "art",
          title: "Hyper-Street Tokyo 2077",
          authorId: "neon_glitch",
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
          authorId: "lofi_chords",
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
          authorId: "midnight_poet",
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
          authorId: "html_wizard",
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
          authorId: "neon_glitch",
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
          authorId: "html_wizard",
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

    // Seed default session as guest initially if empty
    if (!localStorage.getItem("kreasi_session")) {
      localStorage.setItem("kreasi_session", JSON.stringify(null));
    }
  }

  // --- GETTERS & SETTERS (Local Mode) ---
  getCreators() {
    return JSON.parse(localStorage.getItem("kreasi_creators")) || {};
  }

  saveCreators(creators) {
    localStorage.setItem("kreasi_creators", JSON.stringify(creators));
  }

  getWorks() {
    return JSON.parse(localStorage.getItem("kreasi_works")) || [];
  }

  saveWorks(works) {
    localStorage.setItem("kreasi_works", JSON.stringify(works));
  }

  // --- AUTHENTICATION METHODS ---
  
  // Get active session user
  async getCurrentUser() {
    if (this.isSupabase) {
      if (!this.supabaseClient) return null;
      const { data: { user } } = await this.supabaseClient.auth.getUser();
      if (!user) return null;
      // Get profile details from custom profile table
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

  // Sign Up / Register
  async signUp(email, password, username, displayName, avatar, bio) {
    if (!username.startsWith("@")) {
      username = "@" + username;
    }

    if (this.isSupabase) {
      // Supabase Signup
      const { data, error } = await this.supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      
      // Save profile to profiles table
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
      // Local Storage Signup
      const creators = this.getCreators();
      
      // Validation checks
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
        password, // stored in plain-text for mock simulation only
        joinedDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      creators[userId] = newCreator;
      this.saveCreators(creators);

      // Auto login after signup
      localStorage.setItem("kreasi_session", JSON.stringify(newCreator));
      return newCreator;
    }
  }

  // Sign In / Login
  async signIn(email, password) {
    if (this.isSupabase) {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Get profile
      const { data: profile } = await this.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      return profile || { id: data.user.id, email: data.user.email };
    } else {
      // Local Storage Login
      const creators = this.getCreators();
      const user = Object.values(creators).find(
        c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );

      if (!user) throw new Error("Email atau password salah!");

      localStorage.setItem("kreasi_session", JSON.stringify(user));
      return user;
    }
  }

  // Sign Out / Logout
  async signOut() {
    if (this.isSupabase) {
      const { error } = await this.supabaseClient.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.setItem("kreasi_session", JSON.stringify(null));
    }
  }

  // Edit / Update Profile
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
      this.saveCreators(creators);
      localStorage.setItem("kreasi_session", JSON.stringify(updatedUser));

      // Also update any works authored by this user to reflect username changes
      const works = this.getWorks();
      let worksChanged = false;
      works.forEach(w => {
        if (w.authorId === currentUser.id) {
          // comments or nested data that holds username
          w.comments.forEach(c => {
            if (c.author === currentUser.username) {
              c.author = username;
              c.avatar = avatar;
            }
          });
          worksChanged = true;
        }
      });
      if (worksChanged) this.saveWorks(works);

      return updatedUser;
    }
  }

  // --- ACCOUNT HISTORY & RETRIEVAL ---
  async getAccountHistory(userId) {
    if (this.isSupabase) {
      // Supabase history fetching
      const { data: works } = await this.supabaseClient
        .from('works')
        .select('*')
        .eq('authorId', userId)
        .order('created_at', { ascending: false });
        
      // Mock or fetch comments
      const { data: comments } = await this.supabaseClient
        .from('comments')
        .select('*, works(title, id)')
        .eq('authorId', userId);

      return {
        works: works || [],
        comments: comments || []
      };
    } else {
      // Local Storage history fetching
      const creators = this.getCreators();
      const user = creators[userId];
      if (!user) return { works: [], comments: [] };

      const allWorks = this.getWorks();
      
      // User's works
      const userWorks = allWorks.filter(w => w.authorId === userId);

      // User's comments log
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
