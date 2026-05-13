import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import "./App.css";

const STATUS_OPTIONS = ["想读", "在读", "已读"];
const GENRE_OPTIONS = ["历史", "哲学", "小说", "科技", "其他"];

function Header({ title, subtitle, theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button className="theme-toggle" onClick={onToggleTheme}>
        {theme === "dark" ? "切换到浅色" : "切换到深色"}
      </button>
    </header>
  );
}

function BookCard({ book, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);
  const [editGenre, setEditGenre] = useState(book.genre);
  const [editNote, setEditNote] = useState(book.note);
  const [editStatus, setEditStatus] = useState(book.status);

  if (editing) {
    return (
      <div className="book-card editing">
        <div className="edit-form">
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
          <div className="edit-row">
            <select value={editGenre} onChange={(e) => setEditGenre(e.target.value)}>
              {GENRE_OPTIONS.map((g) => (<option key={g}>{g}</option>))}
            </select>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (<option key={s}>{s}</option>))}
            </select>
          </div>
          <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows="2" />
          <div className="edit-actions">
            <button onClick={() => {
              onUpdate(book.id, { title: editTitle, author: editAuthor, genre: editGenre, note: editNote, status: editStatus });
              setEditing(false);
            }}>保存</button>
            <button className="cancel-btn" onClick={() => {
              setEditTitle(book.title); setEditAuthor(book.author);
              setEditGenre(book.genre); setEditNote(book.note);
              setEditStatus(book.status); setEditing(false);
            }}>取消</button>
          </div>
        </div>
      </div>
    );
  }

  const statusClass = book.status === "已读" ? "done" : book.status === "在读" ? "reading" : "";

  return (
    <div className="book-card">
      <div className="book-info">
        <h3>{book.title}</h3>
        <span className="book-author">{book.author}</span>
        <span className="book-tag">{book.genre}</span>
      </div>
      <span className={`status-badge ${statusClass}`}>{book.status}</span>
      {book.note && <p className="book-note">{book.note}</p>}
      <div className="card-actions">
        <button className="edit-btn" onClick={() => {
          setEditTitle(book.title); setEditAuthor(book.author);
          setEditGenre(book.genre); setEditNote(book.note);
          setEditStatus(book.status); setEditing(true);
        }}>编辑</button>
        <button className="delete-btn" onClick={() => onDelete(book.id)}>删除</button>
      </div>
    </div>
  );
}

function App() {
  // ===== 自定义 Hook：一行替代 useState + useEffect + localStorage =====
  const [books, setBooks] = useLocalStorage("books", []);
  const [theme, setTheme] = useLocalStorage("theme", "dark");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("历史");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("想读");

  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("全部");
  const [filterStatus, setFilterStatus] = useState("全部");

  // 把 theme 设到 <body> 上，CSS 变量自动切换
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // 三层派生：状态 → 分类 → 搜索
  const filteredBooks = books.filter((b) => {
    const matchSearch = b.title.includes(search) || b.author.includes(search);
    const matchGenre = filterGenre === "全部" || b.genre === filterGenre;
    const matchStatus = filterStatus === "全部" || b.status === filterStatus;
    return matchSearch && matchGenre && matchStatus;
  });

  const addBook = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    setBooks([{
      id: Date.now(), title: title.trim(), author: author.trim(),
      genre, note: note.trim(), status,
    }, ...books]);
    setTitle("");
    setAuthor("");
    setNote("");
    setStatus("想读");
  };

  const deleteBook = (id) => setBooks(books.filter((b) => b.id !== id));
  const updateBook = (id, updates) => setBooks(books.map((b) => (b.id === id ? { ...b, ...updates } : b)));

  const genres = [...new Set(books.map((b) => b.genre))];

  return (
    <div className="app">
      <Header
        title="我的读书笔记"
        subtitle="读过的书、写下的想法，都记在这里"
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <form className="book-form" onSubmit={addBook}>
        <div className="form-row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="书名" required />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="作者" required />
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {GENRE_OPTIONS.map((g) => (<option key={g}>{g}</option>))}
          </select>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="写点笔记..." rows="2" />
        <div className="form-row">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (<option key={s}>{s}</option>))}
          </select>
          <button type="submit">添加</button>
        </div>
      </form>

      {books.length > 0 && (
        <>
          <div className="toolbar">
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索书名或作者..."
            />
            <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
              <option>全部</option>
              {genres.map((g) => (<option key={g}>{g}</option>))}
            </select>
          </div>

          {/* 阅读状态 Tab */}
          <div className="status-tabs">
            {["全部", ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                className={`tab-btn ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="count-hint">
        {books.length === 0 ? "" : `共 ${books.length} 本，筛选出 ${filteredBooks.length} 本`}
      </p>

      {books.length === 0 ? (
        <p className="empty-hint">还没添加书，在上方加一本吧</p>
      ) : filteredBooks.length === 0 ? (
        <p className="empty-hint">没有匹配的书</p>
      ) : (
        <div className="book-list">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onDelete={deleteBook} onUpdate={updateBook} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
