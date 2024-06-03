import "@/styles/globals.css";
import Link from "next/link";

export default function App({ Component, pageProps }) {
  return (
    <>
      <nav style={{ margin: "50px 0px" }}>
        <ul style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <li
            style={{
              cursor: "pointer",
              border: "1px solid gray",
              padding: "10px",
            }}
          >
            <Link href={"/pdf-to-word"}> PDF to Word </Link>
          </li>
          <li
            style={{
              cursor: "pointer",
              border: "1px solid gray",
              padding: "10px",
            }}
          >
            <Link href={"/remove-pdf-pages"}> Remove Pdf Pages </Link>
          </li>
        </ul>
      </nav>
      <Component {...pageProps} />;
    </>
  );
}
