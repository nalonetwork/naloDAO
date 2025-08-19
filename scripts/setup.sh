#!/bin/bash

# NaloDAO Setup Script
# This script helps you set up the NaloDAO project for development

set -e

echo "🌱 Welcome to NaloDAO Setup!"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Navigate to frontend directory
cd frontend

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up environment variables..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created from template"
    echo ""
    echo "⚠️  IMPORTANT: Please update .env.local with your actual values:"
    echo "   - VITE_SUPABASE_URL: Your Supabase project URL"
    echo "   - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key"
    echo "   - VITE_WALLET_CONNECT_PROJECT_ID: Your WalletConnect project ID"
    echo ""
    echo "🔗 Get your Supabase credentials from: https://supabase.com/dashboard"
    echo "🔗 Get your WalletConnect project ID from: https://cloud.walletconnect.com/"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🚀 Starting development server..."
echo "   The app will be available at: http://localhost:3000"
echo ""
echo "📚 Next steps:"
echo "   1. Update .env.local with your credentials"
echo "   2. Set up your Supabase database (see docs/supabase-setup.md)"
echo "   3. Configure WalletConnect for wallet integration"
echo "   4. Start building your regenerative DAO! 🌱"
echo ""

# Start the development server
npm run dev