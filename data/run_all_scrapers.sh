#!/bin/bash
# Run all data scrapers in sequence
# Make sure to activate the conda environment first:
#   conda activate mynaga-gabay-scrapers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/scrapers"

echo "========================================"
echo "MyNaga Gabay - Running All Scrapers"
echo "========================================"

echo ""
echo "[1/5] Scraping Naga Health & Emergency Data..."
python scrape_naga_health.py

echo ""
echo "[2/5] Scraping TGP Pharmacy..."
python scrape_tgp_medicines.py

echo ""
echo "[3/5] Fetching RxNorm Drug Data (this may take ~2 minutes)..."
python fetch_rxnorm_medicines.py

echo ""
echo "[4/5] Parsing PDF Documents..."
python parse_pnf_pdf.py

echo ""
echo "[5/5] Merging All Medicine Data..."
python merge_medicine_data.py

echo ""
echo "========================================"
echo "All scrapers completed successfully!"
echo "========================================"
echo ""
echo "Output files are in: ${SCRIPT_DIR}/output/"
echo "Knowledge base updated in: ${SCRIPT_DIR}/knowledge-base/"
