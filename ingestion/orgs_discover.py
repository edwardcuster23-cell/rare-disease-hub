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

# ── FETCH ACTIVE DISEASES ───────────────────────────
def get_diseases():
    response = supabase.table("diseases").select("id, name, slug, propublica_query").eq("active", True).execute()
    return response.data

# ── SEARCH PROPUBLICA ────────────────────────────────
def search_nonprofits(query):
    url = "https://projects.propublica.org/nonprofits/api/v2/search.json"
    try:
        response = requests.get(url, params={"q": query, "per_page": 10}, timeout=10)
        if response.status_code != 200:
            return []
        return response.json().get("organizations", [])
    except Exception as e:
        print(f"  Error: {e}")
        return []

# ── FORMAT REVENUE ───────────────────────────────────
def fmt_revenue(val):
    if val is None:
        return "N/A"
    if val >= 1_000_000_000:
        return f"${val / 1_000_000_000:.1f}B"
    if val >= 1_000_000:
        return f"${val / 1_000_000:.1f}M"
    if val >= 1_000:
        return f"${val / 1_000:.0f}K"
    return f"${val:,.0f}"

# ── FORMAT EIN ───────────────────────────────────────
def fmt_ein(ein):
    if not ein or len(str(ein)) < 9:
        return str(ein or "N/A")
    ein = str(ein).zfill(9)
    return f"{ein[:2]}-{ein[2:]}"

# ── SAVE CANDIDATES ─────────────────────────────────
def save_candidates(disease_id, orgs):
    saved = 0
    for org in orgs:
        ein_raw = org.get("ein")
        if not ein_raw:
            continue
        ein = fmt_ein(ein_raw)
        clean_ein = str(ein_raw).replace("-", "").zfill(9)
        candidate = {
            "disease_id": disease_id,
            "name": org.get("name", "Unknown"),
            "ein": ein,
            "state": org.get("state"),
            "revenue": org.get("income_amount"),
            "propublica_url": f"https://projects.propublica.org/nonprofits/organizations/{clean_ein}",
        }
        try:
            supabase.table("org_candidates").upsert(
                candidate,
                on_conflict="ein"
            ).execute()
            saved += 1
        except Exception as e:
            print(f"    Insert error: {e}")
    return saved

# ── MAIN ─────────────────────────────────────────────
def main():
    print("Searching ProPublica for candidate organizations...\n")
    diseases = get_diseases()
    print(f"Found {len(diseases)} active disease(s)\n")

    total_candidates = 0

    for disease in diseases:
        name = disease["name"]
        query = disease.get("propublica_query") or name
        orgs = search_nonprofits(query)
        print(f"--- {name} ---" + (f" (search: '{query}')" if query != name else ""))

        if not orgs:
            print("  No results found\n")
            time.sleep(0.5)
            continue

        for j, org in enumerate(orgs, 1):
            ein = fmt_ein(org.get("ein"))
            revenue = fmt_revenue(org.get("income_amount"))
            state = org.get("state") or "N/A"
            org_name = org.get("name", "Unknown")
            print(f"  {j}. {org_name} | EIN: {ein} | Revenue: {revenue} | State: {state}")

        saved = save_candidates(disease["id"], orgs)
        print(f"  -> Saved {saved} candidates to org_candidates\n")

        total_candidates += len(orgs)
        time.sleep(0.5)

    print(f"Done. Total candidates found: {total_candidates}")

if __name__ == "__main__":
    main()
