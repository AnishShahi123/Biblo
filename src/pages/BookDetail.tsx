import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Book } from '@/lib/api';
import { fetchBookById } from '@/lib/api';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, BookOpen, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBookById(Number(id))
        .then(setBook)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid md:grid-cols-3 gap-12">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-4 pt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) return <div className="text-center py-20">Book not found.</div>;

  const coverUrl = book.formats['image/jpeg'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/">
        <Button variant="ghost" className="mb-8 gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Browse
        </Button>
      </Link>

      <div className="grid md:grid-cols-3 gap-12 items-start">
        <div className="relative group">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="aspect-[2/3] w-full bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
              No Cover
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {book.title}
          </h1>
          <p className="text-xl text-primary mb-8 font-medium">
            {book.authors.map(a => a.name).join(', ')}
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link to={`/read/${book.id}`}>
              <Button size="lg" className="gap-2 rounded-full px-8 shadow-lg shadow-primary/20">
                <BookOpen className="h-5 w-5" />
                Read Now
              </Button>
            </Link>
            <a 
              href={book.formats['text/plain; charset=utf-8'] || Object.values(book.formats)[0]} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 rounded-full px-8")}
            >
              <Download className="h-5 w-5" />
              Download
            </a>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {book.subjects.map((subject, i) => (
                  <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Details</h2>
              <dl className="grid grid-cols-2 gap-y-4 text-sm">
                <dt className="text-muted-foreground">Languages</dt>
                <dd className="font-medium">{book.languages.join(', ').toUpperCase()}</dd>
                <dt className="text-muted-foreground">Downloads</dt>
                <dd className="font-medium">{book.download_count.toLocaleString()}</dd>
                <dt className="text-muted-foreground">Copyright</dt>
                <dd className="font-medium">{book.copyright ? 'Yes' : 'No (Public Domain)'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
