export const PrivacyPage = () => {
  return (
    <article class="legal-page">
      <h1>Privacy Policy</h1>
      <p class="meta">
        <strong>Broccoli Apps</strong>
        <br />
        Last updated: January 2026
      </p>

      <p>
        This Privacy Policy applies to all applications and services operated by Broccoli Apps ("we", "us", "our"),
        including:
      </p>
      <ul>
        <li>!tldr (nottldr.com)</li>
        <li>Tasquito (tasquito.com)</li>
        <li>Net Worth Monitor (networthmonitor.com)</li>
      </ul>

      <h2>Information We Collect</h2>

      <h3>Account Information</h3>
      <p>When you create an account using Sign in with Google or Sign in with Apple, we collect:</p>
      <ul>
        <li>Your name</li>
        <li>Your email address</li>
      </ul>

      <h3>App Data</h3>
      <p>We store the data you create within our apps, such as content, entries, and preferences you choose to save.</p>

      <h3>Technical Information</h3>
      <p>Our servers automatically collect standard technical information when you use our services:</p>
      <ul>
        <li>App version</li>
        <li>Device type and operating system (derived from HTTP headers)</li>
        <li>IP address (from server logs)</li>
      </ul>
      <p>We do not use analytics services or tracking tools.</p>

      <h2>How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and maintain our services</li>
        <li>Authenticate your account across Broccoli Apps</li>
        <li>
          Send emails about your account (e.g., verification) and occasional updates about our apps and new features
        </li>
        <li>Debug and improve our apps</li>
      </ul>
      <p>We do not use your data for advertising, profiling, or any purpose other than providing our services.</p>

      <h2>Data Storage and Security</h2>
      <p>
        Your data is stored on Amazon Web Services (AWS) servers in the United States (us-west-2/Oregon region). We
        implement reasonable security measures to protect your information.
      </p>

      <h2>Third-Party Services</h2>
      <p>We use the following third-party services that may process your data:</p>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Purpose</th>
            <th>Data Shared</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>AWS</td>
            <td>Hosting and data storage</td>
            <td>All account and app data</td>
          </tr>
          <tr>
            <td>Google / Apple</td>
            <td>Authentication</td>
            <td>Name, email (during sign-in)</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Payment processing (web/Android tips)</td>
            <td>Payment details (handled directly by Stripe)</td>
          </tr>
          <tr>
            <td>Apple</td>
            <td>In-app purchases (iOS tips)</td>
            <td>Payment details (handled directly by Apple)</td>
          </tr>
        </tbody>
      </table>
      <p>We do not sell, rent, or share your personal information with any other third parties.</p>

      <h2>Data Retention and Deletion</h2>
      <p>
        You can delete your data within each app through its settings. Deleting data in one app does not affect your
        data in other Broccoli Apps. Deleted data is permanently removed within 30 days.
      </p>
      <p>
        To delete all your data across all Broccoli Apps, please contact us at{" "}
        <a href="mailto:contact@broccoliapps.com">contact@broccoliapps.com</a>.
      </p>

      <h2>Cookies</h2>
      <p>We do not use cookies on our websites or apps.</p>

      <h2>Children's Privacy</h2>
      <p>
        Our services are intended for users aged 13 and older. We do not knowingly collect information from children
        under 13. If you believe a child under 13 has provided us with personal information, please contact us and we
        will delete it.
      </p>

      <h2>International Users</h2>
      <p>
        Our services are available worldwide. By using our services, you consent to your data being transferred to and
        processed in the United States.
      </p>
      <p>
        For users in the European Economic Area (EEA), United Kingdom, or other regions with data protection laws: we
        process your data based on your consent (provided when you create an account) and our legitimate interest in
        providing our services.
      </p>

      <h2>Your Rights</h2>
      <p>Depending on your location, you may have rights including:</p>
      <ul>
        <li>Access to your personal data</li>
        <li>Correction of inaccurate data</li>
        <li>Deletion of your data</li>
        <li>Data portability</li>
        <li>Withdrawal of consent</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:contact@broccoliapps.com">contact@broccoliapps.com</a>.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the
        new policy on this page and updating the "Last updated" date.
      </p>

      <h2>Contact Us</h2>
      <p>If you have questions about this Privacy Policy, contact us at:</p>
      <address>
        <a href="mailto:contact@broccoliapps.com">contact@broccoliapps.com</a>
        <br />
        <br />
        Broccoli Apps
        <br />
        PO Box 330
        <br />
        Annandale NSW 2038
        <br />
        Australia
      </address>
    </article>
  );
};
