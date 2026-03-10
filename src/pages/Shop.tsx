import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Eye, Truck, Award, Zap, UserCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  description?: string;
  stock?: number;
  image?: string;
}

const categoryIcons: Record<string, string> = {
  "Pain Relief": "💊", Antibiotics: "🧪", "Cold & Flu": "🤧",
  Gastric: "💉", Vitamins: "🍊", Heart: "❤️", Diabetes: "🩸",
  "Skin Care": "✨", Supplements: "💪", General: "🏥",
};

const features = [
  { icon: Truck, title: "Express Delivery", desc: "Same day in Islamabad" },
  { icon: Award, title: "100% Authentic", desc: "From trusted suppliers" },
  { icon: Zap, title: "Buy Now", desc: "Skip cart, order instantly" },
  { icon: UserCheck, title: "Expert Advice", desc: "Pharmacists available" },
];

export default function Shop() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      fetch("/api/store/medicines?limit=500").then(r => r.json()),
      fetch("/api/store/categories").then(r => r.json()),
    ])
      .then(([medData, catData]) => {
        setMedicines(medData.medicines || []);
        setCategories(catData.categories || []);
      })
      .catch(() => toast({ title: "Error", description: "Failed to load shop data", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = medicines.filter((m) => {
    const matchCat = !activeCategory || m.category === activeCategory;
    const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (med: Medicine) => {
    toast({ title: "Added to cart", description: `${med.name} added to your cart` });
  };

  const buyNow = (med: Medicine) => {
    fetch("/api/store/buy-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicine_id: med.id, quantity: 1 }),
    })
      .then(r => r.json())
      .then(data => toast({ title: data.success ? "Order placed!" : "Error", description: data.message || "Order placed successfully" }))
      .catch(() => toast({ title: "Error", description: "Could not place order", variant: "destructive" }));
  };

  return (
    <div>
      {/* Hero */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center text-pharmacy-dark-foreground">
          <Badge className="bg-success/20 text-success border-success/30 mb-4">🛒 Official Red Dot Pharmacy Store</Badge>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Your Complete <span className="text-gradient-primary">Medicine Store</span>
          </h1>
          <p className="text-pharmacy-dark-foreground/60 max-w-2xl mx-auto mb-8">
            Discover our extensive collection of quality medicines and healthcare products.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-4 text-center">
                <f.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h6 className="font-heading font-semibold text-sm">{f.title}</h6>
                <p className="text-xs text-pharmacy-dark-foreground/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-6 bg-muted/50 sticky top-16 z-30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Button
              size="sm"
              variant={activeCategory === "" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setActiveCategory("")}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveCategory(cat)}
              >
                {categoryIcons[cat] || "💊"} {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground mt-4">Loading medicines...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl mb-2">😔</p>
              <p className="text-muted-foreground">No medicines found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((med, i) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">{med.category}</Badge>
                      {med.stock !== undefined && med.stock < 10 && (
                        <Badge className="bg-warning/10 text-warning border-warning/30 text-xs">Low Stock</Badge>
                      )}
                    </div>
                    <h3 className="font-heading font-semibold text-base mb-1 group-hover:text-primary transition-colors">{med.name}</h3>
                    {med.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{med.description}</p>
                    )}
                    <p className="text-xl font-heading font-bold text-primary mb-4">₨{med.price}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 rounded-xl bg-primary text-primary-foreground text-xs" onClick={() => addToCart(med)}>
                        <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => buyNow(med)}>
                        <Zap className="w-3 h-3 mr-1" /> Buy Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-heading font-bold">Need Medicine Urgently?</h3>
            <p className="text-primary-foreground/70 text-sm">Contact us for emergency delivery</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-xl">
            <a href="tel:+92515111222"><Phone className="w-4 h-4 mr-2" /> Call Now</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
