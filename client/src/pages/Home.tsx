import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">PrylKollen</h1>
          <a href={getLoginUrl()}>
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              Logga in
            </button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Värdera dina ägodelar med AI
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Fotografera en sak, få en AI-driven värdering och marknadsinsikt direkt. 
            Håll koll på vad dina prylar är värda.
          </p>
          <a href={getLoginUrl()}>
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-10 rounded-lg text-lg transition-colors shadow-lg">
              Kom igång gratis
            </button>
          </a>
          <p className="text-sm text-slate-500 mt-4">5 gratis analyser vid registrering</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Fotografera</h3>
            <p className="text-slate-600">Ta en bild eller ladda upp från galleriet. AI:n identifierar föremålet automatiskt.</p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Få värdering</h3>
            <p className="text-slate-600">AI:n analyserar och ger en uppskattning av marknadsvärdet i svenska kronor.</p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Djupdyk</h3>
            <p className="text-slate-600">Få marknadsinsikter, skickbedömning och detaljerad analys av varje föremål.</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="pb-20 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-8">Enkel prissättning</h3>
          <div className="max-w-sm mx-auto bg-slate-900 text-white rounded-xl p-8 shadow-lg">
            <p className="text-sm font-medium opacity-80 mb-2">PAKET</p>
            <p className="text-4xl font-bold mb-4">5 analyser</p>
            <p className="text-3xl font-bold mb-6">49 kr</p>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>AI-identifiering och värdering</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Marknadsinsikter (djupdykning)</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Inventariehantering</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Krediterna gäller för alltid</span>
              </li>
            </ul>
            <a href={getLoginUrl()}>
              <button className="w-full bg-white text-slate-900 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors">
                Kom igång
              </button>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>PrylKollen - Värdera dina ägodelar med AI</p>
        </div>
      </footer>
    </div>
  );
}
