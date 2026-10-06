import React, { useEffect, useMemo, useState } from "react";
import {
  AlarmClock, BarChart3, CalendarDays, Check, CheckCircle2, Circle,
  ClipboardList, Flame, Flag, LayoutDashboard, ListTodo, Moon, Plus,
  Search, Settings2, Sparkles, Sun, Trash2, Trophy, X, Pencil, Smile,
  BookOpen, PartyPopper, TimerReset
} from "lucide-react";
import { createRoot } from "react-dom/client";
const initialTasks = [
  { id: 1, title: "Complete DBMS assignment", subject: "Database Systems", due: "2026-10-08", priority: "High", status: "To Do", emoji: "📚" },
  { id: 2, title: "Prepare for Java test", subject: "Programming", due: "2026-10-10", priority: "Medium", status: "In Progress", emoji: "💻" },
  { id: 3, title: "Read cloud computing notes", subject: "Cloud Computing", due: "2026-10-15", priority: "Medium", status: "To Do", emoji: "☁️" },
  { id: 4, title: "Build portfolio website", subject: "Web Development", due: "2026-10-12", priority: "High", status: "To Do", emoji: "🎨" },
  { id: 5, title: "Submit library record", subject: "MCA Lab", due: "2026-10-06", priority: "Low", status: "Completed", emoji: "✍️" },
  { id: 6, title: "Practice SQL queries", subject: "Database Systems", due: "2026-10-09", priority: "High", status: "In Progress", emoji: "🧠" }
];
const statuses = ["To Do", "In Progress", "Completed"];
const priorityOrder = { High: 0, Medium: 1, Low: 2 };
const jokes = [
  "Bestie, that deadline isn't going to finish itself 😂",
  "Tiny steps still move you forward 🐢💖",
  "Your future self is already saying thank you ✨",
  "One task at a time. You've got this! 💪",
  "Study now, sparkle later 🌟"
];
const today = new Date();
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const isPastDue = (task) => task.due && task.due < dateKey(today) && task.status !== "Completed";
const prettyDate = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No deadline";

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("studybuddy-tasks");
      return saved ? JSON.parse(saved) : initialTasks;
    } catch { return initialTasks; }
  });
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Priority");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState("");
  const [focusMins, setFocusMins] = useState(25);
  const [focusRunning, setFocusRunning] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", due: "", priority: "Medium", status: "To Do", emoji: "📚" });

  useEffect(() => { localStorage.setItem("studybuddy-tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const completed = tasks.filter(t => t.status === "Completed").length;
  const todo = tasks.filter(t => t.status === "To Do").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const points = completed * 10;
  const visibleTasks = useMemo(() => tasks
    .filter(t => filter === "All" || t.status === filter)
    .filter(t => `${t.title} ${t.subject} ${t.priority}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sort === "Priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sort === "Deadline") return (a.due || "9999").localeCompare(b.due || "9999");
      return a.title.localeCompare(b.title);
    }), [tasks, filter, search, sort]);

  function openNew() {
    setEditing(null);
    setForm({ title: "", subject: "", due: "", priority: "Medium", status: "To Do", emoji: "📚" });
    setShowForm(true);
  }
  function openEdit(task) {
    setEditing(task.id);
    setForm({ title: task.title, subject: task.subject, due: task.due, priority: task.priority, status: task.status, emoji: task.emoji || "📚" });
    setShowForm(true);
  }
  function saveTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editing) {
      setTasks(old => old.map(t => t.id === editing ? { ...t, ...form, title: form.title.trim() } : t));
      setToast("Task updated. Look at you being organized! ✨");
    } else {
      setTasks(old => [{ ...form, id: Date.now(), title: form.title.trim() }, ...old]);
      setToast("New mission unlocked! 🎯");
    }
    setShowForm(false);
  }
  function updateStatus(task, status) {
    if (task.status === status) return;
    setTasks(old => old.map(t => t.id === task.id ? { ...t, status } : t));
    if (status === "Completed") setToast(`Boom! "${task.title}" completed. +10 points 🎉`);
    else setToast(`Task moved to ${status}. You've got this 💪`);
  }
  function deleteTask(task) {
    if (window.confirm(`Delete "${task.title}"?`)) {
      setTasks(old => old.filter(t => t.id !== task.id));
      setToast("Task removed. Making room for fresh starts 🌱");
    }
  }

  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon">📘</div><div><b>StudyBuddy <span>✨</span></b><small>Student Work Scheduler</small></div></div>
        <div className="nav-label">YOUR SPACE</div>
        <button className="nav-item active"><LayoutDashboard size={18}/> Dashboard</button>
        <button className="nav-item" onClick={openNew}><Plus size={18}/> Add a task</button>
        <button className="nav-item" onClick={() => setFilter("All")}><ListTodo size={18}/> My tasks <span className="nav-count">{tasks.length}</span></button>
        <button className="nav-item" onClick={() => {setSort("Deadline"); setFilter("All");}}><CalendarDays size={18}/> Deadlines</button>
        <button className="nav-item" onClick={() => setToast(`You've earned ${points} StudyBuddy points! 🏆`)}><BarChart3 size={18}/> My progress</button>
        <div className="sidebar-bottom">
          <div className="mascot">🐱</div>
          <h3>You can do it!</h3>
          <p>“Small steps every day lead to big results.”</p>
          <div className="sidebar-tip">💡 <span>Friendly reminder: take breaks and drink some water!</span></div>
          <button className="theme-button" onClick={() => setDark(v => !v)}>{dark ? <Sun size={17}/> : <Moon size={17}/>} {dark ? "Light mode" : "Dark mode"}</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="searchbox"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks, subjects, or priorities..." /></div>
          <div className="profile"><div className="avatar">🌼</div><div><b>Hello, student!</b><small>Ready to make today count? 💗</small></div><Sparkles size={19} className="sparkle"/></div>
        </header>

        <section className="hero">
          <div className="hero-copy"><span className="eyebrow">YOUR LITTLE PRODUCTIVITY CORNER ✨</span><h1>Hey, you've got this! <span>👋</span></h1><p>Plan a little. Do a little. Celebrate a lot. 💖</p><button className="primary-button" onClick={openNew}><Plus size={17}/> Add my next task</button></div>
          <div className="hero-art"><div className="sunshine">☀️</div><div className="floating">⭐ 💕 ✨</div><div className="study-mascot">🐻‍❄️</div><div className="speech">One thing at a time!<br/>You're doing great 💗</div></div>
        </section>

        <section className="stats">
          <Stat icon={<ClipboardList/>} color="purple" label="Total tasks" value={tasks.length} foot="Your whole to-do universe 🌎"/>
          <Stat icon={<AlarmClock/>} color="orange" label="To do" value={todo} foot="You can start small 🌱"/>
          <Stat icon={<TimerReset/>} color="blue" label="In progress" value={inProgress} foot="Keep that momentum 🚀"/>
          <Stat icon={<CheckCircle2/>} color="green" label="Completed" value={completed} foot="Look at you go! 🎉"/>
          <div className="stat-card progress-card"><div className="progress-ring" style={{"--progress": `${progress}%`}}><span>{progress}%</span></div><b>Progress</b><small>{progress === 100 && tasks.length ? "Legendary! 🏆" : "Every task counts"}</small></div>
        </section>

        <section className="content-grid">
          <div className="tasks-panel panel">
            <div className="section-heading"><div><h2>My task board <span>📝</span></h2><p>Little missions, big achievements.</p></div><button className="primary-button" onClick={openNew}><Plus size={17}/> Add task</button></div>
            <div className="task-toolbar"><div className="filters">{["All", ...statuses].map(s => <button key={s} onClick={() => setFilter(s)} className={filter === s ? "filter active-filter" : "filter"}>{s}</button>)}</div><label className="sort-select"><Settings2 size={15}/><select value={sort} onChange={e => setSort(e.target.value)}><option>Priority</option><option>Deadline</option><option>Alphabetical</option></select></label></div>
            <div className="task-list">
              {visibleTasks.length ? visibleTasks.map(task => <TaskCard key={task.id} task={task} onStatus={updateStatus} onEdit={openEdit} onDelete={deleteTask}/>) :
                <div className="empty-state"><div>🪴</div><h3>No tasks here yet!</h3><p>Add a task and let your productive era begin ✨</p><button className="primary-button" onClick={openNew}><Plus size={16}/> Create a task</button></div>}
            </div>
            <div className="task-footer"><span>Showing <b>{visibleTasks.length}</b> of <b>{tasks.length}</b> tasks</span><span>Made with ☕ and a little ✨</span></div>
          </div>

          <aside className="right-column">
            <div className="panel focus-panel"><div className="mini-heading"><div className="round-emoji">🎯</div><div><h3>Today's focus</h3><p>Pick one thing to begin with.</p></div></div>
              {tasks.filter(t => t.status !== "Completed").slice(0,3).map(t => <label className="focus-item" key={t.id}><input type="checkbox" checked={t.status === "Completed"} onChange={() => updateStatus(t, "Completed")}/><span>{t.title}</span></label>)}
              {!tasks.some(t => t.status !== "Completed") && <p className="all-done">Everything is done! Go celebrate 🥳</p>}
              <div className="quote-box"><span>🐣</span><p>“Done is better than perfect.”<br/><small>Your tiny cheerleader says hi!</small></p></div>
            </div>
            <div className="panel points-panel"><div className="mini-heading"><div className="round-emoji">🏆</div><div><h3>Your rewards</h3><p>Every completed task earns 10 points.</p></div></div><div className="points-number">{points} <span>XP ✨</span></div><div className="points-track"><div style={{width: `${Math.min(points % 100,100)}%`}}/></div><div className="reward-row"><span>🌱 Starter</span><span>⭐ {points >= 50 ? "Rising star unlocked!" : `${50-points} XP to Rising Star`}</span></div><button className="soft-button" onClick={() => setToast(`You've earned ${points} points. ${points >= 50 ? "Rising star unlocked! 🌟" : "Keep completing tasks to earn badges! 🏅"}`)}><Trophy size={16}/> Check my rewards</button></div>
            <div className="panel timer-panel"><div className="mini-heading"><div className="round-emoji">🍅</div><div><h3>Focus corner</h3><p>A tiny timer for big focus.</p></div></div><div className="timer-display">{String(focusMins).padStart(2,"0")}:00</div><div className="timer-actions"><button className="soft-button" onClick={() => setFocusRunning(v => !v)}>{focusRunning ? "Pause" : "Start focus"}</button><button className="icon-button" onClick={() => {setFocusMins(25);setFocusRunning(false);setToast("Fresh focus session ready! 🍅")}} aria-label="Reset timer"><TimerReset size={16}/></button></div><small className="timer-note">{focusRunning ? "Focus mode is on — you've got this! 🔥" : "Demo timer controls; take a real 25-minute session."}</small></div>
          </aside>
        </section>
        <footer className="footer">StudyBuddy ✨ · Your study life, sorted · Remember to be kind to yourself 💗</footer>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowForm(false)}><form className="task-modal" onSubmit={saveTask}>
        <div className="modal-heading"><div><span className="eyebrow">ONE STEP AT A TIME 🌈</span><h2>{editing ? "Edit your task" : "Create a new task"}</h2></div><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={20}/></button></div>
        <label className="field-label">Task name *<input required autoFocus maxLength={90} value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Finish my React assignment"/></label>
        <label className="field-label">Subject or category<input value={form.subject} onChange={e => setForm({...form,subject:e.target.value})} placeholder="e.g. MCA, Java, Personal"/></label>
        <div className="form-row"><label className="field-label">Deadline<input type="date" value={form.due} onChange={e => setForm({...form,due:e.target.value})}/></label><label className="field-label">Priority<select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select></label></div>
        <div className="form-row"><label className="field-label">Status<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label><label className="field-label">Choose an emoji<select value={form.emoji} onChange={e => setForm({...form,emoji:e.target.value})}>{["📚","💻","🧠","🎨","✍️","☁️","🧪","🎯","🌱","⭐","📝","🎓"].map(em => <option key={em}>{em}</option>)}</select></label></div>
        <div className="form-tip">💡 Future you will be proud that you started.</div><div className="modal-actions"><button type="button" className="soft-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" type="submit"><Check size={17}/>{editing ? "Save changes" : "Create task"} ✨</button></div>
      </form></div>}
      {toast && <div className="toast"><div className="toast-icon">🎉</div><div><b>StudyBuddy says...</b><p>{toast}</p></div><button onClick={() => setToast("")} aria-label="Dismiss"><X size={16}/></button><div className="toast-sparkle">✨</div></div>}
    </div>
  );
}

function Stat({ icon, color, label, value, foot }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-info"><span>{label}</span><b>{value}</b><small>{foot}</small></div></div>;
}
function TaskCard({ task, onStatus, onEdit, onDelete }) {
  const next = task.status === "To Do" ? "In Progress" : task.status === "In Progress" ? "Completed" : "To Do";
  return <article className={`task-row ${task.status === "Completed" ? "task-complete" : ""}`}>
    <button className={`check-button ${task.status === "Completed" ? "checked" : ""}`} onClick={() => onStatus(task, task.status === "Completed" ? "To Do" : "Completed")} aria-label={task.status === "Completed" ? "Mark as to do" : "Mark completed"}>{task.status === "Completed" ? <Check size={16}/> : <Circle size={19}/>}</button>
    <div className="task-emoji">{task.emoji || "📚"}</div>
    <div className="task-details"><b>{task.title}</b><small>{task.subject || "Personal task"}</small><div className="task-meta"><span className={`priority priority-${task.priority.toLowerCase()}`}><Flag size={11}/>{task.priority}</span><span className={isPastDue(task) ? "due overdue" : "due"}><CalendarDays size={12}/>{prettyDate(task.due)}{isPastDue(task) ? " · Overdue!" : ""}</span></div></div>
    <select className={`status-select status-${task.status.toLowerCase().replace(" ","-")}`} value={task.status} onChange={e => onStatus(task,e.target.value)} aria-label="Task status">{statuses.map(s => <option key={s}>{s}</option>)}</select>
    <div className="task-actions"><button className="icon-button" onClick={() => onEdit(task)} aria-label="Edit task"><Pencil size={15}/></button><button className="icon-button delete-button" onClick={() => onDelete(task)} aria-label="Delete task"><Trash2 size={15}/></button></div>
  </article>;
}


export default App;
