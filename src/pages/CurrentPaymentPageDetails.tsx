import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import {
  Box,
  Text,
  Heading,
  Button,
  Badge,
  Card,
  CardBody,
  Divider,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Link,
  IconButton,
  TextInput,
} from "@razorpay/blade/components";
import {
  CopyIcon,
  ShareIcon,
  SettingsIcon,
  EditIcon,
  SearchIcon,
  DownloadIcon,
  ChevronLeftIcon,
} from "@razorpay/blade/components";

// Mock data keyed by page id
const pageDataMap: Record<string, {
  id: string;
  pageId: string;
  title: string;
  pageUrl: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdByEmail: string;
  createdOn: string;
  expiresOn: string;
  items: { name: string; revenue: string; price: string; unitsSold: number }[];
  transactions: { paymentId: string; amount: string; customerPhone: string; customerEmail: string; createdAt: string; status: string }[];
  totalPayments: number;
  totalRevenue: string;
}> = {
  pp_c01: {
    id: "pp_c01",
    pageId: "pl_Sbi0FDr3fuMJ5Z",
    title: "Online Course",
    pageUrl: "https://rzp.io/rzp/z4NuPQgY",
    status: "Active",
    createdBy: "Manish Reddy",
    createdByEmail: "manishreddy.t+321@razorpay.com",
    createdOn: "10 Apr 2026",
    expiresOn: "No Expiry",
    items: [
      { name: "Amount", revenue: "₹10.00", price: "₹5.00", unitsSold: 2 },
      { name: "Item 2", revenue: "₹4.00", price: "₹2.00", unitsSold: 2 },
    ],
    transactions: [
      { paymentId: "pay_Sctw8xT0RnJJku", amount: "₹ 7.00", customerPhone: "+91 9920 972082", customerEmail: "manishredditirumala@gmail.com", createdAt: "Apr 13, 2026", status: "Captured" },
      { paymentId: "pay_SctqObLqSowYkp", amount: "₹ 7.00", customerPhone: "+91 9920 972082", customerEmail: "manishredditirumala@gmail.com", createdAt: "Apr 13, 2026", status: "Captured" },
    ],
    totalPayments: 2,
    totalRevenue: "₹ 14.00",
  },
  pp_c02: {
    id: "pp_c02",
    pageId: "pl_RxK9mWq2abNP7Y",
    title: "Online Course",
    pageUrl: "https://rzp.io/rzp/80FLNRG",
    status: "Active",
    createdBy: "Manish Reddy",
    createdByEmail: "manishreddy.t+321@razorpay.com",
    createdOn: "28 Mar 2026",
    expiresOn: "No Expiry",
    items: [
      { name: "Amount", revenue: "₹0.00", price: "₹0.00", unitsSold: 0 },
    ],
    transactions: [],
    totalPayments: 0,
    totalRevenue: "₹ 0.00",
  },
};

type TxnTab = "all" | "authorized" | "captured" | "refunded" | "failed";

const CurrentPaymentPageDetails = () => {
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId: string }>();
  const [txnTab, setTxnTab] = useState<TxnTab>("all");
  const [searchPayment, setSearchPayment] = useState("");
  const [showMore, setShowMore] = useState(false);

  const data = pageDataMap[pageId || ""];

  if (!data) {
    return (
      <DashboardLayout>
        <Box padding="spacing.8">
          <Text>Payment page not found.</Text>
          <Box marginTop="spacing.4">
            <Button variant="tertiary" onClick={() => navigate("/payment-pages-current")}>
              ← Back to All Payment Pages
            </Button>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(data.pageUrl);
    toast.success("URL copied to clipboard!");
  };

  const filteredTxns = data.transactions.filter((t) => {
    if (txnTab === "all") return true;
    return t.status.toLowerCase() === txnTab;
  });

  const tableData = filteredTxns.map((t, i) => ({
    id: `txn_${i}`,
    ...t,
  }));

  return (
    <DashboardLayout>
      <Box>
        {/* Breadcrumb */}
        <Box display="flex" alignItems="center" gap="spacing.2" marginBottom="spacing.5">
          <Button
            variant="tertiary"
            size="small"
            icon={ChevronLeftIcon}
            iconPosition="left"
            onClick={() => navigate("/payment-pages-current")}
          >
            All Payment Pages
          </Button>
          <Text size="small" color="surface.text.gray.muted">/</Text>
          <Text size="small" color="surface.text.gray.muted">{data.title}</Text>
        </Box>

        {/* Page Title + Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.5">
          <Heading size="large">{data.title}</Heading>
          <Box display="flex" alignItems="center" gap="spacing.3">
            <IconButton
              icon={ShareIcon}
              accessibilityLabel="Share"
              size="medium"
              emphasis="subtle"
              onClick={() => toast.info("Share coming soon")}
            />
            <IconButton
              icon={CopyIcon}
              accessibilityLabel="Copy"
              size="medium"
              emphasis="subtle"
              onClick={copyUrl}
            />
            <IconButton
              icon={SettingsIcon}
              accessibilityLabel="Settings"
              size="medium"
              emphasis="subtle"
              onClick={() => toast.info("Settings coming soon")}
            />
            <Button
              variant="primary"
              size="small"
              icon={EditIcon}
              iconPosition="left"
              onClick={() => navigate("/payment-pages-current/create")}
            >
              Edit Page
            </Button>
          </Box>
        </Box>

        {/* Details Card */}
        <Box marginBottom="spacing.6">
          <Card>
            <CardBody>
              <Box padding="spacing.2" display="flex" gap="spacing.6">
                {/* Left: Page details */}
                <Box flex="1">
                  {/* Page URL */}
                  <Box display="flex" marginBottom="spacing.4">
                    <Box width="140px" flexShrink="0">
                      <Text size="small" color="surface.text.gray.muted">Page URL</Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="spacing.2">
                      <Text size="small" color="surface.text.primary.normal">{data.pageUrl}</Text>
                      <IconButton
                        icon={CopyIcon}
                        accessibilityLabel="Copy URL"
                        size="small"
                        emphasis="subtle"
                        onClick={copyUrl}
                      />
                    </Box>
                  </Box>

                  {/* Page Status */}
                  <Box display="flex" alignItems="center" marginBottom="spacing.4">
                    <Box width="140px" flexShrink="0">
                      <Text size="small" color="surface.text.gray.muted">Page Status</Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="spacing.3">
                      <Badge color="positive" size="small">{data.status}</Badge>
                      <Button
                        variant="tertiary"
                        size="xsmall"
                        onClick={() => toast.info("Deactivate coming soon")}
                      >
                        Deactivate
                      </Button>
                    </Box>
                  </Box>

                  {/* Payment Page ID */}
                  <Box display="flex" marginBottom="spacing.4">
                    <Box width="140px" flexShrink="0">
                      <Text size="small" color="surface.text.gray.muted">Payment Page ID</Text>
                    </Box>
                    <Text size="small">{data.pageId}</Text>
                  </Box>

                  {/* Created by */}
                  <Box display="flex" marginBottom="spacing.4">
                    <Box width="140px" flexShrink="0">
                      <Text size="small" color="surface.text.gray.muted">Created by</Text>
                    </Box>
                    <Box>
                      <Text size="small" weight="medium">{data.createdBy}</Text>
                      <Text size="xsmall" color="surface.text.gray.muted">{data.createdByEmail}</Text>
                    </Box>
                  </Box>

                  {/* Created On */}
                  <Box display="flex" marginBottom="spacing.4">
                    <Box width="140px" flexShrink="0">
                      <Text size="small" color="surface.text.gray.muted">Created On</Text>
                    </Box>
                    <Text size="small">{data.createdOn}</Text>
                  </Box>

                  {/* Expires On */}
                  <Box display="flex">
                    <Box width="140px" flexShrink="0">
                      <Text size="small" color="surface.text.gray.muted">Expires On</Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="spacing.2">
                      <Text size="small">{data.expiresOn}</Text>
                      <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Change expiry coming soon"); }}>
                        Change
                      </Link>
                    </Box>
                  </Box>
                </Box>

                {/* Right: Item cards */}
                <Box width="320px" flexShrink="0" display="flex" flexDirection="column" gap="spacing.3">
                  {data.items.slice(0, showMore ? data.items.length : 2).map((item, idx) => (
                    <Box
                      key={idx}
                      borderWidth="thin"
                      borderColor="surface.border.gray.muted"
                      borderRadius="medium"
                      padding="spacing.4"
                    >
                      <Text size="small" weight="semibold" color="surface.text.gray.normal" marginBottom="spacing.3">
                        {item.name}
                      </Text>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                        <Box>
                          <Text size="xsmall" color="surface.text.gray.muted">Revenue</Text>
                          <Text size="small" weight="medium">{item.revenue}</Text>
                        </Box>
                        <Box>
                          <Text size="xsmall" color="surface.text.gray.muted">Price</Text>
                          <Text size="small" weight="medium">{item.price}</Text>
                        </Box>
                        <Box>
                          <Text size="xsmall" color="surface.text.gray.muted">Units Sold</Text>
                          <Text size="small" weight="medium">{item.unitsSold}</Text>
                        </Box>
                        <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Update Stock coming soon"); }}>
                          Update Stock
                        </Link>
                      </Box>
                    </Box>
                  ))}
                  {data.items.length > 2 && !showMore && (
                    <Box textAlign="center">
                      <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); setShowMore(true); }}>
                        Show More
                      </Link>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Box>

        {/* Transactions Section */}
        <Card>
          <CardBody>
            <Box padding="spacing.2">
              {/* Transactions header */}
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.4">
                <Box display="flex" alignItems="center" gap="spacing.5">
                  <Heading size="small">Transactions</Heading>
                  <Text size="small" color="surface.text.gray.muted">
                    Total Payments <Text as="span" weight="semibold">{data.totalPayments}</Text>
                  </Text>
                  <Text size="small" color="surface.text.gray.muted">
                    Total revenue <Text as="span" weight="semibold">{data.totalRevenue}</Text>
                  </Text>
                </Box>
                <Button
                  variant="tertiary"
                  size="small"
                  icon={DownloadIcon}
                  iconPosition="left"
                  onClick={() => toast.info("Download report coming soon")}
                >
                  Download Report
                </Button>
              </Box>

              {/* Transaction filter tabs */}
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.4">
                <Box display="flex" gap="spacing.0">
                  {(["all", "authorized", "captured", "refunded", "failed"] as TxnTab[]).map((tab) => (
                    <button
                      key={tab}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => setTxnTab(tab)}
                    >
                      <Box
                        paddingX="spacing.4"
                        paddingY="spacing.2"
                        borderBottomWidth="thick"
                        borderBottomColor={txnTab === tab ? "surface.border.primary.normal" : "transparent"}
                      >
                        <Text
                          size="small"
                          weight="medium"
                          color={txnTab === tab ? "surface.text.primary.normal" : "surface.text.gray.muted"}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                      </Box>
                    </button>
                  ))}
                </Box>
                <Box width="240px">
                  <TextInput
                    label="Search"
                    labelPosition="left"
                    placeholder="Search by Payment ID"
                    icon={SearchIcon}
                    value={searchPayment}
                    onChange={({ value }) => setSearchPayment(value ?? "")}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Status filter chip */}
              <Box marginBottom="spacing.4">
                <Box display="inline-flex" alignItems="center" gap="spacing.2" paddingX="spacing.3" paddingY="spacing.1" backgroundColor="surface.background.gray.moderate" borderRadius="medium">
                  <Text size="xsmall" color="surface.text.gray.muted">Status: All</Text>
                </Box>
              </Box>

              {/* Transactions Table */}
              {tableData.length > 0 ? (
                <>
                  <Table
                    data={{ nodes: tableData }}
                  >
                    {(tData) => (
                      <>
                        <TableHeader>
                          <TableHeaderRow>
                            <TableHeaderCell>Payment Id</TableHeaderCell>
                            <TableHeaderCell>Amount</TableHeaderCell>
                            <TableHeaderCell>Customer</TableHeaderCell>
                            <TableHeaderCell>Created At</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                          </TableHeaderRow>
                        </TableHeader>
                        <TableBody>
                          {tData.map((row: typeof tableData[0]) => (
                            <TableRow key={row.id} item={row}>
                              <TableCell>
                                <Text size="small" color="surface.text.primary.normal">{row.paymentId}</Text>
                              </TableCell>
                              <TableCell>
                                <Text size="small">{row.amount}</Text>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Text size="small">{row.customerPhone}</Text>
                                  <Text size="xsmall" color="surface.text.gray.muted">{row.customerEmail}</Text>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Text size="small">{row.createdAt}</Text>
                              </TableCell>
                              <TableCell>
                                <Badge color="positive" size="small">{row.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </>
                    )}
                  </Table>
                  <Box
                    paddingX="spacing.4"
                    paddingY="spacing.3"
                    borderTopWidth="thin"
                    borderTopColor="surface.border.gray.muted"
                    display="flex"
                    justifyContent="center"
                  >
                    <Text size="xsmall" color="surface.text.gray.muted">
                      Showing 1 - {tableData.length}
                    </Text>
                  </Box>
                </>
              ) : (
                <Box padding="spacing.8" textAlign="center">
                  <Text size="small" color="surface.text.gray.muted">No transactions yet</Text>
                </Box>
              )}
            </Box>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default CurrentPaymentPageDetails;
