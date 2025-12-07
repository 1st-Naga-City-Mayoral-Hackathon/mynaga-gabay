#!/bin/bash
# MyNaga Gabay - Data Scraper Setup Script
# Creates conda environment and runs all scrapers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_NAME="mynaga-gabay-scrapers"

echo "========================================"
echo "MyNaga Gabay - Data Pipeline Setup"
echo "========================================"

# Check if conda is available
if ! command -v conda &> /dev/null; then
    echo "[ERROR] Conda not found. Please install Miniconda or Anaconda first."
    echo "        https://docs.conda.io/en/latest/miniconda.html"
    exit 1
fi

# Create or update conda environment
if conda env list | grep -q "^${ENV_NAME} "; then
    echo "[INFO] Updating existing conda environment: ${ENV_NAME}"
    conda env update -f "${SCRIPT_DIR}/environment.yml" --prune
else
    echo "[INFO] Creating new conda environment: ${ENV_NAME}"
    conda env create -f "${SCRIPT_DIR}/environment.yml"
fi

echo ""
echo "[INFO] Environment setup complete!"
echo ""
echo "To activate the environment:"
echo "    conda activate ${ENV_NAME}"
echo ""
echo "To run all scrapers:"
echo "    cd ${SCRIPT_DIR}/scrapers"
echo "    python scrape_naga_health.py"
echo "    python scrape_tgp_medicines.py"
echo "    python fetch_rxnorm_medicines.py"
echo "    python parse_pnf_pdf.py"
echo "    python merge_medicine_data.py"
echo ""
echo "Or run the convenience script:"
echo "    ./run_all_scrapers.sh"
