import requests
import time
import os
from dotenv import load_dotenv
from supabase import create_client

# ── CONFIG ──────────────────────────────────────────
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── FETCH ORGS FROM DB ───────────────────────────────
def get_orgs():
    response = supabase.table("organizations").select("*").not_.is_("ein", "null").execute()
    return response.data

# ── FETCH PROPUBLICA DATA ────────────────────────────
def fetch_financials(ein):
    clean_ein = ein.replace("-", "")
    url = f"https://projects.propublica.org/nonprofits/api/v2/organizations/{clean_ein}.json"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"  HTTP {response.status_code} for EIN {ein}")
            return None
        data = response.json()
        filings = data.get("filings_with_data", [])
        if not filings:
            print(f"  No filing data for EIN {ein}")
            return None

        latest = filings[0]

        total_revenue      = latest.get("totrevenue")
        total_expenses     = latest.get("totfuncexpns")
        total_assets       = latest.get("totassetsend")
        salaries           = (latest.get("compnsatncurrofcr") or 0) + (latest.get("othrsalwages") or 0)
        fundraising        = latest.get("profndraising") or 0
        fiscal_year        = latest.get("tax_prd_yr")
        propublica_url     = f"https://projects.propublica.org/nonprofits/organizations/{clean_ein}"

        # Estimate program expenses = total - salaries - fundraising - payroll tax
        payroll_tax        = latest.get("payrolltx") or 0
        overhead           = salaries + fundraising + payroll_tax
        program_expenses   = max((total_expenses or 0) - overhead, 0)
        admin_expenses     = salaries + payroll_tax
        fundraising_expenses = fundraising

        return {
            "total_revenue":        total_revenue,
            "total_expenses":       total_expenses,
            "program_expenses":     program_expenses,
            "fundraising_expenses": fundraising_expenses,
            "admin_expenses":       admin_expenses,
            "total_assets":         total_assets,
            "fiscal_year":          fiscal_year,
            "propublica_url":       propublica_url
        }
    except Exception as e:
        print(f"  Error fetching EIN {ein}: {e}")
        return None

# ── COMPUTE FUNDING SCORE ────────────────────────────
def compute_score(financials):
    try:
        expenses = financials.get("total_expenses") or 0
        programs = financials.get("program_expenses") or 0
        if expenses == 0:
            return None
        ratio = programs / expenses
        if ratio >= 0.80:
            return "A"
        elif ratio >= 0.70:
            return "B"
        elif ratio >= 0.60:
            return "C"
        else:
            return "D"
    except:
        return None

# ── SAVE TO SUPABASE ─────────────────────────────────
def save_org_financials(org_id, financials, score):
    try:
        update_data = {**financials, "funding_score": score}
        supabase.table("organizations").update(update_data).eq("id", org_id).execute()
        return True
    except Exception as e:
        print(f"  Save error: {e}")
        return False

# ── MAIN ─────────────────────────────────────────────
def main():
    print("Starting ProPublica financial ingestion...\n")

    orgs = get_orgs()
    print(f"Found {len(orgs)} orgs with EINs\n")

    for org in orgs:
        print(f"Processing: {org['name']} (EIN: {org['ein']})")
        financials = fetch_financials(org["ein"])

        if financials:
            score = compute_score(financials)
            success = save_org_financials(org["id"], financials, score)
            if success:
                expenses = financials.get("total_expenses") or 1
                programs = financials.get("program_expenses") or 0
                ratio = round((programs / expenses) * 100, 1)
                revenue_m = round((financials.get("total_revenue") or 0) / 1_000_000, 1)
                print(f"  ✓ Score: {score} | Est. programs: {ratio}% | Revenue: ${revenue_m}M | Year: {financials.get('fiscal_year')}")
        else:
            print(f"  ✗ No data found")

        time.sleep(0.5)

    print("\nDone.")

if __name__ == "__main__":
    main()