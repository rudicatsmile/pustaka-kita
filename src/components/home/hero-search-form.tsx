"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSearchForm() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/katalog");
    }
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-col sm:flex-row items-center gap-2.5 max-w-xl mx-auto lg:mx-0 p-2 rounded-2xl bg-card border-2 border-primary/20 shadow-lg focus-within:border-primary transition-all"
    >
      <div className="relative flex-1 w-full flex items-center pl-3">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ketik judul buku, nama penulis, atau topik..."
          className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto rounded-xl font-bold shrink-0">
        Cari di Katalog
      </Button>
    </form>
  );
}
