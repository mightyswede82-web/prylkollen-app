import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, ArrowLeft, Tag, Star, TrendingUp, Calendar } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useEffect } from "react";

export default function ItemDetail() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const itemId = parseInt(params.id || "0");

  const { data: item, isLoading, error } = trpc.items.getItem.useQuery(
    { itemId },
    { enabled: !!user && itemId > 0 }
  );

  const deleteItemMutation = trpc.items.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("Föremålet har tagits bort");
      navigate("/inventory");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-slate-900">PrylKollen</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button variant="outline" onClick={() => navigate("/inventory")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till inventariet
          </Button>
          <Card className="p-12 text-center border border-slate-200 bg-white">
            <p className="text-slate-600 mb-4">Föremålet kunde inte hittas.</p>
            <Button onClick={() => navigate("/inventory")} className="bg-slate-900 hover:bg-slate-800 text-white">
              Gå till inventariet
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">PrylKollen</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => navigate("/inventory")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till inventariet
        </Button>

        {/* Item Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image */}
          {item.imageUrl && (
            <Card className="overflow-hidden border border-slate-200">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-80 object-cover"
              />
            </Card>
          )}

          {/* Main Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{item.name}</h2>
              {(item as any).category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                  <Tag className="w-3 h-3 mr-1" />
                  {(item as any).category}
                </span>
              )}
            </div>

            {/* Value Card */}
            <Card className="p-6 border-2 border-slate-900 bg-slate-900 text-white">
              <p className="text-sm font-medium opacity-80 mb-1">Uppskattat värde</p>
              <p className="text-4xl font-bold">
                {item.estimatedValue ? `${item.estimatedValue} kr` : "Ej värderat"}
              </p>
              <p className="text-xs opacity-60 mt-2">⚠️ Detta är en AI-uppskattning och kan skilja sig från verkligt marknadsvärde.</p>
            </Card>

            {/* Condition */}
            {(item as any).condition && (
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-slate-700 font-medium">Skick:</span>
                <span className="text-slate-900 font-semibold">{(item as any).condition}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center space-x-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Analyserad: {new Date(item.createdAt).toLocaleDateString("sv-SE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="p-8 border border-slate-200 bg-white mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Beskrivning</h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {item.description || "Ingen beskrivning tillgänglig."}
          </p>
        </Card>

        {/* Market Insight (Djupdykning) */}
        {(item as any).marketInsight && (
          <Card className="p-8 border border-blue-200 bg-blue-50 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-900">Djupdykning - Marknadsinsikt</h3>
            </div>
            <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
              {(item as any).marketInsight}
            </p>
            <p className="text-xs text-blue-600 mt-4 italic">
              Observera: Prisuppskattningar och marknadsinsikter är AI-genererade och kan vara felaktiga. Kontrollera alltid mot faktiska marknadsplatser.
            </p>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">Hantera föremål</h4>
              <p className="text-sm text-slate-600">Ta bort detta föremål från ditt inventarie</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                if (window.confirm("Är du säker på att du vill ta bort detta föremål?")) {
                  deleteItemMutation.mutate({ itemId: item.id });
                }
              }}
              disabled={deleteItemMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteItemMutation.isPending ? "Tar bort..." : "Ta bort"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
