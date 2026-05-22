import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Camera, Lock, Zap, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">PrylKollen</div>
          <a href={getLoginUrl()} className="text-slate-600 hover:text-slate-900 transition-colors">
            Logga in
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
              Värdera dina ägodelar med AI
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Fotografera dina saker. Få AI-driven analys och värdering. Håll koll på din inventarie.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <a href={getLoginUrl()}>
              <Button size="lg" className="px-8 py-6 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                Kom igång gratis
              </Button>
            </a>
            <p className="text-sm text-slate-500 mt-4">Få 5 gratis analyser för att börja</p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
            <Card className="p-6 border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <Camera className="w-8 h-8 text-slate-900 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 mb-2">Fotografera & Analysera</h3>
                  <p className="text-sm text-slate-600">
                    Ta ett foto av din sak och få omedelbar AI-analys med namn, beskrivning och värdering.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <Zap className="w-8 h-8 text-slate-900 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 mb-2">Enkelt kreditsystem</h3>
                  <p className="text-sm text-slate-600">
                    Köp 5 analyser för 49 kr. En kredit per analys. Enkelt och transparent.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <Shield className="w-8 h-8 text-slate-900 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 mb-2">Säker & Privat</h3>
                  <p className="text-sm text-slate-600">
                    Din data är krypterad och säker. Vi sparar aldrig dina bilder utan din tillåtelse.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <Lock className="w-8 h-8 text-slate-900 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 mb-2">Inventariehantering</h3>
                  <p className="text-sm text-slate-600">
                    Håll alla dina värderingar på ett ställe. Sök, filtrera och exportera enkelt.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Enkelt prissättning</h2>
            <p className="text-slate-600">Köp analyser när du behöver dem</p>
          </div>

          <Card className="p-8 border-2 border-slate-900 bg-slate-900 text-white max-w-sm mx-auto">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold opacity-90">PAKET</p>
                <p className="text-4xl font-bold mt-2">5 analyser</p>
              </div>
              <div className="text-3xl font-bold">49 kr</div>
              <ul className="space-y-3 text-left text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>5 AI-analyser</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>Namn & beskrivning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>Värderingsuppskattning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>Inventariehantering</span>
                </li>
              </ul>
              <a href={getLoginUrl()}>
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                  Kom igång
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-600">
          <p>&copy; 2026 PrylKollen. Alla rättigheter förbehållna.</p>
        </div>
      </footer>
    </div>
  );
}
