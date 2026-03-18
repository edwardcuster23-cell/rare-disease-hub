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

# ── FETCH DISEASE SEARCH TERMS ───────────────────────
def get_diseases():
    response = supabase.table("diseases").select("id, name, search_terms").eq("active", True).execute()
    return response.data

# ── SEARCH CLINICALTRIALS ────────────────────────────
def search_trials(query, max_results=20):
    url = "https://clinicaltrials.gov/api/v2/studies"
    params = {
        "query.term": query,
        "pageSize": max_results,
        "format": "json"
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return data.get("studies", [])

# ── PARSE TRIAL ──────────────────────────────────────
def parse_trial(study):
    proto = study.get("protocolSection", {})
    ident = proto.get("identificationModule", {})
    status = proto.get("statusModule", {})
    design = proto.get("designModule", {})
    sponsor = proto.get("sponsorCollaboratorsModule", {})
    eligibility = proto.get("eligibilityModule", {})

    trial_id = ident.get("nctId", "")

    def clean_date(d):
        if not d:
            return None
        parts = d.split("-")
        if len(parts) == 1:
            return f"{parts[0]}-01-01"
        if len(parts) == 2:
            return f"{parts[0]}-{parts[1]}-01"
        return d

    start = status.get("startDateStruct", {}).get("date", None)
    completion = status.get("completionDateStruct", {}).get("date", None)

    return {
        "trial_id": trial_id,
        "title": ident.get("briefTitle", ""),
        "status": status.get("overallStatus", ""),
        "phase": ", ".join(design.get("phases", [])) if design.get("phases") else None,
        "sponsor": sponsor.get("leadSponsor", {}).get("name", ""),
        "start_date": clean_date(start),
        "completion_date": clean_date(completion),
        "age_range": eligibility.get("maximumAge", ""),
        "url": f"https://clinicaltrials.gov/study/{trial_id}"
    }

# ── SAVE TO SUPABASE ─────────────────────────────────
def save_trials(disease_id, trials):
    saved = 0
    skipped = 0
    for trial in trials:
        trial["disease_id"] = disease_id
        try:
            supabase.table("trials").upsert(
                trial,
                on_conflict="trial_id"
            ).execute()
            saved += 1
        except Exception as e:
            print(f"  Skipped: {trial['title'][:60]}... ({e})")
            skipped += 1
    return saved, skipped

# ── MAIN ─────────────────────────────────────────────
def main():
    print("Starting ClinicalTrials ingestion...")
    diseases = get_diseases()
    print(f"Found {len(diseases)} disease(s) in database")

    for disease in diseases:
        print(f"\nProcessing: {disease['name']}")
        search_terms = disease.get("search_terms") or []
        if not search_terms:
            print(f"  No search terms configured, skipping")
            continue
        query = search_terms[0]
        print(f"  Query: {query}")

        studies = search_trials(query, max_results=20)
        print(f"  Found {len(studies)} trials on ClinicalTrials.gov")

        trials = [parse_trial(s) for s in studies]
        saved, skipped = save_trials(disease["id"], trials)
        print(f"  Saved: {saved} | Skipped: {skipped}")

        time.sleep(1)

    print("\nDone.")

if __name__ == "__main__":
    main()