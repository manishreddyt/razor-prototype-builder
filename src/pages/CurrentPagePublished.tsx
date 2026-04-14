import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Copy, ExternalLink, Check, Mail, ArrowUpRight, BarChart3, ShoppingCart, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { CurrentPaymentReceiptsModal } from "@/components/current-pp/PaymentReceiptsModal";
import { CurrentPageSettingsModal } from "@/components/current-pp/PageSettingsModal";
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Link,
} from "@razorpay/blade/components";

const CurrentPagePublished = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageTitle = searchParams.get("title") || "Online Course";
  const [copied, setCopied] = useState(false);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const pageUrl = "https://rzp.io/rzp/WxYhV5PH";

  const copyUrl = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAsLink = () => {
    const html = `<a href="${pageUrl}">${pageTitle}</a>`;
    navigator.clipboard.writeText(html);
    toast.success("HTML link copied to clipboard!");
  };

  return (
    <Box minHeight="100vh" backgroundColor="surface.background.gray.moderate" display="flex" flexDirection="column">
      {/* Top bar */}
      <Box
        backgroundColor="surface.background.gray.intense"
        height="56px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingX="spacing.6"
      >
        <Text size="small" weight="medium" color="surface.text.staticWhite.normal">
          Page Published
        </Text>
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate("/payment-pages-current")}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Main content area */}
      <Box flex="1" paddingX="spacing.8" paddingY="spacing.6" maxWidth="960px" marginX="auto" width="100%">
        {/* Edit Page link */}
        <Box marginBottom="spacing.5">
          <Button
            variant="tertiary"
            size="small"
            onClick={() => navigate("/payment-pages-current/create")}
          >
            ← EDIT PAGE
          </Button>
        </Box>

        {/* Success Card */}
        <Box marginBottom="spacing.6">
          <Card>
            <CardBody>
              <Box padding="spacing.2">
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  {/* Left side */}
                  <Box flex="1">
                    {/* Category tag */}
                    <Text size="xsmall" weight="semibold" color="surface.text.gray.muted" marginBottom="spacing.2">
                      {pageTitle.toUpperCase()}
                    </Text>

                    {/* Success message */}
                    <Box display="flex" alignItems="center" gap="spacing.2" marginBottom="spacing.5">
                      <Badge color="positive" size="medium">Live</Badge>
                      <Heading size="medium">Your page is now live!</Heading>
                    </Box>

                    {/* Page URL row */}
                    <Box display="flex" alignItems="center" gap="spacing.3">
                      <Text size="small" color="surface.text.gray.muted">Page URL</Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        borderWidth="thin"
                        borderColor="surface.border.gray.muted"
                        borderRadius="medium"
                        overflow="hidden"
                      >
                        <Box paddingX="spacing.3" paddingY="spacing.2" backgroundColor="surface.background.gray.moderate">
                          <Text size="small" color="surface.text.primary.normal" weight="medium">
                            {pageUrl}
                          </Text>
                        </Box>
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={copyUrl}
                        >
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={copyAsLink}
                        >
                          Share
                        </Button>
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={() => toast.info("Customize URL coming soon")}
                        >
                          CUSTOMIZE URL
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* Right side — Page preview thumbnail */}
                  <Box marginLeft="spacing.8" flexShrink="0">
                    <button
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => window.open(pageUrl, "_blank")}
                    >
                    <Box
                      width="180px"
                      height="120px"
                      borderRadius="medium"
                      borderWidth="thin"
                      borderColor="surface.border.gray.muted"
                      backgroundColor="surface.background.gray.moderate"
                      overflow="hidden"
                      position="relative"
                    >
                      <Box padding="spacing.3" height="100%" display="flex" flexDirection="column">
                        <Box display="flex" alignItems="center" gap="spacing.2" marginBottom="spacing.2">
                          <Box
                            width="20px"
                            height="20px"
                            borderRadius="round"
                            backgroundColor="surface.background.primary.intense"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text size="xsmall" color="surface.text.staticWhite.normal" weight="bold">W</Text>
                          </Box>
                          <Text size="xsmall" color="surface.text.gray.muted">WEALTHJOY</Text>
                        </Box>
                        <Text size="xsmall" weight="semibold" marginBottom="spacing.1">{pageTitle}</Text>
                        <Box flex="1" display="flex" gap="spacing.2">
                          <Box flex="1" display="flex" flexDirection="column" gap="spacing.1">
                            <Box height="6px" backgroundColor="surface.background.gray.moderate" borderRadius="small" width="75%" />
                            <Box height="6px" backgroundColor="surface.background.gray.moderate" borderRadius="small" width="50%" />
                            <Box height="6px" backgroundColor="surface.background.gray.moderate" borderRadius="small" width="66%" />
                          </Box>
                          <Box width="56px" display="flex" flexDirection="column" gap="spacing.1">
                            <Box height="6px" backgroundColor="surface.background.gray.moderate" borderRadius="small" />
                            <Box height="6px" backgroundColor="surface.background.gray.moderate" borderRadius="small" />
                            <Box height="12px" backgroundColor="surface.background.primary.subtle" borderRadius="small" marginTop="spacing.1" />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    </button>
                  </Box>
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Box>

        {/* Next Steps Card */}
        <Card>
          <CardBody>
            <Box padding="spacing.2">
              <Heading size="small" marginBottom="spacing.1">Next Steps for Your Page</Heading>
              <Box height="2px" width="32px" backgroundColor="surface.background.primary.intense" marginBottom="spacing.5" borderRadius="full" />

              {/* Section 1: Receipts */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                marginBottom="spacing.5"
                paddingBottom="spacing.5"
                borderBottomWidth="thin"
                borderBottomColor="surface.border.gray.muted"
              >
                <Box flex="1" display="flex" gap="spacing.3">
                  <Box
                    width="20px"
                    height="20px"
                    borderRadius="round"
                    backgroundColor="surface.background.positive.subtle"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                    marginTop="spacing.1"
                  >
                    <Mail size={12} color="#1e8e3e" />
                  </Box>
                  <Box>
                    <Text size="small">
                      <Text as="span" weight="medium">Receipts will be sent automatically</Text> to customers after each payment
                    </Text>
                    <Text size="xsmall" color="surface.text.gray.muted" marginTop="spacing.1">
                      You can customise your receipt by adding customer's information & billing details
                    </Text>
                  </Box>
                </Box>
                <Box marginLeft="spacing.4" flexShrink="0">
                  <Button variant="secondary" size="small" onClick={() => setShowReceiptsModal(true)}>
                    Receipt Settings
                  </Button>
                </Box>
              </Box>

              {/* Section 2: Page Settings */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box flex="1" display="flex" flexDirection="column" gap="spacing.3">
                  {/* Redirect */}
                  <Box display="flex" gap="spacing.3" alignItems="flex-start">
                    <Box
                      width="20px"
                      height="20px"
                      borderRadius="round"
                      backgroundColor="surface.background.primary.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink="0"
                      marginTop="spacing.1"
                    >
                      <ArrowUpRight size={12} color="#1a56db" />
                    </Box>
                    <Text size="small">
                      <Text as="span" weight="medium">Redirect</Text> customers to your website after payment
                    </Text>
                  </Box>

                  {/* Shiprocket */}
                  <Box display="flex" gap="spacing.3" alignItems="flex-start">
                    <Box
                      width="20px"
                      height="20px"
                      borderRadius="round"
                      backgroundColor="surface.background.notice.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink="0"
                      marginTop="spacing.1"
                    >
                      <ShoppingCart size={12} color="#e65100" />
                    </Box>
                    <Text size="small">
                      <Text as="span" weight="medium">Create orders on Shiprocket</Text> after customer pays on this page
                    </Text>
                  </Box>

                  {/* Tracking */}
                  <Box display="flex" gap="spacing.3" alignItems="flex-start">
                    <Box
                      width="20px"
                      height="20px"
                      borderRadius="round"
                      backgroundColor="surface.background.information.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink="0"
                      marginTop="spacing.1"
                    >
                      <BarChart3 size={12} color="#6200ea" />
                    </Box>
                    <Text size="small">
                      <Text as="span" weight="medium">Track</Text> page usage with Facebook Pixel & Google Analytics
                    </Text>
                  </Box>

                  <Text size="small" color="surface.text.gray.disabled" marginLeft="spacing.8">
                    ...and more!
                  </Text>
                </Box>

                <Box marginLeft="spacing.4" flexShrink="0">
                  <Button variant="secondary" size="small" onClick={() => setShowSettingsModal(true)}>
                    Page Settings
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardBody>
        </Card>
      </Box>

      {/* Help & Support floating button */}
      <Box position="fixed" bottom="spacing.6" right="spacing.6">
        <Button
          variant="primary"
          size="small"
          onClick={() => toast.info("Help & Support coming soon")}
        >
          Help & Support
        </Button>
      </Box>

      {/* Modals */}
      <CurrentPaymentReceiptsModal
        open={showReceiptsModal}
        onClose={() => setShowReceiptsModal(false)}
      />
      <CurrentPageSettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </Box>
  );
};

export default CurrentPagePublished;
