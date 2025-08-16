
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


export const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found while generating tokens');

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error generating tokens:', error);
    throw error;
  }
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: false,
  });
};

export const signup = async (req, res) => {
  try {
      const { username, email, password } = req.body;

      console.log("email: ",email);

        if (!username || !email || !password) {
            return res.status(400)
                .json({ message: 'username, email, and password are required' });
        }

        const existing = await User.findOne({ email});
        if (existing) {
            return res.status(409)
                .json({ message: 'Email already in use' });
        }

      const user = await User.create({
            username,
            email,
            password,
        });

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        setRefreshCookie(res, refreshToken);

        return res.status(201).json({
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
        });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: error.message || 'Failed to sign up' });
  }
};


export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await user.isPasswordCorrect(String(password))

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Failed to sign in' });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await User.updateOne({ refreshToken: token }, { $unset: { refreshToken: 1 } });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: false,
    });

    return res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: error.message || 'Failed to logout' });
  }
};
