import { launchPaymentModal } from "@getalby/bitcoin-connect-react";
import { useState, useEffect } from "react";
import { LightningAddress } from "@getalby/lightning-tools";
import { fiat } from "@getalby/lightning-tools";
import styles from "./styles.module.css";
import clsx from "clsx";

export default function DonateButton() {
  const [invoice, setInvoice] = useState("");

  useEffect(() => {
    (async () => {
      const ln = new LightningAddress("gabo@getalby.com");
      await ln.fetch();
      const satoshi = await fiat.getSatoshiValue({
        currency: "usd",
        amount: 10,
      });

      const invoice = await ln.requestInvoice({ satoshi });
      setInvoice(invoice.paymentRequest);
    })();
  }, []);

  if (!invoice) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => launchPaymentModal({ invoice })}
        className={clsx("button button--secondary button--lg", styles.button)}
      >
        ⚡Donate 10$ in bitcoin
      </button>
    </>
  );
}
