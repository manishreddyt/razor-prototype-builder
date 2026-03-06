import { useState } from "react";
import { Lead } from "@/types/leads";
import { Product } from "@/types/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Filter, Download, Eye, Mail, Phone, Calendar, Package } from "lucide-react";
import { toast } from "sonner";

interface LeadsManagerProps {
  leads: Lead[];
  products: Product[];
  onUpdateLeads: (leads: Lead[]) => void;
}

const statusColors = {
  new: "bg-blue-100 text-blue-700 border-blue-300",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-300",
  converted: "bg-green-100 text-green-700 border-green-300",
  archived: "bg-gray-100 text-gray-700 border-gray-300",
};

export const LeadsManager = ({ leads, products, onUpdateLeads }: LeadsManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<Lead["source"] | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredLeads = leads.filter((lead) => {
    const matchSearch = !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const handleUpdateStatus = (leadId: string, status: Lead["status"]) => {
    const updated = leads.map((l) =>
      l.id === leadId ? { ...l, status } : l
    );
    onUpdateLeads(updated);
    toast.success("Lead status updated");
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetail(true);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Status", "Created At", "Interests"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone || "",
      lead.source,
      lead.status,
      new Date(lead.createdAt).toLocaleDateString(),
      (lead.interests || []).join("; "),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.title || "Unknown Product";
  };

  // Summary stats
  const totalLeads = leads.length;
  const newLeadsLast7Days = leads.filter((l) => {
    const created = new Date(l.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return created >= sevenDaysAgo;
  }).length;
  const conversionRate = totalLeads > 0
    ? ((leads.filter((l) => l.status === "converted").length / totalLeads) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage inquiries and customer leads
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Leads</div>
          <div className="text-2xl font-bold">{totalLeads}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">New (Last 7 Days)</div>
          <div className="text-2xl font-bold">{newLeadsLast7Days}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Conversion Rate</div>
          <div className="text-2xl font-bold">{conversionRate}%</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="contact-form">Contact Form</SelectItem>
            <SelectItem value="product-inquiry">Product Inquiry</SelectItem>
            <SelectItem value="checkout">Checkout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="text-muted-foreground">
            {leads.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
                <p>Leads will appear here when visitors submit forms or make purchases</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                <p>Try adjusting your filters</p>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Source</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Interest</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{lead.name}</div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {lead.source.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {lead.productId ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">
                            {getProductName(lead.productId)}
                          </span>
                        </div>
                      ) : lead.interests && lead.interests.length > 0 ? (
                        <div className="text-sm text-muted-foreground">
                          {lead.interests.length} interest(s)
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <Select
                        value={lead.status}
                        onValueChange={(v) => handleUpdateStatus(lead.id, v as Lead["status"])}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <Badge className={statusColors[lead.status]}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(lead)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showDetail && selectedLead && (
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <div className="font-medium">{selectedLead.name}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>
                    <Badge className={statusColors[selectedLead.status]}>
                      {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div>{selectedLead.email}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <div>{selectedLead.phone || "-"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Source</Label>
                  <div>{selectedLead.source.replace("-", " ")}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <div>{new Date(selectedLead.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {selectedLead.productId && (
                <div>
                  <Label className="text-xs text-muted-foreground">Product Interest</Label>
                  <div className="font-medium">{getProductName(selectedLead.productId)}</div>
                </div>
              )}

              {selectedLead.message && (
                <div>
                  <Label className="text-xs text-muted-foreground">Message</Label>
                  <div className="bg-gray-50 p-3 rounded border mt-1">
                    {selectedLead.message}
                  </div>
                </div>
              )}

              {selectedLead.metadata && Object.keys(selectedLead.metadata).length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Additional Details</Label>
                  <div className="bg-gray-50 p-3 rounded border mt-1 space-y-2 text-sm">
                    {Object.entries(selectedLead.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Select
                  value={selectedLead.status}
                  onValueChange={(v) => {
                    handleUpdateStatus(selectedLead.id, v as Lead["status"]);
                    setSelectedLead({ ...selectedLead, status: v as Lead["status"] });
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Mark as New</SelectItem>
                    <SelectItem value="contacted">Mark as Contacted</SelectItem>
                    <SelectItem value="converted">Mark as Converted</SelectItem>
                    <SelectItem value="archived">Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
