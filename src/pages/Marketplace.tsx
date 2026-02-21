import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Plus, Search, ShoppingCart, MapPin, Phone, ArrowLeft, Package, IndianRupee, User, MessageSquare } from "lucide-react";
import { karnatakaDistricts } from "@/data/karnataka-data";
import ScrollToTop from "@/components/ScrollToTop";

interface CropListing {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string | null;
  farmer_district: string;
  farmer_village: string | null;
  crop_name: string;
  crop_category: string;
  quantity_quintals: number;
  expected_price_per_quintal: number;
  description: string | null;
  is_available: boolean;
  created_at: string;
}

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");

  // Purchase dialog state
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [purchaseQty, setPurchaseQty] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("crop_listings")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching listings:", error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const handlePurchaseRequest = async () => {
    if (!user || !selectedListing) return;
    if (!buyerName.trim() || !purchaseQty || !offeredPrice) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("purchase_requests").insert({
      listing_id: selectedListing.id,
      buyer_id: user.id,
      buyer_name: buyerName.trim(),
      buyer_phone: buyerPhone.trim() || null,
      buyer_email: buyerEmail.trim() || null,
      quantity_quintals: parseFloat(purchaseQty),
      offered_price_per_quintal: parseFloat(offeredPrice),
      message: purchaseMessage.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to send request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Purchase request sent!", description: "The farmer will be notified." });
      setSelectedListing(null);
      setBuyerName(""); setBuyerPhone(""); setBuyerEmail("");
      setPurchaseQty(""); setOfferedPrice(""); setPurchaseMessage("");
    }
  };

  const filtered = listings.filter((l) => {
    const matchSearch = !searchQuery || l.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) || l.farmer_district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || l.crop_category === categoryFilter;
    const matchDistrict = districtFilter === "all" || l.farmer_district === districtFilter;
    return matchSearch && matchCategory && matchDistrict;
  });

  const categories = ["Grains", "Pulses", "Oilseeds", "Cash Crops", "Fruits", "Vegetables", "Spices", "Other"];
  const districts = karnatakaDistricts;

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
                  <ShoppingCart className="w-7 h-7" /> Krishi Marketplace
                </h1>
                <p className="text-primary-foreground/80 text-sm">Direct Farmer-to-Buyer Trading</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button asChild variant="secondary" size="sm" className="gap-2">
                    <Link to="/marketplace/my-listings">
                      <Package className="w-4 h-4" /> My Listings
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to="/marketplace/create">
                      <Plus className="w-4 h-4" /> Sell Crop
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild variant="secondary" size="sm">
                  <Link to="/auth">Login to Trade</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <ScrollToTop />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search crops or districts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="District" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold">{filtered.length} Listings Available</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading listings...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{listing.crop_name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{listing.crop_category}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{formatPrice(listing.expected_price_per_quintal)}</p>
                      <p className="text-xs text-muted-foreground">per quintal</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>{listing.quantity_quintals} Quintals available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{listing.farmer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.farmer_village ? `${listing.farmer_village}, ` : ""}{listing.farmer_district}</span>
                  </div>
                  {listing.farmer_phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{listing.farmer_phone}</span>
                    </div>
                  )}
                  {listing.description && (
                    <p className="text-sm text-muted-foreground border-t pt-2">{listing.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Listed {new Date(listing.created_at).toLocaleDateString("en-IN")}</p>

                  {user && user.id !== listing.farmer_id ? (
                    <Dialog open={selectedListing?.id === listing.id} onOpenChange={(open) => !open && setSelectedListing(null)}>
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2" onClick={() => { setSelectedListing(listing); setOfferedPrice(String(listing.expected_price_per_quintal)); }}>
                          <ShoppingCart className="w-4 h-4" /> Send Purchase Request
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Purchase Request - {listing.crop_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="bg-muted rounded-lg p-3 text-sm">
                            <p><strong>Seller:</strong> {listing.farmer_name} — {listing.farmer_district}</p>
                            <p><strong>Available:</strong> {listing.quantity_quintals} Quintals @ {formatPrice(listing.expected_price_per_quintal)}/Q</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Name *</label>
                            <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Full name" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Phone</label>
                              <Input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="Phone number" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Email</label>
                              <Input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="Email" type="email" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Quantity (Quintals) *</label>
                              <Input value={purchaseQty} onChange={(e) => setPurchaseQty(e.target.value)} type="number" min="0.1" step="0.1" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Offered Price/Q *</label>
                              <Input value={offeredPrice} onChange={(e) => setOfferedPrice(e.target.value)} type="number" min="1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Input value={purchaseMessage} onChange={(e) => setPurchaseMessage(e.target.value)} placeholder="Any message for the farmer..." />
                          </div>
                          <Button onClick={handlePurchaseRequest} disabled={submitting} className="w-full">
                            {submitting ? "Sending..." : "Send Request"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : !user ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth">Login to Purchase</Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No listings found. Be the first to sell!</p>
            {user && (
              <Button asChild className="mt-4">
                <Link to="/marketplace/create"><Plus className="w-4 h-4 mr-2" /> Create Listing</Link>
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
