import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useBookStore } from '@/store/useBookStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useBookStore();

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search for books by title or author..."
        className="pl-10 h-12 text-lg rounded-full border-2 focus-visible:ring-primary/20 transition-all"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
