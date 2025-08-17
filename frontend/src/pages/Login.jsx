import { Box, Paper, TextField, Button, Typography } from "@mui/material";

export default function Login() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: "#f5f5f5" }}
    >
      <Paper elevation={6} sx={{ p: 4, width: 400, borderRadius: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Welcome Back 👋
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3, color: "text.secondary" }}>
          Please login to continue
        </Typography>

        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 1, p: 1.2 }}
        >
          Login
        </Button>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: "text.secondary" }}
        >
          Don’t have an account? <a href="/signup">Sign up</a>
        </Typography>
      </Paper>
    </Box>
  );
}
