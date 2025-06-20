import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import '../../assets/css/Terms.css';

function Term() {
  return (
    <>
      <div id="wrapper">
        <Header />
        <div className="terms-container">
          <div className="terms-content">
            <h1>
              Terms & Conditions
            </h1>
            <p>
              Welcome to <strong>Nataka LK</strong>. Sri Lanka’s premier online
              platform for booking and discovering stage dramas. By using our
              services, you agree to the following terms:
            </p>

            <ol>
              <li>
                <strong>User Accounts</strong>
                <ul>
                  <li>
                    Users must register with accurate personal information.
                  </li>
                  <li>
                    Users are responsible for maintaining the confidentiality of
                    their accounts.
                  </li>
                  <li>
                    You must be at least 16 years old to create an account.
                  </li>
                </ul>
              </li>

              <li>
                <strong>Event Listings & Ticketing</strong>
                <ul>
                  <li>
                    Nataka LK acts as a facilitator between event organizers and
                    customers.
                  </li>
                  <li>
                    Event details (time, venue, cast, etc.) are provided to
                    Nataka LK and may be subject to change.
                  </li>
                </ul>
              </li>

              <li>
                <strong>Ticket Purchase</strong>
                <ul>
                  <li>
                    All ticket purchases are final and non-refundable, unless
                    the event is cancelled.
                  </li>
                  <li>
                    In case of cancellation, ticket refunds will be processed
                    within 14 working days.
                  </li>
                </ul>
              </li>

              <li>
                <strong>Event Cancellation / Postponement</strong>
                <ul>
                  <li>
                    If an event is postponed or cancelled, organizers are
                    responsible for updates.
                  </li>
                </ul>
              </li>

              <li>
                <strong>Payment & Security</strong>
                <ul>
                  <li>
                    Payments are processed via secure third-party gateways (e.g.
                    LankaQR, Visa/MasterCard).
                  </li>
                  <li>Nataka LK does not store credit/debit card info.</li>
                </ul>
              </li>

              <li>
                <strong>Code of Conduct</strong>
                <ul>
                  <li>
                    Users must not post abusive, discriminatory, or misleading
                    content.
                  </li>
                  <li>
                    Misuse of the platform or false bookings may lead to account
                    suspension.
                  </li>
                </ul>
              </li>

              <li>
                <strong>Modifications</strong>
                <ul>
                  <li>Email: info@nataka.com</li>
                  <li>Phone: +94 117 788 788 , +94 773 256 978</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Term;
