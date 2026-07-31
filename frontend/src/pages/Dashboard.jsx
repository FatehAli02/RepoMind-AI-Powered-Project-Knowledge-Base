import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  LogOut,
  Box,
  Send,
  FileText,
  X,
  Loader2,
  FolderGit2,
  UploadCloud,
  Menu
} from "lucide-react";
import { api } from "../lib/api";
import ConfirmModal from "../components/ConfirmModal";
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);

  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docPanelOpen, setDocPanelOpen] = useState(false);
  const [highlightedDocId, setHighlightedDocId] = useState(null);
  const [expandedSource, setExpandedSource] = useState(null); 

  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [asking, setAsking] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [pageError, setPageError] = useState("");
  const chatEndRef = useRef(null);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects(selectId) {
    setProjectsLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data || []);
      if (selectId) {
        const match = (data || []).find((p) => p.id === selectId);
        if (match) setActiveProject(match);
      }
    } catch (err) {
      setPageError(err.message);
    } finally {
      setProjectsLoading(false);
    }
  }

  useEffect(() => {
    if (!activeProject) {
      setDocuments([]);
      setMessages([]);
      return;
    }
    loadDocuments(activeProject.id);
    loadHistory(activeProject.id);
  }, [activeProject?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  async function loadDocuments(projectId) {
    try {
      const data = await api.getDocuments(projectId);
      setDocuments(data || []);
    } catch (err) {
      setPageError(err.message);
    }
  }

  async function loadHistory(projectId) {
    setHistoryLoading(true);
    try {
      const data = await api.getHistory(projectId);
      const asMessages = (data || []).flatMap((item) => [
        { role: "user", content: item.question },
        { role: "ai", content: item.answer, sources: item.sources || [] },
      ]);
      setMessages(asMessages);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;
    try {
      const created = await api.createProject(name);
      setNewProjectName("");
      setCreatingProject(false);
      await loadProjects(created.id);
    } catch (err) {
      setPageError(err.message);
    }
  }

  function askDeleteProject(project) {
    setConfirmTarget({ type: "project", id: project.id, label: project.name });
  }

  function askDeleteDocument(doc, label) {
    setConfirmTarget({ type: "document", id: doc.id, label });
  }

  async function handleConfirmDelete() {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      if (confirmTarget.type === "project") {
        await api.deleteProject(confirmTarget.id);
        if (activeProject?.id === confirmTarget.id) setActiveProject(null);
        await loadProjects();
      } else {
        await api.deleteDocument(confirmTarget.id);
        setDocuments((docs) => docs.filter((d) => d.id !== confirmTarget.id));
      }
      setConfirmTarget(null);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setConfirmLoading(false);
    }
  }

  function handleFileChange(e) {
    setSelectedFile(e.target.files?.[0] || null);
  }

  async function handleUpload() {
    if (!selectedFile || !activeProject) return;
    setUploading(true);
    try {
      await api.uploadDocument(activeProject.id, selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadDocuments(activeProject.id);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q || !activeProject || asking) return;

    setMessages((m) => [...m, { role: "user", content: q }]);
    setQuery("");
    setAsking(true);
    try {
      const res = await api.ask(activeProject.id, q);
      setMessages((m) => [
        ...m,
        { role: "ai", content: res.answer, sources: res.sources || [] },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "ai", content: `Couldn't get an answer. ${err.message}`, error: true },
      ]);
    } finally {
      setAsking(false);
    }
  }

  function openSourceDocument(filename) {
    const match = documents.find((d) => d.title === filename);
    setHighlightedDocId(match ? match.id : null);
    setDocPanelOpen(true);
    if (match) {
      setTimeout(() => setHighlightedDocId(null), 2500);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/auth");
  }

  return (
    <div className="h-screen w-full bg-[#15171C] text-[#E8E8E6] flex overflow-hidden">
      {/* ---------------- Sidebar ---------------- */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-[#111319] border-r border-white/[0.06] flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30 flex items-center justify-center">
            <Box size={16} className="text-[#4ADE80]" />
          </div>
          <span className="font-mono text-base font-semibold tracking-tight text-[#E8E8E6]">
            RepoMind
          </span>
        </div>

        <div className="px-3 pt-3">
          {creatingProject ? (
            <form onSubmit={handleCreateProject} className="flex items-center gap-1.5">
              <input
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setCreatingProject(false);
                    setNewProjectName("");
                  }
                }}
                placeholder="e.g. payments-service"
                className="flex-1 bg-[#1B1E25] border border-[#4ADE80]/40 rounded-md px-2.5 py-1.5 text-sm font-mono outline-none placeholder:text-[#5A6070]"
              />
              <button
                type="submit"
                className="text-[#4ADE80] hover:bg-[#4ADE80]/10 rounded-md p-1.5"
                aria-label="Create project"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatingProject(false);
                  setNewProjectName("");
                }}
                className="text-[#5A6070] hover:bg-white/5 rounded-md p-1.5"
                aria-label="Cancel"
              >
                <X size={14} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setCreatingProject(true)}
              className="w-full flex items-center gap-2 text-sm text-[#8B92A0] hover:text-[#E8E8E6] border border-white/[0.08] hover:border-white/20 rounded-md px-2.5 py-1.5 transition-colors"
            >
              <Plus size={14} />
              New project
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {projectsLoading ? (
            <div className="flex items-center gap-2 text-xs text-[#5A6070] px-2.5 py-2">
              <Loader2 size={12} className="animate-spin" />
              Loading your projects…
            </div>
          ) : projects.length === 0 ? (
            <p className="text-xs text-[#5A6070] px-2.5 py-2 leading-relaxed">
              No projects yet. Create one to get started.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => {setActiveProject(project);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 cursor-pointer transition-colors ${
                  activeProject?.id === project.id
                    ? "bg-[#1E222B] text-[#E8E8E6]"
                    : "text-[#8B92A0] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderGit2
                    size={13}
                    className={
                      activeProject?.id === project.id ? "text-[#4ADE80]" : "text-[#5A6070]"
                    }
                  />
                  <span className="text-sm truncate">{project.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    askDeleteProject(project);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[#5A6070] hover:text-[#F5A524] transition-opacity shrink-0"
                  aria-label={`Delete ${project.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-[#8B92A0] hover:text-[#F5A524] px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---------------- Main workspace ---------------- */}
      <main className="flex-1 flex flex-col min-w-0">
        {!activeProject ? (
          <>
  <div className="md:hidden flex items-center h-14 border-b border-white/[0.06] px-4 shrink-0">
    <button
      onClick={() => setSidebarOpen(true)}
      className="text-[#8B92A0] hover:text-[#E8E8E6]"
      aria-label="Open menu"
    >
      <Menu size={18} />
    </button>
  </div>
  <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-4">
              <FolderGit2 size={20} className="text-[#5A6070]" />
            </div>
            <h2 className="text-base font-medium mb-1">Select a project</h2>
            <p className="text-sm text-[#8B92A0] max-w-xs">
              Choose a project from the sidebar, or create a new one to get
              started.
            </p>
          </div></>
        ) : (
          <>
            {/* Header */}
            <header className="h-14 shrink-0 border-b border-white/[0.06] flex items-center justify-between px-5">
              <div className="min-w-0">
                <h1 className="text-sm font-semibold truncate">
                  {activeProject.name}
                </h1>
                <p className="text-xs text-[#5A6070]">
                  {documents.length === 0
                    ? "No documents added yet"
                    : `${documents.length} document${documents.length === 1 ? "" : "s"} added`}
                </p>
              </div>
              
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-[#8B92A0] hover:text-[#E8E8E6] mr-3"
                aria-label="Open menu"
                >
                <Menu size={18} />
                </button>

              <button
                onClick={() => setDocPanelOpen(true)}
                className="flex items-center gap-1.5 text-sm text-[#8B92A0] hover:text-[#E8E8E6] border border-white/[0.08] hover:border-white/20 rounded-md px-3 py-1.5 transition-colors"
              >
                <FileText size={14} />
                <span className="hidden sm:inline">Documents</span>
                {documents.length > 0 && (
                  <span className="text-xs font-mono bg-white/[0.06] rounded-full px-1.5 py-0.5">
                    {documents.length}
                  </span>
                )}
              </button>
            </header>

            {/* Chat stream */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="max-w-2xl mx-auto space-y-5">
                {historyLoading ? (
                  <div className="flex items-center gap-2 text-xs text-[#5A6070] justify-center">
                    <Loader2 size={12} className="animate-spin" />
                    Loading your conversation…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-[#5A6070] mt-16 leading-relaxed">
                    Add a document, then ask anything about it.
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#4ADE80] text-[#0B0D10]"
                            : msg.error
                            ? "bg-[#F5A524]/10 border border-[#F5A524]/25 text-[#E8E8E6]"
                            : "bg-[#1B1E25] border border-white/[0.06] text-[#E8E8E6]"
                        }`}
                      >
                        {msg.role === "ai" ? (
                          <div className="prose prose-invert max-w-none text-sm overflow-hidden break-words">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-[#15171C] font-medium">{msg.content}</p>
                        )}
                        {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/[0.06] flex flex-col gap-1.5">
                            {msg.sources.map((src, si) => {
                              const key = `${i}-${si}`;
                              const isOpen = expandedSource === key;
                              return (
                                <div key={key}>
                                  <button
                                    onClick={() =>
                                      setExpandedSource(isOpen ? null : key)
                                    }
                                    className="flex items-center gap-1.5 font-mono text-[11px] text-[#4ADE80]/90 hover:text-[#4ADE80]"
                                  >
                                    <FileText size={11} />
                                    {src.filename}
                                  </button>
                                  {isOpen && (
                                    <div className="mt-1.5 bg-black/20 border border-white/[0.06] rounded-md px-2.5 py-2">
                                      <p className="text-xs text-[#8B92A0] font-mono leading-relaxed whitespace-pre-wrap">
                                        {src.snippet}
                                      </p>
                                      <button
                                        onClick={() => openSourceDocument(src.filename)}
                                        className="mt-1.5 text-[11px] text-[#4ADE80]/90 hover:text-[#4ADE80] hover:underline"
                                      >
                                        View file →
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {asking && (
                  <div className="flex justify-start">
                    <div className="bg-[#1B1E25] border border-white/[0.06] rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm text-[#8B92A0]">
                      <Loader2 size={13} className="animate-spin" />
                      Thinking…
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Query input */}
            <form
              onSubmit={handleAsk}
              className="shrink-0 border-t border-white/[0.06] px-5 py-4"
            >
              <div className="max-w-2xl mx-auto flex items-center gap-2 bg-[#1B1E25] border border-white/[0.08] focus-within:border-[#4ADE80]/40 rounded-lg px-3 py-2 transition-colors">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about this codebase…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5A6070]"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || asking}
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-[#4ADE80] text-[#0B0D10] hover:bg-[#3fce70] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      {/* ---------------- Documents drawer ---------------- */}
      {docPanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setDocPanelOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-[#15171C] border-l border-white/[0.08] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06] shrink-0">
              <h2 className="text-sm font-semibold">Documents</h2>
              <button
                onClick={() => setDocPanelOpen(false)}
                className="text-[#5A6070] hover:text-[#E8E8E6] p-1 rounded-md hover:bg-white/[0.06]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Upload area */}
            <div className="p-5 border-b border-white/[0.06] shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="doc-upload-input"
              />
              <label
                htmlFor="doc-upload-input"
                className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/15 hover:border-[#4ADE80]/40 rounded-lg py-6 cursor-pointer transition-colors text-center"
              >
                <UploadCloud size={20} className="text-[#5A6070]" />
                <span className="text-sm text-[#8B92A0]">
                  {selectedFile ? selectedFile.name : "Choose a file to add"}
                </span>
                <span className="text-xs text-[#5A6070]">
                  Markdown, TXT or code files
                </span>
              </label>

              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 text-sm font-medium bg-[#4ADE80] text-[#0B0D10] rounded-md py-2 hover:bg-[#3fce70] transition-colors disabled:opacity-60"
                >
                  {uploading && <Loader2 size={14} className="animate-spin" />}
                  {uploading ? "Adding document…" : "Add document"}
                </button>
              )}
            </div>

            {/* Document list */}
            <div className="flex-1 overflow-y-auto p-5">
              {documents.length === 0 ? (
                <p className="text-sm text-[#5A6070] text-center mt-8 leading-relaxed">
                  Nothing here yet. Add a document above to start asking
                  questions about it.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const label = doc.title || `document-${doc.id}`;
                    const isHighlighted = doc.id === highlightedDocId;
                    return (
                      <div
                        key={doc.id}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 border transition-colors ${
                          isHighlighted
                            ? "bg-[#4ADE80]/10 border-[#4ADE80]/50"
                            : "bg-white/[0.03] border-white/[0.06]"
                        }`}
                      >
                        <FileText
                          size={15}
                          className={`shrink-0 ${isHighlighted ? "text-[#4ADE80]" : "text-[#5A6070]"}`}
                        />
                        <span className="flex-1 text-sm truncate" title={label}>
                          {label}
                        </span>
                        <button
                          onClick={() => askDeleteDocument(doc, label)}
                          className="text-[#5A6070] hover:text-[#F5A524] shrink-0"
                          aria-label={`Delete ${label}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        open={!!confirmTarget}
        title={
          confirmTarget?.type === "project"
            ? "Delete this project?"
            : "Delete this document?"
        }
        description={
          confirmTarget?.type === "project"
            ? `This removes "${confirmTarget?.label}" along with all its documents and chat history. This can't be undone.`
            : `"${confirmTarget?.label}" will be removed from this project's knowledge base. This can't be undone.`
        }
        confirmLabel="Delete"
        loading={confirmLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />

      {/* Global error toast */}
      {pageError && (
        <div className="fixed bottom-5 left-4 right-4 md:left-auto md:right-5 max-w-sm md:mx-0 mx-auto bg-[#1B1E25] border border-[#F5A524]/30 rounded-lg px-4 py-3 shadow-lg flex items-start gap-2 z-50">
          <p className="text-sm text-[#E8E8E6] flex-1">{pageError}</p>
          <button
            onClick={() => setPageError("")}
            className="text-[#5A6070] hover:text-[#E8E8E6]"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
