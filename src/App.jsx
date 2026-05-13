import { useState, useEffect } from "react";
import "./App.css";

function Header({ title, subtitle }) {
  return (
    <header className="app-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

function BookCard({ book, onDelete, onUpdate }) {
  // 编辑模式开关
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);
  const [editGenre, setEditGenre] = useState(book.genre);
  const [editNote, setEditNote] = useState(book.note);

  // ===== 概念：条件渲染 =====
  // editing 为 true 时显示表单，否则显示内容
  if (editing) {
    return (
      <div className="book-card editing">
        <div className="edit-form">
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
          <div className="edit-row">
            <select value={editGenre} onChange={(e) => setEditGenre(e.target.value)}>
              <option>历史</option><option>哲学</option><option>小说</option>
              <option>科技</option><option>其他</option>
            </select>
          </div>
          <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows="2" />
          <div className="edit-actions">
            <button onClick={() => {
              onUpdate(book.id, { title: editTitle, author: editAuthor, genre: editGenre, note: editNote });
              setEditing(false);
            }}>保存</button>
            <button className="cancel-btn" onClick={() => {
              setEditTitle(book.title);
              setEditAuthor(book.author);
              setEditGenre(book.genre);
              setEditNote(book.note);
              setEditing(false);
            }}>取消</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-card">
      <div className="book-info">
        <h3>{book.title}</h3>
        <span className="book-author">{book.author}</span>
        <span className="book-tag">{book.genre}</span>
      </div>
      {book.note && <p className="book-note">{book.note}</p>}
      <div className="card-actions">
        <button className="edit-btn" onClick={() => {
          setEditTitle(book.title);
          setEditAuthor(book.author);
          setEditGenre(book.genre);
          setEditNote(book.note);
          setEditing(true);
        }}>编辑</button>
        <button className="delete-btn" onClick={() => onDelete(book.id)}>删除</button>
      </div>
    </div>
  );
}

function App() {
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem("books");
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("历史");
  const [note, setNote] = useState("");

  // 搜索 & 筛选
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("全部");

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  // ===== 概念：派生状态 — 不存 state，从 books 计算出来 =====
  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title.includes(search) || b.author.includes(search);
    const matchGenre = filterGenre === "全部" || b.genre === filterGenre;
    return matchSearch && matchGenre;
  });

  const addBook = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    setBooks([{ id: Date.now(), title: title.trim(), author: author.trim(), genre, note: note.trim() }, ...books]);
    setTitle("");
    setAuthor("");
    setNote("");
  };

  const deleteBook = (id) => {
    setBooks(books.filter((b) => b.id !== id));
  };

  const updateBook = (id, updates) => {
    setBooks(books.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const genres = [...new Set(books.map((b) => b.genre))]; // 从数据里提取所有分类

  return (
    <div className="app">
      <Header title="我的读书笔记" subtitle="读过的书、写下的想法，都记在这里" />

      <form className="book-form" onSubmit={addBook}>
        <div className="form-row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="书名" required />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="作者" required />
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option>历史</option><option>哲学</option><option>小说</option>
            <option>科技</option><option>其他</option>
          </select>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="写点笔记..." rows="2" />
        <button type="submit">添加</button>
      </form>

      {/* 搜索栏 */}
      {books.length > 0 && (
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
