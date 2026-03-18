import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface CallbackRequestEmailProps {
  patientName: string;
  patientPhone: string;
  preferredDate?: string;
  preferredTime?: string;
}

export const CallbackRequestEmail = ({
  patientName,
  patientPhone,
  preferredDate,
  preferredTime,
}: CallbackRequestEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Callback Request from {patientName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚨 New Callback Request</Heading>
          <Text style={text}>
            You have received a new urgent callback request from your clinic website.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailText}>
              <strong>Patient Name:</strong> {patientName}
            </Text>
            <Text style={detailText}>
              <strong>Phone:</strong> <a href={`tel:${patientPhone}`}>{patientPhone}</a>
            </Text>
            {preferredDate && (
              <Text style={detailText}>
                <strong>Preferred Date:</strong> {preferredDate}
              </Text>
            )}
            {preferredTime && (
              <Text style={detailText}>
                <strong>Preferred Time:</strong> {preferredTime}
              </Text>
            )}
          </Section>

          <Text style={footer}>
            This email was sent from your Next.js clinic website.
            <br />
            You can manage all requests in the Admin Panel.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CallbackRequestEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #eaeaea",
  marginTop: "40px",
  paddingLeft: "24px",
  paddingRight: "24px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  paddingTop: "16px",
  paddingBottom: "16px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const detailsSection = {
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  margin: "24px 0",
};

const detailText = {
  ...text,
  margin: "8px 0",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  fontStyle: "italic",
  marginTop: "32px",
};
