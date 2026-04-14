import { useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
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
                {/* Preview image area */}
                <Box
                  backgroundColor="surface.background.gray.intense"
                  borderRadius="medium"
                  height="224px"
                  position="relative"
                  overflow="hidden"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="spacing.5"
                >
                  <Box position="absolute" display="flex" gap="spacing.3" padding="spacing.4">
                    <Box
                      flex="1"
                      backgroundColor="overlay.background.subtle"
                      borderRadius="medium"
                      padding="spacing.3"
                    >
                      <Box height="12px" width="64px" backgroundColor="overlay.background.moderate" borderRadius="small" marginBottom="spacing.2" />
                      <Box height="8px" width="100%" backgroundColor="overlay.background.subtle" borderRadius="small" marginBottom="spacing.2" />
                      <Box height="8px" width="75%" backgroundColor="overlay.background.subtle" borderRadius="small" marginBottom="spacing.2" />
                      <Box height="8px" width="50%" backgroundColor="overlay.background.subtle" borderRadius="small" marginBottom="spacing.3" />
                      <Box height="24px" width="96px" backgroundColor="surface.background.positive.intense" borderRadius="small" />
                    </Box>
                    <Box
                      width="144px"
                      backgroundColor="overlay.background.subtle"
                      borderRadius="medium"
                      padding="spacing.3"
                    >
                      <Box height="12px" width="100%" backgroundColor="overlay.background.moderate" borderRadius="small" marginBottom="spacing.2" />
                      <Box display="flex" flexDirection="column" gap="spacing.2">
                        <Box height="24px" width="100%" backgroundColor="overlay.background.subtle" borderRadius="small" />
                        <Box height="24px" width="100%" backgroundColor="overlay.background.subtle" borderRadius="small" />
                        <Box height="32px" width="100%" backgroundColor="surface.background.primary.intense" borderRadius="small" />
                      </Box>
                    </Box>
                  </Box>
                  <Box position="absolute" bottom="spacing.3">
                    <Text size="xsmall" color="surface.text.staticWhite.muted">Preview Mockup</Text>
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

      {/* Bottom bar */}
      <Box
        backgroundColor="surface.background.primary.intense"
        paddingY="spacing.3"
        paddingX="spacing.8"
        display="flex"
        justifyContent="center"
        gap="spacing.6"
      >
        {["Collect Payments", "Webstore"].map((label) => (
          <Button key={label} variant="tertiary" size="small">
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default CurrentSelectPageType;
