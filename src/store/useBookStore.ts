import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookStoreState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  bookmarks: Record<number, number>; // bookId -> pageIndex
  setBookmark: (bookId: number, pageIndex: number) => void;
  getBookmark: (bookId: number) => number;
}

export const useBookStore = create<BookStoreState>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      bookmarks: {},
      setBookmark: (bookId, pageIndex) => 
        set((state) => ({
          bookmarks: { ...state.bookmarks, [bookId]: pageIndex }
        })),
      getBookmark: (bookId) => get().bookmarks[bookId] || 0,
    }),
    {
      name: 'biblo-storage',
      partialize: (state) => ({ bookmarks: state.bookmarks }), // Persist only bookmarks
    }
  )
);
