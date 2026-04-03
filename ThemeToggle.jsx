import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trio-theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('trio-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('trio-theme', 'light');
    }
  }, [dark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDark(!dark)}
      className="rounded-full hover:bg-primary/10"
    >
      {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

