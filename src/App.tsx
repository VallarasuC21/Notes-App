import React, { useState, useContext, createContext } from "react";

// Type for a note
interface Note {
  id: number;
  title: string;
  content: string;
}

// Context for managing notes
const NotesContext = createContext<{
  notes: Note[];
  addNote: (note: Note) => void;
  editNote: (id: number, updatedNote: Note) => void;
  deleteNote: (id: number) => void;
} | null>(null);

// Context Provider
const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  const addNote = (note: Note) => setNotes([...notes, note]);
  const editNote = (id: number, updatedNote: Note) =>
    setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
  const deleteNote = (id: number) => setNotes(notes.filter((note) => note.id !== id));

  return (
    <NotesContext.Provider value={{ notes, addNote, editNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
};

// Custom Hook for accessing Notes Context
const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider");
  return context;
};

// Main App Component
const App: React.FC = () => {
  const { notes, addNote, editNote, deleteNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState("");
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedContent, setEditedContent] = useState<string>("");

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
    };

    addNote(note);
    setNewNote({ title: "", content: "" });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditedTitle(note.title);
    setEditedContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editedTitle.trim() || !editedContent.trim()) return;

    const updatedNote: Note = {
      id: editingNote?.id || Date.now(),
      title: editedTitle,
      content: editedContent,
    };

    editNote(editingNote?.id || 0, updatedNote);
    setEditingNote(null);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  // Filter notes based on the search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <h1>Notes App</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Note Form */}
      <div className="note-form">
        <input
          className="form-input"
          type="text"
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
        />
        <textarea
          className="form-textarea"
          placeholder="Content"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        ></textarea>
        <button
          className="form-button"
          onClick={handleAddNote}
        >
          Add Note
        </button>
      </div>

      {/* Show "No results found" only when there is a search term and no notes match */}
      {searchTerm && filteredNotes.length === 0 && (
        <p className="no-results">No results found</p>
      )}

      {/* Notes List */}
      {filteredNotes.map((note) => (
        <div className="note" key={note.id}>
          {/* Editing or Viewing */}
          {editingNote?.id === note.id ? (
            <div className="edit-mode">
              <input
                className="form-input"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <textarea
                className="form-textarea"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              ></textarea>
              <button className="form-button" onClick={handleSaveEdit}>
                Save
              </button>
              <button className="form-button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="view-mode">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <button className="edit" onClick={() => handleEditNote(note)}>
                Edit
              </button>
              <button className="delete" onClick={() => deleteNote(note.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// App Wrapper with Context Provider
const NotesApp: React.FC = () => (
  <NotesProvider>
    <App />
  </NotesProvider>
);

export default NotesApp;