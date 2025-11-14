#!/bin/bash

echo "🔥 Deploying Firestore Indexes for Leave Approval System"
echo "=========================================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found!"
    echo ""
    echo "Please install Firebase CLI first:"
    echo "npm install -g firebase-tools"
    echo ""
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Check if logged in
echo "Checking Firebase authentication..."
firebase projects:list &> /dev/null

if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase"
    echo ""
    echo "Please login first:"
    echo "firebase login"
    echo ""
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Deploy indexes
echo "📤 Deploying Firestore indexes..."
echo ""

firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Indexes deployment initiated!"
    echo ""
    echo "⏳ Index creation takes 5-10 minutes"
    echo "📧 You'll receive an email when complete"
    echo ""
    echo "To check status:"
    echo "1. Go to Firebase Console → Firestore → Indexes"
    echo "2. Or run: firebase firestore:indexes"
    echo ""
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Manual creation steps:"
    echo "1. Go to https://console.firebase.google.com"
    echo "2. Select your project"
    echo "3. Go to Firestore Database → Indexes"
    echo "4. Create indexes as specified in FIRESTORE_INDEXES_LEAVE_SYSTEM.md"
    echo ""
fi
