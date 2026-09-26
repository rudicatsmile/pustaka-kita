"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  BookOpen,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bot,
  User,
  ExternalLink,
  ChevronDown,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  askAiLibrarianAction,
  AiLibrarianBookRecommendation,
} from "@/actions/ai-librarian";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  books?: AiLibrarianBookRecommendation[];
  suggestedQuestions?: string[];
  source?: "gemini_api" | "built_in_semantic_engine";
}

export function AiLibrarianChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "ai",
      text: "Halo! 👋 Saya adalah **PustakaKita Smart AI Librarian**. Ada topik buku yang sedang ingin Anda cari, atau butuh rekomendasi bacaan seru hari ini?",
      suggestedQuestions: [
        "Rekomendasi novel fiksi terbaik",
        "Buku pemrograman web pemula",
        "Berapa batas waktu pinjam & denda?",
        "Buku sains tentang fisika dan alam semesta",
      ],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: cleanText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await askAiLibrarianAction({ query: cleanText });
      if (res.success) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: res.message,
          books: res.recommendedBooks,
          suggestedQuestions: res.suggestedQuestions,
          source: res.source,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: "ai",
            text: res.message || "Maaf, terjadi kendala saat memproses jawaban. Silakan coba lagi.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-catch-${Date.now()}`,
          sender: "ai",
          text: "Maaf, koneksi ke asisten AI terganggu. Silakan periksa jaringan Anda.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-24 lg:bottom-6 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary via-teal-600 to-secondary p-3.5 sm:px-5 sm:py-3 text-white shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20"
            title="Tanya Pustakawan AI"
          >
            <div className="relative">
              <Sparkles className="h-5 w-5 animate-pulse text-amber-200" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
            </div>
            <span className="hidden sm:inline font-bold text-xs tracking-wide">
              Tanya Pustakawan AI
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-20 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-[420px] h-[550px] max-h-[85vh] rounded-3xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-border bg-gradient-to-r from-primary to-teal-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-white shadow-inner">
                <Bot className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-sm tracking-tight text-white">
                    Pustakawan AI
                  </span>
                  <Badge variant="outline" className="bg-white/10 border-white/30 text-amber-200 text-[9px] px-1.5 py-0 uppercase">
                    Cerdas
                  </Badge>
                </div>
                <p className="text-[11px] text-teal-100 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Rekomendasi Buku & Panduan Rak
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/20 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed space-y-2.5 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-card border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line text-xs font-normal">
                    {msg.text}
                  </p>

                  {/* Render Book Recommendations if present */}
                  {msg.books && msg.books.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Rekomendasi Koleksi di Perpustakaan:
                      </span>
                      <div className="space-y-2">
                        {msg.books.map((book) => (
                          <div
                            key={book.id}
                            className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="font-heading font-bold text-foreground text-xs leading-snug truncate">
                                {book.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {book.author} • {book.category}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                  <MapPin className="h-3 w-3" />
                                  {book.shelfLocation}
                                </span>
                                <Badge
                                  variant={book.availableCopies > 0 ? "success" : "destructive"}
                                  className="text-[9px] py-0 px-1.5"
                                >
                                  {book.availableCopies > 0
                                    ? `${book.availableCopies} Tersedia`
                                    : "Dipinjam"}
                                </Badge>
                              </div>
                            </div>
                            <Link href={`/katalog/${book.slug}`}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                title="Buka Detail Buku"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested prompt chips under latest AI message */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pl-2">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:text-primary hover:border-primary/50 transition-all text-left shadow-sm active:scale-95"
                      >
                        💡 {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground p-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                </div>
                <span className="text-[11px] animate-pulse">
                  Pustakawan AI sedang mencari buku terbaik di database...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 border-t border-border bg-card flex items-center gap-2"
          >
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanya rekomendasi, materi, atau aturan rak..."
              className="h-10 text-xs rounded-xl bg-muted/30 border-border focus:border-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-sm active:scale-95"
              title="Kirim Pesan"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
