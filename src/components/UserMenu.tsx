
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const UserMenu = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4" />
        <span>{user.email}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Wyloguj
      </Button>
    </div>
  );
};

export default UserMenu;
