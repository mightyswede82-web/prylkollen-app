import { getLoginUrl } from "@/const";

export default function Home() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>PrylKollen</h1>
      <p>Värdera dina ägodelar med AI</p>
      <a href={getLoginUrl()}>
        <button style={{ padding: "10px 20px", fontSize: "16px" }}>
          Logga in
        </button>
      </a>
    </div>
  );
}
