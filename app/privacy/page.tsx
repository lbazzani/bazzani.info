import { Box, Typography, Paper } from '@mui/material';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Lorenzo Bazzani',
  description: 'Privacy Policy for applications and services provided by Lorenzo Bazzani',
};

export default function PrivacyPage() {
  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: '12px',
          border: '1px solid #e8e8e8',
          backgroundColor: '#fff',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#2c3e50',
            mb: 4,
            textAlign: 'center',
          }}
        >
          Privacy Policy
        </Typography>

        <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 4, textAlign: 'center' }}>
          Last updated: December 16, 2025
        </Typography>

        <Section title="1. Introduction">
          <Typography paragraph>
            This Privacy Policy describes how Lorenzo Bazzani (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects your information when you use our applications and services.
          </Typography>
          <Typography paragraph>
            We are committed to protecting your privacy and ensuring the security of any personal information you may provide.
          </Typography>
        </Section>

        <Section title="2. Information We Collect">
          <Typography paragraph>
            <strong>Information you provide:</strong> We may collect information that you voluntarily provide when using our applications, such as contact information, preferences, and feedback.
          </Typography>
          <Typography paragraph>
            <strong>Automatically collected information:</strong> Our applications may automatically collect certain technical information, including:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>Device type and operating system</li>
            <li>App usage statistics and interactions</li>
            <li>Error logs and crash reports</li>
            <li>General location (country/region level only)</li>
          </Box>
        </Section>

        <Section title="3. How We Use Your Information">
          <Typography paragraph>
            We use the collected information to:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>Provide and maintain our services</li>
            <li>Improve and optimize our applications</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Ensure the security and integrity of our services</li>
          </Box>
        </Section>

        <Section title="4. Data Sharing">
          <Typography paragraph>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>With service providers who assist in operating our applications (under strict confidentiality agreements)</li>
          </Box>
        </Section>

        <Section title="5. Data Security">
          <Typography paragraph>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </Typography>
        </Section>

        <Section title="6. Data Retention">
          <Typography paragraph>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </Typography>
        </Section>

        <Section title="7. Your Rights">
          <Typography paragraph>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>The right to access your personal data</li>
            <li>The right to correct inaccurate data</li>
            <li>The right to request deletion of your data</li>
            <li>The right to object to or restrict processing</li>
            <li>The right to data portability</li>
          </Box>
          <Typography paragraph>
            To exercise any of these rights, please contact us using the information provided below.
          </Typography>
        </Section>

        <Section title="8. Children&apos;s Privacy">
          <Typography paragraph>
            Our applications are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.
          </Typography>
        </Section>

        <Section title="9. Third-Party Services">
          <Typography paragraph>
            Our applications may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
          </Typography>
        </Section>

        <Section title="10. Changes to This Policy">
          <Typography paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
          </Typography>
        </Section>

        <Section title="11. Contact Us">
          <Typography paragraph>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </Typography>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Typography>
              <strong>Lorenzo Bazzani</strong>
            </Typography>
            <Typography>
              Email: info@bazzani.info
            </Typography>
            <Typography>
              Website: https://bazzani.info
            </Typography>
          </Box>
        </Section>
      </Paper>
    </Box>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 600,
          color: '#2c3e50',
          mb: 2,
          pb: 1,
          borderBottom: '2px solid #d35400',
          display: 'inline-block',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ color: '#34495e', lineHeight: 1.7 }}>
        {children}
      </Box>
    </Box>
  );
}
