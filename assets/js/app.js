const STORAGE_KEYS = {
  localUsers: "unicidfit_users",
  localSession: "unicidfit_session",
  quizDraft: "bossfit_ai_quiz_draft",
  quizCompleted: "bossfit_ai_quiz_completed",
  generatedWorkout: "bossfit_ai_generated_workout",
  weeklyPlan: "bossfit_ai_weekly_plan"
};

const SUPABASE_CONFIG = {
  url: window.SUPABASE_URL || "https://YOUR_PROJECT.supabase.co",
  anonKey: window.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
};

const QUIZ_STEP_KEYS = ["objetivo", "nivel", "frequencia", "focoMuscular", "peso", "altura"];

const header = document.getElementById("header");
const navLinks = document.getElementById("navLinks");
const menuToggle = document.getElementById("menuToggle");
const navAnchors = document.querySelectorAll(".nav-links a, .brand, .footer-links a, a[href^='#']");
const sections = document.querySelectorAll("main section[id]");
const reveals = document.querySelectorAll(".reveal");
const currentYear = document.getElementById("currentYear");
const toast = document.getElementById("toast");

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const userPill = document.getElementById("userPill");
const userNameLabel = document.getElementById("userNameLabel");
const userAvatar = document.getElementById("userAvatar");
const heroAvatar = document.getElementById("heroAvatar");
const heroGreeting = document.getElementById("heroGreeting");
const heroProfileName = document.getElementById("heroProfileName");
const heroStatusChip = document.getElementById("heroStatusChip");
const heroPrimaryButton = document.getElementById("heroPrimaryButton");

const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const authTabs = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");
const authFeedback = document.getElementById("authFeedback");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const planButtons = document.querySelectorAll(".plan-action");

const openQuizButton = document.getElementById("openQuizButton");
const editQuizButton = document.getElementById("editQuizButton");
const quizStatus = document.getElementById("quizStatus");
const quizModal = document.getElementById("quizModal");
const closeQuizModal = document.getElementById("closeQuizModal");
const workoutQuizForm = document.getElementById("workoutQuizForm");
const quizSteps = Array.from(document.querySelectorAll(".quiz-step"));
const quizBackButton = document.getElementById("quizBackButton");
const quizNextButton = document.getElementById("quizNextButton");
const quizProgressLabel = document.getElementById("quizProgressLabel");
const quizProgressPercent = document.getElementById("quizProgressPercent");
const quizProgressBar = document.getElementById("quizProgressBar");
const optionButtons = document.querySelectorAll(".step-option");
const pesoInput = document.getElementById("pesoInput");
const alturaInput = document.getElementById("alturaInput");

const quizCompletionState = document.getElementById("quizCompletionState");
const quizCompletionHint = document.getElementById("quizCompletionHint");
const supabaseConnectionState = document.getElementById("supabaseConnectionState");
const supabaseConnectionHint = document.getElementById("supabaseConnectionHint");
const quizSummaryList = document.getElementById("quizSummaryList");

const workoutResultTitle = document.getElementById("workoutResultTitle");
const workoutSummary = document.getElementById("workoutSummary");
const workoutDays = document.getElementById("workoutDays");
const weeklyPlanGrid = document.getElementById("weeklyPlanGrid");
const promptPreview = document.getElementById("promptPreview");
const quizObjectPreview = document.getElementById("quizObjectPreview");
const resultChip = document.getElementById("resultChip");

let toastTimer = null;
let supabaseClient = null;
let currentUser = loadJson(STORAGE_KEYS.localSession, null);
let activeQuizStep = 0;
let pendingQuizCompletionAfterAuth = false;
let generatedWorkout = loadJson(STORAGE_KEYS.generatedWorkout, null);
let weeklyPlan = loadJson(STORAGE_KEYS.weeklyPlan, null);

const quizData = {
  objetivo: "",
  nivel: "",
  frequencia: "",
  focoMuscular: "",
  peso: "",
  altura: "",
  ...loadJson(STORAGE_KEYS.quizDraft, {})
};

currentYear.textContent = new Date().getFullYear();

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeStoredValue(key) {
  localStorage.removeItem(key);
}

function isSupabaseConfigured() {
  return (
    typeof window.supabase !== "undefined" &&
    SUPABASE_CONFIG.url.startsWith("https://") &&
    !SUPABASE_CONFIG.url.includes("YOUR_PROJECT") &&
    SUPABASE_CONFIG.anonKey &&
    !SUPABASE_CONFIG.anonKey.includes("YOUR_SUPABASE_ANON_KEY")
  );
}

function initializeSupabaseClient() {
  if (!isSupabaseConfigured()) return null;

  return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

function getLocalUsers() {
  return loadJson(STORAGE_KEYS.localUsers, []);
}

function saveLocalUsers(users) {
  saveJson(STORAGE_KEYS.localUsers, users);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "UF";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearElementErrors(ids) {
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = "";
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 3200);
}

function showAuthFeedback(message, type) {
  authFeedback.textContent = message;
  authFeedback.className = "auth-feedback " + type;
}

function showContactFeedback(message, type) {
  formStatus.textContent = message;
  formStatus.className = "form-status " + type;
}

function showQuizFeedback(message, type) {
  quizStatus.textContent = message;
  quizStatus.className = "form-status " + type;
}

function clearAuthFeedback() {
  authFeedback.textContent = "";
  authFeedback.className = "auth-feedback";
}

function clearAuthFormErrors() {
  clearElementErrors([
    "loginEmailError",
    "loginPasswordError",
    "registerNameError",
    "registerEmailError",
    "registerPasswordError"
  ]);
}

function clearContactErrors() {
  clearElementErrors(["nameError", "emailError", "messageError"]);
}

function clearQuizStepErrors() {
  clearElementErrors([
    "objetivoError",
    "nivelError",
    "frequenciaError",
    "focoMuscularError",
    "pesoError",
    "alturaError"
  ]);
}

function formatLabel(value) {
  const labels = {
    hipertrofia: "Hipertrofia",
    emagrecimento: "Emagrecimento",
    resistencia: "Resistencia",
    iniciante: "Iniciante",
    intermediario: "Intermediario",
    avancado: "Avancado",
    "2x": "2x por semana",
    "3x": "3x por semana",
    "4x+": "4x ou mais",
    peito: "Peito",
    costas: "Costas",
    pernas: "Pernas",
    ombro: "Ombro",
    fullbody: "Fullbody"
  };

  return labels[value] || value || "--";
}

function buildQuizDataObject() {
  return {
    objetivo: quizData.objetivo,
    nivel: quizData.nivel,
    frequencia: quizData.frequencia,
    focoMuscular: quizData.focoMuscular,
    peso: Number(quizData.peso),
    altura: Number(quizData.altura)
  };
}

function buildPrompt(data) {
  return [
    "Crie um plano de treino personalizado para o aplicativo BOSSFIT AI com base nos seguintes dados:",
    "",
    "Objetivo: " + formatLabel(data.objetivo),
    "Nivel: " + formatLabel(data.nivel),
    "Frequencia semanal: " + formatLabel(data.frequencia),
    "Foco muscular: " + formatLabel(data.focoMuscular),
    "Peso atual: " + data.peso + " kg",
    "Altura: " + data.altura + " cm",
    "",
    "O resultado deve conter:",
    "- divisao semanal",
    "- exercicios por dia",
    "- series e repeticoes",
    "- nivel de intensidade",
    "- recomendacoes iniciais do coach",
    "- orientacoes de progressao",
    "",
    "Seja claro, organizado, adequado ao nivel do usuario e pronto para exibicao em interface web."
  ].join("\n");
}

function generateWorkout(data) {
  const templates = {
    hipertrofia: {
      peito: ["Supino reto", "Crucifixo inclinado", "Paralelas assistidas", "Triceps corda"],
      costas: ["Puxada frontal", "Remada baixa", "Remada curvada", "Face pull"],
      pernas: ["Agachamento livre", "Leg press", "Cadeira extensora", "Mesa flexora"],
      ombro: ["Desenvolvimento halteres", "Elevacao lateral", "Remada alta", "Crucifixo invertido"],
      fullbody: ["Agachamento goblet", "Supino halteres", "Puxada alta", "Levantamento romeno"]
    },
    emagrecimento: {
      peito: ["Supino com ritmo continuo", "Flexao inclinada", "Battle rope", "Cordas navais"],
      costas: ["Remada baixa", "Pulldown", "Bike sprint", "Corrida intervalada"],
      pernas: ["Agachamento com salto", "Avanco alternado", "Bike intensa", "Stiff leve"],
      ombro: ["Desenvolvimento leve", "Elevacao lateral", "Burpee adaptado", "Corrida parada"],
      fullbody: ["Circuito funcional", "Burpee adaptado", "Kettlebell swing", "Mountain climber"]
    },
    resistencia: {
      peito: ["Supino leve", "Flexao controlada", "Prancha", "Ergometro"],
      costas: ["Puxada alta", "Remada baixa", "Prancha lateral", "Bike moderada"],
      pernas: ["Agachamento continuo", "Step-up", "Leg press leve", "Eliptico"],
      ombro: ["Desenvolvimento leve", "Elevacao frontal", "Cordas leves", "Prancha alta"],
      fullbody: ["Circuito metabolico", "Agachamento", "Flexao inclinada", "Remada funcional"]
    }
  };

  const frequencyMap = {
    "2x": ["Dia 1", "Dia 2"],
    "3x": ["Dia 1", "Dia 2", "Dia 3"],
    "4x+": ["Dia 1", "Dia 2", "Dia 3", "Dia 4"]
  };

  const levelMap = {
    iniciante: "Baixa a moderada",
    intermediario: "Moderada",
    avancado: "Moderada a alta"
  };

  const exercises = templates[data.objetivo][data.focoMuscular];
  const days = frequencyMap[data.frequencia];
  const intensity = levelMap[data.nivel];
  const repRange = data.objetivo === "hipertrofia" ? "3 a 4 series de 8 a 12 reps" : data.objetivo === "emagrecimento" ? "3 a 4 series de 12 a 15 reps" : "3 series de 15 a 20 reps";

  return {
    title: "Treino Personalizado BOSSFIT AI",
    summary: "Plano orientado para " + formatLabel(data.objetivo) + ", nivel " + formatLabel(data.nivel) + " e frequencia " + formatLabel(data.frequencia) + ".",
    intensity,
    coachNote: "Priorize tecnica, registre sensacoes e ajuste a carga gradualmente para manter consistencia.",
    days: days.map((day, index) => ({
      day,
      emphasis: index === 0 ? "sessao principal" : index === days.length - 1 ? "consolidacao e controle" : "progresso continuo",
      exercises: exercises.map((exercise, exerciseIndex) => ({
        name: exercise,
        prescription: repRange,
        note: ["tecnica limpa", "cadencia controlada", "amplitude completa", "descanso inteligente"][(index + exerciseIndex) % 4]
      }))
    }))
  };
}

function generateWeeklyPlan(data) {
  const planByFrequency = {
    "2x": [
      { day: "Segunda", focus: "Treino principal", note: "Sessao com maior energia e foco na tecnica." },
      { day: "Quinta", focus: "Treino complementar", note: "Reforco de volume e estabilidade." }
    ],
    "3x": [
      { day: "Segunda", focus: "Forca base", note: "Entrada forte da semana com foco em execucao." },
      { day: "Quarta", focus: "Volume e constancia", note: "Repeticao com controle para consolidar progresso." },
      { day: "Sexta", focus: "Ajuste final", note: "Fechamento da semana com intensidade sustentavel." }
    ],
    "4x+": [
      { day: "Segunda", focus: "Bloco 1", note: "Inicio com intensidade progressiva." },
      { day: "Terca", focus: "Bloco 2", note: "Continuidade com volume inteligente." },
      { day: "Quinta", focus: "Bloco 3", note: "Prioridade no foco muscular escolhido." },
      { day: "Sabado", focus: "Bloco 4", note: "Finalizacao com estabilidade e condicionamento." }
    ]
  };

  return {
    title: "Plano Semanal Personalizado",
    nutrition: "Use seus dados corporais como base para futuras sugestoes de alimentacao e ajustes de consumo.",
    recommendation: "Peso e altura ajudam a calibrar o acompanhamento de evolucao, consistencia e proximos refinamentos.",
    schedule: planByFrequency[data.frequencia]
  };
}

function saveQuizDraft() {
  saveJson(STORAGE_KEYS.quizDraft, quizData);
}

function markQuizCompleted() {
  saveJson(STORAGE_KEYS.quizCompleted, true);
}

function isQuizCompleted() {
  return Boolean(loadJson(STORAGE_KEYS.quizCompleted, false));
}

function openAuthModal(tab = "login") {
  authModal.classList.remove("hidden");
  authModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  switchAuthTab(tab);
}

function closeAuthModalUI() {
  authModal.classList.add("hidden");
  authModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  clearAuthFeedback();
  clearAuthFormErrors();
}

function openQuizModal(step = 0) {
  quizModal.classList.remove("hidden");
  quizModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  activeQuizStep = Math.max(0, Math.min(step, QUIZ_STEP_KEYS.length - 1));
  renderQuizStep();
}

function closeQuizModalUI() {
  quizModal.classList.add("hidden");
  quizModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  clearQuizStepErrors();
}

function switchAuthTab(tab) {
  authTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.authTab === tab);
  });

  authForms.forEach((form) => {
    form.classList.toggle("active", form.id === tab + "Form");
  });

  clearAuthFeedback();
  clearAuthFormErrors();
}

function toggleHeaderState() {
  header.classList.toggle("scrolled", window.scrollY > 24);
}

function closeMobileMenu() {
  navLinks.classList.remove("mobile-open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function openMobileMenu() {
  navLinks.classList.add("mobile-open");
  menuToggle.classList.add("open");
  menuToggle.setAttribute("aria-expanded", "true");
}

function setActiveLink() {
  const scrollPosition = window.scrollY + header.offsetHeight + 40;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");
    const link = document.querySelector('.nav-links a[href="#' + id + '"]');

    if (!link) return;

    if (scrollPosition >= top && scrollPosition < top + height) {
      document.querySelectorAll(".nav-links a").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    }
  });
}

function scrollToTarget(targetId) {
  const target = document.querySelector(targetId);
  if (!target) return;

  const offset = header.offsetHeight - 4;
  const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: "smooth" });
  closeMobileMenu();
}

function updateAuthUI() {
  const isLoggedIn = Boolean(currentUser);
  loginButton.classList.toggle("hidden", isLoggedIn);
  logoutButton.classList.toggle("hidden", !isLoggedIn);
  userPill.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    const initials = getInitials(currentUser.name);
    userNameLabel.textContent = currentUser.name;
    userAvatar.textContent = initials;
    heroAvatar.textContent = initials;
    heroGreeting.textContent = "Ola, " + currentUser.name.split(" ")[0];
    heroProfileName.textContent = "Conta conectada na UnicidFit";
    heroStatusChip.textContent = "Conta ativa";
    heroPrimaryButton.textContent = "Abrir quiz BOSSFIT AI";
    document.getElementById("name").value = currentUser.name;
    document.getElementById("email").value = currentUser.email;
  } else {
    userNameLabel.textContent = "Visitante";
    userAvatar.textContent = "UF";
    heroAvatar.textContent = "UF";
    heroGreeting.textContent = "Dashboard ativo";
    heroProfileName.textContent = "UnicidFit Performance";
    heroStatusChip.textContent = "Nivel de foco: alto";
    heroPrimaryButton.textContent = "Criar minha conta";
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
  }
}

function updateSupabaseStatusUI() {
  if (!isSupabaseConfigured()) {
    supabaseConnectionState.textContent = "Pronta para uso";
    supabaseConnectionHint.textContent = "Seu perfil pode ser ajustado e atualizado sempre que voce quiser.";
    return;
  }

  if (currentUser && currentUser.provider === "supabase") {
    supabaseConnectionState.textContent = "Perfil conectado";
    supabaseConnectionHint.textContent = "Sua experiencia personalizada esta pronta para acompanhar a sua evolucao.";
    return;
  }

  supabaseConnectionState.textContent = "Perfil disponivel";
  supabaseConnectionHint.textContent = "Entre na sua conta para continuar de onde parou com mais fluidez.";
}

function updateQuizSummaryUI() {
  const summaryValues = [
    formatLabel(quizData.objetivo),
    formatLabel(quizData.nivel),
    formatLabel(quizData.frequencia),
    formatLabel(quizData.focoMuscular),
    quizData.peso ? quizData.peso + " kg" : "--",
    quizData.altura ? quizData.altura + " cm" : "--"
  ];

  quizSummaryList.querySelectorAll(".summary-item strong").forEach((item, index) => {
    item.textContent = summaryValues[index];
  });

  const complete = QUIZ_STEP_KEYS.every((key) => String(quizData[key]).trim() !== "");
  quizCompletionState.textContent = isQuizCompleted() ? "Concluido" : complete ? "Pronto para finalizar" : "Nao iniciado";
  quizCompletionHint.textContent = isQuizCompleted()
    ? "Os dados podem ser editados e atualizados a qualquer momento."
    : "Tempo estimado inferior a 1 minuto.";
}

function renderStoredOutputs() {
  if (!generatedWorkout) {
    workoutResultTitle.textContent = "Aguardando conclusao do quiz";
    workoutSummary.textContent = "Assim que o quiz for finalizado, sua experiencia sera atualizada com um treino personalizado e um plano semanal alinhado ao seu objetivo.";
    workoutDays.innerHTML = [
      "<article class='result-card placeholder-card'>",
      "<h4>Nenhum resultado gerado ainda</h4>",
      "<p>Depois da finalizacao, esta area exibira dias da semana, exercicios, series, repeticoes e orientacoes principais.</p>",
      "</article>"
    ].join("");
    weeklyPlanGrid.innerHTML = [
      "<article class='result-card placeholder-card'>",
      "<h4>Plano semanal</h4>",
      "<p>O plano semanal personalizado sera exibido aqui com foco, intensidade e recomendacoes do coach.</p>",
      "</article>"
    ].join("");
    promptPreview.textContent = "Depois do quiz, esta area exibira um resumo claro do seu perfil e da direcao do treino.";
    quizObjectPreview.textContent = "As recomendacoes iniciais do coach aparecerao aqui com uma leitura objetiva e facil de entender.";
    resultChip.textContent = "Status: pronto para gerar";
    return;
  }

  workoutResultTitle.textContent = generatedWorkout.title;
  workoutSummary.textContent = generatedWorkout.summary + " Intensidade sugerida: " + generatedWorkout.intensity + ". " + generatedWorkout.coachNote;
  resultChip.textContent = "Status: personalizacao ativa";
  promptPreview.textContent = [
    "Perfil identificado:",
    "- Objetivo: " + formatLabel(quizData.objetivo),
    "- Nivel: " + formatLabel(quizData.nivel),
    "- Frequencia: " + formatLabel(quizData.frequencia),
    "- Foco muscular: " + formatLabel(quizData.focoMuscular)
  ].join("\n");

  quizObjectPreview.textContent = [
    "Direcao inicial do coach:",
    "- Intensidade sugerida: " + generatedWorkout.intensity,
    "- Ajuste corporal: " + quizData.peso + " kg e " + quizData.altura + " cm",
    "- Proxima etapa: manter constancia e acompanhar a resposta do corpo."
  ].join("\n");

  workoutDays.innerHTML = generatedWorkout.days.map((day) => {
    const exercises = day.exercises.map((exercise) => {
      return "<li><strong>" + exercise.name + "</strong> - " + exercise.prescription + " <span class='result-note'>(" + exercise.note + ")</span></li>";
    }).join("");

    return [
      "<article class='result-card'>",
      "<h4>" + day.day + "</h4>",
      "<p>Foco do dia: " + day.emphasis + ".</p>",
      "<ul>" + exercises + "</ul>",
      "</article>"
    ].join("");
  }).join("");

  if (!weeklyPlan) return;

  weeklyPlanGrid.innerHTML = weeklyPlan.schedule.map((item) => {
    return [
      "<article class='result-card'>",
      "<h4>" + item.day + "</h4>",
      "<p><strong>" + item.focus + "</strong></p>",
      "<p>" + item.note + "</p>",
      "<p class='result-note'>" + weeklyPlan.recommendation + "</p>",
      "</article>"
    ].join("");
  }).join("");
}

function updateOptionSelectionUI() {
  quizSteps.forEach((step) => {
    const key = step.dataset.key;
    step.querySelectorAll(".step-option").forEach((button) => {
      button.classList.toggle("selected", button.dataset.value === quizData[key]);
    });
  });
}

function hydrateNumericFields() {
  pesoInput.value = quizData.peso || "";
  alturaInput.value = quizData.altura || "";
}

function renderQuizStep() {
  quizSteps.forEach((step, index) => {
    step.classList.toggle("active", index === activeQuizStep);
  });

  const percent = Math.round(((activeQuizStep + 1) / quizSteps.length) * 100);
  quizProgressLabel.textContent = "Etapa " + (activeQuizStep + 1) + " de " + quizSteps.length;
  quizProgressPercent.textContent = percent + "%";
  quizProgressBar.style.width = percent + "%";
  quizBackButton.disabled = activeQuizStep === 0;
  quizNextButton.textContent = activeQuizStep === quizSteps.length - 1 ? "Finalizar quiz" : "Avancar";

  clearQuizStepErrors();
  updateOptionSelectionUI();
  hydrateNumericFields();
}

function setQuizValue(key, value) {
  quizData[key] = value;
  saveQuizDraft();
  updateQuizSummaryUI();
  updateOptionSelectionUI();
}

function validateQuizStep(stepIndex) {
  const key = QUIZ_STEP_KEYS[stepIndex];
  const value = String(quizData[key]).trim();
  const errorElement = document.getElementById(key + "Error");

  if (key === "peso") {
    const numericValue = Number(value);
    if (!value || Number.isNaN(numericValue) || numericValue < 20 || numericValue > 400) {
      errorElement.textContent = "Informe um peso valido entre 20 e 400 kg.";
      return false;
    }
    errorElement.textContent = "";
    return true;
  }

  if (key === "altura") {
    const numericValue = Number(value);
    if (!value || Number.isNaN(numericValue) || numericValue < 80 || numericValue > 250) {
      errorElement.textContent = "Informe uma altura valida entre 80 e 250 cm.";
      return false;
    }
    errorElement.textContent = "";
    return true;
  }

  if (!value) {
    errorElement.textContent = "Selecione uma resposta para continuar.";
    return false;
  }

  errorElement.textContent = "";
  return true;
}

async function getAuthenticatedSupabaseUser() {
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient.auth.getUser();
  if (error) return null;
  return data.user;
}

function mapSupabaseUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
    provider: "supabase"
  };
}

async function syncSupabaseSession() {
  if (!supabaseClient) return;

  const user = await getAuthenticatedSupabaseUser();
  if (user) {
    currentUser = mapSupabaseUser(user);
    saveJson(STORAGE_KEYS.localSession, currentUser);
  } else if (currentUser && currentUser.provider === "supabase") {
    currentUser = null;
    removeStoredValue(STORAGE_KEYS.localSession);
  }
}

async function handleSupabaseLogin(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await syncSupabaseSession();
}

async function handleSupabaseRegister(name, email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      }
    }
  });

  if (error) throw error;

  if (data.session) {
    await syncSupabaseSession();
    return "Conta criada e sessao iniciada com sucesso.";
  }

  return "Conta criada. Confira seu email para confirmar o acesso.";
}

async function handleSupabaseLogout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
  currentUser = null;
  removeStoredValue(STORAGE_KEYS.localSession);
}

async function upsertQuizToSupabase(userId, data) {
  const payload = {
    user_id: userId,
    objetivo: data.objetivo,
    nivel: data.nivel,
    frequencia: data.frequencia,
    foco_muscular: data.focoMuscular,
    peso: Number(data.peso),
    altura: Number(data.altura),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("user_quiz")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}

async function saveWorkoutToSupabase(userId, workout, promptText) {
  const payload = {
    user_id: userId,
    title: workout.title,
    summary: workout.summary,
    prompt: promptText,
    workout_data: workout,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("generated_workouts")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}

async function saveWeeklyPlanToSupabase(userId, weeklyPlanData) {
  const payload = {
    user_id: userId,
    title: weeklyPlanData.title,
    plan_data: weeklyPlanData,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("weekly_plans")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}

async function loadQuizFromSupabase(userId) {
  const { data, error } = await supabaseClient
    .from("user_quiz")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return;

  quizData.objetivo = data.objetivo || "";
  quizData.nivel = data.nivel || "";
  quizData.frequencia = data.frequencia || "";
  quizData.focoMuscular = data.foco_muscular || "";
  quizData.peso = data.peso ? String(data.peso) : "";
  quizData.altura = data.altura ? String(data.altura) : "";
  saveQuizDraft();
}

async function loadOutputsFromSupabase(userId) {
  const { data: workoutData } = await supabaseClient
    .from("generated_workouts")
    .select("workout_data")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: planData } = await supabaseClient
    .from("weekly_plans")
    .select("plan_data")
    .eq("user_id", userId)
    .maybeSingle();

  if (workoutData?.workout_data) {
    generatedWorkout = workoutData.workout_data;
    saveJson(STORAGE_KEYS.generatedWorkout, generatedWorkout);
  }

  if (planData?.plan_data) {
    weeklyPlan = planData.plan_data;
    saveJson(STORAGE_KEYS.weeklyPlan, weeklyPlan);
  }
}

async function completeQuizFlow() {
  const finalData = buildQuizDataObject();
  const promptText = buildPrompt(finalData);

  if (supabaseClient && !currentUser) {
    pendingQuizCompletionAfterAuth = true;
    closeQuizModalUI();
    openAuthModal("register");
    showAuthFeedback("Entre ou crie sua conta para continuar a personalizacao do BOSSFIT AI.", "error");
    return;
  }

  quizNextButton.disabled = true;
  quizNextButton.textContent = "Salvando...";
  resultChip.textContent = "Status: processando dados";

  generatedWorkout = generateWorkout(finalData);
  weeklyPlan = generateWeeklyPlan(finalData);

  try {
    if (supabaseClient && currentUser?.provider === "supabase") {
      await upsertQuizToSupabase(currentUser.id, finalData);
      await saveWorkoutToSupabase(currentUser.id, generatedWorkout, promptText);
      await saveWeeklyPlanToSupabase(currentUser.id, weeklyPlan);
    }

    saveQuizDraft();
    markQuizCompleted();
    saveJson(STORAGE_KEYS.generatedWorkout, generatedWorkout);
    saveJson(STORAGE_KEYS.weeklyPlan, weeklyPlan);
    renderStoredOutputs();
    updateQuizSummaryUI();
    closeQuizModalUI();
    showQuizFeedback("Quiz concluido com sucesso. O plano personalizado ja foi atualizado.", "success");
    showToast("Fluxo concluido: quiz validado, dados organizados e personalizacao gerada.");
    scrollToTarget("#resultado");
  } catch (error) {
    showQuizFeedback("Nao foi possivel concluir a atualizacao agora. Tente novamente em instantes.", "error");
    resultChip.textContent = "Status: erro ao salvar";
  } finally {
    quizNextButton.disabled = false;
    quizNextButton.textContent = "Finalizar quiz";
    pendingQuizCompletionAfterAuth = false;
  }
}

async function initializeProject() {
  supabaseClient = initializeSupabaseClient();

  if (supabaseClient) {
    await syncSupabaseSession();
    supabaseClient.auth.onAuthStateChange(async () => {
      await syncSupabaseSession();
      updateAuthUI();
      updateSupabaseStatusUI();

      if (currentUser?.provider === "supabase") {
        await loadQuizFromSupabase(currentUser.id);
        await loadOutputsFromSupabase(currentUser.id);
        updateQuizSummaryUI();
        renderStoredOutputs();

        if (pendingQuizCompletionAfterAuth) {
          closeAuthModalUI();
          await completeQuizFlow();
        }
      }
    });

    if (currentUser?.provider === "supabase") {
      await loadQuizFromSupabase(currentUser.id);
      await loadOutputsFromSupabase(currentUser.id);
    }
  }

  updateAuthUI();
  updateSupabaseStatusUI();
  updateQuizSummaryUI();
  renderStoredOutputs();
  renderQuizStep();
}

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.contains("mobile-open");
  if (isOpen) closeMobileMenu();
  else openMobileMenu();
});

navAnchors.forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;
    event.preventDefault();
    scrollToTarget(targetId);
  });
});

document.addEventListener("click", (event) => {
  const clickedInsideNav = event.target.closest(".nav");
  if (!clickedInsideNav && navLinks.classList.contains("mobile-open")) {
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 920) closeMobileMenu();
});

window.addEventListener("scroll", () => {
  toggleHeaderState();
  setActiveLink();
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

reveals.forEach((item) => revealObserver.observe(item));

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchAuthTab(tab.dataset.authTab));
});

loginButton.addEventListener("click", () => openAuthModal("login"));
heroPrimaryButton.addEventListener("click", () => {
  if (currentUser) {
    scrollToTarget("#quiz");
    return;
  }
  openAuthModal("register");
});

logoutButton.addEventListener("click", async () => {
  try {
    if (supabaseClient && currentUser?.provider === "supabase") {
      await handleSupabaseLogout();
    } else {
      currentUser = null;
      removeStoredValue(STORAGE_KEYS.localSession);
    }

    updateAuthUI();
    updateSupabaseStatusUI();
    showToast("Sessao encerrada com sucesso.");
  } catch (error) {
    showToast("Nao foi possivel encerrar a sessao agora.");
  }
});

closeAuthModal.addEventListener("click", closeAuthModalUI);
closeQuizModal.addEventListener("click", closeQuizModalUI);

authModal.addEventListener("click", (event) => {
  if (event.target === authModal) closeAuthModalUI();
});

quizModal.addEventListener("click", (event) => {
  if (event.target === quizModal) closeQuizModalUI();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!authModal.classList.contains("hidden")) closeAuthModalUI();
    if (!quizModal.classList.contains("hidden")) closeQuizModalUI();
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAuthFormErrors();
  clearAuthFeedback();

  const email = normalizeEmail(document.getElementById("loginEmail").value);
  const password = document.getElementById("loginPassword").value.trim();
  let hasError = false;

  if (!validateEmail(email)) {
    document.getElementById("loginEmailError").textContent = "Informe um email valido.";
    hasError = true;
  }

  if (password.length < 6) {
    document.getElementById("loginPasswordError").textContent = "A senha deve ter pelo menos 6 caracteres.";
    hasError = true;
  }

  if (hasError) {
    showAuthFeedback("Revise os dados de acesso antes de continuar.", "error");
    return;
  }

  try {
    if (supabaseClient) {
      await handleSupabaseLogin(email, password);
    } else {
      const user = getLocalUsers().find((item) => item.email === email && item.password === password);
      if (!user) throw new Error("Email ou senha incorretos.");
      currentUser = { id: user.id, name: user.name, email: user.email, provider: "local" };
      saveJson(STORAGE_KEYS.localSession, currentUser);
    }

    updateAuthUI();
    updateSupabaseStatusUI();
    closeAuthModalUI();
    showToast("Login realizado com sucesso.");
    loginForm.reset();
  } catch (error) {
    showAuthFeedback(error.message || "Nao foi possivel realizar login.", "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAuthFormErrors();
  clearAuthFeedback();

  const name = document.getElementById("registerName").value.trim();
  const email = normalizeEmail(document.getElementById("registerEmail").value);
  const password = document.getElementById("registerPassword").value.trim();
  let hasError = false;

  if (name.length < 3) {
    document.getElementById("registerNameError").textContent = "Digite um nome com pelo menos 3 caracteres.";
    hasError = true;
  }

  if (!validateEmail(email)) {
    document.getElementById("registerEmailError").textContent = "Informe um email valido.";
    hasError = true;
  }

  if (password.length < 6) {
    document.getElementById("registerPasswordError").textContent = "Use uma senha com no minimo 6 caracteres.";
    hasError = true;
  }

  if (hasError) {
    showAuthFeedback("Corrija os campos destacados para criar a conta.", "error");
    return;
  }

  try {
    if (supabaseClient) {
      const message = await handleSupabaseRegister(name, email, password);
      showToast(message);
    } else {
      const users = getLocalUsers();
      if (users.some((item) => item.email === email)) {
        throw new Error("Este email ja esta cadastrado.");
      }

      const newUser = {
        id: "local-" + Date.now(),
        name,
        email,
        password
      };

      users.push(newUser);
      saveLocalUsers(users);
      currentUser = { id: newUser.id, name, email, provider: "local" };
      saveJson(STORAGE_KEYS.localSession, currentUser);
      showToast("Conta criada com sucesso.");
    }

    updateAuthUI();
    updateSupabaseStatusUI();
    closeAuthModalUI();
    registerForm.reset();
  } catch (error) {
    showAuthFeedback(error.message || "Nao foi possivel criar a conta.", "error");
  }
});

planButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const planName = button.dataset.plan;

    if (!currentUser) {
      openAuthModal("register");
      showAuthFeedback("Entre para continuar com o plano " + planName + ".", "error");
      return;
    }

    if (!isQuizCompleted()) {
      scrollToTarget("#quiz");
      showToast("Complete o quiz BOSSFIT AI para liberar a personalizacao do plano " + planName + ".");
      return;
    }

    showToast(currentUser.name.split(" ")[0] + ", o plano " + planName + " foi reservado na simulacao.");
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearContactErrors();
  formStatus.className = "form-status";
  formStatus.textContent = "";

  const name = document.getElementById("name").value.trim();
  const email = normalizeEmail(document.getElementById("email").value);
  const message = document.getElementById("message").value.trim();
  let hasError = false;

  if (name.length < 3) {
    document.getElementById("nameError").textContent = "Digite um nome com pelo menos 3 caracteres.";
    hasError = true;
  }

  if (!validateEmail(email)) {
    document.getElementById("emailError").textContent = "Informe um email valido para continuar.";
    hasError = true;
  }

  if (message.length < 12) {
    document.getElementById("messageError").textContent = "Escreva uma mensagem com pelo menos 12 caracteres.";
    hasError = true;
  }

  if (hasError) {
    showContactFeedback("Revise os campos destacados antes de enviar sua mensagem.", "error");
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  setTimeout(() => {
    showContactFeedback("Mensagem enviada com sucesso. A equipe UnicidFit entrara em contato em breve.", "success");
    contactForm.reset();

    if (currentUser) {
      document.getElementById("name").value = currentUser.name;
      document.getElementById("email").value = currentUser.email;
    }

    submitButton.disabled = false;
    submitButton.textContent = "Enviar mensagem";
  }, 900);
});

openQuizButton.addEventListener("click", () => {
  openQuizModal(0);
});

editQuizButton.addEventListener("click", async () => {
  if (supabaseClient && currentUser?.provider === "supabase") {
    await loadQuizFromSupabase(currentUser.id);
    updateQuizSummaryUI();
  }

  openQuizModal(0);
});

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const parentStep = button.closest(".quiz-step");
    const key = parentStep.dataset.key;
    setQuizValue(key, button.dataset.value);
  });
});

pesoInput.addEventListener("input", () => {
  setQuizValue("peso", pesoInput.value);
});

alturaInput.addEventListener("input", () => {
  setQuizValue("altura", alturaInput.value);
});

quizBackButton.addEventListener("click", () => {
  if (activeQuizStep === 0) return;
  activeQuizStep -= 1;
  renderQuizStep();
});

quizNextButton.addEventListener("click", async () => {
  if (!validateQuizStep(activeQuizStep)) return;

  if (activeQuizStep === quizSteps.length - 1) {
    await completeQuizFlow();
    return;
  }

  activeQuizStep += 1;
  renderQuizStep();
});

toggleHeaderState();
setActiveLink();
initializeProject();
