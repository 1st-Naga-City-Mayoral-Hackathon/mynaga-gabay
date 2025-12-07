# Data Pipeline - MyNaga Gabay

This directory contains web scrapers, API fetchers, and PDF parsers for the RAG (Retrieval Augmented Generation) pipeline.

## Directory Structure

```
data/
├── scrapers/                    # Python scraping/fetching scripts
│   ├── scrape_naga_health.py    # Naga health & emergency data
│   ├── scrape_tgp_medicines.py  # TGP Pharmacy medicines
│   ├── fetch_rxnorm_medicines.py # RxNorm API drug data
│   ├── parse_pnf_pdf.py         # PDF parser for PNF/PhilHealth
│   └── merge_medicine_data.py   # Consolidates all medicine data
├── output/                      # Scraped JSON data (by category)
│   ├── health/
│   │   └── bmc_psych_schedule.json
│   ├── emergency/
│   │   └── naga_hotlines.json
│   ├── medicines/
│   │   ├── tgp_medicines.json
│   │   ├── rxnorm_medicines.json
│   │   ├── philhealth_benefits.json
│   │   └── medicines_consolidated.json
│   └── government/
└── knowledge-base/              # Processed data for vector DB
    ├── medicines/
    │   └── medicines.json       # 100+ medicines from merged sources
    ├── philhealth/
    ├── facilities/
    ├── bikol-phrases/
    └── government-services/
```

## Scrapers & Fetchers

### 1. `scrape_naga_health.py`
Scrapes local Naga health and emergency data:
- **BMC Psychiatry Schedule** - Adult, Child, Forensic psychiatry
- **Naga City Emergency Hotlines** - Police, Fire, Hospitals, Command Center

### 2. `scrape_tgp_medicines.py`
Scrapes The Generics Pharmacy (TGP) website:
- Generic medicine names and brand names
- Local Philippine pricing
- Dosage forms and strengths

### 3. `fetch_rxnorm_medicines.py`
Fetches data from NIH RxNorm API:
- 100+ common drugs with normalized names
- Brand name mappings
- Drug classifications
- Dosage information

### 4. `parse_pnf_pdf.py`
Parses Philippine government health PDFs:
- PhilHealth benefit/payment schedules
- Philippine National Formulary (when available)

### 5. `merge_medicine_data.py`
Consolidates all medicine data sources into unified knowledge base.

## Quick Start

```bash
# Install dependencies
pip install requests beautifulsoup4 fake-useragent pdfplumber pypdf2

# Run all scrapers
cd data/scrapers
python3 scrape_naga_health.py       # Local health data
python3 scrape_tgp_medicines.py     # TGP pharmacy
python3 fetch_rxnorm_medicines.py   # RxNorm API (takes ~2 min)
python3 parse_pnf_pdf.py            # Parse PDFs
python3 merge_medicine_data.py      # Consolidate all
```

## Data Sources Summary

| Source | Type | Entries | Status |
|--------|------|---------|--------|
| RxNorm (NIH) | API | 98 drugs | ✅ Done |
| TGP Philippines | Scraper | 4 medicines | ✅ Done |
| PhilHealth Annex | PDF | 44 benefits | ✅ Done |
| BMC Psychiatry | Scraper | 3 schedules | ✅ Done |
| Naga Hotlines | Scraper | 5 categories | ✅ Done |
| **Total Medicines** | Merged | **102** | ✅ Done |

## Output Format

Scraped data follows this JSON structure:
```json
{
  "id": "rxnorm-123456",
  "genericName": "Paracetamol",
  "brandNames": ["Biogesic", "Tempra"],
  "category": "Analgesic",
  "dosageForms": ["Tablet", "Syrup"],
  "commonUses": ["Fever", "Pain"]
}
```

## Adding New Data Sources

1. Create script in `scrapers/` with naming: `scrape_<source>.py` or `fetch_<api>.py`
2. Output to `output/<category>/` directory
3. Use `fake_useragent` for web scraping
4. Include `source_url` for attribution
5. Run `merge_medicine_data.py` to consolidate
