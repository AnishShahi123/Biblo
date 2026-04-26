import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book } from '@/lib/api';
import { fetchBooks } from '@/lib/api';
import { SearchBar } from '@/components/SearchBar';
import { BookCard } from '@/components/BookCard';
import { useBookStore } from '@/store/useBookStore';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { searchQuery } = useBookStore();
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    setPage(1);
    loadBooks(1, debouncedSearch, true);
  }, [debouncedSearch]);

  const loadBooks = async (pageNum: number, query: string, reset: boolean = false) => {
    setLoading(true);
    try {
      const data = await fetchBooks(query, pageNum);
      if (reset) {
        setBooks(data.results);
      } else {
        setBooks((prev) => [...prev, ...data.results]);
      }
      setHasMore(!!data.next);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadBooks(nextPage, debouncedSearch);
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24"
    >
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80')] bg-cover bg-center"
          />
        </div>

        <header className="relative z-20 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
          >
            <h1 className="text-8xl md:text-9xl font-bold mb-6 font-serif tracking-tighter text-primary">
              Biblo
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-xl leading-relaxed font-light tracking-wide italic">
              "A room without books is like a body without a soul."
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 glass rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto"
          >
            <SearchBar />
          </motion.div>
        </header>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12 px-2">
          <h2 className="text-2xl font-serif font-bold tracking-tight">Featured Collection</h2>
          <div className="h-[1px] flex-1 mx-8 bg-border/50 hidden md:block" />
          <p className="text-sm font-sans font-bold tracking-widest text-muted-foreground uppercase">
            {books.length} VOLUMES
          </p>
        </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
        <AnimatePresence mode="popLayout">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        </div>
      )}

      {!loading && hasMore && (
        <div className="mt-24 text-center">
          <Button 
            onClick={handleLoadMore} 
            variant="ghost"
            size="lg" 
            className="rounded-full px-16 border border-border hover:bg-primary hover:text-primary-foreground transition-all duration-500 font-bold tracking-widest text-xs h-16 group"
          >
            DISCOVER MORE 
            <motion.span 
              className="ml-2 inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </Button>
        </div>
      )}
      </div>
    </motion.main>
  );
}
