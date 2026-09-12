#!/bin/bash
# DeepForge — Agent Quick Start
# Run this first to verify the environment is ready.

set -e

echo "=== DeepForge Agent Quick Start ==="
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ]; then
  echo "ERROR: Not in DeepForge directory. Run: cd /home/z/my-project/deepforge"
  exit 1
fi

# Install dependencies
echo "1. Installing dependencies..."
bun install 2>&1 | tail -1

# Type check
echo "2. Type checking..."
npx tsc --noEmit 2>&1 && echo "   ✓ TypeScript OK" || echo "   ✗ TypeScript errors"

# Check if dev server is running
echo "3. Checking dev server..."
if curl -s --max-time 3 http://localhost:3001/ > /dev/null 2>&1; then
  echo "   ✓ Dev server running on port 3001"
else
  echo "   Starting dev server..."
  nohup bun run dev > /dev/null 2>&1 &
  sleep 5
  if curl -s --max-time 3 http://localhost:3001/ > /dev/null 2>&1; then
    echo "   ✓ Dev server started on port 3001"
  else
    echo "   ✗ Dev server failed to start"
  fi
fi

# Count problems
echo "4. Problem count..."
COUNT=$(grep -c "id:" src/data/problems.ts 2>/dev/null || echo "0")
echo "   Current: $COUNT entries in problems.ts"

# Check design system
echo "5. Design system check..."
if grep -q "next-themes" package.json 2>/dev/null; then
  echo "   ✓ next-themes installed (light/dark mode)"
else
  echo "   ✗ next-themes not installed"
fi

if grep -q "Inter" src/app/layout.tsx 2>/dev/null; then
  echo "   ✓ Inter font configured"
else
  echo "   ✓ Inter font missing"
fi

# Check git
echo "6. Git status..."
git status --short | head -5
echo ""

echo "=== Ready to work ==="
echo "Read AGENT_CONTEXT.md for full instructions."
echo "Dev server: http://localhost:3001"
echo "Repo: https://github.com/srivtx/deepforge"
