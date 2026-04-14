import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
} from "@razorpay/blade/components";
import { CloseIcon } from "@razorpay/blade/components";
import { IconButton } from "@razorpay/blade/components";

const CurrentSelectPageType = () => {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      backgroundColor="surface.background.primary.intense"
      display="flex"
      flexDirection="column"
    >
      {/* Close button */}
      <Box display="flex" justifyContent="flex-end" padding="spacing.4">
        <IconButton
          icon={CloseIcon}
          accessibilityLabel="Close"
          onClick={() => navigate("/payment-pages-current")}
          size="large"
          emphasis="subtle"
        />
      </Box>

      {/* Header */}
      <Box textAlign="center" paddingTop="spacing.4" paddingBottom="spacing.8">
        <Heading size="large" color="surface.text.staticWhite.normal">
          Select page of your choice
        </Heading>
      </Box>

      {/* Cards */}
      <Box
        flex="1"
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        gap="spacing.8"
        paddingX="spacing.8"
        paddingBottom="spacing.10"
      >
        {/* Payment Page Card */}
        <Box width="420px">
          <Card elevation="highRaised">
            <CardBody>
              <Box padding="spacing.0">
                {/* Preview image area — realistic payment page mockup */}
                <Box
                  backgroundColor="surface.background.gray.subtle"
                  borderRadius="medium"
                  height="224px"
                  position="relative"
                  overflow="hidden"
                  marginBottom="spacing.5"
                  borderWidth="thin"
                  borderColor="surface.border.gray.muted"
                >
                  <Box display="flex" height="100%" padding="spacing.3" gap="spacing.2">
                    {/* Left: Page content side */}
                    <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
                      {/* Logo + company */}
                      <Box display="flex" alignItems="center" gap="spacing.2" marginBottom="spacing.2">
                        <Box width="14px" height="14px" borderRadius="round" backgroundColor="surface.background.primary.intense" flexShrink="0" />
                        <Box height="6px" width="48px" backgroundColor="surface.background.gray.moderate" borderRadius="small" />
                      </Box>
                      {/* Title */}
                      <Box height="8px" width="85%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="8px" width="60%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.2" />
                      {/* Description lines */}
                      <Box height="4px" width="100%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="4px" width="92%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="4px" width="85%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="4px" width="96%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="4px" width="70%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.2" />
                      {/* Second paragraph */}
                      <Box height="4px" width="100%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="4px" width="88%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="4px" width="75%" backgroundColor="surface.background.gray.moderate" borderRadius="small" />
                    </Box>
                    {/* Right: Payment details side */}
                    <Box width="140px" flexShrink="0" display="flex" flexDirection="column">
                      <Box height="8px" width="72px" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.2" />
                      <Box height="2px" width="20px" backgroundColor="surface.background.primary.intense" marginBottom="spacing.2" />
                      {/* Product item 1 */}
                      <Box display="flex" alignItems="center" gap="spacing.1" marginBottom="spacing.2">
                        <Box width="20px" height="16px" borderRadius="small" backgroundColor="surface.background.gray.moderate" flexShrink="0" />
                        <Box flex="1">
                          <Box height="4px" width="80%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                          <Box height="4px" width="50%" backgroundColor="surface.background.gray.moderate" borderRadius="small" />
                        </Box>
                      </Box>
                      {/* Product item 2 */}
                      <Box display="flex" alignItems="center" gap="spacing.1" marginBottom="spacing.2">
                        <Box width="20px" height="16px" borderRadius="small" backgroundColor="surface.background.gray.moderate" flexShrink="0" />
                        <Box flex="1">
                          <Box height="4px" width="70%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                          <Box height="4px" width="45%" backgroundColor="surface.background.gray.moderate" borderRadius="small" />
                        </Box>
                      </Box>
                      {/* Product item 3 */}
                      <Box display="flex" alignItems="center" gap="spacing.1" marginBottom="spacing.3">
                        <Box width="20px" height="16px" borderRadius="small" backgroundColor="surface.background.gray.moderate" flexShrink="0" />
                        <Box flex="1">
                          <Box height="4px" width="75%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                          <Box height="4px" width="40%" backgroundColor="surface.background.gray.moderate" borderRadius="small" />
                        </Box>
                      </Box>
                      {/* Form fields */}
                      <Box height="4px" width="28px" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="12px" width="100%" borderRadius="small" borderWidth="thin" borderColor="surface.border.gray.muted" marginBottom="spacing.2" />
                      <Box height="4px" width="28px" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                      <Box height="12px" width="100%" borderRadius="small" borderWidth="thin" borderColor="surface.border.gray.muted" marginBottom="spacing.3" />
                      {/* Pay button */}
                      <Box height="16px" width="100%" backgroundColor="surface.background.primary.intense" borderRadius="small" />
                    </Box>
                  </Box>
                </Box>

                {/* Content */}
                <Box>
                  <Heading size="medium" marginBottom="spacing.2">Payment page</Heading>
                  <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.1">
                    Setup your own custom branded page. Collect payments for:
                  </Text>
                  <Text size="xsmall" color="surface.text.gray.disabled" marginBottom="spacing.5">
                    Events & tickets &bull; Donations &bull; Fees &bull; Courses & more
                  </Text>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/payment-pages-current/create")}
                    iconPosition="right"
                  >
                    Select Payment page
                  </Button>
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Box>

        {/* Razorpay Webstore Card */}
        <Box width="420px">
          <Card elevation="highRaised">
            <CardBody>
              <Box padding="spacing.0">
                {/* Preview image area */}
                <Box
                  backgroundColor="surface.background.gray.moderate"
                  borderRadius="medium"
                  height="224px"
                  position="relative"
                  overflow="hidden"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="spacing.5"
                  borderWidth="thin"
                  borderColor="surface.border.gray.muted"
                >
                  <Box position="absolute" padding="spacing.4">
                    <Box height="12px" width="128px" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.3" />
                    <Box display="flex" flexWrap="wrap" gap="spacing.2">
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          width="48%"
                          backgroundColor="surface.background.gray.moderate"
                          borderRadius="medium"
                          borderWidth="thin"
                          borderColor="surface.border.gray.muted"
                          padding="spacing.2"
                        >
                          <Box height="64px" width="100%" backgroundColor="surface.background.gray.subtle" borderRadius="small" marginBottom="spacing.2" />
                          <Box height="8px" width="75%" backgroundColor="surface.background.gray.moderate" borderRadius="small" marginBottom="spacing.1" />
                          <Box height="8px" width="50%" backgroundColor="surface.background.gray.moderate" borderRadius="small" />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box position="absolute" bottom="spacing.3" right="spacing.3">
                    <Text size="xsmall" color="surface.text.gray.muted">Catalogue Preview</Text>
                  </Box>
                </Box>

                {/* Content */}
                <Box>
                  <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.2">
                    <Heading size="medium">Razorpay Webstore</Heading>
                    <Badge color="information" size="small">Beta</Badge>
                  </Box>
                  <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.1">
                    Showcase products on your online Razorpay Webstore and start accepting orders.
                  </Text>
                  <Text size="xsmall" color="surface.text.gray.disabled" marginBottom="spacing.5">
                    Add multiple images and detailed descriptions for your products & deliver...
                  </Text>
                  <Button
                    variant="secondary"
                    onClick={() => toast.info("Razorpay Webstore coming soon")}
                  >
                    Explore Webstore
                  </Button>
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Box>
      </Box>

    </Box>
  );
};

export default CurrentSelectPageType;
