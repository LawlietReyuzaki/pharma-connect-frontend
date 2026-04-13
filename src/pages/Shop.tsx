import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, Eye, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { formatPKR, medicineFallback } from "@/lib/api";

interface Medicine {
  id: number;
  name: string;
  chemical?: string;
  description?: string;
  price: number;
  image_path?: string;
  category?: string;
  status?: string;
  stock_quantity?: number;
}

interface CategoryCount {
  name: string;
  count: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function Shop() {
  const [urlParams] = useSearchParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState(urlParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/store/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories_with_counts || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchQuery) params.set("search", searchQuery);
    params.set("status", "in_stock");
    params.set("limit", "50");

    const url = searchQuery
      ? `/api/store/search?q=${encodeURIComponent(searchQuery)}${selectedCategory ? `&category=${selectedCategory}` : ""}`
      : `/api/store/medicines?${params}`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => setMedicines(d.medicines || d.results || []))
      .catch(() => setMedicines([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const viewDetail = (id: number) => {
    fetch(`/api/store/medicines/${id}`)
      .then((r) => r.json())
      .then((d) => setDetailMedicine(d.medicine))
      .catch(() => {});
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-pharmacy-dark via-purple-900 to-pharmacy-dark text-pharmacy-dark-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Medicine <span className="text-gradient-primary">Store</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-pharmacy-dark-foreground/55 max-w-lg mx-auto mb-8">
            Browse our extensive collection of genuine medicines. All products verified and sourced from certified manufacturers.
          </motion.p>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search medicines by name, chemical, or category..."
              className="pl-12 h-12 rounded-xl bg-card text-foreground border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* Main */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Categories</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !selectedCategory ? "bg-gradient-to-r from-primary to-pink-600 text-primary-foreground shadow-lg shadow-primary/50" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.name ? "bg-gradient-to-r from-primary to-pink-600 text-primary-foreground shadow-lg shadow-primary/50" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.name} <span className="opacity-50 ml-1">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-heading font-semibold text-muted-foreground">No medicines found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {medicines.map((med, i) => (
                <motion.div
                  key={med.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i % 5}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 card-hover"
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-100 relative overflow-hidden">
                    <img
                      src={med.image_path || "/static/images/default-medicine.png"}
                      alt={med.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={medicineFallback}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {med.status === "out_of_stock" && (
                      <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground bg-destructive px-3 py-1 rounded-lg">Out of Stock</span>
                      </div>
                    )}
                    {med.category && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-gradient-to-r from-primary to-pink-600 text-white px-2.5 py-1 rounded-md shadow-md">
                        {med.category}
                      </span>
                    )}
                    <button
                      onClick={() => viewDetail(med.id)}
                      className="absolute top-2 right-2 w-9 h-9 rounded-full bg-gradient-to-r from-primary to-pink-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h6 className="font-heading font-semibold text-sm truncate group-hover:text-primary transition-colors">{med.name}</h6>
                    {med.chemical && <p className="text-[11px] text-muted-foreground truncate mt-1">{med.chemical}</p>}
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-heading font-bold text-primary text-sm">{formatPKR(med.price)}</span>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-primary to-pink-600 text-primary-foreground rounded-lg h-7 px-3 text-[11px] shadow-md hover:shadow-lg transition-all"
                        disabled={med.status === "out_of_stock"}
                        onClick={() => addItem({ id: med.id, name: med.name, price: med.price, image_path: med.image_path })}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <Dialog open={!!detailMedicine} onOpenChange={(o) => !o && setDetailMedicine(null)}>
        <DialogContent className="sm:max-w-lg">
          {detailMedicine && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">{detailMedicine.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={detailMedicine.image_path || "/static/images/default-medicine.png"}
                  alt={detailMedicine.name}
                  className="w-full h-60 object-cover rounded-xl bg-muted"
                  onError={medicineFallback}
                />
                {detailMedicine.chemical && <p className="text-sm text-muted-foreground"><strong>Chemical:</strong> {detailMedicine.chemical}</p>}
                {detailMedicine.category && <p className="text-sm text-muted-foreground"><strong>Category:</strong> {detailMedicine.category}</p>}
                {detailMedicine.description && <p className="text-sm text-muted-foreground">{detailMedicine.description}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-2xl font-heading font-bold text-primary">{formatPKR(detailMedicine.price)}</span>
                  <Button
                    className="bg-primary text-primary-foreground rounded-xl"
                    disabled={detailMedicine.status === "out_of_stock"}
                    onClick={() => {
                      addItem({ id: detailMedicine.id, name: detailMedicine.name, price: detailMedicine.price, image_path: detailMedicine.image_path });
                      setDetailMedicine(null);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
