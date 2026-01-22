#!/bin/bash

echo "🚀 Tezkor Deploy jarayoni boshlandi..."

# 1. Git Push
echo "📦 GitHub-ga o'zgarishlar yuklanmoqda..."
git add .
git commit -m "Auto deploy: O'zgarishlar va optimizatsiya"
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ GitHub-ga yuklashda xatolik yuz berdi!"
    exit 1
fi

echo "✅ GitHub-ga muvaffaqiyatli yuklandi."

# 2. Server Update
echo "🔄 Serverda yangilash skripti ishga tushirilmoqda..."
if [ -f "update_server.exp" ]; then
    expect update_server.exp
else
    echo "❌ 'update_server.exp' fayli topilmadi!"
    exit 1
fi

echo "🎉 Barcha jarayonlar muvaffaqiyatli yakunlandi! Dastur yangilandi."
