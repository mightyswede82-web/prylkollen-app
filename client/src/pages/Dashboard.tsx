import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: credits, isLoading: creditsLoading } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!user,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

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
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-slate-600">Krediter kvar</p>
              <p className="text-2xl font-bold text-slate-900">
                {creditsLoading ? <Loader2 className="w-5 h-5 animate-spin inline" /> : credits?.balance ?? 0}
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-right">
              <p className="text-sm text-slate-600">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Upload Card */}
          <Card className="p-8 border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors cursor-pointer bg-white">
            <Link href="/analyze">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Analysera ny sak</h3>
                  <p className="text-sm text-slate-600 mt-1">Fotografera eller ladda upp en bild</p>
                </div>
              </div>
            </Link>
          </Card>

          {/* Buy Credits Card */}
          <Card className="p-8 border border-slate-200 bg-white hover:shadow-md transition-shadow">
            <Link href="/buy-credits">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Köp krediter</h3>
                  <p className="text-sm text-slate-600 mt-1">5 analyser för 49 kr</p>
                </div>
              </div>
            </Link>
          </Card>

          {/* Inventory Card */}
          <Card className="p-8 border border-slate-200 bg-white hover:shadow-md transition-shadow">
            <Link href="/inventory">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Min inventarie</h3>
                  <p className="text-sm text-slate-600 mt-1">Se alla dina värderingar</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="p-8 border border-slate-200 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Välkommen, {user.name}!</h2>
          <p className="text-slate-600 mb-6">
            Du har {creditsLoading ? "..." : credits?.balance ?? 0} krediter kvar. Varje analys kostar 1 kredit. Börja genom att fotografera en sak eller köpa fler krediter.
          </p>
          <div className="flex space-x-4">
            <Link href="/analyze">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">Analysera nu</Button>
            </Link>
            <Link href="/buy-credits">
              <Button variant="outline">Köp krediter</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
