import { useState } from "react";
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
  Divider,
  TextInput,
  Checkbox,
  Link,
  Switch,
  FileUpload,
} from "@razorpay/blade/components";
import { ArrowLeftIcon } from "@razorpay/blade/components";

const ReceiptsSettings = () => {
  const navigate = useNavigate();

  // Send Receipts state
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);

  // GST Receipts Numbering state
  const [receiptPrefix, setReceiptPrefix] = useState("INV-");
  const [receiptStartFrom, setReceiptStartFrom] = useState("0001");

  // Details on Receipts state
  const [merchantName, setMerchantName] = useState("Manish Reddy");
  const [gstNumber, setGstNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [receiptDetails, setReceiptDetails] = useState("");

  const handleSave = () => {
    toast.success("Receipts settings saved!");
    navigate("/account-settings");
  };

  return (
    <DashboardLayout>
      <Box>
        {/* Back link + Title */}
        <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.6">
          <Button
            variant="tertiary"
            size="small"
            icon={ArrowLeftIcon}
            onClick={() => navigate("/account-settings")}
            accessibilityLabel="Back to Account Settings"
          />
          <Heading size="large">Receipts Settings</Heading>
        </Box>

        {/* Send Receipts via */}
        <Card marginBottom="spacing.5">
          <CardBody>
            <Box padding="spacing.2">
              <Heading size="small" marginBottom="spacing.2">Send Receipts via</Heading>
              <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.4">
                Choose how payment receipts are delivered to your customers
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
          </CardBody>
        </Card>

        {/* GST Receipts Numbering */}
        <Card marginBottom="spacing.5">
          <CardBody>
            <Box padding="spacing.2">
              <Heading size="small" marginBottom="spacing.2">GST Receipts Numbering</Heading>
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
          </CardBody>
        </Card>

        {/* Details printed on Receipts */}
        <Card marginBottom="spacing.5">
          <CardBody>
            <Box padding="spacing.2">
              <Heading size="small" marginBottom="spacing.2">Details printed on Receipts</Heading>
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
          </CardBody>
        </Card>

        {/* Save / Cancel */}
        <Box display="flex" justifyContent="flex-end" gap="spacing.3">
          <Button variant="tertiary" onClick={() => navigate("/account-settings")}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ReceiptsSettings;
