import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Check, X, Package, IndianRupee, MessageSquare } from "lucide-react";

interface PurchaseRequest {
  id: string;
  buyer_name: string;
  buyer_phone: string | null;
  buyer_email: string | null;
  quantity_quintals: number;
  offered_price_per_quintal: number;
  message: string | null;
  status: string;
  created_at: string;
}

interface Listing {
  id: string;
  crop_name: string;
  crop_category: string;
  quantity_quintals: number;
  expected_price_per_quintal: number;
  farmer_district: string;
  is_available: boolean;
  created_at: string;
}

const MyListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Record<string, PurchaseRequest[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: listingsData } = await supabase
      .from("crop_listings")
      .select("*")
      .eq("farmer_id", user!.id)
      .order("created_at", { ascending: false });

    setListings(listingsData || []);

    if (listingsData && listingsData.length > 0) {
      const listingIds = listingsData.map((l) => l.id);
      const { data: reqData } = await supabase
        .from("purchase_requests")
        .select("*")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });

      const grouped: Record<string, PurchaseRequest[]> = {};
      (reqData || []).forEach((r: any) => {
        if (!grouped[r.listing_id]) grouped[r.listing_id] = [];
        grouped[r.listing_id].push(r);
      });
      setRequests(grouped);
    }
    setLoading(false);
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    const { error } = await supabase.from("purchase_requests").update({ status }).eq("id", requestId);
    if (error) {
      toast({ title: "Error updating", variant: "destructive" });
    } else {
      toast({ title: status === "accepted" ? "✅ Request accepted!" : "Request rejected" });
      fetchData();
    }
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from("crop_listings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", variant: "destructive" });
    } else {
      toast({ title: "Listing removed" });
      fetchData();
    }
  };

  const formatPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card><CardContent className="pt-6 text-center"><p>Please login first.</p><Button asChild className="mt-4"><Link to="/auth">Login</Link></Button></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/marketplace"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">My Listings & Requests</h1>
              <p className="text-primary-foreground/80 text-sm">Manage your crop listings and buyer requests</p>
            </div>
          </div>
          <Button asChild size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/marketplace/create"><Plus className="w-4 h-4" /> New Listing</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">You haven't listed any crops yet.</p>
            <Button asChild><Link to="/marketplace/create"><Plus className="w-4 h-4 mr-2" /> Create Your First Listing</Link></Button>
          </div>
        ) : (
          listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{listing.crop_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{listing.crop_category}</Badge>
                      <Badge variant={listing.is_available ? "default" : "destructive"}>
                        {listing.is_available ? "Available" : "Sold"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{formatPrice(listing.expected_price_per_quintal)}/Q</span>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteListing(listing.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{listing.quantity_quintals} Quintals · {listing.farmer_district} · Listed {new Date(listing.created_at).toLocaleDateString("en-IN")}</p>
              </CardHeader>
              <CardContent>
                {requests[listing.id] && requests[listing.id].length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Purchase Requests ({requests[listing.id].length})
                    </h4>
                    {requests[listing.id].map((req) => (
                      <div key={req.id} className="bg-muted rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{req.buyer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {req.quantity_quintals}Q @ {formatPrice(req.offered_price_per_quintal)}/Q
                            </p>
                            {req.buyer_phone && <p className="text-sm text-muted-foreground">📞 {req.buyer_phone}</p>}
                            {req.buyer_email && <p className="text-sm text-muted-foreground">✉️ {req.buyer_email}</p>}
                            {req.message && <p className="text-sm mt-1">"{req.message}"</p>}
                          </div>
                          <Badge variant={req.status === "accepted" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}>
                            {req.status}
                          </Badge>
                        </div>
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" className="gap-1" onClick={() => updateRequestStatus(req.id, "accepted")}>
                              <Check className="w-3 h-3" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => updateRequestStatus(req.id, "rejected")}>
                              <X className="w-3 h-3" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No purchase requests yet.</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default MyListings;
