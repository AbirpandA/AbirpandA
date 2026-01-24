#!/bin/bash

# 🚀 QUICK SETUP SCRIPT
# Run this to get everything ready!

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║           🤖 DYNAMIC PROFILE SETUP WIZARD                        ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v) found"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✅ npm $(npm -v) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --save js-yaml

# Create .env file (optional)
echo ""
echo "🔐 GitHub Token Setup"
echo "================================"
echo ""
echo "1. Go to: https://github.com/settings/tokens/new"
echo "2. Create a token with these scopes:"
echo "   - public_repo"
echo "   - read:user"
echo "3. Copy the token"
echo ""
echo "4. In your GitHub repo:"
echo "   Settings → Secrets and Variables → Actions"
echo "   New repository secret:"
echo "   Name: GITHUB_TOKEN"
echo "   Value: (paste your token)"
echo ""
read -p "Press Enter once you've added the token to GitHub Secrets..."

# Test the script
echo ""
echo "🧪 Testing update script locally..."
echo "==========================================="
echo ""
echo "Set your token first (temporary):"
echo "  export GITHUB_TOKEN='your_token_here'"
echo ""
echo "Then run:"
echo "  npm run update"
echo ""
echo "Check the results:"
echo "  cat README.md"
echo ""

# First run
read -p "Do you have a GitHub token and want to test now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your GitHub token (will not be saved): " token
    export GITHUB_TOKEN="$token"
    npm run update
    echo ""
    echo "✅ Test complete! Check README.md"
else
    echo "⏭️  You can test anytime with: npm run update"
fi

echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. ✏️  Customize your profile:"
echo "   Edit: data/profile.yaml"
echo ""
echo "2. 🧪 Test locally:"
echo "   npm run update"
echo ""
echo "3. 📤 Push to GitHub:"
echo "   git add ."
echo "   git commit -m '🚀 Initial setup'"
echo "   git push origin main"
echo ""
echo "4. ✅ Verify automation:"
echo "   Go to: Actions tab → Run workflow manually"
echo ""
echo "📚 Full documentation: SETUP.md"
echo ""
echo "🎉 Setup complete! Your profile will auto-update daily."
echo ""
