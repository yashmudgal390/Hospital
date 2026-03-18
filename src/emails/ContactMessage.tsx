import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface ContactMessageEmailProps {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
}

export const ContactMessageEmail = ({
  senderName,
  senderEmail,
  senderPhone,
  subject,
  message,
}: ContactMessageEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Message: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✉️ New Contact Message</Heading>
          <Text style={text}>
            You have received a new message from the contact form on your clinic
            website.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailText}>
              <strong>From:</strong> {senderName}
            </Text>
            <Text style={detailText}>
              <strong>Email:</strong> <a href={`mailto:${senderEmail}`}>{senderEmail}</a>
            </Text>
            {senderPhone && (
              <Text style={detailText}>
                <strong>Phone:</strong> {senderPhone}
              </Text>
            )}
            <Hr style={hr} />
            <Text style={detailText}>
              <strong>Subject:</strong> {subject}
            </Text>
            <Text style={messageText}>
              {message}
            </Text>
          </Section>

          <Text style={footer}>
            This email was sent from your Next.js clinic website.
            <br />
            You can reply directly to this email to contact the patient, or manage
            it in the Admin Panel.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactMessageEmail;

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
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
};

const detailText = {
  ...text,
  margin: "8px 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const messageText = {
  ...text,
  marginTop: "16px",
  padding: "16px",
  backgroundColor: "#fff",
  borderRadius: "6px",
  border: "1px solid #eaeaea",
  whiteSpace: "pre-wrap" as const, // preserves line breaks
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  fontStyle: "italic",
  marginTop: "32px",
};
