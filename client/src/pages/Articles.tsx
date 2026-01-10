import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useArticles } from "@/hooks/use-articles";
import { LoadingState } from "@/components/ui/LoadingState";
import { motion } from "framer-motion";

export default function ArticlesPage() {
  const { data: articles, isLoading } = useArticles();

  // Mock articles if none exist (for demo purposes)
  const displayArticles = articles?.length ? articles : [
    {
      id: 1,
      title: "Understanding The 4 Phases",
      category: "Education",
      content: "Menstrual, Follicular, Ovulation, and Luteal. Each phase brings different energy levels...",
      imageUrl: "https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Nutrition for Your Cycle",
      category: "Health",
      content: "What you eat can drastically affect your cramps and mood...",
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Yoga for Cramps",
      category: "Wellness",
      content: "Gentle movements to ease the pain during your first few days...",
      imageUrl: "https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-display font-bold text-foreground">Wellness Library</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Curated articles to help you understand your body, mind, and cycle better.
          </p>
        </header>

        {isLoading && !articles ? (
          <LoadingState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  {/* Descriptive comment for Unsplash URL */}
                  {/* wellness healthy lifestyle yoga food nature */}
                  <img 
                    src={article.imageUrl || "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800"} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                    {article.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold font-display mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {article.content}
                  </p>
                  <button className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                    Read Article →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
