import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUser } from "@/hooks/use-auth";
import { usePredictions, useGeneratePrediction } from "@/hooks/use-predictions";
import { format, differenceInDays, addDays } from "date-fns";
import { CalendarDays, Droplets, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: predictions, isLoading } = usePredictions();
  const { mutate: generatePrediction, isPending: isGenerating } = useGeneratePrediction();

  // Find next prediction
  const nextPeriod = predictions?.[0]; // Assuming backend sorts by date desc or we sort here
  // Ideally sort on client to be safe:
  const sortedPredictions = predictions?.sort((a, b) => 
    a.predictedStartDate.getTime() - b.predictedStartDate.getTime()
  ).filter(p => p.predictedStartDate > new Date());
  
  const next = sortedPredictions?.[0];
  const daysUntil = next ? differenceInDays(next.predictedStartDate, new Date()) : null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Hello, {user?.name || user?.username}
          </h1>
          <p className="text-muted-foreground mt-1">Here's your cycle summary for today.</p>
        </header>

        {/* Hero Card - Next Period */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 shadow-xl shadow-primary/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-4 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Prediction</span>
              </div>
              
              {next ? (
                <>
                  <h2 className="text-5xl font-display font-bold mb-2">
                    {daysUntil} Days
                  </h2>
                  <p className="text-lg opacity-90 font-medium">Until your next period</p>
                  <p className="mt-4 opacity-80">
                    Expected around {format(next.predictedStartDate, "MMMM d, yyyy")}
                  </p>
                </>
              ) : (
                <div className="py-4">
                  <h2 className="text-3xl font-display font-bold mb-4">No predictions yet</h2>
                  <button 
                    onClick={() => generatePrediction()}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-white text-primary rounded-xl font-bold shadow-lg hover:bg-white/90 transition-colors"
                  >
                    {isGenerating ? "Analyzing..." : "Generate Prediction"}
                  </button>
                </div>
              )}
            </div>

            <div className="hidden md:flex justify-end">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-64">
                <div className="flex items-center gap-3 mb-4">
                  <Droplets className="w-5 h-5" />
                  <span className="font-semibold">Current Phase</span>
                </div>
                {/* Simplified phase logic for UI demo */}
                <div className="text-2xl font-bold">Luteal Phase</div>
                <div className="h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-white w-[70%]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/calendar">
            <div className="bg-card hover:border-primary/50 transition-all duration-300 p-6 rounded-2xl border border-border shadow-sm cursor-pointer group">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Log Period</h3>
              <p className="text-sm text-muted-foreground mt-1">Track flow and symptoms</p>
            </div>
          </Link>

          <Link href="/articles">
            <div className="bg-card hover:border-accent/50 transition-all duration-300 p-6 rounded-2xl border border-border shadow-sm cursor-pointer group">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Wellness Tips</h3>
              <p className="text-sm text-muted-foreground mt-1">Daily insights for you</p>
            </div>
          </Link>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-secondary rounded text-primary">Beta</span>
            </div>
            <h3 className="text-lg font-bold text-foreground">AI Insights</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              {predictions?.length ? "Prediction confidence is high based on recent logs." : "Log more data to get accurate AI predictions."}
            </p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Articles</h2>
            <Link href="/articles">
              <span className="text-sm text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Using mock data since we might not have articles yet */}
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-border/50 hover:shadow-md transition-all">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-secondary/50 flex items-center justify-center text-muted-foreground text-xs">
                    Article Img
                  </div>
                </div>
                <div className="flex-1 py-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Health</span>
                  <h3 className="font-bold text-lg leading-tight mt-1 mb-2">Understanding your Luteal Phase symptoms</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">Learn why you feel the way you do during this important part of your cycle.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
