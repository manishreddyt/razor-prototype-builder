import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Box,
  Text,
  Heading,
  Button,
  Badge,
  TextInput,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@razorpay/blade/components";
import { SearchIcon, PlusIcon } from "@razorpay/blade/components";

const existingPages = [
  {
    id: "pp_c01",
    title: "Online Course",
    totalSales: "₹ 1,080.00",
    itemName: "Online Course",
    itemPrice: "Amount",
    unitsSold: 1,
    pageUrl: "https://rzp.io/rzp/z4NuPQgY",
    createdOn: "13 Apr 2026",
    status: "Active" as const,
  },
  {
    id: "pp_c02",
    title: "Online Course",
    totalSales: "₹ 0.00",
    itemName: "Online Course",
    itemPrice: "Amount",
    unitsSold: 0,
    pageUrl: "https://rzp.io/rzp/80FLNRG",
    createdOn: "28 Mar 2026",
    status: "Active" as const,
  },
];

type TopTab = "payment-pages" | "products";
type SubTab = "payment-pages" | "webstore";
type StatusTab = "all" | "active" | "inactive";

const PaymentPagesCurrent = () => {
  const navigate = useNavigate();
  const [topTab, setTopTab] = useState<TopTab>("payment-pages");
  const [subTab, setSubTab] = useState<SubTab>("payment-pages");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [searchTitle, setSearchTitle] = useState("");

  const filtered = existingPages.filter((p) => {
    const matchTitle = p.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchStatus =
      statusTab === "all" ||
      (statusTab === "active" && p.status === "Active") ||
      (statusTab === "inactive" && p.status !== "Active");
    return matchTitle && matchStatus;
  });

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const tableData = filtered.map((p) => ({
    id: p.id,
    title: p.title,
    totalSales: p.totalSales,
    itemName: p.itemName,
    itemPrice: p.itemPrice,
    unitsSold: p.unitsSold,
    pageUrl: p.pageUrl,
    createdOn: p.createdOn,
    status: p.status,
  }));

  return (
    <DashboardLayout>
      <Box>
        {/* Top-level tabs + actions row */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth="thin"
          borderBottomColor="surface.border.gray.muted"
          paddingBottom="spacing.0"
        >
          <Box display="flex" gap="spacing.0">
            {(["payment-pages", "products"] as TopTab[]).map((tab) => (
              <button
                key={tab}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => setTopTab(tab)}
              >
                <Box
                  paddingX="spacing.4"
                  paddingY="spacing.3"
                  borderBottomWidth="thick"
                  borderBottomColor={topTab === tab ? "surface.border.primary.normal" : "transparent"}
                >
                  <Text
                    size="small"
                    weight="medium"
                    color={topTab === tab ? "surface.text.primary.normal" : "surface.text.gray.muted"}
                  >
                    {tab === "payment-pages" ? "Payment Pages" : "Products"}
                  </Text>
                </Box>
              </button>
            ))}
          </Box>
          <Box display="flex" alignItems="center" gap="spacing.3" paddingBottom="spacing.2">
            <Button variant="tertiary" size="small" onClick={() => {}}>
              Need help? Take a tour
            </Button>
            <Button variant="tertiary" size="small" onClick={() => {}}>
              Documentation
            </Button>
            <Button
              variant="primary"
              size="medium"
              icon={PlusIcon}
              iconPosition="left"
              onClick={() => navigate("/payment-pages-current/select")}
            >
              Create Payment Page
            </Button>
          </Box>
        </Box>

        {/* Sub-tabs: Payment Pages / Razorpay Webstore */}
        <Box marginTop="spacing.3" marginBottom="spacing.1">
          <Box
            display="inline-flex"
            alignItems="center"
            backgroundColor="surface.background.gray.moderate"
            borderRadius="medium"
            padding="spacing.1"
          >
            {(["payment-pages", "webstore"] as SubTab[]).map((tab) => (
              <button
                key={tab}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => setSubTab(tab)}
              >
                <Box
                  paddingX="spacing.4"
                  paddingY="spacing.2"
                  borderRadius="medium"
                  backgroundColor={subTab === tab ? "surface.background.gray.subtle" : "transparent"}
                >
                  <Text
                    size="small"
                    weight="medium"
                    color={subTab === tab ? "surface.text.gray.normal" : "surface.text.gray.muted"}
                  >
                    {tab === "payment-pages" ? "Payment Pages" : "Razorpay Webstore"}
                  </Text>
                </Box>
              </button>
            ))}
          </Box>
        </Box>

        {/* Status filter tabs + Search */}
        <Box marginTop="spacing.4" display="flex" flexDirection="column" gap="spacing.3">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Status tabs */}
            <Box
              display="inline-flex"
              alignItems="center"
              backgroundColor="surface.background.gray.moderate"
              borderRadius="medium"
              padding="spacing.1"
            >
              {(["all", "active", "inactive"] as StatusTab[]).map((tab) => (
                <button
                  key={tab}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={() => setStatusTab(tab)}
                >
                  <Box
                    paddingX="spacing.4"
                    paddingY="spacing.2"
                    borderRadius="medium"
                    backgroundColor={statusTab === tab ? "surface.background.primary.intense" : "transparent"}
                  >
                    <Text
                      size="small"
                      weight="medium"
                      color={statusTab === tab ? "surface.text.staticWhite.normal" : "surface.text.gray.muted"}
                    >
                    {tab === "all" ? "All" : tab === "active" ? "Active" : "Inactive"}
                  </Text>
                  </Box>
                </button>
              ))}
            </Box>

            {/* Search */}
            <Box width="240px">
              <TextInput
                label="Search"
                labelPosition="left"
                placeholder="Search by Title"
                icon={SearchIcon}
                value={searchTitle}
                onChange={({ value }) => setSearchTitle(value ?? "")}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {/* Table */}
        <Box marginTop="spacing.4">
          <Table
            data={{
              nodes: tableData,
            }}
          >
            {(tableData) => (
              <>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Total Sales</TableHeaderCell>
                    <TableHeaderCell>Item Name</TableHeaderCell>
                    <TableHeaderCell>Units Sold</TableHeaderCell>
                    <TableHeaderCell>Page URL</TableHeaderCell>
                    <TableHeaderCell>Created On</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row: typeof existingPages[0]) => (
                    <TableRow key={row.id} item={row}>
                      <TableCell>
                        <RouterLink to={`/payment-pages-current/details/${row.id}`} style={{ textDecoration: "none" }}>
                          <Text size="small" color="surface.text.primary.normal">{row.title}</Text>
                        </RouterLink>
                      </TableCell>
                      <TableCell>
                        <Text size="small">{row.totalSales}</Text>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Text size="small">{row.itemName}</Text>
                          <Text size="xsmall" color="surface.text.gray.muted">{row.itemPrice}</Text>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Text size="small">{row.unitsSold}</Text>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap="spacing.2">
                          <Text size="small" color="surface.text.primary.normal" truncateAfterLines={1}>
                            {row.pageUrl}
                          </Text>
                          <Button
                            variant="tertiary"
                            size="xsmall"
                            onClick={() => copyLink(row.pageUrl)}
                            accessibilityLabel="Copy link"
                          >
                            Copy
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Text size="small" color="surface.text.gray.muted">{row.createdOn}</Text>
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={row.status === "Active" ? "positive" : "neutral"}
                          size="small"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}
          </Table>
          {/* Pagination footer */}
          <Box
            paddingX="spacing.4"
            paddingY="spacing.3"
            borderTopWidth="thin"
            borderTopColor="surface.border.gray.muted"
            display="flex"
            justifyContent="flex-end"
          >
            <Text size="xsmall" color="surface.text.gray.muted">
              Showing 1 - {filtered.length}
            </Text>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default PaymentPagesCurrent;
