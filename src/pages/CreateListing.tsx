import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { karnatakaDistricts, crops, priceData } from "@/data/karnataka-data";
import { ArrowLeft, Leaf, IndianRupee } from "lucide-react";

// Map crop categories to marketplace listing categories
const mapCategory = (cat: string): string => {
  if (cat === "Cereals" || cat === "Millets") return "Grains";
  if (cat === "Plantation") return "Cash Crops";
  if (["Pulses", "Oilseeds", "Cash Crops", "Fruits", "Vegetables", "Spices"].includes(cat)) return cat;
  return "Other";
};

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    cropId: "",
    quantity: "",
    farmerName: "",
    phone: "",
    district: "",
    village: "",
    description: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const selectedCrop = useMemo(() => crops.find((c) => c.id === form.cropId), [form.cropId]);

  // Auto-derived mandi price (modal) for selected crop + district
  const mandiPrice = useMemo(() => {
    if (!form.cropId || !form.district) return null;
    const entry = priceData.find((p) => p.cropId === form.cropId && p.district === form.district);
    return entry?.modalPrice ?? null;
  }, [form.cropId, form.district]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (!selectedCrop || !form.quantity || !form.farmerName || !form.district || mandiPrice == null) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("crop_listings").insert({
      farmer_id: user.id,
      farmer_name: form.farmerName.trim(),
      farmer_phone: form.phone.trim() || null,
      farmer_district: form.district,
      farmer_village: form.village.trim() || null,
      crop_name: selectedCrop.name,
      crop_category: mapCategory(selectedCrop.category),
      quantity_quintals: parseFloat(form.quantity),
      expected_price_per_quintal: mandiPrice,
      description: form.description.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to create listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🌾 Listing created successfully!" });
      navigate("/marketplace");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Leaf className="w-12 h-12 mx-auto text-primary" />
            <p>Please login to create a listing.</p>
            <Button asChild><Link to="/auth">Login</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/marketplace"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Sell Your Crop</h1>
              <p className="text-primary-foreground/80 text-sm">Price is auto-set from Karnataka Krishi Mandi rates</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Crop Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Crop *</label>
                  <Select value={form.cropId} onValueChange={(v) => update("cropId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select your crop" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {crops.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.image} {c.name} <span className="text-muted-foreground">— {c.localName}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCrop && (
                    <p className="text-xs text-muted-foreground">
                      Category: <strong>{mapCategory(selectedCrop.category)}</strong> · Unit: {selectedCrop.unit}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">District *</label>
                  <Select value={form.district} onValueChange={(v) => update("district", v)}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>
                      {karnatakaDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity (Quintals) *</label>
                  <Input value={form.quantity} onChange={(e) => update("quantity", e.target.value)} type="number" min="0.1" step="0.1" placeholder="e.g. 10" />
                </div>
              </div>

              {/* Auto-filled mandi price */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Krishi Mandi Price (per quintal)</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Auto-set from APMC rates for {form.district || "your district"}.
                    </p>
                  </div>
                  <div className="flex items-center text-2xl font-bold text-primary">
                    <IndianRupee className="w-5 h-5" />
                    {mandiPrice != null ? mandiPrice.toLocaleString("en-IN") : "—"}
                  </div>
                </div>
                {!form.cropId || !form.district ? (
                  <p className="text-xs text-muted-foreground mt-2">Select a crop and district to see the price.</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    All farmers in the same district list this crop at the same fair mandi price.
                  </p>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Your Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name *</label>
                    <Input value={form.farmerName} onChange={(e) => update("farmerName", e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Mobile number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Village/Town</label>
                    <Input value={form.village} onChange={(e) => update("village", e.target.value)} placeholder="Village or town name" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Quality, harvest date, organic, etc." rows={3} />
              </div>

              <Button type="submit" disabled={submitting || mandiPrice == null} className="w-full" size="lg">
                {submitting ? "Creating..." : "🌾 List My Crop"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateListing;
