import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Book } from '@/lib/api';
import { fetchBookById, fetchBookContent } from '@/lib/api';
import { paginateTextDynamic } from '@/lib/pagination';
import { PageFlip } from '@/components/PageFlip';
import { Button } from '@/components/ui/button';
import { useBookStore } from '@/store/useBookStore';
import { ChevronLeft, ChevronRight, X, Bookmark, Loader2 } from 'lucide-react';

export default function ReaderView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginating, setPaginating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { setBookmark, getBookmark } = useBookStore();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePagination = useCallback(async (content: string) => {
    setPaginating(true);
    const result = await paginateTextDynamic(content, {
      containerWidth: 520, // Premium wider page
      containerHeight: 740,
      fontSize: '18px',
      lineHeight: '1.8',
      fontFamily: "'Merriweather', Georgia, serif",
      padding: '80px'
    });
    setPages(result);
    setPaginating(false);

    if (id) {
      const savedPage = getBookmark(Number(id));
      if (savedPage < result.length) {
        setCurrentIndex(savedPage % 2 === 0 ? savedPage : savedPage - 1);
      }
    }
  }, [id, getBookmark]);

  useEffect(() => {
    if (id) {
      const bookId = Number(id);
      fetchBookById(bookId).then(async (bookData) => {
        setBook(bookData);
        try {
          const content = await fetchBookContent(bookData);
          await handlePagination(content);
        } catch (err) {
          console.error(err);
          setPages(["Error loading book content. Please try another format."]);
        } finally {
          setLoading(false);
        }
      });
    }
  }, [id, handlePagination]);

  const goToPage = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < pages.length) {
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentIndex(newIndex);
      if (id) setBookmark(Number(id), newIndex);
    }
  }, [currentIndex, pages.length, id, setBookmark]);

  const step = isMobile ? 1 : 2;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToPage(currentIndex + step);
      if (e.key === 'ArrowLeft') goToPage(currentIndex - step);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goToPage]);

  if (loading || paginating) {
    return (
      <div className="fixed inset-0 bg-[#f4efe6] flex flex-col items-center justify-center p-8 gap-6">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
        </div>
        <p className="text-primary/60 font-serif italic tracking-wide animate-pulse">
          {paginating ? "Paginating manuscript..." : "Preparing your library..."}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#dfd9ce] dark:bg-zinc-950 flex flex-col overflow-hidden select-none font-sans">
      {/* Premium Vignette Background */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/5" />

      {/* Header */}
      <header className="h-20 glass flex items-center justify-between px-12 z-50 fixed top-0 w-full">
        <div className="flex items-center gap-8">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-primary/5 rounded-full transition-all duration-500"
          >
            <X className="h-5 w-5 text-primary/60" />
          </motion.button>
          <div className="hidden md:block">
            <h1 className="font-serif text-lg font-black text-primary tracking-tight line-clamp-1">
              {book?.title}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent font-black mt-1">
              {book?.authors[0]?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-black tracking-[0.3em] text-muted-foreground mb-1">
              {Math.round(((currentIndex + (isMobile ? 1 : 2)) / pages.length) * 100)}% READ
            </div>
            <div className="w-32 h-1 bg-primary/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + (isMobile ? 1 : 2)) / pages.length) * 100}%` }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-3 rounded-none hover:bg-primary hover:text-primary-foreground px-6 h-10 border border-primary/10 transition-all duration-500">
            <Bookmark className="h-4 w-4" />
            <span className="text-[10px] font-black tracking-widest">BOOKMARK</span>
          </Button>
        </div>
      </header>

      {/* Reader Body */}
      <main className="flex-1 relative flex items-center justify-center p-6 lg:p-12 mt-12 mb-12">
        <div
          className="relative w-full max-w-[1200px] h-full max-h-[850px] grid md:grid-cols-2 rounded-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-zinc-900 dark:bg-black p-1.5 transition-all duration-1000 ease-out"
        >
          {/* Realistic Page Stack Effect */}
          <div className="absolute -bottom-4 inset-x-8 h-8 bg-white/30 rounded-b-2xl -z-10 blur-[2px]" />
          <div className="absolute -bottom-8 inset-x-16 h-8 bg-white/10 rounded-b-3xl -z-20 blur-[4px]" />

          {/* Spine Shadow Layer */}
          <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 bg-gradient-to-r from-black/30 via-black/60 to-black/30 z-40 pointer-events-none rounded-full blur-[4px]" />

          {/* Left Page */}
          <div className="hidden md:block h-full relative border-r border-black/10 overflow-hidden bg-[#f4efe6] rounded-l-lg">
            <PageFlip
              side="left"
              pageIndex={currentIndex}
              direction={direction}
              isActive={direction === -1}
              onSwipeNext={() => goToPage(currentIndex + step)}
              onSwipePrev={() => goToPage(currentIndex - step)}
              onClick={() => goToPage(currentIndex - step)}
              dragDisabled={currentIndex === 0}
            >
              {pages[currentIndex] || ""}
            </PageFlip>
          </div>

          {/* Right Page */}
          <div className="h-full relative overflow-hidden bg-[#f4efe6] rounded-r-lg">
            <PageFlip
              side="right"
              pageIndex={isMobile ? currentIndex : currentIndex + 1}
              direction={direction}
              isActive={direction === 1}
              onSwipeNext={() => goToPage(currentIndex + step)}
              onSwipePrev={() => goToPage(currentIndex - step)}
              onClick={() => goToPage(currentIndex + step)}
              dragDisabled={isMobile ? currentIndex >= pages.length - 1 : currentIndex + 1 >= pages.length - 1}
            >
              {pages[isMobile ? currentIndex : currentIndex + 1] || ""}
            </PageFlip>
          </div>

          {/* Floating Side-by-Side Navigation */}
          <div className="absolute -left-24 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col items-center gap-2 group">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentIndex - step)}
              disabled={currentIndex === 0}
              className="h-16 w-16 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm transition-all shadow-sm"
            >
              <ChevronLeft className="h-10 w-10 text-black/40" />
            </Button>
            <span className="text-[10px] font-bold text-black/20 tracking-widest uppercase">Prev Page</span>
          </div>

          <div className="absolute -right-24 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col items-center gap-2 group">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentIndex + step)}
              disabled={isMobile ? currentIndex >= pages.length - 1 : currentIndex >= pages.length - 2}
              className="h-16 w-16 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm transition-all shadow-sm"
            >
              <ChevronRight className="h-10 w-10 text-black/40" />
            </Button>
            <span className="text-[10px] font-bold text-black/20 tracking-widest uppercase">Next Page</span>
          </div>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-20 glass flex items-center justify-between px-16 fixed bottom-0 w-full z-50">
        <div className="flex items-center gap-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentIndex - step)}
            disabled={currentIndex === 0}
            className="group gap-3 text-[10px] font-black tracking-[0.3em] text-primary/60 hover:text-primary transition-all duration-500"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            ANTERIOR
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black tracking-[0.5em] text-accent">
            VOLUME I
          </span>
          <div className="h-1 w-1 rounded-full bg-primary/20" />
          <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">
            PAGE {currentIndex + 1} OF {pages.length}
          </span>
        </div>

        <div className="flex items-center gap-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentIndex + step)}
            disabled={isMobile ? currentIndex >= pages.length - 1 : currentIndex >= pages.length - 2}
            className="group gap-3 text-[10px] font-black tracking-[0.3em] text-primary/60 hover:text-primary transition-all duration-500"
          >
            SUIXANT
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
