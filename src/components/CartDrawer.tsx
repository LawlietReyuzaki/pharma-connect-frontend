import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard, Truck, MapPin, Phone as PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatPKR, medicineFallback } from "@/lib/api";

type CheckoutStep = "cart" | "details" | "payment";

interface PaymentMethod {
  id: number;
  name: string;
  slug: string;
  requires_receipt: boolean;
  account_title?: string;
  account_number?: string;
  account_details?: string;
}

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, deliveryFee, total, isOpen, setIsOpen, totalItems } = useCart();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [ordering, setOrdering] = useState(false);

  const loadPaymentMethods = async () => {
    try {
      const res = await fetch("/api/payments/methods");
      const data = await res.json();
      setPaymentMethods(data.payment_methods || []);
    } catch {}
  };

  const handleProceedToDetails = () => {
    if (!isAuthenticated) {
      toast({ title: "Please login first", description: "You need to be logged in to place an order.", variant: "destructive" });
      return;
    }
    setStep("details");
  };

  const handleProceedToPayment = () => {
    if (!address.trim() || !phone.trim()) {
      toast({ title: "Missing info", description: "Please fill in your address and phone number.", variant: "destructive" });
      return;
    }
    loadPaymentMethods();
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      toast({ title: "Select payment method", variant: "destructive" });
      return;
    }
    setOrdering(true);

    try {
      let receiptPath: string | undefined;
      const method = paymentMethods.find((m) => m.slug === selectedPayment);

      if (method?.requires_receipt && receiptFile) {
        const formData = new FormData();
        formData.append("receipt", receiptFile);
        const uploadRes = await fetch("/api/payments/upload-receipt", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) receiptPath = uploadData.receipt_path;
      }

      const res = await fetch("/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          address,
          phone,
          items: items.map((i) => ({ medicine_id: i.id, quantity: i.quantity })),
          payment_method: selectedPayment,
          delivery_fee: deliveryFee,
          notes,
          payment_receipt_path: receiptPath,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Order placed!", description: `Order #${data.order.id} — Estimated delivery: ${data.order.estimated_delivery || "1-2 days"}` });
        clearCart();
        setStep("cart");
        setIsOpen(false);
        setAddress("");
        setPhone("");
        setNotes("");
        setSelectedPayment("");
        setReceiptFile(null);
      } else {
        toast({ title: "Order failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setOrdering(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50" onClick={() => { setIsOpen(false); setStep("cart"); }} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-lg">
                  {step === "cart" ? `Cart (${totalItems})` : step === "details" ? "Delivery Details" : "Payment"}
                </h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setIsOpen(false); setStep("cart"); }}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {step === "cart" && (
                items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Browse our store and add medicines</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                        <img
                          src={item.image_path || "/static/images/default-medicine.png"}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover bg-muted"
                          onError={medicineFallback}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-primary font-semibold text-sm">{formatPKR(item.price)}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center hover:bg-muted">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center hover:bg-muted">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-semibold">{formatPKR(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {step === "details" && (
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Delivery Address</Label>
                    <Textarea placeholder="Full delivery address..." className="mt-1.5 rounded-xl" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-primary" /> Phone Number</Label>
                    <Input placeholder="03XX-XXXXXXX" className="mt-1.5 rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea placeholder="Any special instructions..." className="mt-1.5 rounded-xl" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Select your payment method:</p>
                  <div className="space-y-2">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.slug}
                        onClick={() => setSelectedPayment(pm.slug)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                          selectedPayment === pm.slug ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{pm.name}</p>
                          {pm.account_number && <p className="text-xs text-muted-foreground">{pm.account_title} — {pm.account_number}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                  {paymentMethods.find((m) => m.slug === selectedPayment)?.requires_receipt && (
                    <div>
                      <Label>Upload Payment Receipt</Label>
                      <Input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        className="mt-1.5 rounded-xl"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF — max 5MB</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-5 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPKR(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery</span><span>{formatPKR(deliveryFee)}</span></div>
                  <div className="flex justify-between font-heading font-bold text-lg pt-1.5 border-t border-border"><span>Total</span><span className="text-primary">{formatPKR(total)}</span></div>
                </div>
                {step === "cart" && (
                  <Button onClick={handleProceedToDetails} className="w-full bg-primary text-primary-foreground rounded-xl" size="lg">
                    Proceed to Checkout
                  </Button>
                )}
                {step === "details" && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("cart")} className="rounded-xl">Back</Button>
                    <Button onClick={handleProceedToPayment} className="flex-1 bg-primary text-primary-foreground rounded-xl">Continue to Payment</Button>
                  </div>
                )}
                {step === "payment" && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("details")} className="rounded-xl">Back</Button>
                    <Button onClick={handlePlaceOrder} className="flex-1 bg-primary text-primary-foreground rounded-xl" disabled={ordering}>
                      {ordering ? "Placing Order..." : `Pay ${formatPKR(total)}`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
