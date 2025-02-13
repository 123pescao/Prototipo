import create from 'zustand';

const useStore = create((set) => ({
  websites: [],
  darkMode: localStorage.getItem("theme") === "dark",
  setWebsites: (websites) => set({ websites }),
  addWebsite: (newWebsite) => set((state) => ({ websites: [...state.websites, newWebsite] })),
  removeWebsite: (url) => set((state) => ({
    websites: state.websites.filter((site) => site.url !== url),
  })),
  setDarkMode: (darkMode) => {
    set({ darkMode });
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  },
}));

export default useStore;
