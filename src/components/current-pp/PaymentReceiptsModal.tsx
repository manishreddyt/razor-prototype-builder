import { useState } from "react";
import { toast } from "sonner";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  Button,
  Text,
  Heading,
  RadioGroup,
  Radio,
  Switch,
  TextInput,
  SelectInput,
  ActionList,
  ActionListItem,
  Checkbox,
  Alert,
  Badge,
  Link,
  TextArea,
  FileUpload,
} from "@razorpay/blade/components";
import { ChevronUpIcon, ChevronDownIcon, ExternalLinkIcon, UploadIcon } from "@razorpay/blade/components";

interface PaymentFieldItem {
  id: string;
  label: string;
  type: string;
  rate?: string;
}

interface PaymentReceiptsModalProps {
  open: boolean;
  onClose: () => void;
  paymentItems?: PaymentFieldItem[];
  onGstChange?: (enabled: boolean) => void;
}

interface GstLineItem {
  id: string;
  item: string;
  fieldName: string;
  rate: string;
  taxRate: string;
  hsnSac: string;
}

export const CurrentPaymentReceiptsModal = ({ open, onClose, paymentItems, onGstChange }: PaymentReceiptsModalProps) => {
  const [receiptMode, setReceiptMode] = useState("auto");

  // Customer info field selections
  const [customerFields, setCustomerFields] = useState({
    email: true,
    phone: true,
    name: false,
    pan: false,
  });
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);

  // Billing details (80G)
  const [showBillingDetails, setShowBillingDetails] = useState(true);
  const [eightyGDescription, setEightyGDescription] = useState(
    "All donations made to us are eligible for tax exemption under 80G of IT act ITBA/EXM/S80G/2019-20/1XXXXXXX Dated DD/MM/YYYY"
  );

  // GST Receipt
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstExpanded, setGstExpanded] = useState(true);

  // Customer info expanded
  const [customerInfoExpanded, setCustomerInfoExpanded] = useState(true);

  // 80G expanded
  const [billingExpanded, setBillingExpanded] = useState(true);

  // Pre-fill GST line items from payment form fields
  const priceFields = paymentItems ? paymentItems.filter((f) => f.type === "price") : [];
  const initialGstItems: GstLineItem[] = priceFields.length > 0
    ? priceFields.map((field, idx) => ({
        id: `g${idx + 1}`,
        item: field.label,
        fieldName: field.label,
        rate: field.rate || "",
        taxRate: "",
        hsnSac: "",
      }))
    : [{ id: "g1", item: "", fieldName: "", rate: "", taxRate: "", hsnSac: "" }];

  const [gstLineItems, setGstLineItems] = useState<GstLineItem[]>(initialGstItems);

  const handleSave = () => {
    toast.success("Payment receipt settings saved!");
    onClose();
  };

  const toggleCustomerField = (field: keyof typeof customerFields) => {
    setCustomerFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const addGstLineItem = () => {
    setGstLineItems([
      ...gstLineItems,
      { id: `g${Date.now()}`, item: "", fieldName: "", rate: "", taxRate: "", hsnSac: "" },
    ]);
  };

  const updateGstLineItem = (id: string, field: keyof GstLineItem, value: string) => {
    setGstLineItems(
      gstLineItems.map((li) => (li.id === id ? { ...li, [field]: value } : li))
    );
  };

  const removeGstLineItem = (id: string) => {
    if (gstLineItems.length > 1) {
      setGstLineItems(gstLineItems.filter((li) => li.id !== id));
    }
  };

  return (
    <Modal isOpen={open} onDismiss={onClose} size="medium">
      <ModalHeader title="Payment Receipts Settings" />
      <ModalBody>
        <Box display="flex" flexDirection="column" gap="spacing.5">
          {/* Receipt mode */}
          <RadioGroup
            label="When to send receipts"
            value={receiptMode}
            onChange={({ value }) => setReceiptMode(value)}
          >
            <Radio value="auto" helpText="Receipts are emailed to customers immediately after payment.">
              Send Receipts Automatically
            </Radio>
            <Radio value="manual" helpText="You may send receipts later from dashboard. Your own reference ID may be added too.">
              Don't Send Receipts Automatically
            </Radio>
          </RadioGroup>

          {/* Links */}
          <Box display="flex" gap="spacing.4">
            <Link href="#" icon={ExternalLinkIcon} iconPosition="right" size="small">
              Sample Receipt
            </Link>
            <Link href="#" icon={ExternalLinkIcon} iconPosition="right" size="small">
              Learn More
            </Link>
          </Box>

          {/* GST Receipt Section */}
          <Box
            borderWidth="thin"
            borderColor="surface.border.gray.muted"
            borderRadius="medium"
            overflow="hidden"
          >
            {/* GST Toggle Header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding="spacing.4"
              backgroundColor="surface.background.gray.moderate"
            >
              <Box display="flex" alignItems="center" gap="spacing.4">
                <Switch
                  accessibilityLabel="Enable GST Receipt"
                  isChecked={gstEnabled}
                  onChange={({ isChecked }) => {
                    setGstEnabled(isChecked);
                    onGstChange?.(isChecked);
                    if (isChecked) setGstExpanded(true);
                  }}
                />
                <Box>
                  <Text size="medium" weight="semibold">GST Receipt</Text>
                  <Text size="xsmall" color="surface.text.gray.muted">
                    Generate GST-compliant invoice with customer & tax details
                  </Text>
                </Box>
              </Box>
              {gstEnabled && (
                <Button
                  variant="tertiary"
                  size="small"
                  icon={gstExpanded ? ChevronUpIcon : ChevronDownIcon}
                  onClick={() => setGstExpanded(!gstExpanded)}
                  accessibilityLabel={gstExpanded ? "Collapse" : "Expand"}
                />
              )}
            </Box>

            {/* GST Expanded Content */}
            {gstEnabled && gstExpanded && (
              <Box padding="spacing.4" display="flex" flexDirection="column" gap="spacing.4">
                {/* Required fields info */}
                <Alert
                  color="information"
                  description="The following fields will be enabled on the payment page for GST invoice generation: Name, Billing Address, City, State, Pincode, and Customer GST (optional)."
                  isFullWidth
                  isDismissible={false}
                />

                {/* Item-wise details */}
                <Box>
                  <Heading size="small" marginBottom="spacing.3">Item Details</Heading>
                  <Box display="flex" flexDirection="column" gap="spacing.3">
                    {gstLineItems.map((li, idx) => (
                      <Box
                        key={li.id}
                        borderWidth="thin"
                        borderColor="surface.border.gray.muted"
                        borderRadius="medium"
                        padding="spacing.3"
                        backgroundColor="surface.background.gray.moderate"
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.3">
                          <Text size="small" color="surface.text.gray.muted" weight="medium">
                            Item {idx + 1}
                          </Text>
                          {gstLineItems.length > 1 && (
                            <Button
                              variant="tertiary"
                              size="xsmall"
                              color="negative"
                              onClick={() => removeGstLineItem(li.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                        <Box display="flex" flexDirection="column" gap="spacing.3">
                          <Box display="flex" gap="spacing.3">
                            <Box flex="1">
                              <TextInput
                                label="Item Name"
                                labelPosition="top"
                                size="small"
                                value={li.item}
                                onChange={({ value }) => updateGstLineItem(li.id, "item", value ?? "")}
                                placeholder="e.g., Online Course"
                                helpText="Name shown on invoice"
                              />
                            </Box>
                            <Box flex="1">
                              <TextInput
                                label="Item Field Name"
                                labelPosition="top"
                                size="small"
                                value={li.fieldName}
                                onChange={({ value }) => updateGstLineItem(li.id, "fieldName", value ?? "")}
                                placeholder="e.g., Amount"
                                helpText="Label shown on payment form"
                              />
                            </Box>
                          </Box>
                          <Box display="flex" gap="spacing.3">
                            <Box flex="1">
                              <TextInput
                                label="Rate (₹)"
                                labelPosition="top"
                                size="small"
                                value={li.rate}
                                onChange={({ value }) => updateGstLineItem(li.id, "rate", value ?? "")}
                                placeholder="0.00"
                              />
                            </Box>
                            <Box flex="1">
                              <SelectInput
                                label="Tax Rate"
                                labelPosition="top"
                                size="small"
                                value={li.taxRate}
                                onChange={({ values }) => updateGstLineItem(li.id, "taxRate", values[0] ?? "")}
                                placeholder="Select rate"
                              >
                                <ActionList>
                                  <ActionListItem title="0%" value="0" />
                                  <ActionListItem title="5%" value="5" />
                                  <ActionListItem title="12%" value="12" />
                                  <ActionListItem title="18%" value="18" />
                                  <ActionListItem title="28%" value="28" />
                                </ActionList>
                              </SelectInput>
                            </Box>
                            <Box flex="1">
                              <TextInput
                                label="HSN/SAC Code"
                                labelPosition="top"
                                size="small"
                                value={li.hsnSac}
                                onChange={({ value }) => updateGstLineItem(li.id, "hsnSac", value ?? "")}
                                placeholder="e.g., 9992"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Box marginTop="spacing.3">
                    <Button variant="tertiary" size="small" onClick={addGstLineItem}>
                      + Add another item
                    </Button>
                  </Box>
                </Box>

                {/* Tax calculation note */}
                <Alert
                  color="notice"
                  description="Tax rate will be auto-calculated based on the customer's billing address and your registered business address (CGST+SGST for intra-state, IGST for inter-state)."
                  isFullWidth
                  isDismissible={false}
                />
              </Box>
            )}
          </Box>

          {/* Customer Information on Receipt Section */}
          <Box
            borderWidth="thin"
            borderColor="surface.border.gray.muted"
            borderRadius="medium"
            overflow="hidden"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding="spacing.4"
              backgroundColor="surface.background.gray.moderate"
            >
              <Box display="flex" alignItems="center" gap="spacing.4">
                <Switch
                  accessibilityLabel="Show customer information on receipt"
                  isChecked={showCustomerInfo}
                  onChange={({ isChecked }) => {
                    setShowCustomerInfo(isChecked);
                    if (isChecked) setCustomerInfoExpanded(true);
                  }}
                />
                <Box>
                  <Text size="medium" weight="semibold">Show customer's information on receipt</Text>
                  <Text size="xsmall" color="surface.text.gray.muted">
                    Include customer details like name and PAN on the payment receipt
                  </Text>
                </Box>
              </Box>
              {showCustomerInfo && (
                <Button
                  variant="tertiary"
                  size="small"
                  icon={customerInfoExpanded ? ChevronUpIcon : ChevronDownIcon}
                  onClick={() => setCustomerInfoExpanded(!customerInfoExpanded)}
                  accessibilityLabel={customerInfoExpanded ? "Collapse" : "Expand"}
                />
              )}
            </Box>
            {showCustomerInfo && customerInfoExpanded && (
              <Box padding="spacing.4" display="flex" flexDirection="column" gap="spacing.4">
                <Box display="flex" gap="spacing.5">
                  <Checkbox
                    isChecked={customerFields.name}
                    onChange={() => toggleCustomerField("name")}
                  >
                    Customer Name
                  </Checkbox>
                  <Checkbox
                    isChecked={customerFields.pan}
                    onChange={() => toggleCustomerField("pan")}
                  >
                    PAN Number
                  </Checkbox>
                </Box>
                <Box>
                  <Text size="xsmall" color="surface.text.gray.muted" weight="medium" marginBottom="spacing.2">
                    Always included
                  </Text>
                  <Box display="flex" gap="spacing.3">
                    <Badge color="neutral" size="small">Email Address</Badge>
                    <Badge color="neutral" size="small">Phone Number</Badge>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* 80G Details on Receipt Section */}
          <Box
            borderWidth="thin"
            borderColor="surface.border.gray.muted"
            borderRadius="medium"
            overflow="hidden"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding="spacing.4"
              backgroundColor="surface.background.gray.moderate"
            >
              <Box display="flex" alignItems="center" gap="spacing.4">
                <Switch
                  accessibilityLabel="Show 80G details on receipt"
                  isChecked={showBillingDetails}
                  onChange={({ isChecked }) => {
                    setShowBillingDetails(isChecked);
                    if (isChecked) setBillingExpanded(true);
                  }}
                />
                <Box>
                  <Text size="medium" weight="semibold">Show 80G Details on Receipt</Text>
                  <Text size="xsmall" color="surface.text.gray.muted">
                    Include 80G tax exemption details on the receipt for donors
                  </Text>
                </Box>
              </Box>
              {showBillingDetails && (
                <Button
                  variant="tertiary"
                  size="small"
                  icon={billingExpanded ? ChevronUpIcon : ChevronDownIcon}
                  onClick={() => setBillingExpanded(!billingExpanded)}
                  accessibilityLabel={billingExpanded ? "Collapse" : "Expand"}
                />
              )}
            </Box>
            {showBillingDetails && billingExpanded && (
              <Box padding="spacing.4" display="flex" flexDirection="column" gap="spacing.4">
                {/* 80G Description */}
                <TextArea
                  label="80G Description"
                  labelPosition="top"
                  value={eightyGDescription}
                  onChange={({ value }) => setEightyGDescription(value ?? "")}
                  helpText="Sample 80G Receipt"
                  numberOfLines={4}
                />

                {/* Signature Upload */}
                <Box>
                  <Text size="small" weight="medium" marginBottom="spacing.2">
                    Signature of Authorised Person (Optional)
                  </Text>
                  <FileUpload
                    uploadType="single"
                    label="Upload Signature"
                    helpText="Upload .png, .jpg or .jpeg file | 500 KB Max"
                    acceptedFileTypes=".png,.jpg,.jpeg"
                    maxSize={500 * 1024}
                    onChange={({ fileList }) => {
                      if (fileList.length > 0) {
                        toast.success(`File "${fileList[0].name}" selected`);
                      }
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </ModalBody>
      <ModalFooter>
        <Box display="flex" justifyContent="flex-end" gap="spacing.4" width="100%">
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </ModalFooter>
    </Modal>
  );
};
