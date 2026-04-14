import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import {
  Box,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  Link,
  Switch,
  Avatar,
} from "@razorpay/blade/components";
import { CopyIcon } from "@razorpay/blade/components";

const AccountSettings = () => {
  const navigate = useNavigate();

  const copyMerchantId = () => {
    navigator.clipboard.writeText("RoOR1GZ6pOgE14");
    toast.success("Merchant ID copied!");
  };

  return (
    <DashboardLayout>
      <Box>
        {/* Page Title */}
        <Heading size="large" marginBottom="spacing.6">Your profile</Heading>

        {/* Profile Card */}
        <Card marginBottom="spacing.6">
          <CardBody>
            <Box padding="spacing.2" display="flex" gap="spacing.8">
              {/* Left: Avatar + info */}
              <Box display="flex" gap="spacing.5" flex="1">
                <Avatar size="xlarge" name="Manish Reddy" color="primary" />
                <Box>
                  <Heading size="medium">Manish Reddy</Heading>
                  <Text size="small" color="surface.text.gray.muted">Owner</Text>
                  <Box display="flex" alignItems="center" gap="spacing.2" marginTop="spacing.2">
                    <Text size="xsmall" color="surface.text.gray.muted">Merchant ID</Text>
                    <Text size="small" weight="medium">RoOR1GZ6pOgE14</Text>
                    <Button
                      variant="tertiary"
                      size="xsmall"
                      icon={CopyIcon}
                      onClick={copyMerchantId}
                      accessibilityLabel="Copy Merchant ID"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Right: Account details */}
              <Box flex="1">
                <Box display="flex" marginBottom="spacing.3">
                  <Box width="140px" flexShrink="0">
                    <Text size="small" color="surface.text.gray.muted">Phone number</Text>
                  </Box>
                  <Box display="flex" alignItems="center" gap="spacing.2">
                    <Text size="small">+91 9920 972082</Text>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Edit coming soon"); }}>
                      Edit
                    </Link>
                  </Box>
                </Box>
                <Box display="flex" marginBottom="spacing.3">
                  <Box width="140px" flexShrink="0">
                    <Text size="small" color="surface.text.gray.muted">Login email</Text>
                  </Box>
                  <Box display="flex" alignItems="center" gap="spacing.2">
                    <Text size="small">manishreddy.t+321@razorpay.com</Text>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Edit coming soon"); }}>
                      Edit
                    </Link>
                  </Box>
                </Box>
                <Box display="flex" marginBottom="spacing.3">
                  <Box width="140px" flexShrink="0">
                    <Text size="small" color="surface.text.gray.muted">Password</Text>
                  </Box>
                  <Box display="flex" alignItems="center" gap="spacing.2">
                    <Text size="small">••••••••</Text>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Edit coming soon"); }}>
                      Edit
                    </Link>
                  </Box>
                </Box>
                <Box display="flex">
                  <Box width="140px" flexShrink="0">
                    <Text size="small" color="surface.text.gray.muted">2-step verification</Text>
                  </Box>
                  <Switch
                    accessibilityLabel="Enable 2-step verification"
                    isChecked={false}
                    onChange={() => toast.info("2FA settings coming soon")}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </CardBody>
        </Card>

        {/* Account and product settings */}
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.5">
          <Heading size="medium">Account and product settings</Heading>
          <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Documentation coming soon"); }}>
            Documentation
          </Link>
        </Box>

        <Box display="flex" gap="spacing.5" flexWrap="wrap">
          {/* Payment methods card */}
          <Box width="340px">
            <Card>
              <CardBody>
                <Box padding="spacing.2">
                  <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.4">
                    <Box
                      width="32px"
                      height="32px"
                      borderRadius="medium"
                      backgroundColor="surface.background.primary.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text size="small">💳</Text>
                    </Box>
                    <Heading size="small">Payment methods</Heading>
                  </Box>
                  <Box display="flex" flexDirection="column" gap="spacing.2">
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Cards</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>UPI/QR</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Netbanking</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>EMI</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Wallet</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Pay Later</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>International payments</Link>
                  </Box>
                </Box>
              </CardBody>
            </Card>
          </Box>

          {/* Website and app settings card */}
          <Box width="340px">
            <Card>
              <CardBody>
                <Box padding="spacing.2">
                  <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.4">
                    <Box
                      width="32px"
                      height="32px"
                      borderRadius="medium"
                      backgroundColor="surface.background.positive.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text size="small">🌐</Text>
                    </Box>
                    <Heading size="small">Website and app settings</Heading>
                  </Box>
                  <Box display="flex" flexDirection="column" gap="spacing.2">
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Business website detail</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>API Keys</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Webhooks</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Applications</Link>
                  </Box>
                </Box>
              </CardBody>
            </Card>
          </Box>

          {/* Business settings card */}
          <Box width="340px">
            <Card>
              <CardBody>
                <Box padding="spacing.2">
                  <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.4">
                    <Box
                      width="32px"
                      height="32px"
                      borderRadius="medium"
                      backgroundColor="surface.background.notice.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text size="small">🏢</Text>
                    </Box>
                    <Heading size="small">Business settings</Heading>
                  </Box>
                  <Box display="flex" flexDirection="column" gap="spacing.2">
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>GST details</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate("/account-settings/receipts"); }}>Receipts settings</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Business details</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Bank account</Link>
                  </Box>
                </Box>
              </CardBody>
            </Card>
          </Box>

          {/* Payments and refunds card */}
          <Box width="340px">
            <Card>
              <CardBody>
                <Box padding="spacing.2">
                  <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.4">
                    <Box
                      width="32px"
                      height="32px"
                      borderRadius="medium"
                      backgroundColor="surface.background.information.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text size="small">💰</Text>
                    </Box>
                    <Heading size="small">Payments and refunds</Heading>
                  </Box>
                  <Box display="flex" flexDirection="column" gap="spacing.2">
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Payment capture settings</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Refund settings</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Flash checkout</Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); toast.info("Coming soon"); }}>Checkout customisation</Link>
                  </Box>
                </Box>
              </CardBody>
            </Card>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AccountSettings;
