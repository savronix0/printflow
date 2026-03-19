import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#0f0f12",
            color: "#e4e4e7",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ color: "#f87171", marginBottom: "1rem" }}>
            Bir hata oluştu
          </h1>
          <pre
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "1rem",
              borderRadius: "8px",
              maxWidth: "600px",
              overflow: "auto",
              fontSize: "14px",
            }}
          >
            {this.state.error?.message || "Bilinmeyen hata"}
          </pre>
          <p style={{ marginTop: "1rem", color: "#94a3b8", fontSize: "14px" }}>
            .env dosyasında VITE_FIREBASE_DATABASE_URL tanımlı mı kontrol edin.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
