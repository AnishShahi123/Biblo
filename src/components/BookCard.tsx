import { Link } from 'react-router-dom';
import type { Book } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const coverUrl = book.formats['image/jpeg'];
  const authorName = book.authors[0]?.name || 'Unknown Author';

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden border-none bg-transparent group cursor-pointer shadow-none">
        <Link to={`/book/${book.id}`}>
          <div className="aspect-[2/3] overflow-hidden relative rounded-r-lg rounded-l-sm shadow-xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.4)] group-hover:rotate-y-[-5deg] perspective-[1000px]">
            {/* Book Spine Simulation */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 via-black/5 to-transparent z-10" />
            
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center text-muted-foreground italic text-center p-6 text-sm font-serif">
                {book.title}
              </div>
            )}
            
            {/* Texture Overlay */}
            <div className="absolute inset-0 paper-texture opacity-10 pointer-events-none" />
            
            {/* Subtle Gradient Fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                className="text-white font-bold text-[10px] tracking-[0.3em] bg-primary/80 backdrop-blur-md px-6 py-3 rounded-none border border-white/20 shadow-2xl"
              >
                VIEW DETAIL
              </motion.div>
            </div>
          </div>
        </Link>
        
        <CardContent className="px-0 py-6">
          <h3 className="font-serif font-bold text-base leading-snug text-primary line-clamp-2 mb-2 group-hover:text-accent transition-colors duration-300">
            {book.title}
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
            {authorName}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
