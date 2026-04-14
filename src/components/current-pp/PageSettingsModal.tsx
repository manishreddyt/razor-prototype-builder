import { useState } from "react";
import { toast } from "sonner";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  Button,
  TextInput,
  RadioGroup,
  Radio,
  Checkbox,
  Text,
  Heading,
} from "@razorpay/blade/components";

interface PageSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const CurrentPageSettingsModal = ({ open, onClose }: PageSettingsModalProps) => {
  const [pageUrl, setPageUrl] = useState("https://pages.razorpay.com/");
  const [theme, setTheme] = useState("light");
  const [noExpiry, setNoExpiry] = useState(true);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [showCustomMessage, setShowCustomMessage] = useState(true);
  const [showRedirect, setShowRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const handleSave = () => {
    toast.success("Page settings saved!");
    onClose();
  };

  return (
    <Modal isOpen={open} onDismiss={onClose} size="medium">
      <ModalHeader title="Page Settings" subtitle="Configure URL, theme, and post-payment behavior" />
      <ModalBody>
        <Box display="flex" flexDirection="column" gap="spacing.6">
          {/* URL of this page */}
          <Box>
            <TextInput
              label="URL of this page"
              value={pageUrl}
              onChange={({ value }) => setPageUrl(value ?? "")}
              placeholder="https://pages.razorpay.com/"
            />
          </Box>

          {/* Theme */}
          <Box>
            <RadioGroup
              label="Theme"
              value={theme}
              onChange={({ value }) => setTheme(value)}
            >
              <Radio value="dark">Dark</Radio>
              <Radio value="light">Light</Radio>
            </RadioGroup>
          </Box>

          {/* Page Expiry Date */}
          <Box>
            <Heading size="small" marginBottom="spacing.3">Page Expiry Date</Heading>
            <Box display="flex" flexDirection="column" gap="spacing.3">
              <Checkbox
                isChecked={noExpiry}
                onChange={({ isChecked }) => setNoExpiry(isChecked)}
              >
                No Expiry
              </Checkbox>

              {!noExpiry && (
                <Box display="flex" gap="spacing.3">
                  <Box flex="1">
                    <TextInput
                      label="Date"
                      type="text"
                      value={expiryDate}
                      onChange={({ value }) => setExpiryDate(value ?? "")}
                      placeholder="DD/MM/YYYY"
                    />
                  </Box>
                  <Box width="140px">
                    <TextInput
                      label="Time"
                      type="text"
                      value={expiryTime}
                      onChange={({ value }) => setExpiryTime(value ?? "")}
                      placeholder="HH:MM"
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Action after successful payment */}
          <Box>
            <Heading size="small" marginBottom="spacing.3">
              Action after successful payment?
            </Heading>
            <Box display="flex" flexDirection="column" gap="spacing.3">
              <Checkbox
                isChecked={showCustomMessage}
                onChange={({ isChecked }) => {
                  setShowCustomMessage(isChecked);
                  if (isChecked) setShowRedirect(false);
                }}
              >
                Show custom message
              </Checkbox>

              <Box>
                <Checkbox
                  isChecked={showRedirect}
                  onChange={({ isChecked }) => {
                    setShowRedirect(isChecked);
                    if (isChecked) setShowCustomMessage(false);
                  }}
                >
                  Redirect to your website
                </Checkbox>
                {showRedirect && (
                  <Box marginTop="spacing.3" marginLeft="spacing.7">
                    <TextInput
                      label="Redirect URL"
                      value={redirectUrl}
                      onChange={({ value }) => setRedirectUrl(value ?? "")}
                      placeholder="https://yourwebsite.com/thank-you"
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Get Hyperlink Button */}
          <Box>
            <Heading size="small" marginBottom="spacing.2">Get Hyperlink Button</Heading>
            <Text size="small" color="surface.text.gray.muted">
              Embed a payment button on your website that links to this page.
            </Text>
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
