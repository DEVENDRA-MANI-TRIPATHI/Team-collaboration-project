import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography } from "@mui/material";
import useAuth from "../hooks/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup({ username, email, password });
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed, try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: "#f5f5f5" }}
    >
      <Paper
        elevation={6}
        sx={{ p: 4, width: 400, borderRadius: 3 }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Create an Account ✨
        </Typography>
        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 3, color: "text.secondary" }}
        >
          Please fill the form to continue
        </Typography>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Full Name"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2, mb: 1, p: 1.2 }}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: "text.secondary" }}
        >
          Already have an account? <a href="/login">Login</a>
        </Typography>
      </Paper>
    </Box>
  );
}
