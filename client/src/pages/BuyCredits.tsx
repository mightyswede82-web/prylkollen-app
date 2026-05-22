import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function BuyCredits() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const createCheckoutMutation = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Något gick fel");
    },
  });

  if (!user) {
    navigate("/");
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">
          ← Tillbaka
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Köp krediter</h2>
          <p className="text-slate-600">Välj ett paket för att börja analysera</p>
        </div>

        {/* Pricing Card */}
        <Card className="p-8 border-2 border-slate-900 bg-slate-900 text-white">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold opacity-90">PAKET</p>
              <p className="text-4xl font-bold mt-2">5 analyser</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>5 AI-analyser</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>Namn & beskrivning</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>Värderingsuppskattning</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>Inventariehantering</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <p className="text-3xl font-bold">49 kr</p>
              <p className="text-sm opacity-90 mt-1">Engångspris</p>
            </div>

            <Button
              onClick={() => createCheckoutMutation.mutate()}
              disabled={createCheckoutMutation.isPending}
              className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-6 text-lg"
            >
              {createCheckoutMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Laddar...
                </>
              ) : (
                "Köp nu"
              )}
            </Button>

            <p className="text-xs opacity-75 text-center">
              Säker betalning via Stripe. Du kan köpa fler paket när som helst.
            </p>
          </div>
        </Card>

        {/* FAQ */}
        <div className="mt-12 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Vanliga frågor</h3>

          <Card className="p-6 border border-slate-200 bg-white">
            <h4 className="font-semibold text-slate-900 mb-2">Hur länge gäller mina krediter?</h4>
            <p className="text-slate-600 text-sm">Dina krediter gäller för alltid. Du kan använda dem när du vill.</p>
          </Card>

          <Card className="p-6 border border-slate-200 bg-white">
            <h4 className="font-semibold text-slate-900 mb-2">Kan jag få pengarna tillbaka?</h4>
            <p className="text-slate-600 text-sm">
              Ja, vi erbjuder 30 dagars pengar-tillbaka-garanti om du inte är nöjd.
            </p>
          </Card>

          <Card className="p-6 border border-slate-200 bg-white">
            <h4 className="font-semibold text-slate-900 mb-2">Vilka betalningsmetoder accepterar ni?</h4>
            <p className="text-slate-600 text-sm">Vi accepterar alla större kreditkort, bankkort och digitala plånböcker via Stripe.</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
