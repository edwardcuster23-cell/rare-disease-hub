import requests
import time
import os
from dotenv import load_dotenv
from supabase import create_client

# ── CONFIG ──────────────────────────────────────────
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── FETCH DISEASES ──────────────────────────────────
def get_diseases():
    response = supabase.table("diseases").select("id, name, pubmed_query").eq("active", True).execute()
    return response.data

# ── PARSE DATE ───────────────────────────────────────
def parse_date(date_str):
    if not date_str:
        return None
    parts = date_str.strip().split()
    if len(parts) == 0:
        return None
    year = parts[0]
    if not year.isdigit() or len(year) != 4:
        return None
    months = {
        'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06',
        'Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12'
    }
    month = months.get(parts[1][:3], '01') if len(parts) >= 2 else '01'
    day = parts[2].zfill(2) if len(parts) >= 3 and parts[2].isdigit() else '01'
    return f"{year}-{month}-{day}"

# ── SEARCH PUBMED ────────────────────────────────────
def search_pubmed(query):
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": 10000,
        "sort": "date",
        "retmode": "json",
        "datetype": "pdat",
        "mindate": "2023",
        "maxdate": "2026"
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return data["esearchresult"]["idlist"]

# ── FETCH PAPER DETAILS ──────────────────────────────
def fetch_paper_details(pubmed_ids):
    if not pubmed_ids:
        return []
    papers = []
    # Fetch in batches of 500
    for i in range(0, len(pubmed_ids), 500):
        batch = pubmed_ids[i:i+500]
        url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        params = {
            "db": "pubmed",
            "id": ",".join(batch),
            "retmode": "json"
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        for pid in batch:
            if pid in data["result"]:
                item = data["result"][pid]
                papers.append({
                    "pubmed_id": pid,
                    "title": item.get("title", ""),
                    "journal": item.get("fulljournalname", ""),
                    "published_date": parse_date(item.get("pubdate", "")),
                    "authors": [a["name"] for a in item.get("authors", [])],
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{pid}/"
                })
        time.sleep(0.1)
    return papers

# ── SAVE TO SUPABASE ─────────────────────────────────
def save_papers(disease_id, papers):
    saved = 0
    skipped = 0
    for paper in papers:
        paper["disease_id"] = disease_id
    for i in range(0, len(papers), 100):
        batch = papers[i:i+100]
        try:
            supabase.table("papers").upsert(
                batch,
                on_conflict="pubmed_id"
            ).execute()
            saved += len(batch)
        except Exception as e:
            print(f"  Batch error: {e}")
            skipped += len(batch)
    return saved, skipped

# ── MAIN ─────────────────────────────────────────────
def main():
    print("Starting PubMed ingestion...")
    diseases = get_diseases()
    total = len(diseases)
    print(f"Found {total} disease(s) in database\n")

    for i, disease in enumerate(diseases, 1):
        query = disease.get("pubmed_query")
        if not query:
            print(f"[{i}/{total}] {disease['name']} — skipped (no pubmed_query)")
            continue

        start = time.time()
        pubmed_ids = search_pubmed(query)
        papers = fetch_paper_details(pubmed_ids)
        saved, skipped = save_papers(disease["id"], papers)
        elapsed = time.time() - start
        print(f"[{i}/{total}] {disease['name']} — found {len(pubmed_ids)}, inserted {saved} new ({elapsed:.1f}s)")

        time.sleep(1)

    print("\nDone.")

if __name__ == "__main__":
    main()
