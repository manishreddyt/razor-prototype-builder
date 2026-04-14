import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GripVertical, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Image } from "lucide-react";
import { toast } from "sonner";
import { CurrentPaymentReceiptsModal } from "@/components/current-pp/PaymentReceiptsModal";
import { CurrentPageSettingsModal } from "@/components/current-pp/PageSettingsModal";
import {
  Box,
  Heading,
  Text,
  Button,
  TextInput,
  TextArea,
  Card,
  CardBody,
  Badge,
  IconButton,
  Divider,
} from "@razorpay/blade/components";
import { CloseIcon, PlusIcon, EditIcon, TrashIcon } from "@razorpay/blade/components";

const CurrentCreatePaymentPage = () => {
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("+91 (IN)");
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [showInputDropdown, setShowInputDropdown] = useState(false);
  const inputDropdownRef = useRef<HTMLDivElement>(null);

  const inputFieldTypes = [
    "Single Line Text",
    "Alphabets",
    "Alphanumeric",
    "Number",
    "Email",
    "Phone No.",
    "Link / URL",
    "Large Textarea",
    "PAN Number",
    "Pincode",
    "Dropdown",
    "Date Picker",
    "Name",
    "Address",
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputDropdownRef.current && !inputDropdownRef.current.contains(e.target as Node)) {
        setShowInputDropdown(false);
      }
    };
    if (showInputDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInputDropdown]);

  // Payment form fields
  const [paymentFields, setPaymentFields] = useState([
    { id: "f1", label: "Amount", type: "price", rate: "", removable: false },
    { id: "f2", label: "Email", type: "input", rate: "", removable: false },
    { id: "f3", label: "Phone", type: "input", rate: "", removable: true },
  ]);

  const addField = (type: "input" | "price", label?: string) => {
    const newField = {
      id: `f${Date.now()}`,
      label: label || (type === "input" ? "New Field" : "Price Field"),
      type,
      rate: "",
      removable: true,
    };
    setPaymentFields([...paymentFields, newField]);
  };

  const removeField = (id: string) => {
    setPaymentFields(paymentFields.filter((f) => f.id !== id));
  };

  const handlePublish = () => {
    if (!pageTitle.trim()) {
      toast.error("Please enter a page title");
      return;
    }
    toast.success("Payment page created and published!");
    setTimeout(() => navigate(`/payment-pages-current/published?title=${encodeURIComponent(pageTitle)}`), 800);
  };

  return (
    <Box minHeight="100vh" backgroundColor="surface.background.gray.moderate" display="flex" flexDirection="column">
      {/* Top bar */}
      <Box
        backgroundColor="surface.background.gray.intense"
        height="50px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingX="spacing.5"
      >
        <Text size="small" weight="medium" color="surface.text.staticWhite.normal">
          Create New Payment Page
        </Text>
        <Box display="flex" alignItems="center" gap="spacing.3">
          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowReceiptsModal(true)}
          >
            Payment Receipts
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowSettingsModal(true)}
          >
            Page Settings
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handlePublish}
          >
            Create and Publish Page
          </Button>
          <IconButton
            icon={CloseIcon}
            accessibilityLabel="Close"
            size="medium"
            emphasis="subtle"
            onClick={() => navigate("/payment-pages-current")}
          />
        </Box>
      </Box>

      {/* Editor content */}
      <Box flex="1" display="flex" justifyContent="center" paddingY="spacing.8" paddingX="spacing.4" gap="spacing.6">
        {/* Left: Page editor card */}
        <Box width="520px">
          <Card>
            <CardBody>
              <Box padding="spacing.4">
                {/* Business logo area */}
                <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.8">
                  <Box
                    width="40px"
                    height="40px"
                    borderRadius="round"
                    backgroundColor="surface.background.primary.intense"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                  >
                    <Text color="surface.text.staticWhite.normal" weight="bold" size="small">W</Text>
                  </Box>
                  <Text size="small" weight="semibold" color="surface.text.gray.normal">
                    WEALTHJOY TECHNOLOGIES
                  </Text>
                </Box>

                {/* Page title */}
                <Box marginBottom="spacing.3">
                  <TextInput
                    label="Page Title"
                    labelPosition="top"
                    placeholder="Enter page title here"
                    value={pageTitle}
                    onChange={({ value }) => setPageTitle(value ?? "")}
                    size="large"
                  />
                </Box>

                {/* Add Goal Tracker */}
                <Box marginBottom="spacing.4">
                  <Box display="flex" alignItems="center" gap="spacing.2">
                    <Button variant="tertiary" size="small" onClick={() => {}}>
                      + Add a Goal Tracker
                    </Button>
                    <Badge color="positive" size="small">NEW</Badge>
                  </Box>
                </Box>

                {/* Description */}
                <Box marginBottom="spacing.4">
                  <TextArea
                    label="Description"
                    labelPosition="top"
                    placeholder="Enter page description"
                    value={pageDescription}
                    onChange={({ value }) => setPageDescription(value ?? "")}
                    numberOfLines={3}
                  />
                </Box>

                {/* Rich text toolbar */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap="spacing.1"
                  marginBottom="spacing.4"
                  paddingY="spacing.2"
                  borderTopWidth="thin"
                  borderTopColor="surface.border.gray.muted"
                  borderBottomWidth="thin"
                  borderBottomColor="surface.border.gray.muted"
                >
                  {[Bold, Italic, Underline].map((Icon, i) => (
                    <button key={i} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                      <Icon size={14} color="#9ca3af" />
                    </button>
                  ))}
                  <Box width="1px" height="14px" backgroundColor="surface.background.gray.moderate" marginX="spacing.1" />
                  {[List, ListOrdered].map((Icon, i) => (
                    <button key={i} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                      <Icon size={14} color="#9ca3af" />
                    </button>
                  ))}
                  <Box width="1px" height="14px" backgroundColor="surface.background.gray.moderate" marginX="spacing.1" />
                  {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
                    <button key={i} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                      <Icon size={14} color="#9ca3af" />
                    </button>
                  ))}
                  <Box width="1px" height="14px" backgroundColor="surface.background.gray.moderate" marginX="spacing.1" />
                  {[Link2, Image].map((Icon, i) => (
                    <button key={i} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                      <Icon size={14} color="#9ca3af" />
                    </button>
                  ))}
                </Box>

                {/* Social media share icons */}
                <Box marginBottom="spacing.6">
                  <Button variant="tertiary" size="small" onClick={() => {}}>
                    + Add social media share icons
                  </Button>
                </Box>

                {/* Contact Us section */}
                <Divider />
                <Box paddingTop="spacing.5">
                  <Heading size="small" marginBottom="spacing.3">Contact Us:</Heading>
                  <Box display="flex" gap="spacing.4">
                    <Box flex="1">
                      <TextInput
                        label="Email"
                        labelPosition="top"
                        placeholder="Enter support email"
                        value={supportEmail}
                        onChange={({ value }) => setSupportEmail(value ?? "")}
                        size="small"
                      />
                    </Box>
                    <Box flex="1">
                      <TextInput
                        label="Phone"
                        labelPosition="top"
                        placeholder="Enter support phone"
                        value={supportPhone}
                        onChange={({ value }) => setSupportPhone(value ?? "")}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Box>

        {/* Right: Payment Details panel */}
        <Box width="320px">
          <Card>
            <CardBody>
              <Box padding="spacing.2">
                <Heading size="small" marginBottom="spacing.1">Payment Details</Heading>
                <Box height="2px" width="32px" backgroundColor="surface.background.primary.intense" marginBottom="spacing.5" borderRadius="full" />

                {/* Payment fields */}
                <Box display="flex" flexDirection="column" gap="spacing.4">
                  {paymentFields.map((field) => (
                    <Box key={field.id}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="spacing.2">
                        <Box display="flex" alignItems="center" gap="spacing.2">
                          <GripVertical size={14} color="#d1d5db" style={{ cursor: "grab" }} />
                          <Text size="small" weight="medium">{field.label}</Text>
                        </Box>
                        <Box display="flex" alignItems="center" gap="spacing.2">
                          {field.type === "price" && (
                            <Badge color="primary" size="small">Price field</Badge>
                          )}
                          {field.removable && (
                            <IconButton
                              icon={TrashIcon}
                              accessibilityLabel="Remove field"
                              size="small"
                              emphasis="subtle"
                              onClick={() => removeField(field.id)}
                            />
                          )}
                        </Box>
                      </Box>
                      <TextInput
                        label=""
                        accessibilityLabel={field.label}
                        isDisabled
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>

                {/* GST Address Fields */}
                {gstEnabled && (
                  <Box marginTop="spacing.5" paddingTop="spacing.4" borderTopWidth="thin" borderTopColor="surface.border.gray.muted">
                    <Box display="flex" flexDirection="column" gap="spacing.3">
                      <TextInput label="Name" isDisabled placeholder="Name" size="small" />
                      <TextInput label="Address" isDisabled placeholder="Address Line" size="small" />
                      <Box display="flex" gap="spacing.2">
                        <Box flex="1">
                          <TextInput label="Pincode" isDisabled placeholder="Pincode" size="small" />
                        </Box>
                        <Box flex="1">
                          <TextInput label="City" isDisabled placeholder="City" size="small" />
                        </Box>
                      </Box>
                      <TextInput label="State" isDisabled placeholder="Select State" size="small" />
                      <TextInput label="GST Number (optional)" isDisabled placeholder="e.g., 29ABCDE1234F1Z5" size="small" />
                    </Box>
                  </Box>
                )}

                {/* Add field buttons */}
                <Box marginTop="spacing.5" display="flex" alignItems="center" gap="spacing.3">
                  <Text size="xsmall" color="surface.text.gray.muted">Add new</Text>
                  <Box position="relative" ref={inputDropdownRef}>
                    <Button
                      variant="tertiary"
                      size="xsmall"
                      icon={PlusIcon}
                      iconPosition="left"
                      onClick={() => setShowInputDropdown(!showInputDropdown)}
                    >
                      Input field
                    </Button>
                    {showInputDropdown && (
                      <Box
                        position="absolute"
                        top="100%"
                        left="spacing.0"
                        marginTop="spacing.2"
                        backgroundColor="surface.background.gray.intense"
                        borderRadius="medium"
                        borderWidth="thin"
                        borderColor="surface.border.gray.muted"
                        paddingY="spacing.2"
                        minWidth="200px"
                        zIndex={100}
                        elevation="midRaised"
                        overflow="auto"
                        maxHeight="280px"
                      >
                        {inputFieldTypes.map((fieldType) => (
                          <button
                            key={fieldType}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "8px 16px",
                              fontSize: "13px",
                              color: "#1a1a2e",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f0f5"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                            onClick={() => {
                              addField("input", fieldType);
                              setShowInputDropdown(false);
                            }}
                          >
                            {fieldType}
                          </button>
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Button variant="tertiary" size="xsmall" icon={PlusIcon} iconPosition="left" onClick={() => addField("price")}>
                    Price field
                  </Button>
                </Box>

                {/* Payment methods & Pay button */}
                <Box marginTop="spacing.8" paddingTop="spacing.5" borderTopWidth="thin" borderTopColor="surface.border.gray.muted">
                  <Box display="flex" gap="spacing.2" marginBottom="spacing.4">
                    {["UPI", "VISA", "Master", "RuPay", "PayPal"].map((method) => (
                      <Badge key={method} color="neutral" size="small">{method}</Badge>
                    ))}
                  </Box>
                  <Button variant="primary" size="medium" isFullWidth onClick={() => {}}>
                    Pay ₹ 0,000.00
                  </Button>
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Box>
      </Box>

      {/* Help & Support floating button */}
      <Box position="fixed" bottom="spacing.5" right="spacing.5">
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
        paymentItems={paymentFields}
        onGstChange={(enabled) => setGstEnabled(enabled)}
      />
      <CurrentPageSettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </Box>
  );
};

export default CurrentCreatePaymentPage;
