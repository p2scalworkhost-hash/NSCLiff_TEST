const STORAGE_KEY = "nsc-liff-register-profile";
const ATTENDANCE_KEY = "nsc-liff-daily-attendance";
const ATTENDANCE_HISTORY_KEY = "nsc-liff-attendance-history";

// LINE LIFF & Webhook Configuration
const LIFF_ID = "2010368908-m5GjQ7qz"; // ใส่ LIFF ID จริงตรงนี้ เช่น "2006123456-XXXXXXXX"
const N8N_WEBHOOK_URL = ""; // ใส่ n8n webhook URL ตรงนี้ เช่น "https://n8n.yourdomain.com/webhook/..."

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYMkvTCHQ0oRuYANj1Axc_z6HrRkbxCnI",
  authDomain: "p2sowen.firebaseapp.com",
  databaseURL: "https://p2sowen-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "p2sowen",
  storageBucket: "p2sowen.firebasestorage.app",
  messagingSenderId: "432340752812",
  appId: "1:432340752812:web:4cd4a2fc8182a111680209",
  measurementId: "G-KD8M18YTFW"
};

let db = null;
let currentLineProfile = null;
let currentActiveAttendance = null;

// Initialize Firebase if configured
try {
  if (typeof firebase !== "undefined" && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase Firestore initialized successfully.");
  } else {
    console.log("Firebase is running in Local Storage mock mode. Set firebaseConfig to enable real Firestore Database.");
  }
} catch (err) {
  console.error("Firebase initialization failed:", err);
}

const mockLineProfile = {
  userId: "U-mock-nsc-0001",
  displayName: "NSC Staff",
  pictureUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='48' fill='%2306c755'/%3E%3Ctext x='48' y='57' text-anchor='middle' font-family='Arial' font-size='30' font-weight='700' fill='white'%3EL%3C/text%3E%3C/svg%3E",
};

const staffDirectory = [
  [1, "นางสาวจารุวรรณ แดงสวัสดิ์", "จารุวรรณ", "แดงสวัสดิ์", "พี่จา", "OR"],
  [2, "นางสาวมณีรัตน์ รอดเจริญ", "มณีรัตน์", "รอดเจริญ", "กันยา", "OR"],
  [3, "นางสาวหฤทัย สอดส่อง", "หฤทัย", "สอดส่อง", "เจี๊ยบ", "OR"],
  [4, "นางสาวจุฑาวดี โล่ห์คำ", "จุฑาวดี", "โล่ห์คำ", "ไนท์", "OR"],
  [5, "นายธนพงษ์ สุวรรณทิพย์", "ธนพงษ์", "สุวรรณทิพย์", "มายด์", "OR"],
  [6, "นางสาวเปมิกา แก้วบังสัน", "เปมิกา", "แก้วบังสัน", "โอริ", "OR"],
  [7, "นายศุภณัฐ โคตรพรม", "ศุภณัฐ", "โคตรพรม", "ปอย", "OR"],
  [8, "นางสาวจิณห์นิภา บรมสุข", "จิณห์นิภา", "บรมสุข", "โบว์", "Senior MKT"],
  [9, "นางสาวกสิณา ชาประดิษฐ", "กสิณา", "ชาประดิษฐ", "แก้ว", "Senior MKT"],
  [10, "นางสาวนันท์พนิตา เสาวคนธ์", "นันท์พนิตา", "เสาวคนธ์", "นุ่น", "Senior MKT"],
  [11, "นายไวคูณฐ์ พิพัฒน์ฉัตรเดชา", "ไวคูณฐ์", "พิพัฒน์ฉัตรเดชา", "บอส", "Senior MKT"],
  [12, "นายเดชานนท์ ขำบรรจง", "เดชานนท์", "ขำบรรจง", "ไอซ์", "Senior MKT"],
  [13, "นางสาวภัทราภรณ์ พินิจพงษ์", "ภัทราภรณ์", "พินิจพงษ์", "โฟม", "Senior MKT"],
  [14, "นางสาวศศิกาญจน์ ชีวมงคลกานต์", "ศศิกาญจน์", "ชีวมงคลกานต์", "ซิน", "Senior MKT"],
  [15, "นางสางอุไรรัตน์ อัครอังศุเพชร", "อุไรรัตน์", "อัครอังศุเพชร", "แบม", "Senior MKT"],
  [16, "นางสาววรินธร ทาดีวงศ์", "วรินธร", "ทาดีวงศ์", "เพลง", "MKT"],
  [17, "นางสาวแคทลียา แสนบุดดา", "แคทลียา", "แสนบุดดา", "แคท", "Operation"],
  [18, "นายจักรี ศรีละโคตร", "จักรี", "ศรีละโคตร", "จีโน่", "Operation"],
  [19, "นางสาววริศรา ขำศิริรัตน์", "วริศรา", "ขำศิริรัตน์", "บีม", "Operation"],
  [20, "นางสาวเมธิศาณัฏฐ์ ทองจันทึก", "เมธิศาณัฏฐ์", "ทองจันทึก", "พี่โอ๋", "Operation"],
  [21, "นางสาวศิรินภา กะการดี", "ศิรินภา", "กะการดี", "พี่นภา", "Operation"],
  [22, "นางสาวนภาลัย แท่นศิลา", "นภาลัย", "แท่นศิลา", "กิ๊ฟ", "Operation"],
  [23, "นางสาวฉัตรนิดา ชาวบ้านเกาะ", "ฉัตรนิดา", "ชาวบ้านเกาะ", "ครีม", "Operation"],
  [24, "นางสาวกาญจนารัติ อิ่มมะโน", "กาญจนารัติ", "อิ่มมะโน", "ฟางข้าว", "Operation"],
  [25, "นางสาวพรรณพร พลอาษา", "พรรณพร", "พลอาษา", "ผึ้ง", "Operation"],
  [26, "นางสาวธิดารัตน์ ผาทอง", "ธิดารัตน์", "ผาทอง", "ปลาย", "Operation"],
  [27, "นางสาวรุ่งนภา โพธิยา", "รุ่งนภา", "โพธิยา", "สายรุ้ง", "Operation"],
  [28, "นางสาวมนัญญา สุขสิทธิ์", "มนัญญา", "สุขสิทธิ์", "วาว", "Operation"],
  [29, "นางสาวอัมพกา แก้วประทุม", "อัมพกา", "แก้วประทุม", "บี", "Operation"],
  [30, "นางสาวเปมิกา วิชัยโย", "เปมิกา", "วิชัยโย", "กิ๊ก", "Operation"],
  [31, "นางสาวธัญพิชชา กาหา", "ธัญพิชชา", "กาหา", "ป้อน", "Operation"],
  [32, "นางสาวนภัสสร ศิลป์ประกอบ", "นภัสสร", "ศิลป์ประกอบ", "เฟิร์ส", "Operation"],
  [33, "นางสาวปวริศา จิระศรีไพฑูรย์", "ปวริศา", "จิระศรีไพฑูรย์", "เฟอรี่", "Operation"],
  [38, "นางสาวเพ็ญโฉม สุขสิทธิ์", "เพ็ญโฉม", "สุขสิทธิ์", "พี่แวว", "Manager"],
].map(([id, fullName, firstName, lastName, nickname, position]) => ({
  id,
  fullName,
  firstName,
  lastName,
  nickname,
  position,
}));

const registerView = document.querySelector("#registerView");
const pendingView = document.querySelector("#pendingView");
const profileView = document.querySelector("#profileView");
const registerForm = document.querySelector("#registerForm");
const attendanceForm = document.querySelector("#attendanceForm");
const formError = document.querySelector("#formError");

async function getLineProfile() {
  // เงื่อนไข: LIFF init สำเร็จและ login แล้วเท่านั้น
  if (typeof liff !== "undefined" && isLiffInitialized && liff.isLoggedIn()) {
    try {
      const profile = await liff.getProfile();
      console.log("[LIFF] getProfile success:", profile.userId, profile.displayName);
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl || mockLineProfile.pictureUrl,
      };
    } catch (err) {
      // ไม่ alert — log แล้ว fallback เงียบๆ
      console.error("[LIFF] getProfile failed:", err.message, err);
    }
  } else {
    console.warn(
      "[LIFF] Using mock profile. Reason:",
      typeof liff === "undefined" ? "SDK not loaded" :
      !isLiffInitialized ? "Not initialized" :
      "Not logged in"
    );
  }
  return mockLineProfile;
}

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

function normalizeStaffNamePart(value) {
  return String(value || "")
    .replace(/^(นาย|นางสาว|นางสาง|นาง|คุณ|น้อง)\s*/u, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

function departmentFromPosition(position) {
  const normalized = String(position || "").trim().toUpperCase();
  if (normalized.includes("MKT")) return "MKT";
  if (normalized === "OR") return "OR";
  if (normalized === "OPERATION") return "OPERATION";
  if (normalized === "MAID") return "MAID";
  if (normalized === "MANAGER") return "MANAGER";
  return normalized;
}

function ensureDepartmentOption(value, label = value) {
  const departmentSelect = registerForm.elements.department;
  if (!value || [...departmentSelect.options].some((option) => option.value === value)) return;

  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  departmentSelect.append(option);
}

function findStaffDirectoryMatch(firstName, lastName) {
  const normalizedFirstName = normalizeStaffNamePart(firstName);
  const normalizedLastName = normalizeStaffNamePart(lastName);
  if (!normalizedFirstName || !normalizedLastName) return null;

  return staffDirectory.find(
    (staff) =>
      normalizeStaffNamePart(staff.firstName) === normalizedFirstName &&
      normalizeStaffNamePart(staff.lastName) === normalizedLastName,
  );
}

function applyStaffDirectoryMatch() {
  const match = findStaffDirectoryMatch(registerForm.elements.firstName.value, registerForm.elements.lastName.value);
  if (!match) {
    return;
  }

  const department = departmentFromPosition(match.position);
  ensureDepartmentOption(department, `${department} - จากรายชื่อพนักงาน`);

  registerForm.elements.nickname.value = match.nickname;
  registerForm.elements.department.value = department;
}

function buildProfile(formData, lineProfile) {
  const firstName = formData.get("firstName").trim();
  const lastName = formData.get("lastName").trim();
  const nickname = formData.get("nickname").trim();
  const department = formData.get("department");
  const staffMatch = findStaffDirectoryMatch(firstName, lastName);

  return {
    employeeId: formData.get("employeeId").trim() || `TEMP-${Date.now().toString().slice(-6)}`,
    firstName,
    lastName,
    nickname,
    phone: normalizePhone(formData.get("phone")),
    department,
    position: staffMatch?.position || department || "",
    lineUserId: lineProfile.userId,
    lineDisplayName: lineProfile.displayName,
    linePictureUrl: lineProfile.pictureUrl,
    staffDirectoryId: staffMatch?.id || "",
    staffDirectoryFullName: staffMatch?.fullName || "",
    status: "registered",
    createdAt: new Date().toISOString(),
  };
}

function validateProfile(profile, consentChecked) {
  if (!profile.firstName || !profile.lastName || !profile.nickname || !profile.department) {
    return "กรุณากรอกข้อมูลที่จำเป็นให้ครบ";
  }

  if (!/^0\d{8,9}$/.test(profile.phone)) {
    return "กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก โดยขึ้นต้นด้วย 0";
  }

  if (!consentChecked) {
    return "กรุณายืนยันข้อมูลก่อนบันทึก";
  }

  return "";
}

async function saveProfile(profile) {
  if (db) {
    try {
      await db.collection("profiles").doc(profile.lineUserId).set(profile);
      console.log("Profile saved to Firebase Firestore.");
    } catch (err) {
      console.error("Firestore saveProfile failed:", err);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

async function loadProfile(lineUserId) {
  if (db && lineUserId) {
    try {
      const doc = await db.collection("profiles").doc(lineUserId).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch (err) {
      console.error("Firestore loadProfile failed:", err);
    }
  }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

async function saveAttendance(record) {
  if (db) {
    try {
      const docId = `${record.lineUserId}_${record.cycleDate}`;
      await db.collection("attendance").doc(docId).set(record);
      console.log("Attendance saved to Firebase Firestore.");
    } catch (err) {
      console.error("Firestore saveAttendance failed:", err);
    }
  }
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(record));
}

async function loadAttendance(lineUserId, cycleDate) {
  if (db && lineUserId && cycleDate) {
    try {
      const docId = `${lineUserId}_${cycleDate}`;
      const doc = await db.collection("attendance").doc(docId).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch (err) {
      console.error("Firestore loadAttendance failed:", err);
    }
  }
  try {
    const history = JSON.parse(localStorage.getItem(ATTENDANCE_HISTORY_KEY));
    if (Array.isArray(history) && lineUserId && cycleDate) {
      const record = history.find((item) => item.lineUserId === lineUserId && item.cycleDate === cycleDate);
      if (record) return record;
    }
  } catch (err) {
    console.error("Error reading attendance history in loadAttendance:", err);
  }
  try {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY));
  } catch {
    return null;
  }
}

async function resetStaleAttendanceIfNeeded(lineUserId) {
  const activeCycleDate = await getActiveCycleDate(lineUserId);
  const record = await loadAttendance(lineUserId, activeCycleDate);
  if (!record) return;

  if (record.cycleDate !== activeCycleDate) {
    localStorage.removeItem(ATTENDANCE_KEY);
  }
}

async function loadAttendanceHistory(lineUserId) {
  if (db && lineUserId) {
    try {
      const snapshot = await db.collection("attendance_history")
        .where("lineUserId", "==", lineUserId)
        .orderBy("submittedAt", "desc")
        .limit(100)
        .get();
      const history = [];
      snapshot.forEach(doc => {
        history.push(doc.data());
      });
      if (history.length > 0) return history;
    } catch (err) {
      console.error("Firestore loadAttendanceHistory failed:", err);
    }
  }
  try {
    const history = JSON.parse(localStorage.getItem(ATTENDANCE_HISTORY_KEY));
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

async function saveAttendanceHistory(record) {
  if (db) {
    try {
      const docId = `${record.lineUserId}_${record.cycleDate}`;
      await db.collection("attendance_history").doc(docId).set(record);
      console.log("Attendance history saved to Firebase Firestore.");
    } catch (err) {
      console.error("Firestore saveAttendanceHistory failed:", err);
    }
  }
  const history = await loadAttendanceHistory(record.lineUserId);
  const recordKey = `${record.lineUserId}-${record.workDate}-${record.cycleDate || record.submittedAt}`;
  const nextRecord = { ...record, recordKey };
  const index = history.findIndex((item) => item.recordKey === recordKey);

  if (index >= 0) {
    history[index] = { ...history[index], ...nextRecord };
  } else {
    history.unshift(nextRecord);
  }

  localStorage.setItem(ATTENDANCE_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}

function setLineHeader(profile) {
  document.querySelector("#lineAvatar").src = profile.pictureUrl;
  document.querySelector("#lineName").textContent = profile.displayName;
  document.querySelector("#lineId").textContent = profile.userId;
}

function initials(profile) {
  return `${profile.firstName.slice(0, 1)}${profile.lastName.slice(0, 1)}`.toUpperCase();
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

function todayInputValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getWorkCycleDateValue(now = new Date()) {
  const cycle = new Date(now);
  if (cycle.getHours() < 7) {
    cycle.setDate(cycle.getDate() - 1);
  }
  const y = cycle.getFullYear();
  const m = String(cycle.getMonth() + 1).padStart(2, '0');
  const d = String(cycle.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getNextDayDateString(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  const nd = String(date.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

async function getActiveCycleDate(lineUserId) {
  const baseCycleDate = getWorkCycleDateValue();
  if (!lineUserId) return baseCycleDate;

  const now = new Date();
  
  // Parse local dates safely using integer parts
  const [y, m, d] = baseCycleDate.split("-").map(Number);
  const startWindow = new Date(y, m - 1, d, 21, 0, 0);

  const nextDayStr = getNextDayDateString(baseCycleDate);
  const [ny, nm, nd] = nextDayStr.split("-").map(Number);
  const endWindow = new Date(ny, nm - 1, nd, 7, 0, 0);
  
  const inAdvanceWindow = (now >= startWindow && now <= endWindow);

  if (inAdvanceWindow) {
    const baseRecord = await loadAttendance(lineUserId, baseCycleDate);
    // Allow advance check-in if they submitted any valid status (work, holiday, or leave) for the base cycle date
    if (baseRecord && baseRecord.workStatus && baseRecord.workStatus !== "reset" && baseRecord.cycleDate === baseCycleDate) {
      return getNextDayDateString(baseCycleDate);
    }
  }
  return baseCycleDate;
}


function getNextResetText() {
  return "ระบบจะเปิดให้ลงข้อมูลรอบใหม่เวลา 21:00-07:00 น.";
}

function formatWorkDate(dateValue) {
  if (!dateValue) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function getExcelDateKey(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return `${date.getMonth() + 1}-${date.getDate()}`;
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isValidStartTime(startTime) {
  if (!/^\d{2}:00$/.test(startTime)) return false;
  const hour = Number(startTime.slice(0, 2));
  return Number.isInteger(hour) && hour >= 1 && hour <= 24;
}

function showRegister(profile = null) {
  profileView.hidden = true;
  pendingView.hidden = true;
  registerView.hidden = false;
  formError.hidden = true;

  if (!profile) {
    registerForm.elements.consent.checked = false;
    return;
  }

  registerForm.elements.firstName.value = profile.firstName;
  registerForm.elements.lastName.value = profile.lastName;
  registerForm.elements.nickname.value = profile.nickname;
  registerForm.elements.phone.value = profile.phone;
  ensureDepartmentOption(profile.department, `${profile.department} - จากข้อมูลเดิม`);
  registerForm.elements.department.value = profile.department;
  registerForm.elements.employeeId.value = profile.employeeId.startsWith("TEMP-") ? "" : profile.employeeId;
  registerForm.elements.consent.checked = false;
}

function showProfile(profile) {
  if (profile.status === "pending_review") {
    registerView.hidden = true;
    profileView.hidden = true;
    pendingView.hidden = false;
    return;
  }

  registerView.hidden = true;
  pendingView.hidden = true;
  profileView.hidden = false;

  document.querySelector("#employeeInitials").textContent = initials(profile);
  document.querySelector("#employeeName").textContent = `${profile.firstName} ${profile.lastName}`;
  document.querySelector("#employeeMeta").textContent = `${profile.nickname} · ${profile.department}`;
  document.querySelector("#savedEmployeeId").textContent = profile.employeeId;
  document.querySelector("#savedPhone").textContent = profile.phone;
  document.querySelector("#savedLineId").textContent = profile.lineUserId;
  document.querySelector("#savedAt").textContent = formatDate(profile.createdAt);
  applyAttendanceLock();
}

function getStatusLabel(status) {
  return {
    work: "เข้างาน",
    holiday: "หยุด/นักขัตฤกษ์/พักร้อน",
    paid_leave: "ลาป่วย/ลากิจ",
    unpaid_leave: "ลาไม่รับเงินเดือน",
  }[status] || "-";
}

async function buildDailyLineLog(profile) {
  const formData = new FormData(attendanceForm);
  const status = formData.get("workStatus");
  const workDate = attendanceForm.elements.workDate.value;
  const startTime = status === "work" ? getSelectedStartTime() : "";
  const plannedEndTime = startTime ? toTime(toMinutes(startTime) + 9 * 60) : "";
  const leaveType = status === "work" ? "" : attendanceForm.elements.leaveType.value;

  const cycleDate = workDate;

  return {
    employeeId: profile.employeeId,
    fullName: `${profile.firstName} ${profile.lastName}`,
    nickname: profile.nickname,
    department: profile.department,
    lineUserId: profile.lineUserId,
    workDate,
    excelDateKey: getExcelDateKey(workDate),
    workStatus: status,
    workStatusLabel: getStatusLabel(status),
    plannedStartTime: startTime,
    plannedEndTime,
    otPromptTime: plannedEndTime,
    leaveType,
    employeeOtIntent: false,
    submittedAt: new Date().toISOString(),
    cycleDate,
  };
}

function renderDailyLineLog(log) {
  document.querySelector("#logFullName").textContent = log.fullName;
  document.querySelector("#logExcelDateKey").textContent = log.excelDateKey;
  document.querySelector("#logWorkStatus").textContent = log.leaveType
    ? `${log.workStatusLabel} (${log.leaveType})`
    : log.workStatusLabel;
  document.querySelector("#logPlanTime").textContent = log.plannedStartTime
    ? `${log.plannedStartTime} / ${log.plannedEndTime}`
    : "-";
  document.querySelector("#logOtPrompt").textContent = log.otPromptTime || "-";
  document.querySelector("#logOtIntent").textContent = log.workStatus === "work"
    ? log.employeeOtIntent ? "มี OT" : "ยังไม่ได้ตอบ / ไม่มี OT"
    : "-";
  const logOtNoteRow = document.querySelector("#logOtNoteRow");
  const logOtNote = document.querySelector("#logOtNote");
  if (logOtNoteRow && logOtNote) {
    if (log.workStatus === "work" && log.employeeOtIntent && log.otNote) {
      logOtNote.textContent = log.otNote;
      logOtNoteRow.style.display = "";
    } else {
      logOtNote.textContent = "-";
      logOtNoteRow.style.display = log.workStatus === "work" && log.employeeOtIntent ? "" : "none";
    }
  }
  document.querySelector("#mockExcelName").textContent = log.fullName;
  document.querySelector("#mockExcelCell").textContent = `${log.excelDateKey}: ${getMockExcelCellValue(log)}`;
  document.querySelector("#lineLogPanel").hidden = false;
}

function getMockExcelCellValue(log) {
  if (log.workStatus !== "work") return log.workStatusLabel;
  return `${log.plannedStartTime}\\n${log.plannedEndTime}`;
}

function getSelectedStartTime() {
  const selected = attendanceForm.elements.startTime.value;
  if (selected !== "custom") return selected;
  const rawHour = attendanceForm.elements.customStartHour.value.trim();
  if (!rawHour) return "";
  const hour = rawHour.padStart(2, "0");
  return `${hour}:00`;
}

function updateAttendanceVisibility() {
  const status = new FormData(attendanceForm).get("workStatus");
  const isWork = status === "work";
  const isCustomTime = attendanceForm.elements.startTime.value === "custom";
  document.querySelector("#workFields").hidden = !isWork;
  document.querySelector("#customStartTimeRow").hidden = !isWork || !isCustomTime;
  document.querySelector("#otPreview").hidden = !isWork;
  document.querySelector("#leaveFields").hidden = isWork;

  updateOtPreview();
}

async function getActiveAttendance() {
  if (!currentLineProfile) return null;
  const activeCycleDate = await getActiveCycleDate(currentLineProfile.userId);
  const record = await loadAttendance(currentLineProfile.userId, activeCycleDate);
  if (!record || record.cycleDate !== activeCycleDate || record.workStatus === "reset") return null;
  return record;
}

async function applyAttendanceLock() {
  const activeRecord = await getActiveAttendance();
  currentActiveAttendance = activeRecord;
  const lockedPanel = document.querySelector("#lockedPanel");

  if (!activeRecord) {
    attendanceForm.hidden = false;
    lockedPanel.hidden = true;
    document.querySelector("#profileActions").hidden = false;
    document.querySelector("#lineLogPanel").hidden = true;

    if (currentLineProfile) {
      const activeCycleDate = await getActiveCycleDate(currentLineProfile.userId);
      if (activeCycleDate) {
        attendanceForm.elements.workDate.value = activeCycleDate;

        const submitBtn = attendanceForm.querySelector("button[type='submit']");
        if (submitBtn) {
          const baseToday = getWorkCycleDateValue();
          if (activeCycleDate !== baseToday) {
            submitBtn.textContent = "บันทึกเวลาล่วงหน้า";
          } else {
            submitBtn.textContent = "บันทึกเวลาวันนี้";
          }
        }
      }
    }
    return;
  }

  attendanceForm.hidden = true;
  lockedPanel.hidden = false;
  document.querySelector("#profileActions").hidden = true;
  renderDailyLineLog(activeRecord);
  renderLockedPanel(activeRecord);
}

function renderLockedPanel(record) {
  const summary =
    record.workStatus === "work"
      ? `${formatWorkDate(record.workDate)} เข้างาน ${record.plannedStartTime} เลิกปกติ ${record.plannedEndTime} · ${getNextResetText()}`
      : `${formatWorkDate(record.workDate)} ${record.workStatusLabel} · ${getNextResetText()}`;

  document.querySelector("#lockedSummary").textContent = summary;

  const otCard = document.querySelector(".ot-answer-card");
  if (otCard) {
    otCard.hidden = record.workStatus !== "work";
  }

  const emergencyActionWrapper = document.querySelector("#emergencyActionWrapper");
  if (emergencyActionWrapper) {
    emergencyActionWrapper.hidden = record.workStatus !== "work";
  }

  // Ensure emergency leave section is collapsed/hidden when locked panel resets
  const emergencyLeaveSection = document.querySelector("#emergencyLeaveSection");
  if (emergencyLeaveSection) {
    emergencyLeaveSection.hidden = true;
  }
  const emergencyLeaveButton = document.querySelector("#emergencyLeaveButton");
  if (emergencyLeaveButton) {
    emergencyLeaveButton.hidden = false;
  }

  const otCardLabel = document.querySelector(".ot-answer-card > span");
  if (otCardLabel) {
    otCardLabel.textContent = `หลังทำงานจริง วันที่ ${formatWorkDate(record.workDate)} มี OT ไหม`;
  }

  setOtChoice(Boolean(record.employeeOtIntent), false);
  updatePostCheckinOtLabel(record);
}

async function setOtChoice(hasOt, shouldSave = true, note = null) {
  document.querySelector("#noOtButton").classList.toggle("active", !hasOt);
  document.querySelector("#yesOtButton").classList.toggle("active", hasOt);

  // Show/hide the OT note section
  const otNoteSection = document.querySelector("#otNoteSection");
  if (otNoteSection) {
    otNoteSection.style.display = hasOt ? "block" : "none";
  }

  if (!shouldSave) {
    // Restore saved note into textarea if already answered
    const record = await getActiveAttendance();
    if (record && record.employeeOtIntent && record.otNote) {
      const otNoteInput = document.querySelector("#otNoteInput");
      if (otNoteInput) otNoteInput.value = record.otNote;
    }
    return;
  }

  const record = await getActiveAttendance();
  if (!record) {
    await applyAttendanceLock();
    return;
  }

  record.employeeOtIntent = hasOt;
  record.otAnsweredAt = new Date().toISOString();
  if (note !== null) {
    record.otNote = note;
  } else if (!hasOt) {
    record.otNote = "";
  }
  await saveAttendance(record);
  await saveAttendanceHistory(record);
  renderDailyLineLog(record);
  updatePostCheckinOtLabel(record);
}

function updatePostCheckinOtLabel(record) {
  if (!record?.otAnsweredAt) {
    document.querySelector("#postCheckinOtLabel").textContent = "ยังไม่ได้บันทึกคำตอบ OT";
    return;
  }

  const noteText = record.otNote ? ` — ${record.otNote}` : "";
  document.querySelector("#postCheckinOtLabel").textContent = record.employeeOtIntent
    ? `บันทึกแล้ว: มี OT${noteText}`
    : "บันทึกแล้ว: ไม่มี OT";
}

function updateOtPreview() {
  const startTime = getSelectedStartTime();
  if (!isValidStartTime(startTime)) {
    document.querySelector("#otPreviewTime").textContent = "--:--";
    return;
  }

  document.querySelector("#otPreviewTime").textContent = toTime(toMinutes(startTime) + 9 * 60);
}

async function showAttendanceResult() {
  const status = new FormData(attendanceForm).get("workStatus");
  const workDate = attendanceForm.elements.workDate.value;
  const today = todayInputValue();
  if (!currentLineProfile) {
    alert("ข้อมูลโปรไฟล์ LINE ไม่พร้อมใช้งาน");
    return;
  }
  const profile = await loadProfile(currentLineProfile.userId);

  if (!profile) {
    alert("กรุณาลงทะเบียนพนักงานก่อน");
    showRegister();
    return;
  }

  if (!workDate) {
    alert("กรุณาเลือกวันที่");
    return;
  }

  if (status !== "work") {
    const log = await buildDailyLineLog(profile);
    await saveAttendanceHistory(log);
    renderDailyLineLog(log);
    alert(`บันทึกข้อมูลวันที่ ${formatWorkDate(workDate)} แล้ว`);
    return;
  }

  const startTime = getSelectedStartTime();
  if (!isValidStartTime(startTime)) {
    alert("กรุณากรอกชั่วโมงเป็นตัวเลข 1-24 โดยนาทีจะเป็น 00 อัตโนมัติ");
    return;
  }

  const log = await buildDailyLineLog(profile);
  await saveAttendance(log);
  await saveAttendanceHistory(log);
  renderDailyLineLog(log);
  await applyAttendanceLock();
  alert(`บันทึกข้อมูลวันที่ ${formatWorkDate(workDate)} แล้ว ระบบจะถาม OT เวลา ${toTime(toMinutes(startTime) + 9 * 60)}`);
}

let isLiffInitialized = false;

async function initLiff() {
  // ถ้าไม่มี LIFF ID หรือเป็น placeholder → Mock Mode ทันที
  if (!LIFF_ID || LIFF_ID === "YOUR_LIFF_ID_HERE") {
    console.log("[LIFF] No LIFF ID configured → Mock Mode");
    return false;
  }

  // ถ้า SDK ไม่โหลด
  if (typeof liff === "undefined") {
    console.error("[LIFF] SDK not loaded → Mock Mode");
    return false;
  }

  try {
    console.log("[LIFF] Initializing with ID:", LIFF_ID);
    await liff.init({ liffId: LIFF_ID });
    isLiffInitialized = true;
    console.log("[LIFF] Init success. isLoggedIn:", liff.isLoggedIn());

    if (!liff.isLoggedIn()) {
      console.log("[LIFF] Not logged in → redirecting to LINE login...");
      liff.login();
      return false; // หน้าจะ redirect ไป LINE login
    }

    console.log("[LIFF] Logged in ✓");
    return true;
  } catch (err) {
    console.error("[LIFF] Init failed:", err.message, err);
    // ไม่ alert เพื่อไม่ขัด UX — แค่ fallback ไป Mock Mode เงียบๆ
    isLiffInitialized = false;
    return false;
  }
}

async function init() {
  const liffReady = await initLiff();
  // ถ้า initLiff() เรียก liff.login() หน้าจะ redirect ไปแล้ว
  // โค้ดด้านล่างจะไม่ทำงานต่อในกรณีนั้น

  console.log("[App] LIFF ready:", liffReady);

  const lineProfile = await getLineProfile();
  currentLineProfile = lineProfile;
  console.log("[App] Using profile:", lineProfile.userId, lineProfile.displayName);

  setLineHeader(lineProfile);
  await resetStaleAttendanceIfNeeded(lineProfile.userId);
  attendanceForm.elements.workDate.value = todayInputValue();
  // Allow choosing past dates for testing
  updateAttendanceVisibility();

  const savedProfile = await loadProfile(lineProfile.userId);
  if (savedProfile?.lineUserId === lineProfile.userId) {
    showProfile(savedProfile);
  } else {
    showRegister();
  }

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = registerForm.querySelector("button[type='submit']");
    const originalBtnText = submitButton.textContent;

    const profile = buildProfile(new FormData(registerForm), lineProfile);
    const error = validateProfile(profile, registerForm.elements.consent.checked);

    if (error) {
      formError.textContent = error;
      formError.hidden = false;
      return;
    }

    formError.hidden = true;

    if (N8N_WEBHOOK_URL) {
      submitButton.disabled = true;
      submitButton.textContent = "กำลังส่งข้อมูล...";

      try {
        const payload = {
          lineUserId: profile.lineUserId,
          lineDisplayName: profile.lineDisplayName,
          linePictureUrl: profile.linePictureUrl,
          employeeId: profile.employeeId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          nickname: profile.nickname,
          phone: profile.phone,
          department: profile.department,
          position: profile.position,
          staffDirectoryId: profile.staffDirectoryId,
          staffDirectoryFullName: profile.staffDirectoryFullName,
          source: "liff_identity_confirmation",
          submittedAt: profile.createdAt,
        };

        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "verified") {
          profile.status = "verified";
          if (result.employeeId) profile.employeeId = result.employeeId;
          if (result.name) {
            const parts = result.name.split(/\s+/);
            profile.firstName = parts[0] || profile.firstName;
            profile.lastName = parts.slice(1).join(" ") || profile.lastName;
          }
          await saveProfile(profile);
          showProfile(profile);
          alert(result.message || "ยืนยันตัวตนสำเร็จ!");
        } else if (result.status === "pending_review") {
          profile.status = "pending_review";
          await saveProfile(profile);
          showProfile(profile);
          alert(result.message || "ได้รับข้อมูลแล้ว กรุณารอ HR ตรวจสอบ");
        } else {
          formError.textContent = result.message || "ไม่พบข้อมูลพนักงานหรือข้อมูลไม่ตรงกัน";
          formError.hidden = false;
        }
      } catch (err) {
        console.error("Webhook submission failed:", err);
        formError.textContent = "เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว กรุณาลองใหม่อีกครั้ง";
        formError.hidden = false;
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalBtnText;
      }
    } else {
      // Mock mode
      await saveProfile(profile);
      showProfile(profile);
    }
  });

  for (const fieldName of ["firstName", "lastName"]) {
    registerForm.elements[fieldName].addEventListener("input", applyStaffDirectoryMatch);
    registerForm.elements[fieldName].addEventListener("blur", applyStaffDirectoryMatch);
  }

  // Listen specifically to workStatus radio buttons changing
  const workStatusRadios = attendanceForm.querySelectorAll('input[name="workStatus"]');
  workStatusRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      const status = event.target.value;
      if (status === "holiday") {
        attendanceForm.elements.leaveType.value = "dayoff";
      } else if (status === "paid_leave") {
        attendanceForm.elements.leaveType.value = "sick";
      } else if (status === "unpaid_leave") {
        attendanceForm.elements.leaveType.value = "unpaid";
      }
      updateAttendanceVisibility();
    });
  });

  // Listen specifically to startTime dropdown changing
  attendanceForm.elements.startTime.addEventListener("change", updateAttendanceVisibility);

  attendanceForm.elements.customStartHour.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 2);
    updateOtPreview();
  });

  attendanceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showAttendanceResult();
  });

  document.querySelector("#editButton").addEventListener("click", async () => {
    showRegister(await loadProfile(currentLineProfile.userId));
  });

  document.querySelector("#resetButton").addEventListener("click", async () => {
    if (db && currentLineProfile) {
      try {
        await db.collection("profiles").doc(currentLineProfile.userId).delete();
        console.log("Profile deleted from Firebase Firestore.");
      } catch (err) {
        console.error("Firestore delete profile failed, trying overwrite:", err);
        try {
          await db.collection("profiles").doc(currentLineProfile.userId).set({ status: "reset" });
        } catch (overrideErr) {
          console.error("Firestore override profile failed:", overrideErr);
        }
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ATTENDANCE_KEY);
    registerForm.reset();
    showRegister();
  });

  document.querySelector("#resetCheckinButton").addEventListener("click", async () => {
    if (confirm("ต้องการล้างข้อมูลการเข้างานวันนี้เพื่อทดสอบใหม่ใช่หรือไม่?")) {
      if (currentLineProfile) {
        const cycleDate = currentActiveAttendance ? currentActiveAttendance.cycleDate : (await getActiveCycleDate(currentLineProfile.userId));
        if (db) {
          const docId = `${currentLineProfile.userId}_${cycleDate}`;
          try {
            await db.collection("attendance").doc(docId).delete();
            await db.collection("attendance_history").doc(docId).delete();
            console.log("Attendance and history deleted from Firebase Firestore.");
          } catch (err) {
            console.error("Firestore delete attendance failed, trying overwrite:", err);
            try {
              // Fallback: overwrite status to bypass getActiveAttendance check if delete is blocked
              await db.collection("attendance").doc(docId).set({ workStatus: "reset", cycleDate: "" });
              await db.collection("attendance_history").doc(docId).set({ workStatus: "reset", cycleDate: "" });
              console.log("Attendance overridden in Firebase Firestore.");
            } catch (overrideErr) {
              console.error("Firestore override attendance failed:", overrideErr);
            }
          }
        }
        
        try {
          let history = JSON.parse(localStorage.getItem(ATTENDANCE_HISTORY_KEY));
          if (Array.isArray(history)) {
            history = history.filter((r) => !(r.lineUserId === currentLineProfile.userId && r.cycleDate === cycleDate));
            localStorage.setItem(ATTENDANCE_HISTORY_KEY, JSON.stringify(history));
          }
        } catch (err) {
          console.error("Failed to clean up history in resetCheckinButton:", err);
        }

        try {
          const activeRecord = JSON.parse(localStorage.getItem(ATTENDANCE_KEY));
          if (activeRecord && activeRecord.cycleDate === cycleDate) {
            localStorage.removeItem(ATTENDANCE_KEY);
          }
        } catch {}
      }
      await applyAttendanceLock();
      alert("ล้างข้อมูลการเข้างานวันนี้สำเร็จ สามารถลงเวลาใหม่ได้ทันที");
    }
  });

  document.querySelector("#noOtButton").addEventListener("click", () => {
    setOtChoice(false);
    alert("บันทึกว่า วันนี้ไม่มี OT แล้ว");
  });

  document.querySelector("#yesOtButton").addEventListener("click", () => {
    setOtChoice(true, false); // Show note section without saving yet
    const otNoteSection = document.querySelector("#otNoteSection");
    if (otNoteSection) otNoteSection.style.display = "block";
  });

  document.querySelector("#saveOtNoteButton").addEventListener("click", async () => {
    const otNote = (document.querySelector("#otNoteInput")?.value || "").trim();
    await setOtChoice(true, true, otNote);
    alert("บันทึกว่า วันนี้มี OT" + (otNote ? ` — ${otNote}` : "") + " แล้ว");
  });

  const emergencyLeaveBtn = document.querySelector("#emergencyLeaveButton");
  const emergencyLeaveSec = document.querySelector("#emergencyLeaveSection");
  const cancelEmergencyLeaveBtn = document.querySelector("#cancelEmergencyLeave");
  const submitEmergencyLeaveBtn = document.querySelector("#submitEmergencyLeave");

  if (emergencyLeaveBtn && emergencyLeaveSec && cancelEmergencyLeaveBtn && submitEmergencyLeaveBtn) {
    emergencyLeaveBtn.addEventListener("click", () => {
      emergencyLeaveSec.hidden = false;
      emergencyLeaveBtn.hidden = true;
    });

    cancelEmergencyLeaveBtn.addEventListener("click", () => {
      emergencyLeaveSec.hidden = true;
      emergencyLeaveBtn.hidden = false;
    });

    submitEmergencyLeaveBtn.addEventListener("click", async () => {
      const leaveType = document.querySelector("#emergencyLeaveType").value;
      const leaveNote = document.querySelector("#emergencyLeaveNote").value.trim();

      const record = await getActiveAttendance();
      if (!record) {
        alert("ไม่พบข้อมูลการเข้างานที่สามารถเปลี่ยนได้");
        return;
      }

      function getWorkStatusFromLeaveType(type) {
        if (type === "unpaid") return "unpaid_leave";
        if (type === "sick" || type === "personal") return "paid_leave";
        return "holiday";
      }

      const workStatus = getWorkStatusFromLeaveType(leaveType);
      const workStatusLabel = getStatusLabel(workStatus);

      record.workStatus = workStatus;
      record.workStatusLabel = leaveNote ? `${workStatusLabel} (${leaveNote})` : workStatusLabel;
      record.leaveType = leaveType;
      record.leaveNote = leaveNote;
      record.plannedStartTime = "";
      record.plannedEndTime = "";
      record.otPromptTime = "";
      record.employeeOtIntent = false;
      record.submittedAt = new Date().toISOString();

      await saveAttendance(record);
      await saveAttendanceHistory(record);

      emergencyLeaveSec.hidden = true;
      emergencyLeaveBtn.hidden = false;

      await applyAttendanceLock();
      alert("แจ้งลาฉุกเฉินสำเร็จ (เปลี่ยนสถานะเรียบร้อยแล้ว)");
    });
  }

  // pendingView status check button
  document.querySelector("#checkStatusButton").addEventListener("click", async () => {
    const savedProfile = await loadProfile(currentLineProfile.userId);
    if (!savedProfile || !N8N_WEBHOOK_URL) return;

    const btn = document.querySelector("#checkStatusButton");
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "กำลังตรวจสอบ...";

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineUserId: savedProfile.lineUserId,
          lineDisplayName: savedProfile.lineDisplayName,
          linePictureUrl: savedProfile.linePictureUrl,
          employeeId: savedProfile.employeeId,
          firstName: savedProfile.firstName,
          lastName: savedProfile.lastName,
          nickname: savedProfile.nickname,
          phone: savedProfile.phone,
          department: savedProfile.department,
          position: savedProfile.position,
          source: "liff_status_check",
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Network error");
      const result = await response.json();

      if (result.status === "verified") {
        savedProfile.status = "verified";
        if (result.employeeId) savedProfile.employeeId = result.employeeId;
        if (result.name) {
          const parts = result.name.split(/\s+/);
          savedProfile.firstName = parts[0] || savedProfile.firstName;
          savedProfile.lastName = parts.slice(1).join(" ") || savedProfile.lastName;
        }
        await saveProfile(savedProfile);
        showProfile(savedProfile);
        alert(result.message || "ยืนยันตัวตนสำเร็จแล้ว!");
      } else {
        alert(result.message || "สถานะปัจจุบัน: ยังอยู่ระหว่างการตรวจสอบ");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  document.querySelector("#pendingResetButton").addEventListener("click", async () => {
    if (db && currentLineProfile) {
      try {
        await db.collection("profiles").doc(currentLineProfile.userId).delete();
        console.log("Profile deleted from Firebase Firestore.");
      } catch (err) {
        console.error("Firestore delete profile failed, trying overwrite:", err);
        try {
          await db.collection("profiles").doc(currentLineProfile.userId).set({ status: "reset" });
        } catch (overrideErr) {
          console.error("Firestore override profile failed:", overrideErr);
        }
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ATTENDANCE_KEY);
    registerForm.reset();
    showRegister();
  });
}

init();