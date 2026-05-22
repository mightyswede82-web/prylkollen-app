import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useEffect } from "react";

export default function Inventory() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: items, isLoading } = trpc.items.getItems.useQuery(undefined, {
    enabled: !!user,
  });

  const deleteItemMutation = trpc.items.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("Sak borttagen");
    },
    onError: (error) => {
      toast.error(error.message || "Något gick fel");
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PrylKollen</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">
          ← Tillbaka
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Min inventarie</h2>
          <p className="text-slate-600">Alla dina analyserade saker</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{item.description}</p>
                  )}
                  <div className="mb-4">
                    <p className="text-sm text-slate-600">Värdering</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {item.estimatedValue ? `${item.estimatedValue} kr` : "—"}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItemMutation.mutate({ itemId: item.id })}
                    disabled={deleteItemMutation.isPending}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Ta bort
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border border-slate-200 bg-white">
            <p className="text-slate-600 mb-6">Du har inte analyserat någon sak ännu</p>
            <Button onClick={() => navigate("/analyze")} className="bg-slate-900 hover:bg-slate-800 text-white">
              Analysera en sak
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
