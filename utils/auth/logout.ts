export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    // Redirect to login page after successful logout
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
