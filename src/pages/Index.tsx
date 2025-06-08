
import Calendar from "@/components/Calendar";
import AuthGuard from "@/components/AuthGuard";
import UserMenu from "@/components/UserMenu";

const Index = () => {

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">System Rezerwacji</h1>
            <UserMenu />
          </div>
        </header>
        <main className="p-6">
          <Calendar />
        </main>
      </div>
    </AuthGuard>
  );
};

export default Index;
