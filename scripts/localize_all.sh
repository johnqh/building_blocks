#!/bin/bash

# localize_all.sh - Run the "localize" script in all web app and RN app projects sequentially
#
# Usage:
#   ./localize_all.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

PROJECTS=(
    "entitystarter_app"
    "entitystarter_app_rn"
    "heavymath_app"
    "mail_box"
    "mail_box_rn"
    "mail_box_wallet_landing"
    "mixr"
    "shapeshyft_app"
    "starter_app"
    "starter_app_rn"
    "sudobility"
    "sudojo_app"
    "sudojo_app_rn"
    "svgr_app"
    "svgr_app_rn"
    "tapayoka_buyer_app_rn"
    "tapayoka_vendor_app"
    "tapayoka_vendor_app_rn"
    "whisperly_app"
)

PASSED=()
FAILED=()
SKIPPED=()

for project in "${PROJECTS[@]}"; do
    project_dir="$BASE_DIR/$project"

    if [ ! -d "$project_dir" ]; then
        echo "⏭  Skipping $project (directory not found)"
        SKIPPED+=("$project")
        continue
    fi

    echo ""
    echo "============================================"
    echo "  Localizing: $project"
    echo "============================================"

    (cd "$project_dir" && bun run localize)

    if [ $? -eq 0 ]; then
        echo "✅ $project localized successfully"
        PASSED+=("$project")
    else
        echo "❌ $project localization failed"
        FAILED+=("$project")
    fi
done

echo ""
echo "============================================"
echo "  Summary"
echo "============================================"
echo "Passed:  ${#PASSED[@]}"
echo "Failed:  ${#FAILED[@]}"
echo "Skipped: ${#SKIPPED[@]}"

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo "Failed projects:"
    for project in "${FAILED[@]}"; do
        echo "  - $project"
    done
    exit 1
fi
