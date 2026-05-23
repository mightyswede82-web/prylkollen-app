import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, Camera } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export default function Analyze() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: credits } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!user,
  });

  const analyzeItemMutation = trpc.items.analyzeItem.useMutation({
    onSuccess: () => {
      toast.success("Analys slutförd! Gå till inventariet för att se resultatet.");
      navigate("/inventory");
    },
    onError: (error) => {
      toast.error(error.message || "Något gick fel vid analysen");
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !preview) {
      toast.error("Välj en bild först");
      return;
    }

    if ((credits?.balance ?? 0) <= 0) {
      toast.error("Du har inga krediter kvar. Köp fler för att fortsätta.");
      navigate("/buy-credits");
      return;
    }

    analyzeItemMutation.mutate({
      imageBase64: preview,
      fileName: selectedFile.name,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PrylKollen</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Krediter kvar</p>
            <p className="text-2xl font-bold text-slate-900">{credits?.balance ?? 0}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">
          ← Tillbaka
        </Button>

        <Card className="p-8 border border-slate-200 bg-white">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Analysera en sak</h2>
          <p className="text-slate-600 mb-8">
            Fotografera eller ladda upp en bild av något du vill värdera. AI:n kommer att identifiera det och ge en värderingsuppskattning.
          </p>

          {/* Image Preview */}
          {preview ? (
            <div className="mb-8">
              <img src={preview} alt="Preview" className="w-full h-96 object-cover rounded-lg border border-slate-200" />
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="mt-4 w-full"
              >
                Byt bild
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Camera Upload */}
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors relative overflow-hidden"
              >
                <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">Fotografera</p>
                <p className="text-sm text-slate-600">Använd kameran</p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>

              {/* File Upload */}
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors relative overflow-hidden"
              >
                <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">Ladda upp</p>
                <p className="text-sm text-slate-600">Från galleriet</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {preview && (
            <Button
              onClick={handleAnalyze}
              disabled={analyzeItemMutation.isPending || (credits?.balance ?? 0) <= 0}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-lg font-semibold"
            >
              {analyzeItemMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Analyserar...
                </>
              ) : (
                <>Analysera (1 kredit)</>
              )}
            </Button>
          )}

          {/* Credit Warning */}
          {(credits?.balance ?? 0) <= 0 && (
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-900 font-semibold mb-2">Du har inga krediter kvar</p>
              <p className="text-sm text-amber-800 mb-4">Köp fler krediter för att fortsätta analysera dina saker.</p>
              <Button
                onClick={() => navigate("/buy-credits")}
                className="w-full bg-amber-900 hover:bg-amber-800 text-white"
              >
                Köp krediter
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
