import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import {
  Box,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  Divider,
  TextInput,
  Checkbox,
  Link,
  Badge,
  Switch,
  Avatar,
  FileUpload,
} from "@razorpay/blade/components";
import {
  CopyIcon,
  EditIcon,
  CreditCardIcon,
  SettingsIcon,
  ReceiptIcon,
  InfoIcon,
} from "@razorpay/blade/components";

const AccountSettings = () => {
  // Receipts Settings state
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);
  const [receiptPrefix, setReceiptPrefix] = useState("INV-");
  const [receiptStartFrom, setReceiptStartFrom] = useState("0001");
  const [merchantName, setMerchantName] = useState("Manish Reddy");
  const [gstNumber, setGstNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [receiptDetails, setReceiptDetails] = useState("");
  const [showReceiptsSettings, setShowReceiptsSettings] = useState(false);

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

          {/* Receipts Settings card */}
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
                      <Text size="small">🧾</Text>
                    </Box>
                    <Heading size="small">Receipts settings</Heading>
                  </Box>
                  <Box display="flex" flexDirection="column" gap="spacing.2">
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); setShowReceiptsSettings(true); }}>
                      Send Receipts
                    </Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); setShowReceiptsSettings(true); }}>
                      GST Receipt Numbering
                    </Link>
                    <Link href="#" size="small" onClick={(e: React.MouseEvent) => { e.preventDefault(); setShowReceiptsSettings(true); }}>
                      Details on Receipts
                    </Link>
                  </Box>
                </Box>
              </CardBody>
            </Card>
          </Box>
        </Box>

        {/* Receipts Settings Expanded Section */}
        {showReceiptsSettings && (
          <Box marginTop="spacing.6">
            <Card>
              <CardBody>
                <Box padding="spacing.2">
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.5">
                    <Heading size="medium">Receipts Settings</Heading>
                    <Button
                      variant="tertiary"
                      size="small"
                      onClick={() => setShowReceiptsSettings(false)}
                    >
                      Close
                    </Button>
                  </Box>

                  {/* Send Receipts via */}
                  <Box marginBottom="spacing.6">
                    <Text size="medium" weight="semibold" marginBottom="spacing.3">
                      Send Receipts via
                    </Text>
                    <Box display="flex" gap="spacing.5">
                      <Checkbox
                        isChecked={sendViaEmail}
                        onChange={({ isChecked }) => setSendViaEmail(isChecked)}
                      >
                        Email
                      </Checkbox>
                      <Checkbox
                        isChecked={sendViaWhatsapp}
                        onChange={({ isChecked }) => setSendViaWhatsapp(isChecked)}
                      >
                        WhatsApp
                      </Checkbox>
                    </Box>
                  </Box>

                  <Divider />

                  {/* GST Receipts Numbering */}
                  <Box marginTop="spacing.5" marginBottom="spacing.6">
                    <Text size="medium" weight="semibold" marginBottom="spacing.3">
                      GST Receipts Numbering
                    </Text>
                    <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.4">
                      Configure the receipt numbering format for GST invoices
                    </Text>
                    <Box display="flex" gap="spacing.4" alignItems="flex-end">
                      <Box width="200px">
                        <TextInput
                          label="Prefix"
                          labelPosition="top"
                          value={receiptPrefix}
                          onChange={({ value }) => setReceiptPrefix(value ?? "")}
                          placeholder="INV-"
                          size="medium"
                        />
                      </Box>
                      <Box width="200px">
                        <TextInput
                          label="Start from"
                          labelPosition="top"
                          value={receiptStartFrom}
                          onChange={({ value }) => setReceiptStartFrom(value ?? "")}
                          placeholder="0001"
                          size="medium"
                        />
                      </Box>
                      <Box paddingBottom="spacing.1">
                        <Text size="small" color="surface.text.gray.muted">
                          Preview: <Text as="span" weight="semibold">{receiptPrefix}{receiptStartFrom}</Text>
                        </Text>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Details printed on Receipts */}
                  <Box marginTop="spacing.5">
                    <Text size="medium" weight="semibold" marginBottom="spacing.3">
                      Details printed on Receipts
                    </Text>
                    <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.4">
                      These details will appear on all payment receipts and GST invoices
                    </Text>
                    <Box display="flex" flexDirection="column" gap="spacing.4">
                      <Box display="flex" gap="spacing.4">
                        <Box flex="1">
                          <TextInput
                            label="Merchant Name"
                            labelPosition="top"
                            value={merchantName}
                            onChange={({ value }) => setMerchantName(value ?? "")}
                            placeholder="Your business name"
                            size="medium"
                          />
                        </Box>
                        <Box flex="1">
                          <TextInput
                            label="GST Number"
                            labelPosition="top"
                            value={gstNumber}
                            onChange={({ value }) => setGstNumber(value ?? "")}
                            placeholder="e.g., 29ABCDE1234F1Z5"
                            size="medium"
                          />
                        </Box>
                      </Box>
                      <TextInput
                        label="Company Address"
                        labelPosition="top"
                        value={companyAddress}
                        onChange={({ value }) => setCompanyAddress(value ?? "")}
                        placeholder="Full registered address"
                        size="medium"
                      />
                      <TextInput
                        label="Additional Details"
                        labelPosition="top"
                        value={receiptDetails}
                        onChange={({ value }) => setReceiptDetails(value ?? "")}
                        placeholder="Any additional information to show on receipts"
                        size="medium"
                      />

                      {/* Logo Upload */}
                      <Box>
                        <Text size="small" weight="medium" marginBottom="spacing.2">
                          Logo
                        </Text>
                        <FileUpload
                          uploadType="single"
                          label="Upload Logo"
                          helpText="Upload .png, .jpg or .jpeg file | 1 MB Max"
                          acceptedFileTypes=".png,.jpg,.jpeg"
                          maxSize={1024 * 1024}
                          onChange={({ fileList }) => {
                            if (fileList.length > 0) {
                              toast.success(`Logo "${fileList[0].name}" uploaded`);
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Save */}
                  <Box marginTop="spacing.6" display="flex" justifyContent="flex-end" gap="spacing.3">
                    <Button variant="tertiary" onClick={() => setShowReceiptsSettings(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        toast.success("Receipts settings saved!");
                        setShowReceiptsSettings(false);
                      }}
                    >
                      Save Settings
                    </Button>
                  </Box>
                </Box>
              </CardBody>
            </Card>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AccountSettings;
