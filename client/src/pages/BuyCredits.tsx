import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";

export default function BuyCredits() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const stripeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Load Stripe Buy Button script
    const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/buy-button.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Insert the Stripe Buy Button element
    if (stripeContainerRef.current && stripeContainerRef.current.children.length === 0) {
      const buyButton = document.createElement("stripe-buy-button");
      buyButton.setAttribute("buy-button-id", "buy_btn_1TagYC3eLtbwcaudWh8ZAkdn");
      buyButton.setAttribute("publishable-key", "pk_live_51TaEc53eLtbwcaud2FDWk9JGcFz7SXFO1iEFyIdEwa0MkqrQrUX85xLjQciOhMXsHEXOO1uEvMRlfOMMWq4eU1R500P56GV8il");
      stripeContainerRef.current.appendChild(buyButton);
    }
  }, [user]);

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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">
          ← Tillbaka
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Köp krediter</h2>
          <p className="text-slate-600">Välj ett paket för att börja analysera</p>
        </div>

        {/* Features list */}
        <Card className="p-8 border-2 border-slate-900 bg-slate-900 text-white mb-8">
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
          </div>
        </Card>

        {/* Stripe Buy Button */}
        <div className="flex justify-center mb-8" ref={stripeContainerRef}>
          {/* Stripe Buy Button will be inserted here */}
        </div>

        <p className="text-xs text-slate-500 text-center mb-12">
          Säker betalning via Stripe. Du kan köpa fler paket när som helst.
        </p>

        {/* FAQ */}
        <div className="space-y-6">
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
